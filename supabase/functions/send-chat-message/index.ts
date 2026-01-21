import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate the JWT and get the user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    
    if (userError || !user) {
      console.error('JWT validation failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log('Authenticated user:', userId);

    // Parse and validate request body
    const body = await req.json();
    const { task_id, phase, message, reply_to_id } = body;

    // Validate required fields
    if (!task_id || typeof task_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'task_id is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!phase || typeof phase !== 'string') {
      return new Response(
        JSON.stringify({ error: 'phase is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'message is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Trim and validate message length
    const trimmedMessage = message.trim();

    // XSS sanitization: encode HTML special characters (defense-in-depth)
    const sanitizedMessage = trimmedMessage
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    if (sanitizedMessage.length < MIN_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ error: 'Message cannot be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (sanitizedMessage.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client for database operations
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Server-side rate limiting: check recent messages from this user
    const rateLimitCutoff = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString();
    
    const { data: recentMessages, error: countError } = await serviceClient
      .from('task_messages')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', rateLimitCutoff);

    if (countError) {
      console.error('Error checking rate limit:', countError);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const messageCount = recentMessages?.length || 0;
    console.log(`User ${userId} has sent ${messageCount} messages in the last ${RATE_LIMIT_WINDOW_SECONDS} seconds`);

    if (messageCount >= RATE_LIMIT_MESSAGES) {
      console.warn(`Rate limit exceeded for user ${userId}`);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: 'Please wait a moment before sending more messages'
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate reply_to_id if provided
    let validatedReplyToId: string | null = null;
    if (reply_to_id !== undefined && reply_to_id !== null && reply_to_id !== '') {
      if (typeof reply_to_id !== 'string') {
        return new Response(
          JSON.stringify({ error: 'reply_to_id must be a string' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify the referenced message exists and is in the same task
      const { data: replyToMessage, error: replyError } = await serviceClient
        .from('task_messages')
        .select('id, task_id')
        .eq('id', reply_to_id)
        .maybeSingle();

      if (replyError) {
        console.error('Error checking reply_to message:', replyError);
        return new Response(
          JSON.stringify({ error: 'Failed to validate reply' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!replyToMessage) {
        return new Response(
          JSON.stringify({ error: 'Message being replied to does not exist' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (replyToMessage.task_id !== task_id) {
        return new Response(
          JSON.stringify({ error: 'Cannot reply to a message from a different context' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      validatedReplyToId = reply_to_id;
    }

    // Insert the message using service role (bypasses RLS for insert)
    const { data: insertedMessage, error: insertError } = await serviceClient
      .from('task_messages')
      .insert({
        task_id,
        phase,
        user_id: userId,
        message: sanitizedMessage,
        reply_to_id: validatedReplyToId,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to send message' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Message sent successfully:', insertedMessage.id);

    return new Response(
      JSON.stringify({ success: true, message: insertedMessage }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in send-chat-message:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
