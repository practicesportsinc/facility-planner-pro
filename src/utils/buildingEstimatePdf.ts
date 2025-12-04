import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BuildingConfig, BuildingEstimate } from './buildingCalculator';

export function generateBuildingEstimatePDF(
  config: BuildingConfig,
  estimate: BuildingEstimate,
  leadData: { name: string; email: string }
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("Building Construction Estimate", 20, 25);
  
  // Subheader info
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Prepared for: ${leadData.name}`, 20, 35);
  doc.text(`Email: ${leadData.email}`, 20, 42);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 49);
  
  // Building Summary Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 58, 170, 35, 3, 3, 'FD');
  
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text("Building Specifications", 25, 68);
  
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Dimensions: ${config.width}' x ${config.length}' (${estimate.grossSF.toLocaleString()} SF)`, 25, 77);
  doc.text(`Eave Height: ${config.eaveHeight}'`, 25, 84);
  doc.text(`Finish Level: ${config.finishLevel.charAt(0).toUpperCase() + config.finishLevel.slice(1)}`, 120, 77);
  
  // Count doors
  const totalDoors = config.rollUpDoors12x14 + config.rollUpDoors10x12 + config.manDoors;
  doc.text(`Total Doors: ${totalDoors}`, 120, 84);
  
  // Itemized Cost Table
  const tableData = estimate.items.map(item => [
    item.name,
    item.category.charAt(0).toUpperCase() + item.category.slice(1).replace('_', ' '),
    `${item.quantity.toLocaleString()} ${item.unit}`,
    `$${item.unitCost.toLocaleString()}`,
    `$${item.total.toLocaleString()}`
  ]);
  
  autoTable(doc, {
    startY: 100,
    head: [['Item', 'Category', 'Quantity', 'Unit Cost', 'Total']],
    body: tableData,
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [60, 60, 60]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 35 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  });
  
  // Get the final Y position after the table
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
  
  // Total line
  yPos += 5;
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(120, yPos, 190, yPos);
  
  yPos += 8;
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.setFont(undefined, 'bold');
  doc.text("TOTAL ESTIMATE:", 120, yPos);
  doc.text(`$${estimate.total.toLocaleString()}`, 190, yPos, { align: 'right' });
  
  // Site Options Summary
  if (config.sitePrep || config.concreteFoundation || config.parking || config.utilities || config.sprinklerSystem) {
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
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
  
  // Footer with disclaimer
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(
    "Pricing displayed is only for budgeting purposes and is not guaranteed. Contact a facility specialist",
    20, 275
  );
  doc.text(
    "with Practice Sports, Inc. to confirm current pricing.",
    20, 280
  );
  
  // Branding
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("SportsFacility.ai | Practice Sports, Inc.", 20, 290);
  doc.text("practicesports.com | 402-592-2000", 140, 290);
  
  // Download
  doc.save(`building-estimate-${config.width}x${config.length}-${config.finishLevel}.pdf`);
}
