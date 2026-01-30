import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface EasyWizardPdfData {
  leadData: {
    name: string;
    email: string;
    phone?: string;
    city?: string;
    state?: string;
  };
  facilityDetails: {
    sports: string[];
    size: string;
    projectType: string;
  };
  kpis: {
    capex: number;
    monthlyRevenue: number;
    monthlyOpex: number;
    monthlyEbitda: number;
    breakEvenMonths: number | null;
    grossSf: number;
  };
  equipmentItems?: Array<{
    name: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
  facilityBreakdown?: Array<{
    name: string;
    totalCost: number;
  }>;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export async function generateEasyWizardPdf(data: EasyWizardPdfData): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // ============ COVER PAGE / HEADER ============
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 50, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Sports Facility Plan', pageWidth / 2, 25, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Quick Estimate Report', pageWidth / 2, 38, { align: 'center' });

  y = 65;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Prepared for: ${data.leadData.name}`, 20, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(`Email: ${data.leadData.email}`, 20, y);
  if (data.leadData.phone) {
    y += 6;
    doc.text(`Phone: ${data.leadData.phone}`, 20, y);
  }
  const locationParts = [data.leadData.city, data.leadData.state].filter(Boolean);
  if (locationParts.length > 0) {
    y += 6;
    doc.text(`Location: ${locationParts.join(', ')}`, 20, y);
  }
  y += 6;
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, y);

  // ============ KEY METRICS SUMMARY ============
  y += 20;
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, pageWidth - 30, 55, 3, 3, 'FD');

  y += 12;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Investment Summary', pageWidth / 2, y, { align: 'center' });

  y += 12;
  const summaryData = [
    ['Total Investment', formatCurrency(data.kpis.capex)],
    ['Monthly Revenue', formatCurrency(data.kpis.monthlyRevenue)],
    ['Monthly EBITDA', formatCurrency(data.kpis.monthlyEbitda)],
    ['Break-Even', data.kpis.breakEvenMonths ? `${data.kpis.breakEvenMonths} mo` : 'N/A'],
  ];

  const colWidth = (pageWidth - 50) / 4;
  summaryData.forEach((item, index) => {
    const x = 25 + (index * colWidth);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(item[0], x + colWidth / 2, y, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(item[1], x + colWidth / 2, y + 10, { align: 'center' });
  });

  // ============ FACILITY DETAILS ============
  y += 45;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('Facility Details', 20, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [['Specification', 'Value']],
    body: [
      ['Project Type', data.facilityDetails.projectType],
      ['Sports', data.facilityDetails.sports.join(', ') || 'Multi-Sport'],
      ['Total Square Footage', data.facilityDetails.size],
      ['Facility Size', `${data.kpis.grossSf.toLocaleString()} SF`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 20, right: 20 },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // ============ FINANCIAL BREAKDOWN ============
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('Financial Projections', 20, y);
  y += 10;

  const annualRevenue = data.kpis.monthlyRevenue * 12;
  const annualOpex = data.kpis.monthlyOpex * 12;
  const annualEbitda = data.kpis.monthlyEbitda * 12;
  const roi = data.kpis.capex > 0 ? Math.round((annualEbitda / data.kpis.capex) * 100) : 0;

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Monthly', 'Annual']],
    body: [
      ['Projected Revenue', formatCurrency(data.kpis.monthlyRevenue), formatCurrency(annualRevenue)],
      ['Operating Expenses', formatCurrency(data.kpis.monthlyOpex), formatCurrency(annualOpex)],
      ['EBITDA (Profit)', formatCurrency(data.kpis.monthlyEbitda), formatCurrency(annualEbitda)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
    margin: { left: 20, right: 20 },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // ============ KEY METRICS TABLE ============
  autoTable(doc, {
    startY: y,
    head: [['Key Metric', 'Value']],
    body: [
      ['Total Investment Required', formatCurrency(data.kpis.capex)],
      ['Estimated ROI', `${roi}%`],
      ['Break-Even Period', data.kpis.breakEvenMonths ? `${data.kpis.breakEvenMonths} months` : 'N/A'],
      ['Payback Period', data.kpis.breakEvenMonths ? `${(data.kpis.breakEvenMonths / 12).toFixed(1)} years` : 'N/A'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 20;

  // ============ EQUIPMENT BREAKDOWN (if provided) ============
  if (data.equipmentItems && data.equipmentItems.length > 0) {
    // Check if we need a new page
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('Equipment & Fixtures', 20, y);
    y += 10;

    const equipmentTotal = data.equipmentItems.reduce((sum, item) => sum + item.totalCost, 0);

    autoTable(doc, {
      startY: y,
      head: [['Item', 'Qty', 'Unit Cost', 'Total']],
      body: data.equipmentItems.map(item => [
        item.name,
        item.quantity.toString(),
        formatCurrency(item.unitCost),
        formatCurrency(item.totalCost),
      ]),
      foot: [[
        { content: 'Equipment Total', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
        formatCurrency(equipmentTotal)
      ]],
      theme: 'striped',
      headStyles: { fillColor: [100, 116, 139] },
      footStyles: { fillColor: [241, 245, 249] },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 9 },
    });

    y = (doc as any).lastAutoTable.finalY + 15;
  }

  // ============ FOOTER / DISCLAIMER ============
  // Check if we need a new page for disclaimer
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  const disclaimer = 'This report is for planning purposes only. Actual costs and revenues may vary based on location, market conditions, vendor negotiations, and other factors. Professional consultation is recommended before making investment decisions.';
  const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 40);
  doc.text(splitDisclaimer, 20, y);
  y += splitDisclaimer.length * 4 + 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Generated by Practice Sports | www.practicesports.com | info@practicesports.com', pageWidth / 2, y, { align: 'center' });

  // Return as Blob
  return doc.output('blob');
}

export default generateEasyWizardPdf;
