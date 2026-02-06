import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { loadLogoBase64, addBrandedHeader, addBrandedFooter } from './pdfBranding';

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
  const logoBase64 = await loadLogoBase64();

  // Branded Header
  const subtitle = `Prepared for: ${data.leadData.name} | ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
  let y = addBrandedHeader(doc, logoBase64, 'Quick Estimate Report', subtitle);

  // Contact details
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Email: ${data.leadData.email}`, 20, y);
  y += 5;
  if (data.leadData.phone) {
    doc.text(`Phone: ${data.leadData.phone}`, 20, y);
    y += 5;
  }
  const locationParts = [data.leadData.city, data.leadData.state].filter(Boolean);
  if (locationParts.length > 0) {
    doc.text(`Location: ${locationParts.join(', ')}`, 20, y);
    y += 5;
  }

  // ============ KEY METRICS SUMMARY ============
  y += 8;
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, pageWidth - 30, 45, 3, 3, 'FD');

  y += 10;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Investment Summary', pageWidth / 2, y, { align: 'center' });

  y += 10;
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
  y += 35;
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
  }

  // Branded footer on all pages
  addBrandedFooter(doc);

  return doc.output('blob');
}

export default generateEasyWizardPdf;
