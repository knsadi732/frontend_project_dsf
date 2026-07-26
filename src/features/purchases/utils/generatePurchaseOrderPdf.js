import { jsPDF } from 'jspdf';

const MARGIN = 14;
const PAGE_RIGHT = 196;
const CONTENT_WIDTH = PAGE_RIGHT - MARGIN;
const NAVY = [15, 30, 70];
const ACCENT = [200, 90, 20];

const money = (n) => `Rs.${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
// Dates coming through from the backend/form are full ISO timestamps
// (e.g. "2026-07-27T18:30:00.000Z") — only the date portion is meaningful
// on a PO document.
const formatDate = (value) => (value ? String(value).slice(0, 10) : '-');

/**
 * Renders a Purchase Order as an invoice-style document (navy title band,
 * FROM/TO buyer-supplier blocks, itemised table with HSN/unit/GST%,
 * subtotal + CGST-SGST/IGST breakdown, grand total, delivery/payment
 * terms, signature line) instead of the generic key-value layout every
 * other module's PDF download uses — a PO is the one document type
 * that's actually handed to an external party (the vendor).
 *
 * The PO stores one flat `taxAmount` (no per-line tax breakdown or the
 * original % rate — see purchase.schema.js/PurchaseFormModal), so the
 * displayed GST% is back-derived from taxAmount/subtotal for display, and
 * the same rate is shown against every line rather than a genuinely
 * per-item rate.
 */
export function generatePurchaseOrderPdf({ po, company, vendor, warehouse, items }) {
  const doc = new jsPDF();
  let y = 0;

  // Title band
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 16, 'F');
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PURCHASE ORDER', 105, 10.5, { align: 'center' });
  y = 26;

  // FROM (Buyer = Company) / TO (Supplier = Vendor)
  const colWidth = (CONTENT_WIDTH - 8) / 2;
  const rightColX = MARGIN + colWidth + 8;
  const blockTop = y;

  doc.setTextColor(...ACCENT);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('FROM: (Buyer Details)', MARGIN, y);
  doc.text('TO: (Supplier Details)', rightColX, y);
  y += 6;

  doc.setTextColor(20);
  doc.setFontSize(9);
  let leftY = y;
  doc.setFont('helvetica', 'bold');
  doc.text(company?.name || 'Company', MARGIN, leftY);
  leftY += 5;
  doc.setFont('helvetica', 'normal');
  [company?.gstNumber && `GST: ${company.gstNumber}`, company?.address, company?.phone && `Contact: ${company.phone}`]
    .filter(Boolean)
    .forEach((line) => {
      doc.text(String(line), MARGIN, leftY, { maxWidth: colWidth });
      leftY += 5;
    });

  let rightY = y;
  doc.setFont('helvetica', 'bold');
  doc.text(vendor?.name || 'Vendor', rightColX, rightY);
  rightY += 5;
  doc.setFont('helvetica', 'normal');
  [vendor?.gstNumber && `GST: ${vendor.gstNumber}`, vendor?.address, vendor?.phone && `Contact: ${vendor.phone}`]
    .filter(Boolean)
    .forEach((line) => {
      doc.text(String(line), rightColX, rightY, { maxWidth: colWidth });
      rightY += 5;
    });

  y = Math.max(leftY, rightY, blockTop + 6) + 4;
  doc.setDrawColor(210);
  doc.line(MARGIN, y, PAGE_RIGHT, y);
  y += 7;

  // PO Number / Order Date / Expected Delivery
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('PO Number:', MARGIN, y);
  doc.setFont('helvetica', 'normal');
  doc.text(String(po.poNumber || '-'), MARGIN + 24, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 95, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(po.orderDate), 108, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Expected Delivery:', 135, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(po.expectedDeliveryDate), PAGE_RIGHT, y, { align: 'right' });
  y += 9;

  // Item table
  const cols = [
    { key: 'sno', label: 'S.No', x: MARGIN, width: 10 },
    { key: 'item', label: 'Item Description', x: MARGIN + 10, width: 62 },
    { key: 'hsn', label: 'HSN Code', x: 92, width: 18 },
    { key: 'qty', label: 'Qty', x: 112, width: 14 },
    { key: 'unit', label: 'Unit', x: 126, width: 14 },
    { key: 'rate', label: 'Rate', x: 140, width: 20 },
    { key: 'gst', label: 'GST %', x: 162, width: 14 },
  ];
  doc.setFillColor(...NAVY);
  doc.rect(MARGIN, y, CONTENT_WIDTH, 8, 'F');
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  cols.forEach((col) => doc.text(col.label, col.x, y + 5.5));
  doc.text('Amount', PAGE_RIGHT - 2, y + 5.5, { align: 'right' });
  y += 8;

  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitCost), 0);
  const taxAmount = Number(po.taxAmount) || 0;
  const derivedGstPercent = subtotal > 0 ? (taxAmount / subtotal) * 100 : 0;

  doc.setTextColor(20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  items.forEach((item, index) => {
    const amount = Number(item.quantity) * Number(item.unitCost);
    if (index % 2 === 1) {
      doc.setFillColor(245, 247, 250);
      doc.rect(MARGIN, y, CONTENT_WIDTH, 8, 'F');
    }
    doc.text(String(index + 1), MARGIN, y + 5.5);
    doc.text(item.label, MARGIN + 10, y + 5.5, { maxWidth: 60 });
    doc.text(item.hsnCode || '-', 92, y + 5.5);
    doc.text(String(item.quantity), 112, y + 5.5);
    doc.text(item.uom || '-', 126, y + 5.5);
    doc.text(money(item.unitCost), 140, y + 5.5);
    doc.text(taxAmount > 0 ? `${derivedGstPercent.toFixed(0)}%` : '-', 162, y + 5.5);
    doc.text(money(amount), PAGE_RIGHT - 2, y + 5.5, { align: 'right' });
    y += 8;
  });

  y += 3;
  doc.setDrawColor(210);
  doc.line(MARGIN, y, PAGE_RIGHT, y);
  y += 8;

  // Totals — CGST+SGST if vendor is in the same state as the company
  // (GSTIN's first 2 digits are the state code), otherwise IGST.
  const totalsLabelX = 130;
  doc.setFontSize(9);
  doc.setTextColor(20);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal (Before Tax):', totalsLabelX, y);
  doc.text(money(subtotal), PAGE_RIGHT - 2, y, { align: 'right' });
  y += 7;

  if (taxAmount > 0) {
    const companyState = company?.gstNumber?.slice(0, 2);
    const vendorState = vendor?.gstNumber?.slice(0, 2);
    const halfRate = (derivedGstPercent / 2).toFixed(1);
    const fullRate = derivedGstPercent.toFixed(1);
    const taxLines =
      companyState && vendorState && companyState === vendorState
        ? [
            [`SGST (${halfRate}%):`, taxAmount / 2],
            [`CGST (${halfRate}%):`, taxAmount / 2],
          ]
        : companyState && vendorState
          ? [[`IGST (${fullRate}%):`, taxAmount]]
          : [['GST:', taxAmount]];
    taxLines.forEach(([label, amount]) => {
      doc.text(label, totalsLabelX, y);
      doc.text(money(amount), PAGE_RIGHT - 2, y, { align: 'right' });
      y += 7;
    });
  }

  y += 1;
  doc.setTextColor(...ACCENT);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Grand Total:', totalsLabelX, y);
  doc.text(money(po.total ?? subtotal + taxAmount), PAGE_RIGHT - 2, y, { align: 'right' });
  y += 12;

  // Delivery / Payment terms — each on its own full-width row, wrapped, so
  // a long Payment Terms string can't run off the page or overlap the label.
  doc.setDrawColor(210);
  doc.line(MARGIN, y, PAGE_RIGHT, y);
  y += 8;
  doc.setTextColor(20);
  doc.setFontSize(9);

  doc.setFont('helvetica', 'bold');
  doc.text('Delivery Date:', MARGIN, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(po.expectedDeliveryDate), MARGIN + 28, y);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Payment Terms:', MARGIN, y);
  doc.setFont('helvetica', 'normal');
  const paymentTermsLines = doc.splitTextToSize(String(po.paymentTerms || '-'), CONTENT_WIDTH - 34);
  doc.text(paymentTermsLines, MARGIN + 34, y);
  y += 6 * paymentTermsLines.length + 1;

  if (warehouse?.name || po.deliveryAddress) {
    doc.setFont('helvetica', 'bold');
    doc.text('Ship To:', MARGIN, y);
    doc.setFont('helvetica', 'normal');
    const shipToLines = doc.splitTextToSize([warehouse?.name, po.deliveryAddress].filter(Boolean).join(' — '), CONTENT_WIDTH - 20);
    doc.text(shipToLines, MARGIN + 20, y);
    y += 6 * shipToLines.length + 1;
  }

  // Bank details — this is the vendor's own bank account (where the
  // company's finance team should send payment), not the company's. No
  // backend column exists for it (echo-only vendor fields — see
  // vendor.api.js), so it falls back to a placeholder if the vendor record
  // doesn't have one filled in for this session.
  y += 3;
  doc.setDrawColor(210);
  doc.line(MARGIN, y, PAGE_RIGHT, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Bank Details for Payment', MARGIN, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const bankLine = `Bank Name: ${vendor?.bankName || '[Your Bank Name]'}   |   Account: ${vendor?.bankAccountNumber || '[Account Number]'}   |   IFSC: ${vendor?.bankIfsc || '[IFSC Code]'}`;
  doc.text(bankLine, MARGIN, y);
  y += 10;

  // Signature
  y = Math.max(y + 15, 250);
  doc.setDrawColor(150);
  doc.line(140, y, PAGE_RIGHT, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Authorized by (Signature & Seal)', 168, y + 5, { align: 'center' });

  doc.setTextColor(150);
  doc.text(`Generated on ${new Date().toLocaleString()}`, MARGIN, 285);

  doc.save(`${po.poNumber}.pdf`);
}
