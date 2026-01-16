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

// ============================================================
// COMPREHENSIVE KNOWLEDGE BASE - ALL PRICING & CONFIGURATIONS
// ============================================================

const EQUIPMENT_PRICING = `
## EQUIPMENT PRICING (Practice Sports - practicesports.com)

### Batting Cages & Baseball/Softball
- CurtainCage (Collapsible): $2,500-$3,500 per lane
- ShellCage (Standard): $2,500-$3,500 per lane  
- AirCage (Retractable Electric): $13,000-$17,000 each
- Tunnel Netting: $700-$1,200 each
- Pitching Machines: $2,000-$3,800 each
- L-Screens: $150-$350 each
- Portable Mounds: $800-$1,800 each
- Batting Tees: $25-$65 each
- Radar Speed Devices: $1,500-$3,500 each

### Basketball Equipment
- Competition Hoop Systems: $1,800-$4,500 each
- Hardwood Flooring: $10-$20/SF installed

### Volleyball Equipment
- Volleyball Net Systems: $1,600-$3,200 per court
- Sport Tile Flooring: $4-$8/SF installed

### Pickleball Equipment
- Pickleball Nets: $180-$450 each
- Sport Tile or Hardwood: $4-$20/SF installed

### Soccer/Multi-Sport
- Soccer Goals (pair): $700-$1,800
- Synthetic Turf: $6-$11/SF installed
- Divider Curtains: $400-$900 each

### Safety & Protection
- Wall Padding: $50-$75 per linear foot
- Netting Systems: Varies by size

### Building Systems
- LED Lighting: $2-$4/SF installed
- HVAC: $5-$10/SF installed
- IT/Security (cameras + WiFi): $5,000-$15,000 lump sum
- Locker/Restroom Fixtures: $12,000-$30,000 lump sum
`;

const BUILDING_PRICING = `
## BUILDING CONSTRUCTION PRICING

### Pre-Engineered Metal Buildings
- Metal Building Shell: $35-$60/SF (includes frame, roof, walls)
- Concrete Foundation (6" slab): $8-$14/SF
- Insulation Package: $2-$5/SF

### Doors & Openings
- Roll-Up Door 12'x14': $4,500-$7,000 each
- Roll-Up Door 10'x12': $3,500-$5,500 each
- Steel Man Door: $800-$1,800 each
- Glass Storefront Entry: $6,000-$12,000 each
- Windows 4'x4': $600-$1,400 each

### Site Work
- Site Preparation & Grading: $2-$5/SF
- Asphalt Parking Lot: $4-$7/SF
- Utilities Connection: $15,000-$40,000 lump sum

### Building Systems
- Electrical Service (400A): $25,000-$50,000 lump sum
- Plumbing Rough-in: $12,000-$28,000 lump sum
- Fire Sprinkler System: $3-$6/SF

### Total Building Cost Estimates (turnkey)
- Small facility (10k-15k SF): $65-$85/SF all-in
- Medium facility (20k-30k SF): $55-$75/SF all-in
- Large facility (40k+ SF): $50-$70/SF all-in
`;

const FACILITY_PRESETS = `
## PRE-CONFIGURED FACILITY PACKAGES

### Batting Cage Facility (8 lanes)
- Size: 16,000 SF, 20' ceiling height
- Configuration: 8 batting tunnels
- Total CapEx: ~$580,000
- Monthly Revenue: ~$35,000
- Monthly OpEx: ~$22,000
- Best for: Youth baseball/softball, team training, lessons

### Basketball Facility (4 courts)
- Size: 24,000 SF, 24' ceiling height
- Configuration: 4 full-size regulation courts
- Total CapEx: ~$850,000
- Monthly Revenue: ~$42,000
- Monthly OpEx: ~$28,000
- Best for: Leagues, tournaments, open gym

### Pickleball Facility (6 courts)
- Size: 12,000 SF, 16' ceiling height
- Configuration: 6 regulation pickleball courts
- Total CapEx: ~$425,000
- Monthly Revenue: ~$28,000
- Monthly OpEx: ~$18,000
- Best for: Adults 50+, leagues, drop-in play

### Multi-Sport Complex
- Size: 28,000 SF, 24' ceiling height
- Configuration: 2 basketball courts + 4 volleyball courts + 1 batting cage
- Total CapEx: ~$980,000
- Monthly Revenue: ~$52,000
- Monthly OpEx: ~$32,000
- Best for: Multiple sports leagues, schools, clubs

### Volleyball Facility (6 courts)
- Size: 27,000 SF, 24' ceiling height
- Configuration: 6 volleyball courts
- Total CapEx: ~$930,000
- Monthly Revenue: ~$48,000
- Monthly OpEx: ~$31,500
- Best for: Club teams, adult leagues, tournaments
`;

