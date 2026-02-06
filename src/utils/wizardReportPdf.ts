import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { WizardResult } from '@/types/wizard';
import { loadLogoBase64, addBrandedHeader, addBrandedFooter } from './pdfBranding';

interface LeadData {
  name: string;
  email: string;
  business: string;
  phone?: string;
}

interface FinancialMetrics {
  sportsBreakdown: Array<{
    sportId: string;
    squareFootage: number;
    constructionCost: number;
    equipmentCost: number;
    installationCost: number;
    totalCost: number;
    monthlyRevenue: number;
    monthlyOpex: number;
    monthlyProfit: number;
  }>;
  equipmentBreakdown: Record<string, Array<{
    item: string;
    quantity: number;
    unitCost: number;
    total: number;
    description?: string;
  }>>;
  space: {
    grossSF: number;
    totalProgramSF: number;
    circulationSF: number;
  };
  capex: {
    total: number;
    construction: number;
    equipment: number;
    installation: number;
    totalEquipment: number;
    workingCapital: number;
  };
  opex: {
    total: number;
    staffing: number;
    fixedOperating: number;
    utilities: number;
    insurance: number;
    maintenance: number;
  };
  revenue: {
    total: number;
    memberships: number;
    rentals: number;
    lessons: number;
    events: number;
    retail: number;
  };
  profitability: {
    breakEvenMonths: number;
    ebitda: number;
    roi: number;
    paybackPeriod: number;
  };
  marketAnalysis?: {
    targetMarkets: string[];
    competitiveAdvantage: string;
    marketPenetration: string;
  };
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatSportName = (sportId: string): string => {
  const sportNames: Record<string, string> = {
    'baseball_softball': 'Baseball/Softball',
    'basketball': 'Basketball',
    'volleyball': 'Volleyball',
    'pickleball': 'Pickleball',
    'soccer': 'Soccer',
    'football': 'Football',
    'lacrosse': 'Lacrosse',
    'tennis': 'Tennis',
    'multi_sport': 'Multi-Sport',
    'fitness': 'Fitness',
  };
  return sportNames[sportId] || sportId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export async function generateWizardReportPdf(
  wizardResult: WizardResult,
  financialMetrics: FinancialMetrics,
  leadData: LeadData
): Promise<string> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const logoBase64 = await loadLogoBase64();

  // Helper to check and add new page
  const checkNewPage = (requiredSpace: number = 40) => {
    if (y + requiredSpace > pageHeight - 30) {
      doc.addPage();
      y = 20;
    }
  };

  // ============ COVER PAGE ============
  let y = addBrandedHeader(doc, logoBase64, 'Financial Analysis Report');

  // Prepared for info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`Prepared for: ${leadData.business || leadData.name}`, pageWidth / 2, y, { align: 'center' });
  y += 8;
  doc.setFontSize(10);
  doc.text(`Contact: ${leadData.email}`, pageWidth / 2, y, { align: 'center' });
  y += 5;
  if (leadData.phone) {
    doc.text(`Phone: ${leadData.phone}`, pageWidth / 2, y, { align: 'center' });
    y += 5;
  }
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Key metrics summary box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, y, pageWidth - 40, 55, 3, 3, 'FD');

  y += 12;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Investment Summary', pageWidth / 2, y, { align: 'center' });

  y += 12;
  const summaryData = [
    ['Total Investment', formatCurrency(financialMetrics.capex.total)],
    ['Monthly Revenue', formatCurrency(financialMetrics.revenue.total)],
    ['Monthly EBITDA', formatCurrency(financialMetrics.profitability.ebitda)],
    ['Break-Even', `${financialMetrics.profitability.breakEvenMonths} months`],
  ];

