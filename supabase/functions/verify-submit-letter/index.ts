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

    const { file_path } = await req.json().catch(() => ({}));
    if (typeof file_path !== 'string' || !file_path) return json({ error: 'invalid_input' }, 400);

    const expectedPrefix = `verification/${user.id}/`;
    if (!file_path.startsWith(expectedPrefix)) {
      return json({ error: 'invalid_path' }, 400);
    }

    const sb = createClient(supabaseUrl, serviceKey);

    // Confirm file exists in storage
    const folder = file_path.substring(0, file_path.lastIndexOf('/'));
    const fileName = file_path.substring(file_path.lastIndexOf('/') + 1);
    const { data: list } = await sb.storage.from('user-documents').list(folder, {
      search: fileName,
      limit: 5,
    });
    if (!list || !list.some(o => o.name === fileName)) {
      return json({ error: 'file_not_found' }, 404);
    }

    // If there is already a pending row, return it.
    const { data: pending } = await sb
      .from('verification_submissions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .maybeSingle();

    if (pending) {
      return json({ ok: true, submission_id: pending.id, already_pending: true });
    }

    const { data: inserted, error } = await sb
      .from('verification_submissions')
      .insert({ user_id: user.id, file_path, status: 'pending' })
      .select('id')
      .single();

    if (error) {
      console.error('submission insert failed', error);
      return json({ error: 'internal' }, 500);
    }

    return json({ ok: true, submission_id: inserted.id });
  } catch (e) {
    console.error('verify-submit-letter error', e);
    return json({ error: 'internal' }, 500);
  }
});
