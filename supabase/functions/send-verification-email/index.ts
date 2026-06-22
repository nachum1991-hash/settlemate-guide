// Internal-only sender. Swappable: write to email_outbox today; swap body to a real provider later.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // Require service-role auth (called only by other edge functions)
    const authHeader = req.headers.get('Authorization') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    if (!authHeader.includes(serviceKey)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { to, code } = await req.json();
    if (!to || !code) {
      return new Response(JSON.stringify({ error: 'to and code required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const sb = createClient(supabaseUrl, serviceKey);

    const subject = 'Your SettleMate verification code';
    const body = `Hi,\n\nYour SettleMate verification code is: ${code}\n\nIt expires in 10 minutes. If you didn't request this, ignore this email.\n\n— SettleMate`;

    // Dev mode: persist to email_outbox so QA can read it.
    // TODO: swap with provider (Lovable Emails / Resend / Mailgun) when configured.
    const { error } = await sb.from('email_outbox').insert({ to_email: to, subject, body });
    if (error) {
      console.error('email_outbox insert failed', error);
      return new Response(JSON.stringify({ error: 'send_failed' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // Also log so devs can grab the code from edge function logs during development.
    console.log(`[verification] code for ${to}: ${code}`);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('send-verification-email error', e);
    return new Response(JSON.stringify({ error: 'internal' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