const SPORT_REQUIREMENTS = `
## SPACE REQUIREMENTS BY SPORT

### Baseball/Softball
- Batting Tunnel: ~1,050 SF per tunnel (70'L x 15'W)
- Minimum Ceiling Height: 16-18'
- Recommended: 20'+ for lob/arc pitches
- Flooring: Turf with padding

### Basketball
- Full Court: ~5,000 SF per court (94' x 50' + buffer)
- Half Court: ~2,500 SF
- Minimum Ceiling Height: 24-28'
- Flooring: Hardwood or sport tile

### Volleyball
- Court: ~4,500 SF per court (60' x 30' + buffer)
- Minimum Ceiling Height: 23-26'
- Flooring: Hardwood or sport tile

### Pickleball
- Court: ~1,350 SF per court (30' x 60' + buffer)
- Minimum Ceiling Height: 16-18'
- Flooring: Sport tile or hardwood

### Soccer (Indoor)
- Small Field: ~8,000 SF (varies)
- Minimum Ceiling Height: 16-20'
- Flooring: Synthetic turf

### Multi-Sport Turf
- Flexible: 5,000-15,000 SF zones
- Ceiling Height: 18-24'
- Flooring: Synthetic turf
`;

const BUSINESS_METRICS = `
## FINANCIAL BENCHMARKS & ROI

### Operating Expense Ratios
- Typical: 55-70% of gross revenue
- Staffing: 25-35% of revenue
- Rent/Lease: 10-15% of revenue
- Utilities: 5-8% of revenue
- Insurance: 2-4% of revenue
- Maintenance: 3-5% of revenue
- Marketing: 3-5% of revenue

### Revenue Per Square Foot
- Batting Cages: $25-$45/SF/year
- Basketball Courts: $18-$28/SF/year
- Pickleball Courts: $22-$35/SF/year
- Multi-Sport: $20-$30/SF/year

### Break-Even Timeline
- Conservative: 24-36 months
- Moderate: 18-24 months
- Aggressive: 12-18 months

### Hourly Rental Rates (typical)
- Batting Cage Lane: $25-$45/hour
- Full Basketball Court: $100-$200/hour
- Half Court: $50-$100/hour
- Volleyball Court: $60-$120/hour
- Pickleball Court: $15-$30/hour
- Turf Field Rental: $150-$300/hour

### Membership Models
- Monthly Memberships: $50-$150/person
- Annual Memberships: $500-$1,500/person
- Drop-in Rates: $10-$25/visit

### Staffing Guidelines
- Manager: $45,000-$65,000/year
- Coaches/Trainers: $15-$35/hour
- Front Desk: $12-$18/hour
- Maintenance: $15-$22/hour
`;

const FAQ_KNOWLEDGE = `
## FREQUENTLY ASKED QUESTIONS

### Facility Sizing
- Parking: 5-6 spaces per 1,000 SF of facility
- Circulation Space: 15-20% additional for hallways, lobbies
- Storage: 3-5% of total space

### Ceiling Heights
- Basketball: 24-28' minimum (28'+ preferred for competition)
- Volleyball: 23-26' minimum
- Pickleball: 16-18' minimum
- Baseball Training: 16-18' (20'+ for high arc)

### Popular Add-Ons
- Pro shop/retail area: 200-500 SF
- Observation seating: 10-20 spectators per court
- Training rooms: 200-400 SF
- Party/meeting rooms: 300-600 SF

### Best ROI Sports
1. Pickleball - Growing fastest, lower build cost, high demand
2. Baseball Training - Year-round demand, lesson revenue
3. Basketball - Tournament hosting, league revenue
4. Multi-Sport - Flexibility, diverse revenue streams

### Common Mistakes to Avoid
- Undersizing parking
- Insufficient ceiling height
- Poor HVAC planning
- Inadequate storage
- No spectator seating
`;

