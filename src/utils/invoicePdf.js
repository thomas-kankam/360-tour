import { calculateInvoiceTotals } from "./invoiceHelpers";

async function loadJsPDF() {
  const { jsPDF } = await import("jspdf");
  return jsPDF;
}

function formatMoney(amount, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(amount) || 0);
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
}

function addWrappedText(doc, text, x, y, maxWidth, lineHeight = 5) {
  const lines = doc.splitTextToSize(String(text || ""), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

export async function buildInvoicePdfBlob(invoice, company = {}) {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 16;
  let y = margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;

  doc.setFillColor(21, 67, 96);
  doc.rect(0, 0, pageWidth, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(21, 67, 96);
  doc.text("INVOICE", margin, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`No. ${invoice.invoiceNumber || "Draft"}`, pageWidth - margin, y + 4, { align: "right" });
  doc.text(`Issue: ${invoice.issueDate || "—"}`, pageWidth - margin, y + 9, { align: "right" });
  doc.text(`Due: ${invoice.dueDate || "—"}`, pageWidth - margin, y + 14, { align: "right" });

  y += 22;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(21, 67, 96);
  doc.text(company.legalName || company.name || "360 Tours and Investment Limited", margin, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  [
    company.addressLine1,
    company.addressLine2,
    company.email,
    company.phone,
    company.taxId ? `Tax ID: ${company.taxId}` : "",
  ]
    .filter(Boolean)
    .forEach((line) => {
      doc.text(String(line), margin, y);
      y += 4.5;
    });

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(21, 67, 96);
  doc.text("Billed to", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  [
    invoice.billedTo?.name,
    invoice.billedTo?.email,
    invoice.billedTo?.phone,
    invoice.billedTo?.address,
  ]
    .filter(Boolean)
    .forEach((line) => {
      doc.text(String(line), margin, y);
      y += 4.5;
    });

  y += 6;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(21, 67, 96);
  doc.text("Description", margin, y);
  doc.text("Qty", margin + contentWidth * 0.55, y);
  doc.text("Rate", margin + contentWidth * 0.68, y);
  doc.text("Amount", pageWidth - margin, y, { align: "right" });
  y += 3;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  (invoice.lineItems || []).forEach((item) => {
    const amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
    y = addWrappedText(doc, item.description || "Item", margin, y, contentWidth * 0.5, 4.5);
    doc.text(String(item.quantity || 0), margin + contentWidth * 0.55, y - 4.5);
    doc.text(formatMoney(item.rate, invoice.currency), margin + contentWidth * 0.68, y - 4.5);
    doc.text(formatMoney(amount, invoice.currency), pageWidth - margin, y - 4.5, { align: "right" });
    y += 2;
  });

  y += 4;
  const totals = calculateInvoiceTotals(invoice);
  const totalsX = pageWidth - margin - 50;
  doc.setFontSize(9);
  [
    ["Subtotal", formatMoney(totals.subtotal, invoice.currency)],
    ...(totals.discountAmount ? [["Discount", `- ${formatMoney(totals.discountAmount, invoice.currency)}`]] : []),
    ...(totals.taxAmount ? [[`Tax (${invoice.taxPercent}%)`, formatMoney(totals.taxAmount, invoice.currency)]] : []),
    ...(totals.shipping ? [["Shipping", formatMoney(totals.shipping, invoice.currency)]] : []),
  ].forEach(([label, value]) => {
    doc.text(label, totalsX, y);
    doc.text(value, pageWidth - margin, y, { align: "right" });
    y += 5;
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total", totalsX, y + 2);
  doc.text(formatMoney(totals.total, invoice.currency), pageWidth - margin, y + 2, { align: "right" });
  y += 12;

  if (invoice.notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Notes", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    y = addWrappedText(doc, invoice.notes, margin, y, contentWidth);
    y += 4;
  }

  const paymentLines = [
    invoice.paymentDetails,
    company.bankName ? `Bank: ${company.bankName}` : "",
    company.bankAccount ? `Account: ${company.bankAccount}` : "",
    company.bankRouting ? `Routing / SWIFT: ${company.bankRouting}` : "",
    company.paypalOrMobileMoney ? company.paypalOrMobileMoney : "",
  ].filter(Boolean);

  if (paymentLines.length) {
    doc.setFont("helvetica", "bold");
    doc.text("Payment details", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    paymentLines.forEach((line) => {
      y = addWrappedText(doc, line, margin, y, contentWidth, 4.5);
    });
    y += 2;
  }

  if (invoice.terms) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    addWrappedText(doc, invoice.terms, margin, y, contentWidth);
  }

  return doc.output("blob");
}

export async function downloadInvoicePdf(invoice, company) {
  const blob = await buildInvoicePdfBlob(invoice, company);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${invoice.invoiceNumber || "invoice"}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
