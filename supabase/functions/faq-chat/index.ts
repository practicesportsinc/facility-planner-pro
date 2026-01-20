import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS - restrict to known domains
const ALLOWED_ORIGINS = [
  'https://sportsfacility.ai',
  'https://www.sportsfacility.ai',
  'https://facility-planner-pro.lovable.app',
  'https://id-preview--4da7e89e-10c0-46bf-bb1a-9914ee136192.lovable.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || 
    origin.endsWith('.lovable.app') || 
    origin.endsWith('.lovableproject.com') ||
    origin.endsWith('sportsfacility.ai')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

const FAQ_KNOWLEDGE_BASE = `
## FACILITY SIZE & SPACE PLANNING

Q: What is the average size of a sports facility?
A: Sports facilities range from 8,000 to 100,000+ square feet depending on sport types and revenue goals. Basketball facilities typically need 20,000-40,000 SF, while baseball training centers start around 15,000 SF.

Q: How much space do I need for a basketball court?
A: A regulation high school basketball court requires approximately 5,040 SF (84' x 50') plus safety clearances. With run-out space, plan for 6,000-7,000 SF per court. Multi-court facilities typically allocate 5,500-6,000 SF per court.

Q: What's the minimum size for a baseball training facility?
A: A minimum viable baseball facility starts at 8,000-10,000 SF for 4-6 batting cages. For a competitive training center with pitching mounds, fielding areas, and strength training, plan for 15,000-25,000 SF.

Q: Can I combine multiple sports in one facility?
A: Yes, multi-sport facilities are common and can improve revenue diversification. Plan for convertible court space, adequate ceiling heights for all sports, and proper flooring transitions. Basketball/volleyball combinations work well.

Q: How do ceiling height requirements vary by sport?
A: Basketball: 24' minimum (28'+ preferred). Volleyball: 23' minimum. Baseball cages: 14-16'. Pickleball: 20' minimum. Multi-sport facilities should plan for the tallest requirement.

Q: What's the ideal facility layout for maximizing revenue?
A: Optimal layouts include: visible reception area, flexible court space that converts between sports, dedicated training rooms, viewing areas for parents, retail space, and efficient traffic flow patterns.

Q: How much parking do I need?
A: Plan for 1 parking space per 200-250 SF of facility space. A 20,000 SF facility needs approximately 80-100 parking spaces. Local codes may require more.

Q: What are common facility zoning requirements?
A: Sports facilities typically require commercial or light industrial zoning. Key considerations: parking ratios, noise ordinances, hours of operation, signage restrictions, and occupancy limits.

## CEILING HEIGHTS & BUILDING SPECS

Q: What is "clear height" vs "eave height"?
A: Eave height is the measurement from the ground to where the roof meets the wall. Clear height is from the finished floor to the lowest obstruction (lights, HVAC, structure)—typically 2-4' less than eave height.

Q: Why is clear height so important?
A: Clear height determines which sports can be played and affects ball flight, lighting placement, and HVAC routing. Insufficient clear height limits programming options and can make spaces feel cramped.

Q: What clear heights do different sports require?
A: Basketball: 24' minimum (28'+ for competitive). Volleyball: 23' minimum. Baseball cages: 14-16'. Pickleball: 20' minimum. Soccer: 30'+ for headers/aerial play.

Q: Can I have different ceiling heights in different areas?
A: Yes, many facilities use varied ceiling heights to optimize costs. Training areas may have lower ceilings while main courts have full height. This requires careful planning during construction.

Q: What building type is best for sports facilities?
A: Pre-engineered metal buildings (PEB) are most common due to cost efficiency and clear-span capabilities. Costs range $50-150/SF depending on finish level and location.

## COSTS & BUDGETING

Q: What's the typical cost per square foot for a sports facility?
A: Basic shell buildings: $45-65/SF. Standard turnkey facilities: $100-150/SF. Premium facilities with high-end finishes: $175-250/SF. These ranges vary by location and specifications.

Q: What's included in "turnkey" facility costs?
A: Turnkey typically includes: building shell, HVAC, electrical, plumbing, flooring, basic equipment, locker rooms, restrooms, and reception area. It excludes land, permits, and specialized equipment.

Q: How much should I budget for equipment?
A: Equipment costs vary widely: Basketball systems: $3,000-15,000 each. Batting cages: $3,000-8,000 per tunnel. Turf flooring: $4-12/SF. Strength equipment: $50,000-200,000 for a basic setup.

Q: What are typical operating expenses?
A: Monthly operating costs typically run $8-15/SF annually. Major categories: payroll (40-50%), utilities (15-20%), insurance (5-8%), maintenance (5-10%), and marketing (5-10%).

Q: How long until a sports facility becomes profitable?
A: Most facilities reach operational profitability in 18-36 months. Full ROI typically takes 5-10 years depending on financing structure, location, and management effectiveness.

Q: What financing options are available?
A: Common options include: SBA loans (10-25 year terms), conventional commercial loans, equipment financing, investor partnerships, and lease-to-own arrangements.

Q: Should I lease or buy my building?
A: Buying offers long-term equity building and control, while leasing reduces upfront costs and risk. Consider your capital availability, growth plans, and local market conditions.

## REVENUE & PROGRAMMING

Q: What are the main revenue streams for sports facilities?
A: Primary revenue: memberships (30-40%), training programs (25-35%), leagues/tournaments (15-25%), facility rentals (10-20%). Secondary: retail, concessions, camps, clinics.

Q: How much can I charge for court rentals?
A: Rates vary by market: $40-100/hour for basketball courts, $20-40/hour for batting cages, $25-60/hour for pickleball courts. Peak times command 25-50% premiums.

Q: What membership models work best?
A: Hybrid models combining monthly memberships with pay-per-use options perform well. Consider tiered memberships (basic, premium, family) and add-on packages for specialized training.

Q: How do I price training programs?
A: Group training: $15-40/session. Private lessons: $50-150/hour. Multi-week programs: $150-500. Price based on coach credentials, group size, and local market rates.

Q: What's a realistic utilization rate to expect?
A: New facilities typically achieve 30-40% utilization in year one, growing to 50-70% by year three. Peak hours (4-9 PM weekdays, weekends) should target 80%+ utilization.

Q: How important are leagues and tournaments?
A: Leagues provide consistent, predictable revenue and build community. Tournaments drive high-volume revenue spikes but require more staffing. Most successful facilities offer both.

## EQUIPMENT & FLOORING

Q: What flooring is best for basketball?
A: Hardwood maple is the gold standard ($12-18/SF installed). Sport court tiles ($6-10/SF) offer durability and lower maintenance. Rubber flooring works for training areas.

Q: How much does synthetic turf cost?
A: Indoor turf ranges $4-12/SF installed depending on quality and infill type. Budget $6-8/SF for quality training turf. Replacement is typically needed every 8-12 years.

Q: What equipment is essential for a baseball facility?
A: Core equipment: batting cages with nets ($3,000-8,000 each), pitching machines ($2,000-15,000), portable mounds ($500-3,000), L-screens ($200-500), and hitting tees.

Q: How often does equipment need replacement?
A: Nets: 3-7 years. Machines: 5-10 years with maintenance. Flooring: 10-20 years for hardwood, 8-12 years for turf. Regular maintenance extends all lifespans.

Q: Should I buy new or used equipment?
A: New equipment offers warranties and reliability. Used equipment can save 40-60% but inspect carefully. Essential safety equipment (nets, padding) should always be new.

## OPERATIONS & STAFFING

Q: How many staff do I need?
A: Minimum viable: 2-3 FTEs for a small facility. Typical 20,000 SF facility: 5-8 FTEs plus part-time staff. Plan for management, front desk, trainers, and maintenance.

Q: What insurance do sports facilities need?
A: Required coverage: general liability ($1-2M), property insurance, workers' compensation. Recommended: professional liability, equipment breakdown, business interruption.

Q: What are the biggest operational challenges?
A: Common challenges: staffing quality and retention, managing peak-time demand, equipment maintenance, weather-related attendance fluctuations, and cash flow seasonality.

Q: How do I handle liability and waivers?
A: Require signed waivers for all participants. Implement safety protocols, maintain equipment records, and carry adequate insurance. Consult a sports law attorney for proper documentation.

## GETTING STARTED

Q: What's the first step in planning a sports facility?
A: Start with market research: analyze local competition, identify underserved sports/demographics, and validate demand. Then develop a preliminary business plan before committing to property.

Q: How long does it take to open a facility?
A: Timeline varies: 6-12 months for leased space renovation, 12-24 months for new construction. Add 3-6 months for planning and permitting. Start planning 18-24 months before target opening.

Q: Should I start small or go big?
A: Starting smaller reduces risk and allows learning. Many successful owners start with 10,000-15,000 SF and expand based on demand. However, ensure your initial size can achieve profitability.

Q: What makes sports facilities fail?
A: Common failure factors: undercapitalization, poor location, inadequate market research, weak management, insufficient marketing, and unrealistic revenue projections.

Q: Do I need sports experience to own a facility?
A: Industry experience helps but isn't required. Successful owners often partner with experienced sports professionals or hire knowledgeable management. Business acumen is equally important.

## TECHNICAL & SUPPORT

Q: How accurate are the calculator estimates?
A: Our estimates are based on industry averages and recent project data. They're intended for preliminary budgeting—actual costs vary by location, specifications, and market conditions. Always verify with local contractors.

Q: Can I save my calculations?
A: Yes, you can download PDF reports of your estimates and calculations. Create an account to save multiple scenarios for comparison.

Q: How do I get more detailed pricing?
A: For detailed, location-specific pricing, schedule a consultation with our facility specialists. We can provide customized estimates based on your specific requirements and local market conditions.

Q: What support is available after using the calculator?
A: We offer free consultations, vendor introductions, project planning assistance, and ongoing advisory services. Our team includes experienced facility developers and sports industry professionals.
`;

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a helpful FAQ assistant for SportsFacility.ai, a platform that helps entrepreneurs plan and build sports training facilities.

Your role is to answer questions about sports facility planning using the knowledge base below. Be direct, helpful, and concise.

## KNOWLEDGE BASE
${FAQ_KNOWLEDGE_BASE}

## INSTRUCTIONS
- Answer questions directly and concisely using the knowledge base
- If a question is covered in the FAQ, provide the relevant information
- If a question isn't directly covered, provide helpful guidance based on related FAQ content
- Keep responses focused and practical (2-4 paragraphs max)
- Use specific numbers and data when available
- If you don't know something, say so honestly
- Suggest related topics the user might find helpful
- Don't ask unnecessary follow-up questions - just provide the answer
- Format responses with clear structure when listing multiple items

## RESPONSE FORMAT
- Use markdown formatting for readability
- Use bullet points for lists
- Bold key numbers and important terms
- Keep paragraphs short`;

    // Format messages for API
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-10).map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    ];

    console.log("Calling Lovable AI Gateway for FAQ chat...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: formattedMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return streaming response
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
      },
    });

  } catch (error) {
    console.error("[faq-chat] Error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
