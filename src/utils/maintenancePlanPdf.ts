import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { loadLogoBase64, addBrandedHeader, addBrandedFooter } from './pdfBranding';
import { MAINTENANCE_ASSETS } from '@/data/maintenanceAssets';
import type { MaintenancePlan, MaintenanceWizardState, Cadence } from '@/types/maintenance';

const CADENCE_ORDER: Cadence[] = ['daily', 'weekly', 'monthly', 'quarterly', 'annual'];
const CADENCE_LABELS: Record<Cadence, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
};

export async function generateMaintenancePlanPdf(
  state: MaintenanceWizardState,
  plan: MaintenancePlan
): Promise<void> {
  const doc = new jsPDF();
  const logoBase64 = await loadLogoBase64();

  // ── Cover / Header ──
  let y = addBrandedHeader(doc, logoBase64, 'Facility Maintenance Plan', state.facilityName || undefined);

  // Facility summary
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const summaryLines = [
    `Prepared for: ${state.name}`,
    `Email: ${state.email}`,
    state.facilityName ? `Facility: ${state.facilityName}` : '',
    [state.locationCity, state.locationState, state.locationZip].filter(Boolean).join(', ') || '',
    `Assets: ${state.selectedAssets.length} | Generated: ${new Date().toLocaleDateString()}`,
    `Taxonomy Version: ${plan.version}`,
  ].filter(Boolean);

  summaryLines.forEach((line) => {
    doc.text(line, 15, y);
    y += 6;
  });
  y += 4;

  // ── Schedule Tables by Cadence ──
  for (const cadence of CADENCE_ORDER) {
    const tasks = plan.tasks[cadence];
    if (tasks.length === 0) continue;

    // Check if we need a new page
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(`${CADENCE_LABELS[cadence]} Tasks`, 15, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Asset', 'Task', 'Who', 'Doc?', 'Qty']],
      body: tasks.map((t) => [
        t.assetName,
        t.description + (t.isModified ? ' ⚡' : ''),
        t.staffCanDo ? 'Staff' : 'Contractor',
        t.docRequired ? 'Yes' : '',
        String(t.quantity),
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [11, 99, 229], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 70 },
        2: { cellWidth: 25 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
      },
      margin: { left: 15, right: 15 },
    });

    y = (doc as any).lastAutoTable?.finalY + 10 || y + 30;
  }

  // ── Red Flags Page ──
  if (plan.redFlags.length > 0) {
    doc.addPage();
    y = 20;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 30, 30);
    doc.text('⚠ Red Flags — Immediate Action Required', 15, y);
    y += 10;

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    for (const rf of plan.redFlags) {
      doc.setFont('helvetica', 'bold');
      doc.text(rf.assetName, 15, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      for (const flag of rf.flags) {
        doc.text(`• ${flag}`, 20, y);
        y += 5;
        if (y > 270) { doc.addPage(); y = 20; }
      }
      y += 3;
    }
  }

  // ── Contractor Guidance Page ──
  if (plan.contractorNeeds.length > 0) {
    doc.addPage();
    y = 20;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Contractor Guidance', 15, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);

    for (const cn of plan.contractorNeeds) {
      doc.setFont('helvetica', 'bold');
      doc.text(cn.category, 15, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      for (const task of cn.tasks) {
        const lines = doc.splitTextToSize(`• ${task}`, 170);
        doc.text(lines, 20, y);
        y += lines.length * 5;
        if (y > 270) { doc.addPage(); y = 20; }
      }
      y += 3;
    }
  }

  // ── Footer ──
  addBrandedFooter(doc);

  doc.save(`maintenance-plan-${state.facilityName || 'facility'}.pdf`);
}

export async function generateMaintenancePlanPdfBase64(
  state: MaintenanceWizardState,
  plan: MaintenancePlan
): Promise<string> {
  const doc = new jsPDF();
  const logoBase64 = await loadLogoBase64();

  // ── Cover / Header ──
  let y = addBrandedHeader(doc, logoBase64, 'Facility Maintenance Plan', state.facilityName || undefined);

  // Facility summary
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const summaryLines = [
    `Prepared for: ${state.name}`,
    `Email: ${state.email}`,
    state.facilityName ? `Facility: ${state.facilityName}` : '',
    [state.locationCity, state.locationState, state.locationZip].filter(Boolean).join(', ') || '',
    `Assets: ${state.selectedAssets.length} | Generated: ${new Date().toLocaleDateString()}`,
    `Taxonomy Version: ${plan.version}`,
  ].filter(Boolean);

  summaryLines.forEach((line) => {
    doc.text(line, 15, y);
    y += 6;
  });
  y += 4;

  // ── Schedule Tables by Cadence ──
  for (const cadence of CADENCE_ORDER) {
    const tasks = plan.tasks[cadence];
    if (tasks.length === 0) continue;
    if (y > 240) { doc.addPage(); y = 20; }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(`${CADENCE_LABELS[cadence]} Tasks`, 15, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Asset', 'Task', 'Who', 'Doc?', 'Qty']],
      body: tasks.map((t) => [
        t.assetName,
        t.description + (t.isModified ? ' ⚡' : ''),
        t.staffCanDo ? 'Staff' : 'Contractor',
        t.docRequired ? 'Yes' : '',
        String(t.quantity),
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [11, 99, 229], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 70 },
        2: { cellWidth: 25 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
      },
      margin: { left: 15, right: 15 },
    });

    y = (doc as any).lastAutoTable?.finalY + 10 || y + 30;
  }

  // ── Red Flags Page ──
  if (plan.redFlags.length > 0) {
    doc.addPage();
    y = 20;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 30, 30);
    doc.text('⚠ Red Flags — Immediate Action Required', 15, y);
    y += 10;
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    for (const rf of plan.redFlags) {
      doc.setFont('helvetica', 'bold');
      doc.text(rf.assetName, 15, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      for (const flag of rf.flags) {
        doc.text(`• ${flag}`, 20, y);
        y += 5;
        if (y > 270) { doc.addPage(); y = 20; }
      }
      y += 3;
    }
  }

  // ── Contractor Guidance Page ──
  if (plan.contractorNeeds.length > 0) {
    doc.addPage();
    y = 20;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Contractor Guidance', 15, y);
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    for (const cn of plan.contractorNeeds) {
      doc.setFont('helvetica', 'bold');
      doc.text(cn.category, 15, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      for (const task of cn.tasks) {
        const lines = doc.splitTextToSize(`• ${task}`, 170);
        doc.text(lines, 20, y);
        y += lines.length * 5;
        if (y > 270) { doc.addPage(); y = 20; }
      }
      y += 3;
    }
  }

  addBrandedFooter(doc);

  // Return base64 without triggering download
  return doc.output('datauristring').split(',')[1];
}
