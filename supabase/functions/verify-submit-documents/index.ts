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

async function verifyExists(
  sb: ReturnType<typeof createClient>,
  path: string,
): Promise<boolean> {
  const folder = path.substring(0, path.lastIndexOf('/'));
  const fileName = path.substring(path.lastIndexOf('/') + 1);
  const { data } = await sb.storage.from('user-documents').list(folder, {
    search: fileName,
    limit: 5,
  });
  return !!data && data.some((o) => o.name === fileName);
}

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

    const body = await req.json().catch(() => ({}));
    const letter_path = typeof body.letter_path === 'string' ? body.letter_path : '';
    const id_path = typeof body.id_path === 'string' ? body.id_path : '';
    if (!letter_path || !id_path) return json({ error: 'invalid_input' }, 400);
    if (letter_path === id_path) return json({ error: 'paths_must_differ' }, 400);

    const expectedPrefix = `verification/${user.id}/`;
    if (!letter_path.startsWith(expectedPrefix) || !id_path.startsWith(expectedPrefix)) {
      return json({ error: 'invalid_path' }, 400);
    }

    const sb = createClient(supabaseUrl, serviceKey);

    if (!(await verifyExists(sb, letter_path))) return json({ error: 'letter_not_found' }, 404);
    if (!(await verifyExists(sb, id_path))) return json({ error: 'id_not_found' }, 404);

    // One pending row per user: reuse if present so retries always point at the fresh pair.
    const { data: pending } = await sb
      .from('verification_submissions')
      .select('id, file_path, id_file_path')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .maybeSingle();

    let submissionId: string;

    if (pending) {
      const { error: updErr } = await sb
        .from('verification_submissions')
        .update({ file_path: letter_path, id_file_path: id_path })
        .eq('id', pending.id);
      if (updErr) {
        console.error('submission update failed', updErr);
        return json({ error: 'internal' }, 500);
      }
      submissionId = pending.id;
    } else {
      const { data: inserted, error } = await sb
        .from('verification_submissions')
        .insert({
          user_id: user.id,
          file_path: letter_path,
          id_file_path: id_path,
          status: 'pending',
        })
        .select('id')
        .single();
      if (error || !inserted) {
        console.error('submission insert failed', error);
        return json({ error: 'internal' }, 500);
      }
      submissionId = inserted.id;
    }

    // GDPR sweep: delete any object under verification/{user.id}/ that isn't one of the two referenced paths.
    const folder = `verification/${user.id}`;
    const { data: objs } = await sb.storage.from('user-documents').list(folder, { limit: 1000 });
    if (objs && objs.length > 0) {
      const keep = new Set([
        letter_path.substring(letter_path.lastIndexOf('/') + 1),
        id_path.substring(id_path.lastIndexOf('/') + 1),
      ]);
      const toRemove = objs
        .filter((o) => o.name && !keep.has(o.name))
        .map((o) => `${folder}/${o.name}`);
      if (toRemove.length > 0) {
        const { error: rmErr } = await sb.storage.from('user-documents').remove(toRemove);
        if (rmErr) console.error('orphan cleanup failed', rmErr);
      }
    }

    return json({ ok: true, submission_id: submissionId });
  } catch (e) {
    console.error('verify-submit-documents error', e);
    return json({ error: 'internal' }, 500);
  }
});
