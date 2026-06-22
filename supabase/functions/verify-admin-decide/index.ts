import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const sb = createClient(supabaseUrl, serviceKey);
    const { data: roleCheck } = await sb.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!roleCheck) return json({ error: 'Forbidden' }, 403);

    const { submission_id, decision, reject_reason } = await req.json().catch(() => ({}));
    if (typeof submission_id !== 'string') return json({ error: 'invalid_input' }, 400);
    if (decision !== 'approve' && decision !== 'reject') return json({ error: 'invalid_decision' }, 400);

    const { data: sub, error: loadErr } = await sb
      .from('verification_submissions')
      .select('*')
      .eq('id', submission_id)
      .maybeSingle();
    if (loadErr || !sub) return json({ error: 'not_found' }, 404);
    if (sub.status !== 'pending') return json({ error: 'already_decided' }, 409);

    // 1) Delete the file FIRST (GDPR: do not keep letters at rest)
    if (sub.file_path) {
      const { error: rmErr } = await sb.storage.from('user-documents').remove([sub.file_path]);
      if (rmErr) {
        console.error('storage remove failed', rmErr);
        return json({ error: 'storage_delete_failed' }, 500);
      }
    }

    // 2) Apply decision
    if (decision === 'approve') {
      const { error: profErr } = await sb
        .from('profiles')
        .update({
          verified: true,
          verification_method: 'acceptance_letter',
          verification_date: new Date().toISOString(),
        })
        .eq('id', sub.user_id);
      if (profErr) {
        console.error('profile update failed', profErr);
        return json({ error: 'internal' }, 500);
      }
    }

    const { error: subErr } = await sb
      .from('verification_submissions')
      .update({
        status: decision === 'approve' ? 'approved' : 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        reject_reason: decision === 'reject' ? (reject_reason || null) : null,
        file_path: null,
      })
      .eq('id', submission_id);

    if (subErr) {
      console.error('submission update failed', subErr);
      return json({ error: 'internal' }, 500);
    }

    return json({ ok: true });
  } catch (e) {
    console.error('verify-admin-decide error', e);
    return json({ error: 'internal' }, 500);
  }
});
