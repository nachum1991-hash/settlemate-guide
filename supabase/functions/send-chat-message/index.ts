import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_MESSAGE_LENGTH = 2000;
const MIN_MESSAGE_LENGTH = 1;
const RATE_LIMIT_MESSAGES = 10;
const RATE_LIMIT_WINDOW_SECONDS = 60;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = user.id;

    const body = await req.json();
    const { task_id, phase, message, reply_to_id } = body;

    if (!task_id || typeof task_id !== 'string' ||
        !phase || typeof phase !== 'string' ||
        !message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Store raw text — React escapes on render.
    const trimmed = message.trim();
    if (trimmed.length < MIN_MESSAGE_LENGTH) {
      return new Response(JSON.stringify({ error: 'Message cannot be empty' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      return new Response(JSON.stringify({ error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verification + ban gate
    const { data: profileRow } = await serviceClient
      .from('profiles').select('verified').eq('id', userId).maybeSingle();
    if (!profileRow?.verified) {
      return new Response(JSON.stringify({ error: 'not_verified', message: 'Verify your student status to join the chat.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: banRow } = await serviceClient
      .from('chat_bans').select('user_id').eq('user_id', userId).maybeSingle();
    if (banRow) {
      return new Response(JSON.stringify({ error: 'banned', message: "You've been removed from this chat." }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Membership gate — must have joined the channel first
    const { data: membership } = await serviceClient
      .from('chat_memberships')
      .select('first_entered_at')
      .eq('user_id', userId).eq('task_id', task_id).eq('phase', phase)
      .maybeSingle();
    if (!membership) {
      return new Response(JSON.stringify({ error: 'not_a_member', message: 'Open the chat before posting.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limit
    const cutoff = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString();
    const { data: recent, error: countError } = await serviceClient
      .from('task_messages').select('id', { count: 'exact' })
      .eq('user_id', userId).gte('created_at', cutoff);
    if (countError) {
      console.error('rate limit check failed:', countError);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if ((recent?.length || 0) >= RATE_LIMIT_MESSAGES) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded', message: 'Please wait a moment before sending more messages' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate reply_to_id
    let validatedReplyToId: string | null = null;
    if (reply_to_id) {
      if (typeof reply_to_id !== 'string') {
        return new Response(JSON.stringify({ error: 'reply_to_id must be a string' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { data: replyToMsg } = await serviceClient
        .from('task_messages').select('id, task_id').eq('id', reply_to_id).maybeSingle();
      if (!replyToMsg || replyToMsg.task_id !== task_id) {
        return new Response(JSON.stringify({ error: 'Invalid reply target' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      validatedReplyToId = reply_to_id;
    }

    const { data: inserted, error: insertError } = await serviceClient
      .from('task_messages')
      .insert({ task_id, phase, user_id: userId, message: trimmed, reply_to_id: validatedReplyToId })
      .select().single();

    if (insertError) {
      console.error('insert failed:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to send message' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, message: inserted }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('send-chat-message error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