  const colWidth = (pageWidth - 60) / 4;
  summaryData.forEach((item, index) => {
    const x = 30 + (index * colWidth);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(item[0], x + colWidth / 2, y, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(item[1], x + colWidth / 2, y + 12, { align: 'center' });
    doc.setFont('helvetica', 'normal');
  });

  // ============ PAGE 2: FACILITY OVERVIEW ============
  doc.addPage();
  y = 20;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('Facility Overview', 20, y);
  y += 15;

  autoTable(doc, {
    startY: y,
    head: [['Specification', 'Value']],
    body: [
      ['Facility Type', wizardResult.recommendations.facilityType || 'Multi-Sport Facility'],
      ['Total Square Footage', `${Math.round(financialMetrics.space.grossSF).toLocaleString()} SF`],
      ['Program Space', `${Math.round(financialMetrics.space.totalProgramSF).toLocaleString()} SF`],
      ['Circulation/Support', `${Math.round(financialMetrics.space.circulationSF).toLocaleString()} SF`],
      ['Business Model', wizardResult.recommendations.businessModel || 'Membership + Rentals'],
      ['Estimated Capacity', `${wizardResult.recommendations.estimatedCapacity || Math.round(financialMetrics.space.grossSF / 50)} users/hour`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 20, right: 20 },
  });

  y = (doc as any).lastAutoTable.finalY + 20;

  // Sports breakdown
  if (financialMetrics.sportsBreakdown && financialMetrics.sportsBreakdown.length > 0) {
    checkNewPage(60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('Sport-by-Sport Analysis', 20, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [['Sport', 'Sq Ft', 'Construction', 'Equipment', 'Monthly Revenue']],
      body: financialMetrics.sportsBreakdown.map(sport => [
        formatSportName(sport.sportId),
        sport.squareFootage.toLocaleString(),
        formatCurrency(sport.constructionCost),
        formatCurrency(sport.equipmentCost),
        formatCurrency(sport.monthlyRevenue),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
    });

    y = (doc as any).lastAutoTable.finalY + 20;
  }

  // ============ EQUIPMENT BREAKDOWN ============
  const equipmentCategories = Object.entries(financialMetrics.equipmentBreakdown || {})
    .filter(([_, items]) => Array.isArray(items) && items.length > 0);

  if (equipmentCategories.length > 0) {
    doc.addPage();
    y = 20;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('Equipment & Fixtures Breakdown', 20, y);
    y += 15;

    let equipmentTotal = 0;

    equipmentCategories.forEach(([category, items]) => {
      checkNewPage(50);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(category, 20, y);
      y += 8;

      const categoryTotal = (items as any[]).reduce((sum, item) => sum + (item.total || 0), 0);
      equipmentTotal += categoryTotal;

      autoTable(doc, {
        startY: y,
        head: [['Item', 'Qty', 'Unit Cost', 'Total']],
        body: (items as any[]).map(item => [
          item.item || item.name,
          item.quantity?.toString() || '1',
          formatCurrency(item.unitCost || 0),
          formatCurrency(item.total || 0),
        ]),
        foot: [[{ content: `${category} Subtotal`, colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, formatCurrency(categoryTotal)]],
        theme: 'grid',
        headStyles: { fillColor: [100, 116, 139] },
        footStyles: { fillColor: [241, 245, 249] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 9 },
      });

      y = (doc as any).lastAutoTable.finalY + 15;
    });

    checkNewPage(30);
    doc.setFillColor(59, 130, 246);
    doc.rect(20, y, pageWidth - 40, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Equipment Grand Total:', 30, y + 13);
    doc.text(formatCurrency(equipmentTotal), pageWidth - 30, y + 13, { align: 'right' });
    y += 30;
  }

  // ============ CAPITAL EXPENDITURE ============
  doc.addPage();
  y = 20;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('Capital Expenditure (CapEx)', 20, y);
  y += 15;

  autoTable(doc, {
    startY: y,
    head: [['Category', 'Amount', '% of Total']],
    body: [
      ['Construction/Build-out', formatCurrency(financialMetrics.capex.construction), `${((financialMetrics.capex.construction / financialMetrics.capex.total) * 100).toFixed(1)}%`],
      ['Equipment', formatCurrency(financialMetrics.capex.equipment), `${((financialMetrics.capex.equipment / financialMetrics.capex.total) * 100).toFixed(1)}%`],
      ['Installation', formatCurrency(financialMetrics.capex.installation), `${((financialMetrics.capex.installation / financialMetrics.capex.total) * 100).toFixed(1)}%`],
      ['Working Capital', formatCurrency(financialMetrics.capex.workingCapital), `${((financialMetrics.capex.workingCapital / financialMetrics.capex.total) * 100).toFixed(1)}%`],
    ],
    foot: [[{ content: 'Total Investment', colSpan: 1, styles: { fontStyle: 'bold' } }, formatCurrency(financialMetrics.capex.total), '100%']],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    footStyles: { fillColor: [219, 234, 254], textColor: [0, 0, 0] },
    margin: { left: 20, right: 20 },
  });

  y = (doc as any).lastAutoTable.finalY + 25;

  // ============ REVENUE BREAKDOWN ============
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('Revenue Projections (Monthly)', 20, y);
  y += 15;

  autoTable(doc, {
    startY: y,
    head: [['Revenue Stream', 'Monthly', 'Annual', '% of Total']],
    body: [
      ['Memberships', formatCurrency(financialMetrics.revenue.memberships), formatCurrency(financialMetrics.revenue.memberships * 12), `${((financialMetrics.revenue.memberships / financialMetrics.revenue.total) * 100).toFixed(1)}%`],
      ['Court/Space Rentals', formatCurrency(financialMetrics.revenue.rentals), formatCurrency(financialMetrics.revenue.rentals * 12), `${((financialMetrics.revenue.rentals / financialMetrics.revenue.total) * 100).toFixed(1)}%`],
      ['Lessons & Training', formatCurrency(financialMetrics.revenue.lessons), formatCurrency(financialMetrics.revenue.lessons * 12), `${((financialMetrics.revenue.lessons / financialMetrics.revenue.total) * 100).toFixed(1)}%`],
      ['Events & Tournaments', formatCurrency(financialMetrics.revenue.events), formatCurrency(financialMetrics.revenue.events * 12), `${((financialMetrics.revenue.events / financialMetrics.revenue.total) * 100).toFixed(1)}%`],
      ['Retail & Concessions', formatCurrency(financialMetrics.revenue.retail), formatCurrency(financialMetrics.revenue.retail * 12), `${((financialMetrics.revenue.retail / financialMetrics.revenue.total) * 100).toFixed(1)}%`],
    ],
    foot: [[{ content: 'Total Revenue', styles: { fontStyle: 'bold' } }, formatCurrency(financialMetrics.revenue.total), formatCurrency(financialMetrics.revenue.total * 12), '100%']],
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
    footStyles: { fillColor: [220, 252, 231], textColor: [0, 0, 0] },
    margin: { left: 20, right: 20 },
  });

  y = (doc as any).lastAutoTable.finalY + 25;

  // ============ OPERATING EXPENSES ============
  checkNewPage(80);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('Operating Expenses (Monthly)', 20, y);
  y += 15;

  autoTable(doc, {
    startY: y,
    head: [['Expense Category', 'Monthly', 'Annual', '% of Total']],
    body: [
      ['Staffing & Payroll', formatCurrency(financialMetrics.opex.staffing), formatCurrency(financialMetrics.opex.staffing * 12), `${((financialMetrics.opex.staffing / financialMetrics.opex.total) * 100).toFixed(1)}%`],
      ['Fixed Operating', formatCurrency(financialMetrics.opex.fixedOperating), formatCurrency(financialMetrics.opex.fixedOperating * 12), `${((financialMetrics.opex.fixedOperating / financialMetrics.opex.total) * 100).toFixed(1)}%`],
      ['Utilities', formatCurrency(financialMetrics.opex.utilities), formatCurrency(financialMetrics.opex.utilities * 12), `${((financialMetrics.opex.utilities / financialMetrics.opex.total) * 100).toFixed(1)}%`],
      ['Insurance', formatCurrency(financialMetrics.opex.insurance), formatCurrency(financialMetrics.opex.insurance * 12), `${((financialMetrics.opex.insurance / financialMetrics.opex.total) * 100).toFixed(1)}%`],
      ['Maintenance', formatCurrency(financialMetrics.opex.maintenance), formatCurrency(financialMetrics.opex.maintenance * 12), `${((financialMetrics.opex.maintenance / financialMetrics.opex.total) * 100).toFixed(1)}%`],
    ],
    foot: [[{ content: 'Total OpEx', styles: { fontStyle: 'bold' } }, formatCurrency(financialMetrics.opex.total), formatCurrency(financialMetrics.opex.total * 12), '100%']],
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68] },
    footStyles: { fillColor: [254, 226, 226], textColor: [0, 0, 0] },
    margin: { left: 20, right: 20 },
  });

  y = (doc as any).lastAutoTable.finalY + 25;

  // ============ PROFITABILITY SUMMARY ============
  checkNewPage(80);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('Profitability Analysis', 20, y);
  y += 15;

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: [
      ['Monthly Revenue', formatCurrency(financialMetrics.revenue.total)],
      ['Monthly Operating Expenses', formatCurrency(financialMetrics.opex.total)],
      ['Monthly EBITDA', formatCurrency(financialMetrics.profitability.ebitda)],
      ['EBITDA Margin', `${((financialMetrics.profitability.ebitda / financialMetrics.revenue.total) * 100).toFixed(1)}%`],
      ['Annual EBITDA', formatCurrency(financialMetrics.profitability.ebitda * 12)],
      ['Return on Investment (ROI)', `${financialMetrics.profitability.roi.toFixed(1)}%`],
      ['Break-Even Period', `${financialMetrics.profitability.breakEvenMonths} months`],
      ['Payback Period', `${financialMetrics.profitability.paybackPeriod.toFixed(1)} years`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
    },
  });

  // Branded footer on all pages
  addBrandedFooter(doc);

  // Return as base64
  return doc.output('datauristring').split(',')[1];
}

export default generateWizardReportPdf;
