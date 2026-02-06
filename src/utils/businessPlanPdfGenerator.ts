import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BusinessPlanData } from '@/types/businessPlan';
import { loadLogoBase64, addBrandedHeader, addBrandedFooter } from './pdfBranding';

export async function generateBusinessPlanPdf(data: BusinessPlanData, aiContent?: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoBase64 = await loadLogoBase64();

  // Cover Page with branded header
  let y = addBrandedHeader(doc, logoBase64, data.projectOverview.facilityName || 'Sports Facility', 'Business Plan');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`${data.projectOverview.city}, ${data.projectOverview.state}`, pageWidth / 2, y, { align: 'center' });
  y += 20;

  // Key Metrics
  const totalStartup = data.financials.startupCosts.leaseDeposit +
    data.financials.startupCosts.buildoutConstruction +
    data.financials.startupCosts.equipmentTechnology +
    data.financials.startupCosts.preOpeningCosts +
    data.financials.startupCosts.workingCapitalReserve;
  const contingency = totalStartup * (data.financials.startupCosts.contingencyPercentage / 100);
  const totalCapital = totalStartup + contingency;

  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(`Total Investment Required: $${totalCapital.toLocaleString()}`, 20, y);
  y += 8;
  doc.text(`Facility Size: ${data.facilityDesign.totalSquareFootage.toLocaleString()} SF`, 20, y);
  y += 8;
  doc.text(`Target Opening: ${data.projectOverview.targetOpeningDate || 'TBD'}`, 20, y);
  y += 8;
  doc.text(`Scenario: ${data.scenario.charAt(0).toUpperCase() + data.scenario.slice(1)}`, 20, y);

  // New page for content
  doc.addPage();
  y = 20;

  // Executive Summary
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Executive Summary', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const execSummary = aiContent?.executiveSummary || 
    `${data.projectOverview.facilityName} is a proposed ${data.facilityDesign.totalSquareFootage.toLocaleString()} SF sports facility in ${data.projectOverview.city}, ${data.projectOverview.state}. The facility will serve ${data.marketAnalysis.customerSegments.length} customer segments with a total investment of $${totalCapital.toLocaleString()}.`;
  
  const splitSummary = doc.splitTextToSize(execSummary, pageWidth - 40);
  doc.text(splitSummary, 20, y);
  y += splitSummary.length * 5 + 15;

  // Market Analysis
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Market Analysis', 20, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: [
      ['Population (10 min)', data.marketAnalysis.population10Min.toLocaleString()],
      ['Population (15 min)', data.marketAnalysis.population15Min.toLocaleString()],
      ['Median Household Income', `$${data.marketAnalysis.medianHouseholdIncome.toLocaleString()}`],
      ['Youth Population', `${data.marketAnalysis.youthPopulation}%`],
      ['Population Growth Rate', `${data.marketAnalysis.populationGrowthRate}%`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Financial Summary
  doc.addPage();
  y = 20;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Summary', 20, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [['Startup Cost Category', 'Amount']],
    body: [
      ['Lease Deposit', `$${data.financials.startupCosts.leaseDeposit.toLocaleString()}`],
      ['Buildout/Construction', `$${data.financials.startupCosts.buildoutConstruction.toLocaleString()}`],
      ['Equipment & Technology', `$${data.financials.startupCosts.equipmentTechnology.toLocaleString()}`],
      ['Pre-Opening Costs', `$${data.financials.startupCosts.preOpeningCosts.toLocaleString()}`],
      ['Working Capital', `$${data.financials.startupCosts.workingCapitalReserve.toLocaleString()}`],
      ['Contingency', `$${contingency.toLocaleString()}`],
      ['TOTAL', `$${totalCapital.toLocaleString()}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Branded footer on all pages
  addBrandedFooter(doc);

  doc.save(`${data.projectOverview.facilityName || 'Business_Plan'}_Business_Plan.pdf`);
}
