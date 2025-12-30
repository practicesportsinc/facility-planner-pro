import { useState } from "react";
import Layout from "@/components/layout/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  MessageCircle, 
  Building2, 
  Ruler, 
  Package, 
  TrendingUp, 
  Users, 
  Hammer,
  Target,
  DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";
import { FAQChatInput } from "@/components/faq/FAQChatInput";
import { useFAQChat } from "@/hooks/useFAQChat";

const FAQ = () => {
  const { messages, isLoading, sendMessage, clearChat } = useFAQChat();
  const [showAnswer, setShowAnswer] = useState(false);

  const handleChatSend = (message: string) => {
    setShowAnswer(true);
    sendMessage(message);
  };
  const faqs = [
    {
      category: "Facility Size & Space Planning",
      icon: Ruler,
      questions: [
        {
          q: "How much square footage do I need for a basketball facility?",
          a: "A regulation basketball court requires approximately 4,700 square feet (94' x 50'). For a multi-court facility, plan for 5,500-6,000 SF per court to include buffer zones, bench areas, and circulation. A 4-court facility typically needs 22,000-24,000 SF of playing area, plus 15-20% for lobbies, restrooms, and support spaces."
        },
        {
          q: "How big of a parking lot will I need for my sports facility?",
          a: "A general rule of thumb is 5-6 parking spaces per 1,000 square feet of facility space, or approximately 3-4 spaces per court/playing area. For a 20,000 SF facility, plan for 100-120 parking spaces. Each parking space requires roughly 350 SF including drive aisles, so a 100-space lot needs approximately 35,000 SF (0.8 acres). Peak usage times (evenings, weekends) and tournament hosting will increase requirements."
        },
        {
          q: "What's the rule of thumb for circulation and common areas?",
          a: "Plan for 15-25% of your total facility size for circulation, lobbies, hallways, and common areas. A well-designed facility typically allocates: 70-75% for playing areas, 10-15% for circulation/lobbies, 5-8% for restrooms/locker rooms, and 5-10% for offices, storage, and mechanical rooms."
        },
        {
          q: "How do I calculate total facility size from playing areas?",
          a: "Start with your total playing area square footage and multiply by 1.3-1.4 to get gross building size. For example, if you need 20,000 SF of court space, plan for a 26,000-28,000 SF building. This factor accounts for circulation, support spaces, wall thickness, and mechanical areas."
        },
        {
          q: "What's the minimum viable size for a profitable sports facility?",
          a: "Minimum viable size varies by sport and market. For batting cages, 8,000-10,000 SF with 4-6 cages can be profitable. For basketball/volleyball, 12,000-15,000 SF (2-3 courts) is typically the minimum. Pickleball facilities can start smaller at 8,000-10,000 SF (4-6 courts) due to higher court density. Generally, facilities under 10,000 SF struggle to achieve economies of scale."
        },
        {
          q: "How much space do I need for restrooms and locker rooms?",
          a: "Plan for 400-600 SF of restroom space per 10,000 SF of facility. Basic facilities need 2 restrooms (men's/women's) at minimum. Larger facilities should have 4-6 restrooms. Full locker rooms with showers typically require 800-1,200 SF each. Tournament-ready facilities may need additional temporary/portable facilities for peak events."
        },
        {
          q: "Should I include a pro shop or retail area?",
          a: "A pro shop can generate 3-8% of total facility revenue with minimal additional overhead. Allocate 200-500 SF for a small retail area. Consider your sports: baseball/softball facilities benefit from equipment sales, while basketball facilities might focus on apparel. Start small and expand based on demand."
        },
        {
          q: "How much space do I need for a concessions area?",
          a: "A basic snack bar needs 150-300 SF, while a full concession stand with cooking equipment requires 400-800 SF. Include space for storage, prep, and a service counter. Health department requirements vary by location—check local codes before planning. Many facilities start with vending machines and upgrade based on traffic."
        },
        {
          q: "What space is needed for different batting cage configurations?",
          a: "Individual batting cage tunnels typically require 70' x 14' (980 SF) for a full-length cage, or 55' x 12' (660 SF) for shorter training cages. An 8-cage facility needs approximately 8,000-12,000 SF of cage space plus circulation. Shell cages (retractable netting) offer flexibility to convert space for other uses."
        },
        {
          q: "How do I plan for spectator seating?",
          a: "Bleacher seating requires 2-3 SF per seated spectator. For tournament-ready facilities, plan for 50-100 spectators per court/field. A 4-court facility might need 400 seats (800-1,200 SF). Consider retractable bleachers to maximize flexible space. Standing room areas can supplement seating at lower cost."
        }
      ]
    },
    {
      category: "Ceiling Heights & Building Specifications",
      icon: Building2,
      questions: [
        {
          q: "What ceiling heights are best for which sports?",
          a: "Recommended clear heights by sport: Basketball: 24-30' (28' ideal for competition), Volleyball: 23-28' (26' minimum for competition), Pickleball: 16-20' (18' recommended), Baseball/Softball batting cages: 16-20' (18' ideal), Indoor Soccer: 24-30', Football: 30-35'+, Gymnastics: 20-24', Tennis: 35-40' for competition. Multi-sport facilities should target the highest requirement."
        },
        {
          q: "What's the minimum clear height for basketball?",
          a: "The absolute minimum is 20' for recreational play, but 24' is recommended for competitive play with proper arc clearance. NCAA and high school competition typically require 25' minimum. Professional facilities often have 28-35' clear heights. Remember: clear height is measured from finished floor to the lowest obstruction (lights, HVAC, structure)."
        },
        {
          q: "What ceiling height do I need for volleyball?",
          a: "FIVB international competition requires 12.5 meters (41') clear height above the court. USA Volleyball recommends 7m (23') minimum for recreational play and 9m (29.5') for competitive play. Most multi-sport facilities target 26-28' as a practical compromise that accommodates volleyball and basketball."
        },
        {
          q: "Can I have multiple sports with different height requirements in one building?",
          a: "Yes! Options include: stepped rooflines (higher section for basketball/volleyball, lower for batting cages), mezzanine areas with lower ceilings for offices/storage, or divider curtains allowing different activities in zones. The most cost-effective approach is building to the highest requirement, as roof cost per SF is similar regardless of height for pre-engineered metal buildings."
        },
        {
          q: "What's the difference between eave height and clear height?",
          a: "Eave height is measured from the foundation to where the wall meets the roof. Clear height is the usable vertical space from finished floor to the lowest obstruction. Clear height is typically 2-4' less than eave height due to insulation, lighting, HVAC ducts, and roof structure. Always specify clear height when planning sports facilities."
        },
        {
          q: "What type of building is best for a sports facility?",
          a: "Pre-engineered metal buildings (PEMB) are the most popular choice, offering the best value for large clear-span spaces. Benefits include: 35-50% lower cost than conventional construction, faster construction time (4-6 months typical), clear spans up to 200'+ without columns, and easy future expansion. Alternatives include steel frame with masonry, tilt-up concrete, or existing warehouse conversion."
        },
        {
          q: "Should I build new, buy existing, or lease?",
          a: "Build new: highest cost but optimal design, best for long-term ownership. Buy/convert existing: 30-50% lower initial cost, faster opening, but may require compromises on ceiling height or layout. Lease: lowest upfront cost, flexible exit strategy, but limited modifications and ongoing rent expense. Most successful facilities are owner-operated with building ownership for long-term wealth building."
        },
        {
          q: "What insulation is recommended for sports facilities?",
          a: "Minimum R-19 in walls and R-30 in roof for climate-controlled facilities. Energy codes may require higher values. Options include: fiberglass blanket (most economical), rigid foam board (better thermal break), or spray foam (highest R-value, air sealing). Consider reflective insulation in hot climates. Proper insulation reduces HVAC costs by 25-40%."
        }
      ]
    },
    {
      category: "Sport-Specific Equipment",
      icon: Package,
      questions: [
        {
          q: "What equipment is needed for a batting cage facility?",
          a: "Core equipment includes: batting cage nets/frames ($2,500-4,000 per tunnel), pitching machines ($1,500-8,000 each depending on type), L-screens and protective padding ($500-2,000), turf or dirt flooring ($4-12/SF), hitting mats and plates ($200-800), balls and ball feeders ($500-1,500), and safety padding for walls ($50-75 per linear foot). Budget $15,000-30,000 per fully-equipped tunnel."
        },
        {
          q: "What equipment do I need for a basketball facility?",
          a: "Essential equipment: basketball goals/backboards ($3,000-15,000 per system depending on adjustability), court flooring ($4-15/SF for sport court or hardwood), bleacher seating ($50-150 per seat), scoreboards ($2,000-15,000), shot clocks ($1,000-3,000 per pair), padding for walls and posts ($2,000-5,000), and ball racks/storage. Budget $50,000-150,000 per full court depending on finish level."
        },
        {
          q: "What flooring options work best for each sport?",
          a: "Basketball: Hardwood maple ($10-15/SF) or sport court tiles ($4-8/SF). Volleyball: Sport court or rubber ($4-10/SF). Pickleball: Sport court, acrylic coating on concrete, or specialty pickleball surfaces ($3-8/SF). Indoor turf sports: Synthetic turf ($6-12/SF installed). Batting cages: Artificial turf or rubber mats ($4-10/SF). Multi-sport: Modular sport court tiles offer best versatility."
        },
        {
          q: "What safety equipment is required for indoor facilities?",
          a: "Required/recommended items include: wall padding for impact zones ($50-75/linear foot), column/post padding ($200-500 each), floor edge padding, safety netting for ball containment ($2-5/SF), first aid stations, AED defibrillators ($1,500-2,500), fire extinguishers, emergency lighting, and proper exit signage. Insurance may require specific safety features—check with your carrier."
        },
        {
          q: "What lighting specifications do I need for sports facilities?",
          a: "Recommended foot-candle levels: recreational play 30-50 fc, competitive play 50-75 fc, broadcast/professional 100+ fc. LED lighting is now standard, offering 50-70% energy savings over metal halide. Plan for $15-25/SF for quality sports lighting. Consider instant-on capability, dimming controls, and maintenance access. Ceiling-mounted fixtures should be shielded from ball strikes."
        },
        {
          q: "What technology and scoring systems should I consider?",
          a: "Modern facilities often include: electronic scoreboards ($2,000-20,000), video replay systems ($5,000-25,000), court booking software ($100-500/month), access control systems ($5,000-15,000), WiFi infrastructure ($3,000-10,000), digital signage ($2,000-8,000), and payment processing systems. Many operators start basic and add technology based on customer demand."
        },
        {
          q: "What's the difference between batting cage types?",
          a: "Shell cages: permanent frame with retractable nets, most versatile, $2,500-4,000 per tunnel. Fixed tunnel nets: permanently hung netting, lowest cost at $1,500-2,500 per tunnel but no flexibility. Portable cages: movable frames for temporary setups, $800-2,000. Air-supported domes: seasonal/temporary structures. Shell cages are most popular for commercial facilities due to space flexibility."
        },
        {
          q: "What are the best turf options for indoor facilities?",
          a: "Options include: Nylon turf (most durable, best for high-traffic baseball/softball, $8-12/SF), Polyethylene turf (softer, better for soccer/football, $6-10/SF), Polypropylene (economy option, $4-7/SF). Key specifications: pile height (1.5-2.5\" typical), infill type (rubber, sand, or combination), and backing system. Quality turf should last 8-12 years with proper maintenance."
        },
        {
          q: "What pickleball equipment do I need?",
          a: "Per court: portable net system ($200-600) or permanent posts ($300-800), court surface/lines ($500-2,000 if adding to existing surface), paddles and balls for rentals ($500-1,500), ball hoppers and storage. Facility needs: divider netting between courts ($300-600 per court), seating, and lighting. Budget $3,000-8,000 per court for equipment beyond the court surface itself."
        },
        {
          q: "Do I need backup or redundant equipment?",
          a: "Yes, plan for backups of critical items: 10-20% extra balls and basic equipment, spare pitching machine motors or a backup machine, extra nets and padding for repairs, backup scoreboards/timing systems for tournaments. Downtime during peak hours costs more than spare equipment. Most suppliers offer maintenance packages."
        }
      ]
    },
    {
      category: "Most Popular & Trending Sports",
      icon: Target,
      questions: [
        {
          q: "What are the fastest-growing indoor sports for facilities?",
          a: "Pickleball leads growth with 48% increase in players since 2020—now 36+ million players in the US. Other high-growth sports: padel tennis (400% growth in 3 years, popular in urban areas), indoor golf simulators (30% annual growth), youth baseball training (consistent demand), functional fitness/training, and esports/gaming centers. Basketball and volleyball remain steady with established participation."
        },
        {
          q: "Why is pickleball so popular for facility investment?",
          a: "Pickleball offers compelling economics: 4 pickleball courts fit in the space of 1 tennis court, lower ceiling requirements (16-18'), strong demand from 50+ demographic with disposable income, easy-to-learn sport driving rapid adoption, year-round indoor playability, and courts can generate $40-80/hour in rentals. Court density means higher revenue per square foot than most other sports."
        },
        {
          q: "What sports have the highest participation rates?",
          a: "Top US participation sports (annual): Basketball: 26 million, Baseball/softball: 25 million, Soccer: 22 million, Volleyball: 18 million, Pickleball: 36 million (fastest growing), Tennis: 23 million. For facilities, youth sports drive consistent demand—70% of facility revenue often comes from youth programs, camps, and leagues."
        },
        {
          q: "Should I focus on one sport or multiple sports?",
          a: "Single-sport advantages: specialized reputation, simplified operations, targeted marketing. Multi-sport advantages: diversified revenue, year-round demand, broader customer base, reduced risk. Most successful commercial facilities offer 2-3 complementary sports (e.g., basketball/volleyball, baseball/softball, pickleball/tennis). Start focused and expand based on market demand."
        },
        {
          q: "What sports work well together in a multi-sport facility?",
          a: "Compatible combinations: Basketball + Volleyball (similar court size, same height requirements), Baseball + Softball (shared equipment, overlapping seasons), Pickleball + Tennis (court conversion possible), Soccer + Lacrosse + Football (shared turf space). Avoid mixing sports with vastly different height or surface requirements unless building separate zones."
        },
        {
          q: "What age demographics drive the most facility revenue?",
          a: "Youth (8-18) typically represents 60-70% of facility revenue through leagues, lessons, camps, and team rentals. Adult recreational leagues (25-55) provide 20-30% with consistent evening/weekend demand. Seniors (55+) are growing rapidly, especially for pickleball. Birthday parties and events can contribute 5-15% for family-friendly facilities."
        }
      ]
    },
    {
      category: "Return on Investment & Financial Planning",
      icon: TrendingUp,
      questions: [
        {
          q: "What sports offer the best ROI for facility owners?",
          a: "Highest ROI sports typically include: Pickleball (low build-out, high court density, strong demand), Baseball/softball training (loyal repeat customers, lesson revenue), Basketball (high utilization, tournament potential), and volleyball (club culture drives consistent rentals). ROI depends heavily on local market demand, competition, and operational excellence. Most facilities achieve 15-25% operating margins at maturity."
        },
        {
          q: "How long does it typically take to break even on a sports facility?",
          a: "Most well-operated facilities reach operational break-even (covering monthly expenses) within 12-24 months. Full investment payback typically takes 5-8 years depending on debt structure and initial investment. Facilities with strong pre-opening marketing and established customer relationships can accelerate this timeline. Conservative projections should assume 18-24 months to stabilize."
        },
        {
          q: "What are typical revenue streams for indoor sports facilities?",
          a: "Primary revenue sources: Court/cage rentals (30-40%), Memberships (15-25%), Lessons/training (15-25%), Leagues and tournaments (15-20%), Camps and clinics (10-15%). Secondary sources: Pro shop sales (3-8%), Concessions/vending (2-5%), Party/event rentals (3-8%), Sponsorships (1-3%). Diversified facilities are more resilient—don't rely on any single revenue stream for more than 40%."
        },
        {
          q: "What are typical operating expenses for sports facilities?",
          a: "Major expense categories as percentage of revenue: Labor/payroll (25-35%), Rent or mortgage (15-25%), Utilities (8-15%), Insurance (3-6%), Marketing (3-8%), Maintenance (3-5%), Supplies and equipment (2-4%), Technology/software (1-3%), Administrative (2-4%). Well-run facilities achieve 15-25% net operating margin after all expenses."
        },
        {
          q: "How do I price court rentals and memberships?",
          a: "Court rental pricing varies by market: $25-60/hour for pickleball, $40-100/hour for basketball, $30-50/hour for batting cages. Prime time (5-9pm weekdays, weekends) commands 25-50% premium. Memberships typically range $50-200/month depending on access level. Research local competition and price within 10-15% of market rates while offering superior value."
        },
        {
          q: "What's the typical profit margin for a sports facility?",
          a: "Gross margins (revenue minus direct costs) typically range 60-75%. Net operating margins (after all expenses including debt service) range 10-25% for well-run facilities. First-year margins are often lower (5-15%) while building customer base. Mature facilities with paid-off debt can achieve 25-35% margins. Location, management quality, and market competition significantly impact profitability."
        },
        {
          q: "Should I offer memberships, rentals, or both?",
          a: "Most successful facilities offer both. Memberships provide predictable recurring revenue and customer loyalty (typically 40-60% of members become long-term). Rentals maximize revenue per hour and serve occasional users. A common split is 30-40% membership revenue, 60-70% rental/transactional revenue. Offer membership tiers (basic, premium, unlimited) to capture different customer segments."
        },
        {
          q: "What additional revenue sources should I consider?",
          a: "Often-overlooked revenue opportunities: Personal training and lessons (high margin), Birthday parties and corporate events, Summer and holiday camps, Tournament hosting fees, Vending and concessions, Retail/pro shop, Equipment rentals, Advertising and sponsorships, Filming/content creation rentals, and subletting space to complementary businesses (physical therapy, sports medicine)."
        },
        {
          q: "What's the typical cap rate for sports facility investments?",
          a: "Sports facilities typically trade at 8-12% cap rates depending on market, lease structure, and business stability. Stabilized facilities with long-term leases to strong operators may achieve 7-9% caps. Value-add or higher-risk facilities may require 10-14% caps. Cap rates have compressed in recent years due to increased investor interest in experiential real estate."
        },
        {
          q: "How do I calculate staffing costs?",
          a: "Typical staffing ratios: 1 front desk staff per 15-20 active customers, 1 manager per 10-15 staff, maintenance at 0.5-1 FTE per 20,000 SF. Hourly rates vary by market: $12-18/hour for front desk, $15-25/hour for referees/supervisors, $25-50/hour for coaches/trainers. Total labor typically represents 25-35% of revenue. Cross-train staff to maximize flexibility and reduce headcount."
        },
        {
          q: "What insurance do I need for a sports facility?",
          a: "Required coverage typically includes: General liability ($1-2M minimum), Property insurance, Workers compensation, and Business interruption. Additional coverage to consider: Professional liability (for trainers/coaches), Participant accident insurance, Equipment breakdown, Cyber liability, and Umbrella policy ($2-5M). Annual premiums typically run $15,000-50,000 depending on size and activities. Work with a sports facility specialist broker."
        },
        {
          q: "How much working capital do I need?",
          a: "Plan for 3-6 months of operating expenses as working capital reserve, plus pre-opening costs (marketing, staff training, initial inventory). For a $30,000/month expense structure, maintain $90,000-180,000 reserve. Many facilities underestimate startup cash needs—build in 20% contingency beyond projections."
        }
      ]
    },
    {
      category: "Building & Construction",
      icon: Hammer,
      questions: [
        {
          q: "What does a pre-engineered metal building cost per square foot?",
          a: "Building shell only: $15-30/SF depending on size, height, and complexity. Fully finished (turnkey including HVAC, electrical, plumbing, finishes): $75-150/SF. Factors affecting cost: clear height (taller = more expensive), location/labor rates, soil conditions, and finish level. Get multiple quotes—prices can vary 20-30% between suppliers. Metal building costs have increased 15-25% since 2020."
        },
        {
          q: "What permits do I need to build a sports facility?",
          a: "Typical permits include: Building permit, Electrical permit, Plumbing permit, Mechanical permit, Fire marshal approval, Certificate of occupancy, and potentially: Zoning variance (if needed), Site plan approval, Environmental permits (wetlands, stormwater), Health department approval (if food service). Permit timelines vary from 4-16 weeks depending on jurisdiction. Budget 1-2% of construction cost for permit fees."
        },
        {
          q: "How long does it take to build a sports facility?",
          a: "Typical timeline: Pre-construction (design, permits, financing): 3-6 months, Site work and foundation: 4-8 weeks, Building erection: 6-12 weeks, Interior buildout: 8-16 weeks, Equipment installation: 2-4 weeks. Total: 8-14 months from concept to opening. Design-build approaches can accelerate this by 2-3 months. Factor in weather delays for foundation and erection phases."
        },
        {
          q: "What are the typical soft costs for a facility project?",
          a: "Soft costs typically represent 15-25% of total project cost: Architectural/engineering (5-8%), Permits and fees (1-2%), Legal and accounting (1-2%), Loan fees and interest during construction (3-5%), Insurance during construction (0.5-1%), Furniture, fixtures, equipment (5-10%), Pre-opening expenses (2-4%), Contingency (5-10%). Don't underestimate soft costs—they're often larger than expected."
        },
        {
          q: "What's the difference between finish levels (basic/standard/premium)?",
          a: "Basic ($75-100/SF): Exposed structure, minimal finishes, basic lighting, economical HVAC—suitable for training facilities, batting cages. Standard ($100-130/SF): Finished walls, quality flooring, good lighting, comfortable HVAC—appropriate for most commercial facilities. Premium ($130-175+/SF): High-end finishes, advanced lighting, superior HVAC, acoustic treatments—tournament venues, upscale facilities. Choose based on target market and competition."
        },
        {
          q: "What site work is required for a new facility?",
          a: "Typical site work includes: Clearing and grubbing ($2-5/SF), Grading and earthwork ($3-8/SF), Storm water management ($2-5/SF), Utilities (water, sewer, electric, gas) ($15,000-50,000), Paving and parking ($4-8/SF), Landscaping ($2-5/SF of landscaped area), Site lighting ($5,000-20,000). Site work typically represents 8-15% of total project cost. Poor soil conditions can significantly increase costs."
        },
        {
          q: "Do I need fire sprinklers for my facility?",
          a: "Fire sprinkler requirements vary by jurisdiction but are typically required for buildings over 5,000-12,000 SF or certain occupancy types. Cost: $3-8/SF for wet systems. Benefits beyond code compliance: lower insurance premiums (10-15% savings), safer environment, and may allow larger undivided spaces. Check local codes early—retrofitting sprinklers is 2-3x more expensive than new installation."
        },
        {
          q: "What HVAC capacity do I need for a sports facility?",
          a: "Sports facilities require more cooling capacity than typical buildings due to occupant activity levels. Plan for 400-600 SF per ton of cooling (vs. 500-800 SF for offices). High ceilings require additional capacity or destratification fans. Budget $15-30/SF for HVAC depending on system type. Consider: energy efficiency, maintenance access, noise levels, and air quality (especially for indoor turf facilities)."
        },
        {
          q: "What foundation type is best for a sports facility?",
          a: "Most sports facilities use one of three foundation types: Slab-on-grade (most common, $6-10/SF), suitable for most conditions. Stem wall/spread footing (for buildings with tall walls or poor soil, $8-14/SF). Pier and beam (for expansive soils or flood zones, $10-18/SF). A geotechnical report ($2,000-5,000) is essential to determine the appropriate foundation design."
        }
      ]
    },
    {
      category: "Operations & Management",
      icon: Users,
      questions: [
        {
          q: "How many staff members do I need to run a sports facility?",
          a: "Staffing depends on size and hours. Typical staffing: Front desk (1 per shift during open hours), Managers (1-2 FTE), Maintenance (0.5-1 FTE per 20,000 SF), Coaches/trainers (as needed, often independent contractors), Referees/officials (part-time, event-based). A 20,000 SF facility open 80 hours/week typically needs 3-5 FTE equivalent. Cross-training reduces headcount needs."
        },
        {
          q: "What operating hours work best for sports facilities?",
          a: "Typical successful hours: Weekdays 6am-10pm (peak 5-9pm), Weekends 7am-9pm (consistent traffic). Youth-focused facilities peak after school (3-8pm). Adult leagues peak 7-10pm. Early morning (6-8am) attracts serious athletes and trainers. Consider 24/7 access for members via key cards—low cost to operate off-peak. Adjust seasonally: extended summer hours, reduced during school."
        },
        {
          q: "How do I manage booking and scheduling?",
          a: "Most facilities use dedicated sports facility management software ($100-500/month) for: online booking, payment processing, membership management, league scheduling, and reporting. Popular options include Upper Hand, EZFacility, Sportsman, and CourtReserve. Key features: mobile booking, automated reminders, waitlists, and integration with payment systems. Manual scheduling becomes unsustainable above 2-3 courts/cages."
        },
        {
          q: "What's the best way to market a sports facility?",
          a: "Effective marketing channels: Google My Business (critical for local search), Social media (Instagram, Facebook for community building), Youth sports partnerships (leagues, clubs, schools), Email marketing to existing customers, Local SEO and website, Referral programs (members bring friends), Community events and open houses, and tournament hosting for exposure. Budget 3-8% of revenue for marketing. Word-of-mouth is your best long-term channel."
        },
        {
          q: "Should I host leagues, tournaments, or open play?",
          a: "Most successful facilities offer all three: Leagues provide predictable recurring revenue and build community (30-40% of court revenue). Tournaments generate high revenue weekends and attract new customers (20-30%). Open play/rentals maximize flexibility and serve casual users (30-50%). Balance is key—don't over-commit to leagues leaving no availability for rentals."
        },
        {
          q: "How do I partner with local schools and clubs?",
          a: "Approach strategies: Offer discounted practice facility rates during off-peak hours, Host club tryouts and evaluations, Partner on camps and clinics, Provide meeting/team space, Support fundraisers, and offer team discounts. Benefits: consistent revenue, built-in marketing, community goodwill. Formalize agreements with contracts specifying rates, scheduling priority, and cancellation policies."
        },
        {
          q: "How do I handle liability and waivers?",
          a: "Essential practices: Require signed waivers from all participants (parents sign for minors), Use digital waiver systems for efficiency and record-keeping, Maintain adequate insurance coverage, Document all incidents thoroughly, Regular safety inspections and maintenance logs, Train staff on emergency procedures. Consult a local attorney familiar with sports law to review your waiver language and procedures."
        },
        {
          q: "What maintenance schedule should I follow?",
          a: "Daily: Clean restrooms, empty trash, inspect playing surfaces, check equipment. Weekly: Deep clean floors, check safety equipment, inspect netting/padding. Monthly: HVAC filter changes, detailed equipment inspection, touch-up painting. Quarterly: HVAC service, deep cleaning, safety audit. Annually: Floor refinishing/resurfacing, major equipment overhaul, professional inspections. Document everything for liability protection."
        },
        {
          q: "How do I handle slow periods and seasonality?",
          a: "Strategies for slow periods: Offer discounted rates during off-peak hours, Host camps during school breaks, Create special events and promotions, Develop corporate team-building packages, Offer personal training and lessons, Rent to filming/photography, and adjust operating hours to reduce labor costs. Build 2-3 months' expense reserve to cover seasonal dips."
        }
      ]
    },
    {
      category: "General Questions",
      icon: HelpCircle,
      questions: [
        {
          q: "What is SportsFacility.ai?",
          a: "SportsFacility.ai is a comprehensive planning tool powered by Practice Sports, Inc. that helps entrepreneurs, investors, and facility owners estimate costs, revenues, and ROI for sports facility projects. Our calculator provides detailed financial projections and recommendations based on your specific facility requirements."
        },
        {
          q: "Who should use this calculator?",
          a: "Our tools are designed for facility owners, real estate developers, sports entrepreneurs, franchise operators, equipment suppliers, and consultants planning indoor or outdoor sports facilities. Whether you're building a new facility or expanding an existing one, our calculators provide valuable insights."
        },
        {
          q: "Is the calculator free to use?",
          a: "Yes, all our calculator tools (Quick Estimate, Easy Wizard, and Advanced Calculator) are completely free to use. We only ask for your contact information to provide you with detailed results and connect you with facility specialists who can help bring your vision to life."
        },
        {
          q: "How accurate are the cost estimates?",
          a: "Our estimates are based on current market data, industry benchmarks, and real-world facility projects. However, actual costs can vary based on location, market conditions, supplier negotiations, and specific project requirements. We recommend using our estimates for budgeting purposes and consulting with our facility specialists for confirmed pricing."
        },
        {
          q: "What happens after I submit my contact information?",
          a: "After submission, you'll receive a confirmation email with a summary of your project estimates. Our team at Practice Sports, Inc. will also receive your information and may reach out to discuss your project, answer questions, and provide personalized recommendations. You can also schedule a consultation at any time using our booking system."
        },
        {
          q: "Do you provide consulting services?",
          a: "Yes! Practice Sports, Inc. offers comprehensive facility consulting services including site selection, equipment sourcing, facility design, business planning, and project management. Contact us to learn more about how we can help bring your facility vision to reality."
        }
      ]
    }
  ];

  const scrollToCategory = (categoryIndex: number) => {
    const element = document.getElementById(`category-${categoryIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const totalQuestions = faqs.reduce((sum, cat) => sum + cat.questions.length, 0);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Frequently Asked Questions</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Everything you need to know about planning your sports facility with SportsFacility.ai
          </p>
          <Badge variant="secondary" className="text-sm">
            {totalQuestions} Questions Answered
          </Badge>
        </div>

        {/* AI Chat Input */}
        <div className="max-w-4xl mx-auto mb-12">
          <p className="text-center text-muted-foreground mb-4">
            Can't find your answer? Ask our AI assistant anything about sports facility planning.
          </p>
          <FAQChatInput onSend={handleChatSend} isLoading={isLoading} />
          
          {/* AI Answer Display */}
          {showAnswer && messages.length > 0 && (
            <Card className="mt-6 p-6 bg-card/50 border-primary/20">
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={msg.role === "user" ? "text-muted-foreground" : ""}>
                    {msg.role === "user" ? (
                      <p className="text-sm italic">"{msg.content}"</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {msg.content.split('\n').map((line, lineIdx) => (
                          <span key={lineIdx}>
                            {line.split(/\*\*(.*?)\*\*/g).map((part, partIdx) => 
                              partIdx % 2 === 1 ? <strong key={partIdx}>{part}</strong> : part
                            )}
                            {lineIdx < msg.content.split('\n').length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <p className="text-muted-foreground animate-pulse">Thinking...</p>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-4"
                onClick={() => { clearChat(); setShowAnswer(false); }}
              >
                Clear & Ask Another Question
              </Button>
            </Card>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Category Navigation Sidebar */}
          <aside className="lg:w-72 lg:sticky lg:top-24 lg:self-start">
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Jump to Topic
              </h3>
              <nav className="space-y-2">
                {faqs.map((category, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToCategory(idx)}
                    className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors flex items-center gap-2 group"
                  >
                    <category.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="truncate">{category.category}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {category.questions.length}
                    </Badge>
                  </button>
                ))}
              </nav>
            </Card>
          </aside>

          {/* FAQ Content */}
          <div className="flex-1 space-y-12">
            {faqs.map((category, idx) => (
              <section key={idx} id={`category-${idx}`} className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">{category.category}</h2>
                    <p className="text-sm text-muted-foreground">
                      {category.questions.length} questions
                    </p>
                  </div>
                </div>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.questions.map((faq, qIdx) => (
                    <AccordionItem
                      key={qIdx}
                      value={`${idx}-${qIdx}`}
                      className="border rounded-lg px-4 bg-card"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <span className="font-medium pr-4">{faq.q}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4 leading-relaxed whitespace-pre-line">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <Card className="max-w-2xl mx-auto mt-16 p-8 text-center">
          <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-6">
            Our facility specialists are here to help. Schedule a consultation or contact us directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-gradient-primary">
              <a href="https://practicesportsinc.setmore.com/" target="_blank" rel="noopener noreferrer">
                Schedule Consultation
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/b2b/contact">Contact Us</Link>
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default FAQ;