// ============================================================
// MAIN SERVER LOGIC
// ============================================================

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
    const maxRequests = 30;

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

    // Filter and format messages for AI API
    let formattedMessages = messages
      .filter((msg: any) => {
        if (msg.role === 'assistant' && msg.content.includes("Welcome! I'm here to help you plan")) {
          return false;
        }
        return true;
      })
      .map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));

    // Limit conversation length
    if (formattedMessages.length > 12) {
      formattedMessages = formattedMessages.slice(-12);
    }

    console.log(`[facility-chat] Sending ${formattedMessages.length} messages to AI`);

    // Detect conversation context
    const conversationText = formattedMessages.map(m => m.content).join(' ').toLowerCase();
    
    // Detect selected mode
    let selectedMode: 'fast' | 'advanced' | 'expert' | null = null;
    if (/fast.*basic.*mode|quick estimate/i.test(conversationText)) {
      selectedMode = 'fast';
    } else if (/advanced.*mode/i.test(conversationText)) {
      selectedMode = 'advanced';
    } else if (/expert.*detailed.*mode|full.*analysis/i.test(conversationText)) {
      selectedMode = 'expert';
    }

    // Detect what user is asking about
    const isPricingQuestion = /how much|cost|price|pricing|budget|afford|expense|investment/i.test(conversationText);
    const isEquipmentQuestion = /equipment|cage|hoop|net|turf|flooring|machine|batting cage|pitching/i.test(conversationText);
    const isBuildingQuestion = /building|construction|shell|foundation|door|site work|metal building|concrete/i.test(conversationText);
    const isBusinessQuestion = /roi|revenue|profit|break.?even|operating|staffing|salary|membership|pricing strategy/i.test(conversationText);
    const isPresetQuestion = /preset|package|pre.?configured|turn.?key|template/i.test(conversationText);

    // Detect conversation stage
    const hasSports = /basketball|volleyball|pickleball|soccer|tennis|baseball|turf|multi-sport|hockey|lacrosse/i.test(conversationText);
    const hasSize = /square feet|sq\.? ?ft|small|medium|large|(\d+,?\d*)\s*sf/i.test(conversationText);
    const hasLocation = /[A-Z][a-z]+,?\s+[A-Z]{2}/.test(formattedMessages.map(m => m.content).join(' '));
    const hasBudget = /budget|\$\d|million|cost|afford/i.test(conversationText);
    const hasTimeline = /timeline|month|year|soon|immediately/i.test(conversationText);
    const hasBuildMode = /new construction|retrofit|existing|lease|buy/i.test(conversationText);

    // Build stage guidance for quick-reply buttons
    let stageGuidance = '';
    
    if (!selectedMode) {
      stageGuidance = `No mode selected yet. Ask user which planning mode they prefer and ALWAYS include these buttons:
[QUICK_REPLIES]
[{"id":"fast","label":"⚡ Fast / Basic","value":"I want the Fast Basic mode - quick 2-3 minute estimate"},{"id":"advanced","label":"🎯 Advanced","value":"I want Advanced mode - detailed 5 minute planning"},{"id":"expert","label":"🔬 Expert","value":"I want Expert mode - comprehensive full analysis"}]`;
    } else if (selectedMode === 'fast') {
      if (!hasSports) {
        stageGuidance = `FAST MODE - Ask about sports with buttons:
[QUICK_REPLIES]
[{"id":"basketball","label":"Basketball 🏀","value":"Basketball"},{"id":"volleyball","label":"Volleyball 🏐","value":"Volleyball"},{"id":"pickleball","label":"Pickleball 🏓","value":"Pickleball"},{"id":"baseball","label":"Baseball/Softball ⚾","value":"Baseball/Softball"},{"id":"multi","label":"Multi-Sport 🏟️","value":"Multiple sports"}]`;
      } else if (!hasSize) {
        stageGuidance = `FAST MODE - Ask about size with buttons:
[QUICK_REPLIES]
[{"id":"small","label":"Small (10k-25k sf)","value":"Small facility, around 15,000 square feet"},{"id":"medium","label":"Medium (25k-50k sf)","value":"Medium sized, around 35,000 square feet"},{"id":"large","label":"Large (50k+ sf)","value":"Large facility, 60,000+ square feet"}]`;
      } else if (!hasLocation) {
        stageGuidance = `FAST MODE - Ask about location:
[QUICK_REPLIES]
[{"id":"tx","label":"Texas","value":"Texas"},{"id":"ca","label":"California","value":"California"},{"id":"fl","label":"Florida","value":"Florida"},{"id":"ny","label":"New York","value":"New York"},{"id":"custom","label":"Other location","value":"Let me enter my city and state"}]`;
      } else {
        stageGuidance = `FAST MODE - You have all required info. TRIGGER REPORT NOW.`;
      }
    } else if (selectedMode === 'advanced') {
      if (!hasSports) {
        stageGuidance = `ADVANCED MODE - Ask about sports with buttons.`;
      } else if (!hasSize) {
        stageGuidance = `ADVANCED MODE - Ask about size with buttons.`;
      } else if (!hasLocation) {
        stageGuidance = `ADVANCED MODE - Ask about location with buttons.`;
      } else if (!hasBudget) {
        stageGuidance = `ADVANCED MODE - Ask about budget:
[QUICK_REPLIES]
[{"id":"under1m","label":"Under $1M","value":"Budget under $1 million"},{"id":"1to3m","label":"$1M-$3M","value":"Budget $1-3 million"},{"id":"3to5m","label":"$3M-$5M","value":"Budget $3-5 million"},{"id":"over5m","label":"$5M+","value":"Budget over $5 million"}]`;
      } else if (!hasTimeline) {
        stageGuidance = `ADVANCED MODE - Ask about timeline:
[QUICK_REPLIES]
[{"id":"6mo","label":"6 months","value":"6 months"},{"id":"1yr","label":"6-12 months","value":"6-12 months"},{"id":"2yr","label":"1-2 years","value":"1-2 years"},{"id":"exploring","label":"Just exploring","value":"Just exploring options"}]`;
      } else {
        stageGuidance = `ADVANCED MODE - You have enough info. TRIGGER REPORT NOW.`;
      }
    } else if (selectedMode === 'expert') {
      stageGuidance = `EXPERT MODE - Gather comprehensive details about equipment preferences, staffing, revenue programs, operating costs. After 8-10 detailed exchanges, TRIGGER REPORT.`;
    }

    // System prompt with full knowledge base
    const systemPrompt = `You are an expert sports facility planning consultant for SportsFacility.com.

=== CRITICAL GROUNDING RULES (MANDATORY - FOLLOW THESE EXACTLY) ===

1. **ONLY use information from the knowledge base below** - NEVER make up statistics, prices, facts, or estimates not explicitly listed
2. **If asked about something NOT in your knowledge base**, respond: "I don't have specific information on that topic in my database. I can help you with facility planning, equipment pricing, construction costs, and business metrics that I have documented."
3. **NEVER provide**: legal advice, tax advice, specific zoning/permit regulations, medical advice, safety certifications, financing/loan advice, or competitor recommendations
4. **All pricing is ESTIMATES ONLY for planning purposes** - Regional costs vary significantly

=== OFF-LIMITS TOPICS (Politely decline these) ===
- Specific legal/zoning requirements → Say: "Please consult your local planning department for zoning requirements."
- Tax/accounting advice → Say: "Please consult a CPA or financial advisor for tax implications."
- Competitor products or pricing → Say: "I can only provide information about the equipment and services we offer."
- Medical/safety certifications → Say: "Please consult relevant safety authorities for certification requirements."
- Financing/loan advice → Say: "Please consult a lender or financial advisor for financing options."
- Insurance specifics → Say: "Please consult an insurance broker for coverage recommendations."

=== MANDATORY PRICING DISCLAIMER ===
Include this disclaimer with ALL pricing responses:
"💡 *These are budget planning estimates based on national averages (Dec 2024). Actual costs vary by region, vendor, and project specifics. Contact us for a detailed quote.*"

=== KNOWLEDGE BASE (Last Updated: December 2024) ===
For current quotes, contact: sales@sportsfacility.com

${EQUIPMENT_PRICING}

${BUILDING_PRICING}

${FACILITY_PRESETS}

${SPORT_REQUIREMENTS}

${BUSINESS_METRICS}

${FAQ_KNOWLEDGE}

=== RESPONSE BEHAVIOR ===

QUESTION TYPE DETECTION:
${isPricingQuestion ? '- User is asking about PRICING - Provide specific dollar amounts from your knowledge base' : ''}
${isEquipmentQuestion ? '- User is asking about EQUIPMENT - List specific items with prices' : ''}
${isBuildingQuestion ? '- User is asking about BUILDING/CONSTRUCTION - Provide building cost breakdowns' : ''}
${isBusinessQuestion ? '- User is asking about BUSINESS/ROI - Share financial benchmarks' : ''}
${isPresetQuestion ? '- User is asking about PRESET PACKAGES - Describe pre-configured facility options' : ''}

WHEN ANSWERING PRICING/EQUIPMENT QUESTIONS:
- Give SPECIFIC dollar amounts (not "varies" or "it depends")
- Use ranges (low-mid-high) when appropriate
- Mention that prices are for budgeting and can vary by region
- Offer to provide more detail or help plan their facility
- After answering, offer relevant follow-up buttons

${selectedMode ? `
=== PLANNING MODE: ${selectedMode.toUpperCase()} ===

