import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_ATTEMPTS = 5;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time compare
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
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
    const email = typeof body.university_email === 'string'
      ? body.university_email.trim().toLowerCase() : '';
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    if (!email || !/^\d{6}$/.test(code)) return json({ error: 'invalid_input' }, 400);

    const sb = createClient(supabaseUrl, serviceKey);

    // Load latest non-consumed, non-expired OTP for this user+email
    const { data: otp } = await sb
      .from('verification_otps')
      .select('*')
      .eq('user_id', user.id)
      .eq('university_email', email)
      .is('consumed_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Always hash to avoid timing channel
    const dummySalt = otp?.salt ?? 'dummysalt';
    const candidate = await sha256(code + dummySalt);

    if (!otp) return json({ error: 'expired_or_missing' }, 400);

    if (otp.attempts >= MAX_ATTEMPTS) {
      return json({ error: 'too_many_attempts' }, 429);
    }

    await sb.from('verification_otps').update({ attempts: otp.attempts + 1 }).eq('id', otp.id);

    if (!timingSafeEqual(candidate, otp.code_hash)) {
      return json({ error: 'invalid_code' }, 400);
    }

    // Consume
    await sb.from('verification_otps').update({ consumed_at: new Date().toISOString() }).eq('id', otp.id);

    // Tier-1 domain auto-check
    const domain = email.split('@')[1] ?? '';
    const { data: domains } = await sb.from('university_domains').select('base_domain');
    const isMatch = (domains ?? []).some((d: { base_domain: string }) => {
      const base = d.base_domain.toLowerCase();
      return domain === base || domain.endsWith('.' + base);
    });

    const updates: Record<string, unknown> = {
      university_email: email,
      university_email_verified_at: new Date().toISOString(),
    };
    if (isMatch) {
      updates.verified = true;
      updates.verification_method = 'email_domain';
      updates.verification_date = new Date().toISOString();
    }

    const { error: upErr } = await sb.from('profiles').update(updates).eq('id', user.id);
    if (upErr) {
      console.error('profile update failed', upErr);
      return json({ error: 'internal' }, 500);
    }

    return json({ verified: !!isMatch, requires_tier2: !isMatch });
  } catch (e) {
    console.error('verify-confirm-otp error', e);
    return json({ error: 'internal' }, 500);
  }
});
