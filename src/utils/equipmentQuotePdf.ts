import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EquipmentQuote } from '@/types/equipment';
import { SPORT_LABELS } from '@/components/home/SportIcons';

export function generateEquipmentQuotePDF(quote: EquipmentQuote) {
  const doc = new jsPDF();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper to get unit label and dimensions
  const getUnitInfo = () => {
    const isBaseball = quote.sport === 'baseball_softball';
    const unitLabel = isBaseball ? 'Lanes' : 'Courts';
    
    const spaceMultiplier = quote.inputs.spaceSize === 'small' ? 0.8 
      : quote.inputs.spaceSize === 'large' ? 1.2 
      : 1;
    
    let dimensions = '';
    let sqftPerUnit = 0;
    
    if (isBaseball) {
      const laneWidth = quote.inputs.spaceSize === 'small' ? "12'" 
        : quote.inputs.spaceSize === 'large' ? "18'" 
        : "15'";
      dimensions = `70' x ${laneWidth}`;
      sqftPerUnit = 1200 * spaceMultiplier;
    } else if (quote.sport === 'pickleball') {
      dimensions = "60' x 30'";
      sqftPerUnit = 1800 * spaceMultiplier;
    }
    
    const totalSqft = Math.round(quote.inputs.units * sqftPerUnit);
    
    return { unitLabel, dimensions, totalSqft };
  };

  const unitInfo = getUnitInfo();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("Equipment Quote", 20, 25);
  
  // Sport name and date
  doc.setFontSize(14);
  doc.setTextColor(59, 130, 246);
  doc.text(SPORT_LABELS[quote.sport], 20, 35);
  
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 43);
  
  // Configuration Summary Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 52, 170, 30, 3, 3, 'FD');
  
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text("Configuration Summary", 25, 62);
  
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`${unitInfo.unitLabel}: ${quote.inputs.units}`, 25, 72);
  doc.text(`Space: ${quote.inputs.spaceSize.charAt(0).toUpperCase() + quote.inputs.spaceSize.slice(1)}`, 80, 72);
  
  if (unitInfo.dimensions) {
    doc.text(`Size: ${unitInfo.dimensions}`, 120, 72);
    doc.text(`Total: ${unitInfo.totalSqft.toLocaleString()} SF`, 160, 72);
  }
  
  // Build table data from line items
  const tableData: string[][] = [];
  
  quote.lineItems.forEach(category => {
    // Category header row
    tableData.push([category.category, '', '', '']);
    
    // Item rows
    category.items.forEach(item => {
      tableData.push([
        `  ${item.name}`,
        item.quantity.toLocaleString(),
        formatCurrency(item.unitCost),
        formatCurrency(item.totalCost)
      ]);
    });
    
    // Subtotal row
    tableData.push(['', '', 'Subtotal:', formatCurrency(category.subtotal)]);
  });
  
  // Itemized Table
  autoTable(doc, {
    startY: 90,
    head: [['Item', 'Qty', 'Unit Cost', 'Total']],
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
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    },
    didParseCell: (data) => {
      // Style category headers
      if (data.section === 'body' && data.column.index === 0) {
        const cellText = String(data.cell.raw);
        if (!cellText.startsWith('  ') && cellText !== '') {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [226, 232, 240];
        }
      }
      // Style subtotal rows
      if (data.section === 'body' && data.column.index === 2) {
        if (String(data.cell.raw) === 'Subtotal:') {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    margin: { left: 20, right: 20 }
  });
  
  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Totals Section
  doc.setDrawColor(200, 200, 200);
  doc.line(110, finalY, 190, finalY);
  
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  
  let yPos = finalY + 8;
  doc.text("Equipment & Materials:", 110, yPos);
  doc.text(formatCurrency(quote.totals.equipment + quote.totals.flooring), 190, yPos, { align: 'right' });
  
  yPos += 7;
  doc.text("Installation (est.):", 110, yPos);
  doc.text(formatCurrency(quote.totals.installation), 190, yPos, { align: 'right' });
  
  // Total line
  yPos += 5;
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(110, yPos, 190, yPos);
  
  yPos += 8;
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.setFont(undefined, 'bold');
  doc.text("TOTAL:", 110, yPos);
  doc.text(formatCurrency(quote.totals.grandTotal), 190, yPos, { align: 'right' });
  
  // Footer with disclaimer
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(
    "Pricing displayed is only for budgeting purposes and is not guaranteed. Contact a facility specialist",
    20, 270
  );
  doc.text(
    "with Practice Sports, Inc. to confirm current pricing.",
    20, 275
  );
  
  // Branding
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("SportsFacility.ai | Practice Sports, Inc.", 20, 285);
  doc.text("practicesports.com | 402-592-2000", 140, 285);
  
  // Download with sport name in filename
  const sportName = SPORT_LABELS[quote.sport].replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${sportName}_Equipment_Quote.pdf`);
}
