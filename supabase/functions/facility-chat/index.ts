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

    // Detect conversation stage to provide appropriate quick-reply buttons
    const conversationText = formattedMessages.map(m => m.content).join(' ').toLowerCase();
    const hasSports = /basketball|volleyball|pickleball|soccer|tennis|baseball|turf|multi-sport|hockey|lacrosse/i.test(conversationText);
    const hasSize = /square feet|sq\.? ?ft|small|medium|large|(\d+,?\d*)\s*sf/i.test(conversationText);
    const hasLocation = /[A-Z][a-z]+,?\s+[A-Z]{2}/.test(formattedMessages.map(m => m.content).join(' '));
    const hasBudget = /budget|\$\d|million|cost|afford/i.test(conversationText);
    
    let stageGuidance = '';
    if (formattedMessages.length <= 2 && !hasSports) {
      stageGuidance = `First message - offer path selection buttons:
[QUICK_REPLIES]
[{"id":"quick","label":"Quick Estimate 🚀","value":"I want a quick cost estimate"},{"id":"easy","label":"Easy Wizard 🧙","value":"Guide me step-by-step"},{"id":"calc","label":"Full Calculator 🧮","value":"I want detailed customization"}]`;
    } else if (!hasSports) {
      stageGuidance = `No sports collected yet - offer sport buttons:
[QUICK_REPLIES]
[{"id":"basketball","label":"Basketball 🏀","value":"Basketball"},{"id":"volleyball","label":"Volleyball 🏐","value":"Volleyball"},{"id":"pickleball","label":"Pickleball 🏓","value":"Pickleball"},{"id":"soccer","label":"Soccer ⚽","value":"Indoor soccer/turf"},{"id":"multi","label":"Multi-Sport 🏟️","value":"Multiple sports"}]`;
    } else if (!hasSize) {
      stageGuidance = `Sports collected, need size - offer size buttons:
[QUICK_REPLIES]
[{"id":"small","label":"Small (10k-25k sf)","value":"Small facility, around 15,000 square feet"},{"id":"medium","label":"Medium (25k-50k sf)","value":"Medium sized, around 35,000 square feet"},{"id":"large","label":"Large (50k+ sf)","value":"Large facility, 60,000+ square feet"}]`;
    } else if (!hasLocation) {
      stageGuidance = `Sports and size collected, need location - offer location buttons:
[QUICK_REPLIES]
[{"id":"tx","label":"Texas","value":"Texas"},{"id":"ca","label":"California","value":"California"},{"id":"fl","label":"Florida","value":"Florida"},{"id":"ny","label":"New York","value":"New York"},{"id":"custom","label":"Other location","value":"Let me enter my city and state"}]`;
    } else if (!hasBudget) {
      stageGuidance = `Sports, size, location collected - optional budget buttons:
[QUICK_REPLIES]
[{"id":"under1m","label":"Under $1M","value":"Budget is under $1 million"},{"id":"1to3m","label":"$1M-$3M","value":"Budget is $1-3 million"},{"id":"3to5m","label":"$3M-$5M","value":"Budget is $3-5 million"},{"id":"over5m","label":"$5M+","value":"Budget is over $5 million"},{"id":"ready","label":"I'm ready for my report","value":"I have enough information, generate my report"}]`;
    }

    // System prompt for facility planning assistant
    const systemPrompt = `You are a helpful facility planning consultant helping users design their sports facility.

Your goal is to gather the following information through natural conversation:
1. **Sports/activities** - Which sports or activities they want (basketball, volleyball, pickleball, turf, etc.)
2. **Facility size** - Square footage or size descriptor (small=10,000-25,000 sf, medium=25,000-50,000 sf, large=50,000+ sf)
3. **Location** - City and state for accurate cost estimates
4. **Budget** - Approximate budget (optional but helpful)
5. **Timeline** - When they want to open (optional but helpful)

Ask conversational follow-up questions to clarify their vision. Be friendly and helpful.

QUICK-REPLY BUTTON INSTRUCTIONS:
- After EVERY response, include a [QUICK_REPLIES] section with button options
- Use the exact format: [QUICK_REPLIES] followed by a JSON array on the next line
- Buttons help users respond quickly by clicking instead of typing
- Always provide 3-5 relevant button options based on what information is still needed
- The button "value" is what gets sent as the user's message when clicked
- Include emoji in button labels to make them friendly and visual

${stageGuidance}

CRITICAL TRIGGER RULES:
- Once you have AT MINIMUM collected: (1) at least one sport/activity AND (2) facility size information, you MUST trigger report generation
- When you have enough information, respond with EXACTLY this phrase word-for-word:
"Perfect! I have everything I need. Let me generate your personalized facility report..."
- Do NOT modify this phrase in any way - it must be exact
- Do NOT add extra text before or after this phrase
- Do NOT include [QUICK_REPLIES] when triggering report generation
- This phrase triggers the lead capture and report generation flow

Example conversation flow:
User: "I want a basketball facility"
You: "Great! Basketball is a popular choice. How large of a facility are you thinking?"
[QUICK_REPLIES]
[{"id":"small","label":"Small (10k-25k sf)","value":"Small facility, around 15,000 square feet"},{"id":"medium","label":"Medium (25k-50k sf)","value":"Medium sized, around 35,000 square feet"},{"id":"large","label":"Large (50k+ sf)","value":"Large facility, 60,000+ square feet"}]

User: "Medium sized, around 40,000 square feet"
You: "Perfect! And where are you planning to build this facility? The location helps me provide accurate cost estimates."
[QUICK_REPLIES]
[{"id":"tx","label":"Texas","value":"Texas"},{"id":"ca","label":"California","value":"California"},{"id":"fl","label":"Florida","value":"Florida"},{"id":"custom","label":"Other location","value":"Let me enter my city and state"}]

User: "Dallas, Texas"
You: "Perfect! I have everything I need. Let me generate your personalized facility report..."`;

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
