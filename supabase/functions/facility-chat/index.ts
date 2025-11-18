import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      console.error('[facility-chat] Invalid messages format');
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting check
    const identifier = req.headers.get('x-forwarded-for') || 'unknown';
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const windowMinutes = 60;
    const maxRequests = 20;

    const { data: limit } = await supabase
      .from('rate_limits')
      .select('request_count, window_start')
      .eq('identifier', identifier)
      .eq('endpoint', 'facility-chat')
      .maybeSingle();

    const now = Date.now();
    const windowStart = limit ? new Date(limit.window_start).getTime() : now;

    if (limit && now - windowStart < windowMinutes * 60 * 1000) {
      if (limit.request_count >= maxRequests) {
        console.warn(`[facility-chat] Rate limit exceeded for ${identifier}`);
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      await supabase
        .from('rate_limits')
        .update({ request_count: limit.request_count + 1 })
        .eq('identifier', identifier)
        .eq('endpoint', 'facility-chat');
    } else {
      await supabase
        .from('rate_limits')
        .upsert({ 
          identifier, 
          endpoint: 'facility-chat', 
          request_count: 1, 
          window_start: new Date().toISOString() 
        }, {
          onConflict: 'identifier,endpoint'
        });
    }

    console.log(`[facility-chat] Processing ${messages.length} messages`);

    // Filter and format messages for AI API (remove timestamps, filter out initial assistant greeting)
    let formattedMessages = messages
      .filter((msg: any) => {
        // Skip the initial assistant greeting (it's UI-only)
        if (msg.role === 'assistant' && msg.content.includes("Hi! I'm here to help you plan")) {
          return false;
        }
        return true;
      })
      .map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));

    // Limit conversation length to prevent overload (keep last 10 messages)
    if (formattedMessages.length > 10) {
      console.log(`[facility-chat] Truncating conversation from ${formattedMessages.length} to 10 messages`);
      formattedMessages = formattedMessages.slice(-10);
    }

    console.log(`[facility-chat] Sending ${formattedMessages.length} messages to AI`);

    // System prompt for facility planning assistant
    const systemPrompt = `You are an expert sports facility planning consultant helping users design their facility vision. Your goal is to have a natural, encouraging conversation to understand their needs.

Ask clarifying questions to understand:
- What sports they want (basketball, soccer, volleyball, pickleball, tennis, etc.)
- Facility size (small community gym, medium facility, large complex, arena)
- Location/market context (urban, suburban, rural)
- Budget constraints if any
- Timeline and urgency

Be conversational and enthusiastic. Help users think through their vision. 

When you have gathered enough information (sports, size, and location), respond with: "Perfect! I have everything I need. Let me generate your personalized facility report..."

Keep responses concise (2-3 sentences) and ask one focused question at a time.`;

    // Call Lovable AI Gateway with streaming
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...formattedMessages
        ],
        stream: true,
        temperature: 0.8,
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      console.error(`[facility-chat] Lovable AI error: ${response.status}`, errorText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'High traffic detected. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 500) {
        return new Response(
          JSON.stringify({ error: 'AI service is experiencing issues. Please try starting a new conversation.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Unable to process request. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return streaming response
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('[facility-chat] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
