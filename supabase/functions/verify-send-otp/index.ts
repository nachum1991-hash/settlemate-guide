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

// Sender config mirrored exactly from auth-email-hook (working signup/recovery path).
const SITE_NAME = 'SettleMate';
const SENDER_DOMAIN = 'notify.getsettlemate.app';
const FROM_DOMAIN = 'getsettlemate.app';
const FROM_ADDRESS = `${SITE_NAME} <no-reply@${FROM_DOMAIN}>`;

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

function renderOtpEmail(code: string): { html: string; text: string } {
  const text = `Your SettleMate verification code is: ${code}\n\nIt expires in ${OTP_TTL_MINUTES} minutes. If you didn't request this, ignore this email.\n\n— SettleMate`;
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>SettleMate verification code</title></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'DM Sans',Arial,sans-serif;color:#1F2937;">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px;">
    <h1 style="font-size:22px;margin:0 0 16px 0;color:#3B4CCA;">Confirm your university email</h1>
    <p style="font-size:15px;line-height:1.55;margin:0 0 20px 0;">Enter this 6-digit code in SettleMate to finish verifying your student status:</p>
    <div style="font-family:'DM Sans',monospace;font-size:32px;font-weight:700;letter-spacing:8px;color:#1F2937;background:#FAFAF9;border:2px solid #3B4CCA;border-radius:12px;padding:18px 20px;text-align:center;margin:0 0 20px 0;">${code}</div>
    <p style="font-size:14px;line-height:1.55;color:#4B5563;margin:0 0 8px 0;">This code expires in ${OTP_TTL_MINUTES} minutes.</p>
    <p style="font-size:14px;line-height:1.55;color:#4B5563;margin:0 0 24px 0;">If you didn't request this, you can safely ignore this email.</p>
    <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;">
    <p style="font-size:12px;color:#6B7280;margin:0;">— SettleMate</p>
  </div>
</body></html>`;
  return { html, text };
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

    const { data: otpRow, error: insertErr } = await sb
      .from('verification_otps')
      .insert({
        user_id: user.id,
        university_email: email,
        code_hash: codeHash,
        salt,
        expires_at: expiresAt,
      })
      .select('id')
      .single();
    if (insertErr || !otpRow) {
      console.error('otp insert failed', insertErr);
      return json({ error: 'internal' }, 500);
    }

    // Enqueue email via the same queue path the auth hook uses.
    const { html, text } = renderOtpEmail(code);
    const messageId = crypto.randomUUID();

    await sb.from('email_send_log').insert({
      message_id: messageId,
      template_name: 'verification-otp',
      recipient_email: email,
      status: 'pending',
    });

    const { error: enqErr } = await sb.rpc('enqueue_email', {
      queue_name: 'auth_emails',
      payload: {
        message_id: messageId,
        to: email,
        from: FROM_ADDRESS,
        sender_domain: SENDER_DOMAIN,
        subject: 'SettleMate — Your verification code',
        html,
        text,
        purpose: 'transactional',
        label: 'verification-otp',
        idempotency_key: `verify-otp-${otpRow.id}`,
        queued_at: new Date().toISOString(),
      },
    });

    if (enqErr) {
      console.error('enqueue_email failed', enqErr);
      await sb.from('email_send_log').insert({
        message_id: messageId,
        template_name: 'verification-otp',
        recipient_email: email,
        status: 'failed',
        error_message: 'Failed to enqueue verification OTP email',
      });
      return json({ error: 'send_failed' }, 500);
    }

    return json({ ok: true, expires_at: expiresAt });
  } catch (e) {
    console.error('verify-send-otp error', e);
    return json({ error: 'internal' }, 500);
  }
});
