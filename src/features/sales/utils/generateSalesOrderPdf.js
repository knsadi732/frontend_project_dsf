import { jsPDF } from 'jspdf';
import { drawLetterhead } from '@/utils/pdfLetterhead';

const MARGIN = 14;
const PAGE_RIGHT = 196;
const CONTENT_WIDTH = PAGE_RIGHT - MARGIN;
const NAVY = [15, 30, 70];
const ACCENT = [200, 90, 20];

const money = (n) => `Rs.${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const formatDate = (value) => (value ? String(value).slice(0, 10) : '-');

/**
 * Renders a Sales Order as a tax-invoice-style document (letterhead,
 * FROM/TO seller-buyer blocks, itemised table with HSN/qty/rate/GST%,
 * subtotal + CGST-SGST/IGST breakdown, grand total, signature) — mirrors
 * generatePurchaseOrderPdf.js's layout since this is the same kind of
 * document handed to an external party (the customer).
 *
 * order.unitPrice/lineTotal are GST-inclusive (order.service.js backs the
 * taxable value out of the selling price rather than adding tax on top), so
 * the item rows show the inclusive rate/amount while the totals block still
 * shows the true taxable subtotal vs tax split.
 *
 * Before dispatch, goods haven't shipped and the charge is only an
 * estimate — this prints as a Proforma Invoice. Once order.dispatchedAt is
 * set (order.repository.js stamps it the moment status first reaches
 * "dispatched"), the same document becomes the final Tax Invoice — same
 * order number, no separate invoice entity or numbering needed.
 *
 * `invoiceNumber`/`dueDate`/`paymentStatus` are only passed when downloading
 * from the Finance > Invoices tab (finance.service.js's `bills` row, which
 * has its own number distinct from the order number, plus a due date and
 * payment status the order itself doesn't carry) — omitted, this renders as
 * a plain Sales Order/Proforma download.
 */
export function generateSalesOrderPdf({ order, company, customer, items, invoiceNumber, dueDate, paymentStatus }) {
  const isTaxInvoice = Boolean(order.dispatchedAt) || Boolean(invoiceNumber);
  const documentNumber = invoiceNumber || order.orderNumber;
  const doc = new jsPDF();
  let y = drawLetterhead(doc, { gstin: company?.gstNumber });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...NAVY);
  doc.text(isTaxInvoice ? 'TAX INVOICE' : 'PROFORMA INVOICE (ESTIMATED BILL)', 105, y, { align: 'center' });
  y += 10;

  // FROM (Seller = Company) / TO (Buyer = Customer)
  const colWidth = (CONTENT_WIDTH - 8) / 2;
  const rightColX = MARGIN + colWidth + 8;
  const blockTop = y;

  doc.setTextColor(...ACCENT);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('FROM: (Seller Details)', MARGIN, y);
  doc.text('TO: (Buyer Details)', rightColX, y);
  y += 6;

  doc.setTextColor(20);
  doc.setFontSize(9);
  let leftY = y;
  doc.setFont('helvetica', 'bold');
  doc.text(company?.name || 'DS Footwear', MARGIN, leftY);
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
  doc.text(customer?.name || 'Customer', rightColX, rightY);
  rightY += 5;
  doc.setFont('helvetica', 'normal');
  [customer?.gstin && `GST: ${customer.gstin}`, customer?.billing_address, customer?.phone && `Contact: ${customer.phone}`]
    .filter(Boolean)
    .forEach((line) => {
      doc.text(String(line), rightColX, rightY, { maxWidth: colWidth });
      rightY += 5;
    });

  y = Math.max(leftY, rightY, blockTop + 6) + 4;
  doc.setDrawColor(210);
  doc.line(MARGIN, y, PAGE_RIGHT, y);
  y += 7;

  // Order Number / Date / Status — Invoice Date only shows once dispatched
  // (that's the date the charge became final, not the order-placed date).
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(isTaxInvoice ? 'Invoice No:' : 'Order No:', MARGIN, y);
  doc.setFont('helvetica', 'normal');
  doc.text(String(documentNumber || '-'), MARGIN + 22, y);
  doc.setFont('helvetica', 'bold');
  doc.text(isTaxInvoice ? 'Invoice Date:' : 'Date:', 105, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(isTaxInvoice ? order.dispatchedAt : order.orderDate), isTaxInvoice ? 128 : 118, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Status:', 150, y);
  doc.setFont('helvetica', 'normal');
  doc.text(String(order.status || '-'), PAGE_RIGHT, y, { align: 'right' });
  y += 6;

  if (dueDate || paymentStatus) {
    doc.setFont('helvetica', 'bold');
    doc.text('Due Date:', MARGIN, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(dueDate), MARGIN + 22, y);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Status:', 105, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(paymentStatus || '-'), PAGE_RIGHT, y, { align: 'right' });
    y += 6;
  }
  y += 3;

  // Item table
  const cols = [
    { key: 'sno', label: 'S.No', x: MARGIN, width: 10 },
    { key: 'item', label: 'Item Description', x: MARGIN + 10, width: 62 },
    { key: 'hsn', label: 'HSN Code', x: 92, width: 18 },
    { key: 'qty', label: 'Qty', x: 112, width: 14 },
    { key: 'rate', label: 'Rate', x: 132, width: 20 },
    { key: 'gst', label: 'GST %', x: 158, width: 14 },
  ];
  doc.setFillColor(...NAVY);
  doc.rect(MARGIN, y, CONTENT_WIDTH, 8, 'F');
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  cols.forEach((col) => doc.text(col.label, col.x, y + 5.5));
  doc.text('Amount', PAGE_RIGHT - 2, y + 5.5, { align: 'right' });
  y += 8;

  doc.setTextColor(20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  items.forEach((item, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(245, 247, 250);
      doc.rect(MARGIN, y, CONTENT_WIDTH, 8, 'F');
    }
    doc.text(String(index + 1), MARGIN, y + 5.5);
    doc.text(item.label, MARGIN + 10, y + 5.5, { maxWidth: 60 });
    doc.text(item.hsnCode || '-', 92, y + 5.5);
    doc.text(String(item.quantity), 112, y + 5.5);
    doc.text(money(item.unitPrice), 132, y + 5.5);
    doc.text(item.taxRate ? `${Number(item.taxRate).toFixed(0)}%` : '-', 158, y + 5.5);
    doc.text(money(item.lineTotal), PAGE_RIGHT - 2, y + 5.5, { align: 'right' });
    y += 8;
  });

  y += 3;
  doc.setDrawColor(210);
  doc.line(MARGIN, y, PAGE_RIGHT, y);
  y += 8;

  // Totals — GST-inclusive pricing, so the taxable subtotal is the total
  // minus the already-computed tax, not the other way round. CGST+SGST if
  // customer is in the same state as the company, otherwise IGST.
  const totalsLabelX = 130;
  const subtotal = Number(order.subtotal) || 0;
  const taxAmount = Number(order.taxAmount) || 0;
  doc.setFontSize(9);
  doc.setTextColor(20);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal (Before Tax):', totalsLabelX, y);
  doc.text(money(subtotal), PAGE_RIGHT - 2, y, { align: 'right' });
  y += 7;

  if (taxAmount > 0) {
    const companyState = company?.gstNumber?.slice(0, 2);
    const customerState = customer?.gstin?.slice(0, 2);
    const derivedRate = subtotal > 0 ? (taxAmount / subtotal) * 100 : 0;
    const halfRate = (derivedRate / 2).toFixed(1);
    const fullRate = derivedRate.toFixed(1);
    const taxLines =
      companyState && customerState && companyState === customerState
        ? [
            [`SGST (${halfRate}%):`, taxAmount / 2],
            [`CGST (${halfRate}%):`, taxAmount / 2],
          ]
        : companyState && customerState
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
  doc.text(money(order.total ?? subtotal + taxAmount), PAGE_RIGHT - 2, y, { align: 'right' });
  y += 20;

  // Signature
  y = Math.max(y, 250);
  doc.setDrawColor(150);
  doc.line(140, y, PAGE_RIGHT, y);
  doc.setTextColor(20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Authorized by (Signature & Seal)', 168, y + 5, { align: 'center' });

  doc.setTextColor(150);
  doc.text(`Generated on ${new Date().toLocaleString()}`, MARGIN, 285);

  doc.save(`${documentNumber}.pdf`);
}
