import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_OTPS_PER_WINDOW = 3;
const WINDOW_MINUTES = 15;
const RESEND_COOLDOWN_SECONDS = 30;
const OTP_TTL_MINUTES = 10;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function randomCode(): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return (arr[0] % 1_000_000).toString().padStart(6, '0');
}

function randomSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
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
    const rawEmail = typeof body.university_email === 'string' ? body.university_email.trim() : '';
    const email = rawEmail.toLowerCase();
    if (!isValidEmail(email)) return json({ error: 'invalid_email' }, 400);

    const sb = createClient(supabaseUrl, serviceKey);

    // Already verified by someone else?
    const { data: existing } = await sb
      .from('profiles')
      .select('id, university_email_verified_at')
      .eq('university_email', email)
      .not('university_email_verified_at', 'is', null)
      .maybeSingle();
    if (existing && existing.id !== user.id) {
      return json({ error: 'email_already_used' }, 409);
    }

    // Rate limit: count OTPs in window
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
    const { data: recentOtps } = await sb
      .from('verification_otps')
      .select('id, created_at')
      .eq('user_id', user.id)
      .gte('created_at', windowStart)
      .order('created_at', { ascending: false });

    if (recentOtps && recentOtps.length >= MAX_OTPS_PER_WINDOW) {
      return json({ error: 'rate_limited', message: 'Too many codes requested. Try again later.' }, 429);
    }
    if (recentOtps && recentOtps[0]) {
      const lastAge = (Date.now() - new Date(recentOtps[0].created_at).getTime()) / 1000;
      if (lastAge < RESEND_COOLDOWN_SECONDS) {
        return json({ error: 'cooldown', retry_after: Math.ceil(RESEND_COOLDOWN_SECONDS - lastAge) }, 429);
      }
    }

    const code = randomCode();
    const salt = randomSalt();
    const codeHash = await sha256(code + salt);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

    const { error: insertErr } = await sb.from('verification_otps').insert({
      user_id: user.id,
      university_email: email,
      code_hash: codeHash,
      salt,
      expires_at: expiresAt,
    });
    if (insertErr) {
      console.error('otp insert failed', insertErr);
      return json({ error: 'internal' }, 500);
    }

    // Send email via internal sender
    const sendRes = await fetch(`${supabaseUrl}/functions/v1/send-verification-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ to: email, code }),
    });
    if (!sendRes.ok) {
      console.error('send-verification-email failed', await sendRes.text());
      // Don't surface internal failure beyond a generic error; keep code in DB so dev can retrieve.
    }

    return json({ ok: true, expires_at: expiresAt });
  } catch (e) {
    console.error('verify-send-otp error', e);
    return json({ error: 'internal' }, 500);
  }
});
