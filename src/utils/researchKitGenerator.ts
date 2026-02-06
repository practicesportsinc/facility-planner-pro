import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { loadLogoBase64, addBrandedHeader, addBrandedFooter } from './pdfBranding';

interface ProjectData {
  facilityName?: string;
  facilitySize?: number;
  sports?: string[];
  budgetRange?: string;
  timeline?: string;
  supplierCategories?: string[];
}

export const generateResearchKitPDF = async (projectData?: ProjectData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const logoBase64 = await loadLogoBase64();

  // Helper to add page if needed
  const checkAndAddPage = (height: number) => {
    if (yPos + height > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Branded Header
  let yPos = addBrandedHeader(doc, logoBase64, 'DIY Supplier Research Kit', 'Your comprehensive guide to finding and evaluating suppliers');

  // Project Summary (if data provided)
  if (projectData?.facilityName) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Your Project Summary', margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    if (projectData.facilityName) {
      doc.text(`Facility: ${projectData.facilityName}`, margin, yPos);
      yPos += 6;
    }
    if (projectData.facilitySize) {
      doc.text(`Size: ${projectData.facilitySize.toLocaleString()} sq ft`, margin, yPos);
      yPos += 6;
    }
    if (projectData.sports && projectData.sports.length > 0) {
      doc.text(`Sports: ${projectData.sports.join(', ')}`, margin, yPos);
      yPos += 6;
    }
    if (projectData.budgetRange) {
      doc.text(`Budget: ${projectData.budgetRange}`, margin, yPos);
      yPos += 6;
    }
    if (projectData.supplierCategories && projectData.supplierCategories.length > 0) {
      doc.text('Selected Supplier Categories:', margin, yPos);
      yPos += 5;
      projectData.supplierCategories.forEach((cat) => {
        doc.text(`  • ${cat}`, margin + 5, yPos);
        yPos += 5;
      });
    }
    yPos += 10;
  }

  // Section 1: Getting Started Guide
  checkAndAddPage(30);
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Getting Started Guide', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const gettingStartedText = [
    'The supplier research process typically takes 2-4 weeks. Here\'s what to expect:',
    '',
    'Week 1: Research & Initial Outreach',
    '  • Identify 5-10 potential suppliers per category',
    '  • Send initial inquiry emails (use template below)',
    '  • Request basic pricing and availability',
    '',
    'Week 2-3: Evaluation & Comparison',
    '  • Receive and compare quotes',
    '  • Check references and credentials',
    '  • Schedule calls with top 2-3 candidates',
    '',
    'Week 4: Decision & Negotiation',
    '  • Final comparison using scoring matrix',
    '  • Negotiate terms and warranties',
    '  • Request final proposals',
  ];

  gettingStartedText.forEach((line) => {
    checkAndAddPage(6);
    doc.text(line, margin, yPos);
    yPos += 5;
  });
  yPos += 10;

  // Section 2: RFP Email Template
  checkAndAddPage(40);
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('2. RFP Email Template', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Subject: Request for Quote - [Your Facility Name] Project', margin, yPos);
  yPos += 8;

  const emailTemplate = [
    'Dear [Supplier Name],',
    '',
    'I am planning a sports facility project and would like to request a quote for your products/services.',
    '',
    'Project Details:',
    `  • Facility Type: ${projectData?.facilityName || '[Indoor/Outdoor Sports Facility]'}`,
    `  • Size: ${projectData?.facilitySize ? projectData.facilitySize.toLocaleString() + ' sq ft' : '[Square Footage]'}`,
    `  • Location: [City, State]`,
    `  • Timeline: ${projectData?.timeline || '[Start Date - Completion Date]'}`,
    `  • Budget Range: ${projectData?.budgetRange || '[Budget Range]'}`,
    '',
    'Please provide:',
    '  1. Product specifications and pricing',
    '  2. Lead times and availability',
    '  3. Warranty information',
    '  4. Installation requirements (if applicable)',
    '  5. References from similar projects',
    '',
    'I would appreciate your response by [Date - typically 1-2 weeks out].',
    '',
    'Thank you for your time and consideration.',
    '',
    'Best regards,',
    '[Your Name]',
    '[Your Email]',
    '[Your Phone]',
  ];

  emailTemplate.forEach((line) => {
    checkAndAddPage(5);
    doc.text(line, margin, yPos);
    yPos += 5;
  });
  yPos += 10;

  // Section 3: Vendor Comparison Matrix
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Vendor Comparison Matrix', margin, yPos);
  yPos += 10;

  autoTable(doc, {
    startY: yPos,
    head: [['Criteria', 'Supplier A', 'Supplier B', 'Supplier C']],
    body: [
      ['Price Quote', '', '', ''],
      ['Lead Time', '', '', ''],
      ['Warranty (Years)', '', '', ''],
      ['Installation Included?', '', '', ''],
      ['References Provided?', '', '', ''],
      ['Product Quality', '', '', ''],
      ['Customer Service', '', '', ''],
      ['Payment Terms', '', '', ''],
      ['Overall Rating (1-10)', '', '', ''],
    ],
    theme: 'grid',
    headStyles: { fillColor: [33, 150, 243], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Section 4: Due Diligence Checklist
  checkAndAddPage(30);
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Due Diligence Checklist', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const checklist = [
    '☐ Verify business license and credentials',
    '☐ Check liability insurance coverage ($1M+ recommended)',
    '☐ Request and contact 3+ references from similar projects',
    '☐ Review online ratings and testimonials',
    '☐ Verify warranty terms in writing',
    '☐ Confirm lead times and delivery schedules',
    '☐ Review payment terms and deposit requirements',
    '☐ Check for any complaints with Better Business Bureau',
    '☐ Verify product certifications (UL, ASTM, etc.)',
    '☐ Review contract terms carefully before signing',
    '☐ Confirm installation requirements and costs',
    '☐ Check maintenance requirements and ongoing costs',
  ];

  checklist.forEach((item) => {
    checkAndAddPage(6);
    doc.text(item, margin, yPos);
    yPos += 6;
  });
  yPos += 10;

  // Section 5: Evaluation Scoring System
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('5. Evaluation Scoring System', margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Rate each supplier on a scale of 1-10 for each criterion, then calculate weighted score:', margin, yPos);
  yPos += 10;

  autoTable(doc, {
    startY: yPos,
    head: [['Criterion', 'Weight', 'Score (1-10)', 'Weighted Score']],
    body: [
      ['Price Competitiveness', '30%', '', ''],
      ['Product Quality', '25%', '', ''],
      ['Warranty & Support', '15%', '', ''],
      ['Lead Time', '10%', '', ''],
      ['References/Reputation', '10%', '', ''],
      ['Customer Service', '10%', '', ''],
      ['', 'TOTAL', '', ''],
    ],
    theme: 'grid',
    headStyles: { fillColor: [33, 150, 243], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Tip: A score of 70+ indicates a strong candidate. Compare final weighted scores to make your decision.', margin, yPos);
  yPos += 10;

  // Section 6: Key Questions to Ask
  checkAndAddPage(30);
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('6. Key Questions to Ask Suppliers', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const questions = [
    'Product & Quality:',
    '  • What materials are used in your products?',
    '  • Do you have relevant certifications (ASTM, NFHS, etc.)?',
    '  • Can you provide samples or visit existing installations?',
    '',
    'Pricing & Terms:',
    '  • What is included in the quoted price?',
    '  • What are your payment terms and deposit requirements?',
    '  • Do you offer volume discounts?',
    '',
    'Installation & Timeline:',
    '  • Who handles installation - you or a subcontractor?',
    '  • What is your typical lead time from order to delivery?',
    '  • What could cause delays in the timeline?',
    '',
    'Warranty & Support:',
    '  • What does your warranty cover and for how long?',
    '  • What is your process for handling warranty claims?',
    '  • Do you provide ongoing maintenance services?',
  ];

  questions.forEach((line) => {
    checkAndAddPage(5);
    doc.text(line, margin, yPos);
    yPos += 5;
  });

  // Branded footer on all pages
  addBrandedFooter(doc);

  // Save the PDF
  const fileName = projectData?.facilityName 
    ? `DIY-Research-Kit-${projectData.facilityName.replace(/\s+/g, '-')}.pdf`
    : 'DIY-Supplier-Research-Kit.pdf';
  
  doc.save(fileName);
};
