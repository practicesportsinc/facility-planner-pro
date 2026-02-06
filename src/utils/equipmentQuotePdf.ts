import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EquipmentQuote } from '@/types/equipment';
import { SPORT_LABELS } from '@/components/home/SportIcons';
import { loadLogoBase64, addBrandedHeader, addBrandedFooter } from './pdfBranding';

export async function generateEquipmentQuotePDF(quote: EquipmentQuote) {
  const doc = new jsPDF();
  const logoBase64 = await loadLogoBase64();

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

  // Branded Header
  const subtitle = `${SPORT_LABELS[quote.sport]} | Generated: ${new Date().toLocaleDateString()}`;
  let y = addBrandedHeader(doc, logoBase64, 'Equipment Quote', subtitle);

  // Configuration Summary Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, y, 170, 25, 3, 3, 'FD');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text("Configuration", 25, y + 8);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`${unitInfo.unitLabel}: ${quote.inputs.units}`, 25, y + 17);
  doc.text(`Space: ${quote.inputs.spaceSize.charAt(0).toUpperCase() + quote.inputs.spaceSize.slice(1)}`, 80, y + 17);
  
  if (unitInfo.dimensions) {
    doc.text(`Size: ${unitInfo.dimensions}`, 120, y + 17);
    doc.text(`Total: ${unitInfo.totalSqft.toLocaleString()} SF`, 160, y + 17);
  }
  
  y += 33;

  // Build table data from line items
  const tableData: string[][] = [];
  
  quote.lineItems.forEach(category => {
    tableData.push([category.category, '', '', '']);
    category.items.forEach(item => {
      tableData.push([
        `  ${item.name}`,
        item.quantity.toLocaleString(),
        formatCurrency(item.unitCost),
        formatCurrency(item.totalCost)
      ]);
    });
    tableData.push(['', '', 'Subtotal:', formatCurrency(category.subtotal)]);
  });
  
  // Itemized Table
  autoTable(doc, {
    startY: y,
    head: [['Item', 'Qty', 'Unit Cost', 'Total']],
    body: tableData,
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: { fontSize: 9, textColor: [60, 60, 60] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        const cellText = String(data.cell.raw);
        if (!cellText.startsWith('  ') && cellText !== '') {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [226, 232, 240];
        }
      }
      if (data.section === 'body' && data.column.index === 2) {
        if (String(data.cell.raw) === 'Subtotal:') {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    margin: { left: 20, right: 20 }
  });
  
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
  
  yPos += 5;
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(110, yPos, 190, yPos);
  
  yPos += 8;
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.text("TOTAL:", 110, yPos);
  doc.text(formatCurrency(quote.totals.grandTotal), 190, yPos, { align: 'right' });
  
  // Branded footer on all pages
  addBrandedFooter(doc);
  
  const sportName = SPORT_LABELS[quote.sport].replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${sportName}_Equipment_Quote.pdf`);
}
