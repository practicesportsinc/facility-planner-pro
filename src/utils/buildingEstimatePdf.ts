import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BuildingConfig, BuildingEstimate } from './buildingCalculator';
import { loadLogoBase64, addBrandedHeader, addBrandedFooter } from './pdfBranding';

export async function generateBuildingEstimatePDF(
  config: BuildingConfig,
  estimate: BuildingEstimate,
  leadData: { name: string; email: string }
) {
  const doc = new jsPDF();
  const logoBase64 = await loadLogoBase64();

  // Branded Header
  const subtitle = `Prepared for: ${leadData.name} | ${leadData.email} | ${new Date().toLocaleDateString()}`;
  let y = addBrandedHeader(doc, logoBase64, 'Building Construction Estimate', subtitle);
  
  // Building Summary Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, y, 170, 30, 3, 3, 'FD');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text("Building Specifications", 25, y + 9);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Dimensions: ${config.width}' x ${config.length}' (${estimate.grossSF.toLocaleString()} SF)`, 25, y + 18);
  doc.text(`Eave Height: ${config.eaveHeight}'`, 25, y + 25);
  doc.text(`Finish Level: ${config.finishLevel.charAt(0).toUpperCase() + config.finishLevel.slice(1)}`, 120, y + 18);
  
  const totalDoors = config.rollUpDoors12x14 + config.rollUpDoors10x12 + config.manDoors;
  doc.text(`Total Doors: ${totalDoors}`, 120, y + 25);
  
  y += 38;

  // Itemized Cost Table
  const tableData = estimate.items.map(item => [
    item.name,
    item.category.charAt(0).toUpperCase() + item.category.slice(1).replace('_', ' '),
    `${item.quantity.toLocaleString()} ${item.unit}`,
    `$${item.unitCost.toLocaleString()}`,
    `$${item.total.toLocaleString()}`
  ]);
  
  autoTable(doc, {
    startY: y,
    head: [['Item', 'Category', 'Quantity', 'Unit Cost', 'Total']],
    body: tableData,
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 10 },
    bodyStyles: { fontSize: 9, textColor: [60, 60, 60] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 35 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  });
  
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Totals Section
  doc.setDrawColor(200, 200, 200);
  doc.line(120, finalY, 190, finalY);
  
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  
  const subtotal = estimate.subtotals.structure + estimate.subtotals.doors + estimate.subtotals.systems + estimate.subtotals.siteWork;
  
  let yPos = finalY + 8;
  doc.text("Subtotal:", 120, yPos);
  doc.text(`$${subtotal.toLocaleString()}`, 190, yPos, { align: 'right' });
  
  yPos += 7;
  doc.text("Soft Costs (15%):", 120, yPos);
  doc.text(`$${estimate.softCosts.toLocaleString()}`, 190, yPos, { align: 'right' });
  
  yPos += 7;
  doc.text("Contingency (10%):", 120, yPos);
  doc.text(`$${estimate.contingency.toLocaleString()}`, 190, yPos, { align: 'right' });
  
  yPos += 5;
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(120, yPos, 190, yPos);
  
  yPos += 8;
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.text("TOTAL ESTIMATE:", 120, yPos);
  doc.text(`$${estimate.total.toLocaleString()}`, 190, yPos, { align: 'right' });
  
  // Site Options Summary
  if (config.sitePrep || config.concreteFoundation || config.parking || config.utilities || config.sprinklerSystem) {
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text("Included Site Work:", 20, yPos);
    
    const siteOptions = [];
    if (config.sitePrep) siteOptions.push("Site Preparation");
    if (config.concreteFoundation) siteOptions.push("Concrete Foundation");
    if (config.parking) siteOptions.push("Parking Lot");
    if (config.utilities) siteOptions.push("Utilities");
    if (config.sprinklerSystem) siteOptions.push("Fire Sprinkler System");
    
    doc.setFontSize(9);
    doc.text(siteOptions.join(" • "), 20, yPos + 6);
  }
  
  // Branded footer on all pages
  addBrandedFooter(doc);
  
  doc.save(`building-estimate-${config.width}x${config.length}-${config.finishLevel}.pdf`);
}
