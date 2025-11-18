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
        // Skip the initial assistant greeting with mode selection (it's UI-only)
        if (msg.role === 'assistant' && msg.content.includes("Welcome! I'm here to help you plan")) {
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

    // Detect selected mode from conversation
    const conversationText = formattedMessages.map(m => m.content).join(' ').toLowerCase();
    let selectedMode: 'fast' | 'advanced' | 'expert' | null = null;

    if (/fast.*basic.*mode|quick estimate/i.test(conversationText)) {
      selectedMode = 'fast';
    } else if (/advanced.*mode/i.test(conversationText)) {
      selectedMode = 'advanced';
    } else if (/expert.*detailed.*mode|full.*analysis/i.test(conversationText)) {
      selectedMode = 'expert';
    }

    // Detect conversation stage to provide appropriate quick-reply buttons
    const hasSports = /basketball|volleyball|pickleball|soccer|tennis|baseball|turf|multi-sport|hockey|lacrosse/i.test(conversationText);
    const hasSize = /square feet|sq\.? ?ft|small|medium|large|(\d+,?\d*)\s*sf/i.test(conversationText);
    const hasLocation = /[A-Z][a-z]+,?\s+[A-Z]{2}/.test(formattedMessages.map(m => m.content).join(' '));
    const hasBudget = /budget|\$\d|million|cost|afford/i.test(conversationText);
    const hasTimeline = /timeline|month|year|soon|immediately/i.test(conversationText);
    const hasBuildMode = /new construction|retrofit|existing|lease|buy/i.test(conversationText);
    
    let stageGuidance = '';
    
    // Mode-specific guidance
    if (!selectedMode) {
      stageGuidance = `No mode selected yet - user should select Fast, Advanced, or Expert mode first.`;
    } else if (selectedMode === 'fast') {
      // Fast mode: 3-4 questions only
      if (!hasSports) {
        stageGuidance = `FAST MODE - Ask about sports with buttons:
[QUICK_REPLIES]
[{"id":"basketball","label":"Basketball 🏀","value":"Basketball"},{"id":"volleyball","label":"Volleyball 🏐","value":"Volleyball"},{"id":"pickleball","label":"Pickleball 🏓","value":"Pickleball"},{"id":"soccer","label":"Soccer ⚽","value":"Indoor soccer/turf"},{"id":"multi","label":"Multi-Sport 🏟️","value":"Multiple sports"}]`;
      } else if (!hasSize) {
        stageGuidance = `FAST MODE - Ask about size with buttons:
[QUICK_REPLIES]
[{"id":"small","label":"Small (10k-25k sf)","value":"Small facility, around 15,000 square feet"},{"id":"medium","label":"Medium (25k-50k sf)","value":"Medium sized, around 35,000 square feet"},{"id":"large","label":"Large (50k+ sf)","value":"Large facility, 60,000+ square feet"}]`;
      } else if (!hasLocation) {
        stageGuidance = `FAST MODE - Ask about location with buttons:
[QUICK_REPLIES]
[{"id":"tx","label":"Texas","value":"Texas"},{"id":"ca","label":"California","value":"California"},{"id":"fl","label":"Florida","value":"Florida"},{"id":"ny","label":"New York","value":"New York"},{"id":"custom","label":"Other location","value":"Let me enter my city and state"}]`;
      } else {
        stageGuidance = `FAST MODE - You have all required info (sports, size, location). TRIGGER REPORT NOW with the exact phrase.`;
      }
    } else if (selectedMode === 'advanced') {
      // Advanced mode: 6-8 questions
      if (!hasSports) {
        stageGuidance = `ADVANCED MODE - Ask about sports with buttons:
[QUICK_REPLIES]
[{"id":"basketball","label":"Basketball 🏀","value":"Basketball"},{"id":"volleyball","label":"Volleyball 🏐","value":"Volleyball"},{"id":"pickleball","label":"Pickleball 🏓","value":"Pickleball"},{"id":"soccer","label":"Soccer ⚽","value":"Indoor soccer/turf"},{"id":"multi","label":"Multi-Sport 🏟️","value":"Multiple sports"}]`;
      } else if (!hasSize) {
        stageGuidance = `ADVANCED MODE - Ask about size with buttons:
[QUICK_REPLIES]
[{"id":"small","label":"Small (10k-25k sf)","value":"Small facility, around 15,000 square feet"},{"id":"medium","label":"Medium (25k-50k sf)","value":"Medium sized, around 35,000 square feet"},{"id":"large","label":"Large (50k+ sf)","value":"Large facility, 60,000+ square feet"}]`;
      } else if (!hasLocation) {
        stageGuidance = `ADVANCED MODE - Ask about location with buttons:
[QUICK_REPLIES]
[{"id":"tx","label":"Texas","value":"Texas"},{"id":"ca","label":"California","value":"California"},{"id":"fl","label":"Florida","value":"Florida"},{"id":"ny","label":"New York","value":"New York"},{"id":"custom","label":"Other location","value":"Let me enter my city and state"}]`;
      } else if (!hasBudget) {
        stageGuidance = `ADVANCED MODE - Ask about budget with buttons:
[QUICK_REPLIES]
[{"id":"under1m","label":"Under $1M","value":"Budget is under $1 million"},{"id":"1to3m","label":"$1M-$3M","value":"Budget is $1-3 million"},{"id":"3to5m","label":"$3M-$5M","value":"Budget is $3-5 million"},{"id":"over5m","label":"$5M+","value":"Budget is over $5 million"},{"id":"skip","label":"Skip this","value":"Not sure about budget yet"}]`;
      } else if (!hasTimeline) {
        stageGuidance = `ADVANCED MODE - Ask about timeline with buttons:
[QUICK_REPLIES]
[{"id":"6mo","label":"6 months","value":"6 months"},{"id":"6to12","label":"6-12 months","value":"6-12 months"},{"id":"1to2yr","label":"1-2 years","value":"1-2 years"},{"id":"exploring","label":"Just exploring","value":"Just exploring options"}]`;
      } else if (!hasBuildMode) {
        stageGuidance = `ADVANCED MODE - Ask about build mode with buttons:
[QUICK_REPLIES]
[{"id":"new","label":"New Construction","value":"New construction"},{"id":"retrofit","label":"Retrofit Existing","value":"Retrofit existing building"},{"id":"notsure","label":"Not Sure","value":"Not sure yet"}]`;
      } else {
        stageGuidance = `ADVANCED MODE - You have enough info (sports, size, location, budget, timeline, build mode). TRIGGER REPORT NOW.`;
      }
    } else if (selectedMode === 'expert') {
      // Expert mode: 10+ comprehensive questions
      if (!hasSports) {
        stageGuidance = `EXPERT MODE - Ask about sports with buttons:
[QUICK_REPLIES]
[{"id":"basketball","label":"Basketball 🏀","value":"Basketball"},{"id":"volleyball","label":"Volleyball 🏐","value":"Volleyball"},{"id":"pickleball","label":"Pickleball 🏓","value":"Pickleball"},{"id":"soccer","label":"Soccer ⚽","value":"Indoor soccer/turf"},{"id":"multi","label":"Multi-Sport 🏟️","value":"Multiple sports"}]`;
      } else if (!hasSize) {
        stageGuidance = `EXPERT MODE - Ask about size with detailed options:
[QUICK_REPLIES]
[{"id":"small","label":"Small (10k-25k sf)","value":"Small facility, around 15,000 square feet"},{"id":"medium","label":"Medium (25k-50k sf)","value":"Medium sized, around 35,000 square feet"},{"id":"large","label":"Large (50k+ sf)","value":"Large facility, 60,000+ square feet"},{"id":"custom","label":"Custom size","value":"Let me specify exact square footage"}]`;
      } else if (!hasLocation) {
        stageGuidance = `EXPERT MODE - Ask about location:
[QUICK_REPLIES]
[{"id":"tx","label":"Texas","value":"Texas"},{"id":"ca","label":"California","value":"California"},{"id":"fl","label":"Florida","value":"Florida"},{"id":"ny","label":"New York","value":"New York"},{"id":"custom","label":"Other location","value":"Let me enter my city and state"}]`;
      } else if (!hasBudget) {
        stageGuidance = `EXPERT MODE - Ask about budget with detailed ranges:
[QUICK_REPLIES]
[{"id":"under1m","label":"Under $1M","value":"Budget is under $1 million"},{"id":"1to3m","label":"$1M-$3M","value":"Budget is $1-3 million"},{"id":"3to5m","label":"$3M-$5M","value":"Budget is $3-5 million"},{"id":"5to10m","label":"$5M-$10M","value":"Budget is $5-10 million"},{"id":"over10m","label":"$10M+","value":"Budget is over $10 million"}]`;
      } else if (!hasTimeline) {
        stageGuidance = `EXPERT MODE - Ask about timeline:
[QUICK_REPLIES]
[{"id":"3mo","label":"3 months","value":"3 months"},{"id":"6mo","label":"6 months","value":"6 months"},{"id":"1yr","label":"1 year","value":"1 year"},{"id":"2yr","label":"2+ years","value":"2+ years"}]`;
      } else if (!hasBuildMode) {
        stageGuidance = `EXPERT MODE - Ask about build mode with detailed follow-ups:
[QUICK_REPLIES]
[{"id":"new","label":"New Construction","value":"New construction from ground up"},{"id":"retrofit","label":"Retrofit","value":"Convert existing building"},{"id":"lease","label":"Lease","value":"Lease existing facility"}]`;
      } else {
        stageGuidance = `EXPERT MODE - Continue gathering detailed information about equipment preferences, staffing plans, revenue programs, and operating costs. Ask follow-up questions to get comprehensive details. After 8-10 detailed exchanges, TRIGGER REPORT.`;
      }
    }

    // System prompt for facility planning assistant
    const systemPrompt = `You are a helpful facility planning consultant helping users design their sports facility.

${selectedMode ? `
SELECTED MODE: ${selectedMode.toUpperCase()}

${selectedMode === 'fast' ? `
**FAST/BASIC MODE** (3-4 questions only)
- Ask ONLY about: Sport type, Facility size, Location
- Keep questions simple and quick
- After these 3 answers, trigger report generation immediately
- Don't ask about budget, timeline, or detailed features
- Focus on speed - users want a quick ballpark estimate
` : ''}

${selectedMode === 'advanced' ? `
**ADVANCED MODE** (6-8 questions)
- Ask about: Sport, Size, Location, Budget range, Timeline, Build mode (new/retrofit)
- Include moderate detail questions
- After 6-8 questions with good coverage, trigger report generation
- Don't dive into equipment specifics or detailed staffing
- Balance detail with reasonable time investment
` : ''}

${selectedMode === 'expert' ? `
**EXPERT/DETAILED MODE** (10+ comprehensive questions)
- Ask about: Sport, Size, Location, Budget, Timeline, Build mode, Equipment preferences, Staffing plans, Revenue programs, Operating costs
- Go deep on each topic with follow-up questions
- Ask about specific equipment needs, quality preferences
- Explore staffing structure, roles, compensation
- Discuss revenue models, pricing strategies
- Collect comprehensive information before triggering report
- This is for users who want detailed business planning and are willing to invest time
` : ''}

CURRENT PROGRESS:
- Mode selected: ${selectedMode}
- Sports: ${hasSports ? 'COLLECTED' : 'NEEDED'}
- Size: ${hasSize ? 'COLLECTED' : 'NEEDED'}
- Location: ${hasLocation ? 'COLLECTED' : 'NEEDED'}
${selectedMode !== 'fast' ? `- Budget: ${hasBudget ? 'COLLECTED' : 'NEEDED'}` : ''}
${selectedMode !== 'fast' ? `- Timeline: ${hasTimeline ? 'COLLECTED' : 'NEEDED'}` : ''}
${selectedMode !== 'fast' ? `- Build Mode: ${hasBuildMode ? 'COLLECTED' : 'NEEDED'}` : ''}

Ask the next appropriate question based on what's still NEEDED for your selected mode.
` : `
**MODE SELECTION REQUIRED**
The user hasn't selected a mode yet. Wait for them to choose Fast/Basic, Advanced, or Expert/Detailed mode before proceeding with questions.
`}

Your goal is to gather information appropriate to the selected mode through natural conversation.
Ask conversational follow-up questions to clarify their vision. Be friendly and helpful.

QUICK-REPLY BUTTON INSTRUCTIONS:
- After EVERY response, include a [QUICK_REPLIES] section with button options
- Use the exact format: [QUICK_REPLIES] followed by a JSON array on the next line
- Buttons help users respond quickly by clicking instead of typing
- Always provide 3-5 relevant button options based on what information is still needed
- The button "value" is what gets sent as the user's message when clicked
- Include emoji in button labels to make them friendly and visual

${stageGuidance}

CRITICAL TRIGGER RULES (MODE-DEPENDENT):
${selectedMode === 'fast' ? `
- FAST MODE: Once you have sports, size, and location, IMMEDIATELY trigger report
` : ''}
${selectedMode === 'advanced' ? `
- ADVANCED MODE: Once you have sports, size, location, budget, timeline, and build mode, trigger report
` : ''}
${selectedMode === 'expert' ? `
- EXPERT MODE: After 8-10 detailed exchanges covering all major topics, trigger report
` : ''}
- When you have enough information FOR YOUR MODE, respond with EXACTLY this phrase word-for-word:
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
