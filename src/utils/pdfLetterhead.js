const MARGIN = 14;
const PAGE_RIGHT = 196;
const NAVY = [15, 30, 70];

// Static registered-office / statutory details for DS Footwear (single-tenant
// ERP instance) — not backend-sourced, so it's fixed here rather than passed
// through every PDF caller.
const REGISTERED_OFFICE = 'DS Footwears, Committee Hall, Panagarh Bazar, Panagarh, Durgapur, West Bengal - 714133';
const PHONE = '+91-9144024857';
const EMAIL = 'shristyadityasingh1996@gmail.com';
const PAN = 'IMWPD8040N';
const PROPRIETOR = 'Mamta Singh';

/**
 * Draws the DS Footwear letterhead (logo mark, registered office, contact,
 * PAN/proprietor/GSTIN) at the top of any invoice-style PDF — sales orders,
 * work orders, tax invoices — so every document leaving the ERP is branded
 * consistently instead of a bare title.
 */
export function drawLetterhead(doc, { gstin } = {}) {
  let y = 14;

  doc.setFillColor(...NAVY);
  doc.roundedRect(MARGIN, y - 6, 10, 10, 1.5, 1.5, 'F');
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DS', MARGIN + 5, y - 0.5, { align: 'center' });

  doc.setTextColor(...NAVY);
  doc.setFontSize(13);
  doc.text('DS FOOTWEAR', MARGIN + 14, y - 1.5);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text('Step Into Excellence', MARGIN + 14, y + 3);
  y += 9;

  doc.setDrawColor(210);
  doc.line(MARGIN, y, PAGE_RIGHT, y);
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60);
  doc.text(`Registered Office: ${REGISTERED_OFFICE} | Phone: ${PHONE}`, MARGIN, y, { maxWidth: PAGE_RIGHT - MARGIN });
  y += 4;
  doc.text(`Email: ${EMAIL}`, MARGIN, y);
  y += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.text(`PAN: ${PAN}  |  Proprietor: ${PROPRIETOR}  |  GSTIN: ${gstin || '[GSTIN not set]'}`, MARGIN, y);
  y += 5;

  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, PAGE_RIGHT, y);
  doc.setLineWidth(0.2);
  y += 6;

  doc.setTextColor(20);
  return y;
}
