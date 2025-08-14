import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { project, includeImages = true } = await req.json();
    
    console.log('Generating business plan for project:', project?.responses?.find((r: any) => r.questionId === 'project_name')?.value);

    // Extract project data
    const responses = project.responses?.reduce((acc: any, response: any) => {
      acc[response.questionId] = response.value;
      return acc;
    }, {}) || {};

    const projectName = responses.project_name || 'Sports Facility Project';
    const location = responses.location || 'Not specified';
    const currency = responses.currency || 'USD';
    const targetOpeningDate = responses.target_opening_date || 'TBD';
    const businessModel = responses.business_model || project.recommendations?.businessModel || 'Membership-based';
    const selectedSports = Array.isArray(responses.primary_sport) ? responses.primary_sport : [responses.primary_sport];
    const targetMarkets = Array.isArray(responses.target_market) ? responses.target_market : [responses.target_market];

    const financialMetrics = project.financialMetrics || {};
    const grossSqft = Math.round(financialMetrics.space?.grossSF || 0);
    const totalInvestment = financialMetrics.capex?.total || 0;
    const monthlyRevenue = financialMetrics.revenue?.total || 0;
    const monthlyOpex = financialMetrics.opex?.total || 0;
    const breakEvenMonths = financialMetrics.profitability?.breakEvenMonths || 0;
    const roi = financialMetrics.profitability?.roi || 0;

    // Format currency helper
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency === 'CAD' ? 'CAD' : 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    // Generate comprehensive business plan content
    const businessPlanContent = generateBusinessPlanHTML({
      projectName,
      location,
      currency,
      targetOpeningDate,
      businessModel,
      selectedSports,
      targetMarkets,
      grossSqft,
      totalInvestment,
      monthlyRevenue,
      monthlyOpex,
      breakEvenMonths,
      roi,
      formatCurrency,
      financialMetrics,
      includeImages
    });

    // Convert HTML to PDF using a PDF generation service
    // For now, we'll return the HTML content as a simple PDF-like structure
    // In production, you'd use a service like Puppeteer, jsPDF, or a PDF API
    
    const pdfBuffer = await generatePDFFromHTML(businessPlanContent);
    
    return new Response(JSON.stringify({ 
      pdfBuffer: pdfBuffer,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating business plan:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateBusinessPlanHTML({
  projectName,
  location,
  currency,
  targetOpeningDate,
  businessModel,
  selectedSports,
  targetMarkets,
  grossSqft,
  totalInvestment,
  monthlyRevenue,
  monthlyOpex,
  breakEvenMonths,
  roi,
  formatCurrency,
  financialMetrics,
  includeImages
}: any) {
  const currentDate = new Date().toLocaleDateString();
  const sportsNames = selectedSports.map((sport: string) => {
    const sportMap: Record<string, string> = {
      'baseball_softball': 'Baseball/Softball',
      'basketball': 'Basketball',
      'volleyball': 'Volleyball',
      'pickleball': 'Pickleball',
      'soccer': 'Soccer',
      'football': 'Football',
      'lacrosse': 'Lacrosse',
      'tennis': 'Tennis',
      'multi_sport': 'Multi-Sport',
      'fitness': 'Fitness'
    };
    return sportMap[sport] || sport;
  }).join(', ');

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${projectName} - Business Plan</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
        .section { margin-bottom: 30px; page-break-inside: avoid; }
        h1 { color: #2563eb; font-size: 28px; margin-bottom: 10px; }
        h2 { color: #1e40af; font-size: 22px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
        h3 { color: #374151; font-size: 18px; margin-top: 20px; }
        .financial-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .financial-table th, .financial-table td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
        .financial-table th { background-color: #f3f4f6; font-weight: bold; }
        .highlight { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        .executive-summary { background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2563eb; }
        @media print { body { margin: 0; } .section { page-break-inside: avoid; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>${projectName}</h1>
        <p style="font-size: 18px; color: #6b7280;">Comprehensive Business Plan</p>
        <p style="color: #6b7280;">Generated: ${currentDate} | Location: ${location}</p>
    </div>

    <div class="executive-summary">
        <h2>Executive Summary</h2>
        <p><strong>${projectName}</strong> is a ${grossSqft.toLocaleString()} square foot sports facility specializing in ${sportsNames}. Located in ${location}, this ${businessModel.toLowerCase()} facility is designed to serve ${targetMarkets.join(', ')} markets with a planned opening date of ${targetOpeningDate}.</p>
        
        <p>The facility requires a total investment of <strong>${formatCurrency(totalInvestment)}</strong> and is projected to achieve monthly revenues of <strong>${formatCurrency(monthlyRevenue)}</strong> with operating expenses of <strong>${formatCurrency(monthlyOpex)}</strong>, resulting in a break-even period of <strong>${breakEvenMonths} months</strong> and an ROI of <strong>${roi.toFixed(1)}%</strong>.</p>
    </div>

    <div class="section">
        <h2>Facility Overview</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${grossSqft.toLocaleString()}</div>
                <div>Total Square Feet</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${selectedSports.length}</div>
                <div>Sports Offered</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${formatCurrency(totalInvestment)}</div>
                <div>Total Investment</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${breakEvenMonths} months</div>
                <div>Break-Even Timeline</div>
            </div>
        </div>
        
        <h3>Sports Programs</h3>
        <p>The facility will offer comprehensive programs in: <strong>${sportsNames}</strong></p>
        
        <h3>Target Markets</h3>
        <ul>
            ${targetMarkets.map((market: string) => `<li>${market.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>Financial Projections</h2>
        
        <h3>Investment Breakdown</h3>
        <table class="financial-table">
            <tr><th>Category</th><th>Amount</th><th>Percentage</th></tr>
            <tr><td>Construction/Build-out</td><td>${formatCurrency(financialMetrics.capex?.construction || totalInvestment * 0.7)}</td><td>70%</td></tr>
            <tr><td>Equipment & Fixtures</td><td>${formatCurrency(financialMetrics.capex?.equipment || totalInvestment * 0.2)}</td><td>20%</td></tr>
            <tr><td>Working Capital</td><td>${formatCurrency(financialMetrics.capex?.workingCapital || totalInvestment * 0.1)}</td><td>10%</td></tr>
            <tr style="font-weight: bold;"><td>Total Investment</td><td>${formatCurrency(totalInvestment)}</td><td>100%</td></tr>
        </table>

        <h3>Monthly Revenue Projections</h3>
        <table class="financial-table">
            <tr><th>Revenue Stream</th><th>Monthly Amount</th></tr>
            <tr><td>Memberships</td><td>${formatCurrency(financialMetrics.revenue?.memberships || monthlyRevenue * 0.6)}</td></tr>
            <tr><td>Court/Field Rentals</td><td>${formatCurrency(financialMetrics.revenue?.rentals || monthlyRevenue * 0.2)}</td></tr>
            <tr><td>Lessons & Training</td><td>${formatCurrency(financialMetrics.revenue?.lessons || monthlyRevenue * 0.15)}</td></tr>
            <tr><td>Events & Tournaments</td><td>${formatCurrency(financialMetrics.revenue?.events || monthlyRevenue * 0.05)}</td></tr>
            <tr style="font-weight: bold;"><td>Total Monthly Revenue</td><td>${formatCurrency(monthlyRevenue)}</td></tr>
        </table>

        <h3>Monthly Operating Expenses</h3>
        <table class="financial-table">
            <tr><th>Expense Category</th><th>Monthly Amount</th></tr>
            <tr><td>Staffing</td><td>${formatCurrency(financialMetrics.opex?.staffing || monthlyOpex * 0.4)}</td></tr>
            <tr><td>Utilities</td><td>${formatCurrency(financialMetrics.opex?.utilities || monthlyOpex * 0.25)}</td></tr>
            <tr><td>Insurance</td><td>${formatCurrency(financialMetrics.opex?.insurance || monthlyOpex * 0.1)}</td></tr>
            <tr><td>Maintenance</td><td>${formatCurrency(financialMetrics.opex?.maintenance || monthlyOpex * 0.15)}</td></tr>
            <tr><td>Other Operating</td><td>${formatCurrency(financialMetrics.opex?.fixedOperating || monthlyOpex * 0.1)}</td></tr>
            <tr style="font-weight: bold;"><td>Total Monthly OpEx</td><td>${formatCurrency(monthlyOpex)}</td></tr>
        </table>
    </div>

    <div class="section">
        <h2>Market Analysis</h2>
        <p>The sports facility market in ${location} presents significant opportunities for ${sportsNames} programming. Our target demographics of ${targetMarkets.join(' and ')} represent a growing segment with increasing participation rates.</p>
        
        <div class="highlight">
            <strong>Competitive Advantage:</strong> ${selectedSports.length > 2 ? 'Multi-sport facility offering diverse programming under one roof' : 'Specialized facility with focused expertise in ' + sportsNames}
        </div>
    </div>

    <div class="section">
        <h2>Operations Plan</h2>
        <h3>Facility Management</h3>
        <p>The facility will operate under a ${businessModel.toLowerCase()} model, maximizing utilization through diverse programming and flexible scheduling.</p>
        
        <h3>Staffing Plan</h3>
        <p>Estimated staffing costs of ${formatCurrency(financialMetrics.opex?.staffing || monthlyOpex * 0.4)} per month will support facility operations, coaching, and customer service.</p>
    </div>

    <div class="section">
        <h2>Risk Analysis & Mitigation</h2>
        <ul>
            <li><strong>Market Competition:</strong> Differentiate through superior programming and customer experience</li>
            <li><strong>Seasonal Variations:</strong> Develop year-round programming to maintain consistent revenue</li>
            <li><strong>Economic Downturns:</strong> Flexible membership options and corporate partnerships</li>
            <li><strong>Operational Risks:</strong> Comprehensive insurance coverage and maintenance protocols</li>
        </ul>
    </div>

    <div class="section">
        <h2>Implementation Timeline</h2>
        <p><strong>Target Opening Date:</strong> ${targetOpeningDate}</p>
        <p>The facility development will follow a structured timeline from permitting through grand opening, with key milestones for construction, equipment installation, staff hiring, and marketing launch.</p>
    </div>

    <div class="highlight">
        <h2>Conclusion</h2>
        <p>${projectName} represents a compelling investment opportunity with strong financial projections, growing market demand, and a clear path to profitability. With an ROI of ${roi.toFixed(1)}% and break-even timeline of ${breakEvenMonths} months, this facility is positioned for long-term success in the ${location} market.</p>
    </div>
</body>
</html>`;
}

async function generatePDFFromHTML(htmlContent: string): Promise<string> {
  // For now, we'll create a simple base64 encoded PDF-like content
  // In production, you'd use a proper PDF generation service
  
  // Create a simple PDF structure (this is a placeholder implementation)
  const pdfHeader = "%PDF-1.4\n";
  const pdfContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  
  // This is a very basic PDF-like structure for demonstration
  // In production, use proper PDF generation libraries
  const basicPdf = `${pdfHeader}
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length ${pdfContent.length}
>>
stream
BT
/F1 12 Tf
72 720 Td
(${pdfContent.substring(0, 500)}...) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${400 + pdfContent.length}
%%EOF`;

  // Convert to base64
  return btoa(basicPdf);
}