${selectedMode === 'fast' ? `FAST MODE (3-4 questions only): Sport → Size → Location → Generate Report` : ''}
${selectedMode === 'advanced' ? `ADVANCED MODE (6-8 questions): Sport → Size → Location → Budget → Timeline → Build Mode → Generate Report` : ''}
${selectedMode === 'expert' ? `EXPERT MODE (10+ questions): Comprehensive details on all aspects before generating report` : ''}

CURRENT PROGRESS:
- Sports: ${hasSports ? 'COLLECTED ✓' : 'NEEDED'}
- Size: ${hasSize ? 'COLLECTED ✓' : 'NEEDED'}
- Location: ${hasLocation ? 'COLLECTED ✓' : 'NEEDED'}
${selectedMode !== 'fast' ? `- Budget: ${hasBudget ? 'COLLECTED ✓' : 'NEEDED'}` : ''}
${selectedMode !== 'fast' ? `- Timeline: ${hasTimeline ? 'COLLECTED ✓' : 'NEEDED'}` : ''}

${stageGuidance}
` : `
=== MODE SELECTION REQUIRED (CRITICAL) ===
User hasn't selected a planning mode yet.

⚠️ **ABSOLUTELY MANDATORY**: Your response MUST end with mode selection buttons:

[QUICK_REPLIES]
[{"id":"fast","label":"⚡ Fast / Basic","value":"I want the Fast Basic mode - quick 2-3 minute estimate"},{"id":"advanced","label":"🎯 Advanced","value":"I want Advanced mode - detailed 5 minute planning"},{"id":"expert","label":"🔬 Expert","value":"I want Expert mode - comprehensive full analysis"}]

