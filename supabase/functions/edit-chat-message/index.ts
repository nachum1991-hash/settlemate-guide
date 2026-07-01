import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_MESSAGE_LENGTH = 2000;
const EDIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message_id, new_message } = await req.json();
    if (!message_id || typeof message_id !== 'string' ||
        !new_message || typeof new_message !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const trimmed = new_message.trim();
    if (trimmed.length < 1 || trimmed.length > MAX_MESSAGE_LENGTH) {
      return new Response(JSON.stringify({ error: 'Invalid message length' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const service = createClient(supabaseUrl, serviceKey);

    // Ban gate
    const { data: banRow } = await service
      .from('chat_bans').select('user_id').eq('user_id', user.id).maybeSingle();
    if (banRow) {
      return new Response(JSON.stringify({ error: 'banned' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Load message
    const { data: msg, error: fetchErr } = await service
      .from('task_messages')
      .select('id, user_id, created_at')
      .eq('id', message_id).maybeSingle();
    if (fetchErr || !msg) {
      return new Response(JSON.stringify({ error: 'Message not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (msg.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const age = Date.now() - new Date(msg.created_at).getTime();
    if (age > EDIT_WINDOW_MS) {
      return new Response(JSON.stringify({ error: 'edit_window_expired', message: 'You can only edit messages within 15 minutes of posting.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: updated, error: updErr } = await service
      .from('task_messages')
      .update({ message: trimmed, edited_at: new Date().toISOString() })
      .eq('id', message_id)
      .select().single();
    if (updErr) {
      console.error('edit failed:', updErr);
      return new Response(JSON.stringify({ error: 'Failed to edit message' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, message: updated }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('edit-chat-message error:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
