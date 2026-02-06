import jsPDF from 'jspdf';

let cachedLogoBase64: string | null = null;

/**
 * Loads the company logo as a base64 data URL for embedding in PDFs.
 * Results are cached after first load.
 */
export async function loadLogoBase64(): Promise<string | null> {
  if (cachedLogoBase64) return cachedLogoBase64;

  try {
    const response = await fetch('/images/sportsfacility-logo.png');
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        cachedLogoBase64 = reader.result as string;
        resolve(cachedLogoBase64);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Adds a branded header with logo and title to the current page.
 * Returns the Y position after the header for content placement.
 */
export function addBrandedHeader(
  doc: jsPDF,
  logoBase64: string | null,
  title: string,
  subtitle?: string
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  if (logoBase64) {
    try {
      // Logo on the left, roughly 40px tall with aspect ratio preserved
      doc.addImage(logoBase64, 'PNG', 15, 8, 50, 20);
    } catch {
      // If logo fails, just use text
    }
  }

  // Title text to the right of logo
  const titleX = logoBase64 ? 70 : 20;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text(title, titleX, y + 5);

  if (subtitle) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, titleX, y + 13);
    y += 13;
  }

  // Separator line under header
  y = 35;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(15, y, pageWidth - 15, y);

  return y + 10; // Return Y position for content to start
}

const DISCLAIMER_TEXT =
  'Pricing displayed is only for budgeting purposes and is not guaranteed. Contact a facility specialist with Practice Sports, Inc. to confirm current pricing.';

const CONTACT_LINES = [
  'Practice Sports, Inc. | SportsFacility.ai',
  '14706 Giles Rd, Omaha, NE 68138',
  '800.877.6787 | 402.592.2000',
  'info@practicesports.com | practicesports.com',
];

/**
 * Adds branded footer with disclaimer and contact info to every page.
 * Call this AFTER all content has been added to the document.
 */
export function addBrandedFooter(doc: jsPDF, includeDisclaimer = true): void {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    let footerY = 265;

    if (includeDisclaimer) {
      // Disclaimer
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(140, 140, 140);
      const splitDisclaimer = doc.splitTextToSize(DISCLAIMER_TEXT, pageWidth - 30);
      doc.text(splitDisclaimer, 15, footerY);
      footerY += splitDisclaimer.length * 3.5 + 3;
    }

    // Contact info
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);

    CONTACT_LINES.forEach((line) => {
      doc.text(line, 15, footerY);
      footerY += 3.5;
    });

    // Page number
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 15, 290, { align: 'right' });
  }
}