Even if answering a question, ALWAYS include these mode buttons at the end.
`}

=== QUICK-REPLY BUTTONS (⚠️ ABSOLUTELY MANDATORY - NEVER SKIP) ===

**CRITICAL: YOU MUST END EVERY SINGLE RESPONSE WITH [QUICK_REPLIES]** - No exceptions!

If no mode selected → Include mode selection buttons (Fast/Advanced/Expert)
If mode selected → Include contextual next-step buttons

Format (must be on its own lines at the END of your response):

[QUICK_REPLIES]
[{"id":"opt1","label":"Option Label 🏀","value":"Full sentence when clicked"}]

RULES:
1. ⚠️ ALWAYS provide button options - users should CLICK, not type
2. After pricing answers, offer buttons like: "See equipment list", "Get building costs", "Start planning"
3. 3-5 buttons per response
4. Include emojis in labels
5. Values should be complete sentences
6. ⚠️ FAILING TO INCLUDE [QUICK_REPLIES] IS A CRITICAL ERROR

=== REPORT EMAIL OFFER (IMPORTANT) ===

When you provide a DETAILED response with ANY of these:
- Cost breakdowns with 3+ line items showing $ amounts
- Equipment lists with pricing
- Building cost estimates
- Complete facility budgets
- Multi-item quotes or estimates

Then you MUST include this button as the FIRST option in [QUICK_REPLIES]:
{"id":"email-report","label":"📧 Email this report","value":"[EMAIL_REPORT]"}

Example with email button:
[QUICK_REPLIES]
[{"id":"email-report","label":"📧 Email this report","value":"[EMAIL_REPORT]"},{"id":"more","label":"Get more details","value":"Tell me more about..."}]

EXAMPLE RESPONSES:

User: "How much does a batting cage cost?"
You: "Batting cages typically cost **$2,500-$3,500 per lane** for standard ShellCage systems. Here's the breakdown:
- CurtainCage (Budget): $2,500/lane
- ShellCage (Standard): $3,000/lane
- AirCage (Premium Retractable): $13,000-$17,000 each

This doesn't include installation (~20%) or flooring ($6-11/SF for turf).

For an 8-lane facility, expect $24,000-$40,000 just for cages, plus flooring and installation.

[QUICK_REPLIES]
[{"id":"full","label":"Full baseball facility cost 💰","value":"What's the total cost for a complete baseball training facility?"},{"id":"equip","label":"All baseball equipment ⚾","value":"Show me all the equipment needed for baseball training"},{"id":"plan","label":"Start planning my facility 📋","value":"Help me plan my baseball facility"}]"

=== TRIGGER PHRASE ===
When you have enough information FOR THE SELECTED MODE, respond with EXACTLY:
"Perfect! I have everything I need. Let me generate your personalized facility report..."
(Do NOT include [QUICK_REPLIES] when triggering report generation)`;

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
        temperature: 0.2, // Low temperature for factual, knowledge-base-grounded responses
        max_tokens: 700
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      console.error(`[facility-chat] Lovable AI error: ${response.status}`, errorText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'API credits exhausted.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[facility-chat] Streaming response from AI');

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('[facility-chat] Error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
