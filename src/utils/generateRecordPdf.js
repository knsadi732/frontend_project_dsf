import { jsPDF } from 'jspdf';
import { drawLetterhead } from './pdfLetterhead';

const MARGIN = 14;
const PAGE_RIGHT = 196;

/**
 * Renders a single-record document (letterhead + header fields + optional
 * line-items table + total) as a downloadable PDF. Used by every module's
 * "download" row action so any record leaving the ERP — work order, tax
 * invoice, or otherwise — is branded with the company letterhead.
 */
export function generateRecordPdf({ title, fields = [], items, itemsColumns, total, fileName, gstin }) {
  const doc = new jsPDF();
  let y = drawLetterhead(doc, { gstin });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, MARGIN, y);
  y += 8;

  doc.setDrawColor(200);
  doc.line(MARGIN, y, PAGE_RIGHT, y);
  y += 8;

  doc.setFontSize(10);
  fields.forEach(({ label, value }) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, MARGIN, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value ?? '-'), MARGIN + 42, y);
    y += 7;
  });

  if (items?.length && itemsColumns?.length) {
    y += 4;
    doc.line(MARGIN, y, PAGE_RIGHT, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    let x = MARGIN;
    itemsColumns.forEach((col) => {
      doc.text(col.label, x, y);
      x += col.width;
    });
    y += 3;
    doc.line(MARGIN, y, PAGE_RIGHT, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    items.forEach((item) => {
      x = MARGIN;
      itemsColumns.forEach((col) => {
        const raw = item[col.key];
        const text = col.format ? col.format(raw, item) : String(raw ?? '-');
        doc.text(text, x, y);
        x += col.width;
      });
      y += 7;
    });
  }

  if (total) {
    y += 3;
    doc.line(MARGIN, y, PAGE_RIGHT, y);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text(total, PAGE_RIGHT, y, { align: 'right' });
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.text(`Generated on ${new Date().toLocaleString()}`, MARGIN, 285);

  doc.save(fileName);
}
