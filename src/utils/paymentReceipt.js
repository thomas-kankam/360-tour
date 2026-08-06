import { jsPDF } from "jspdf";
import env from "../config/env";
import { formatBookingCurrency } from "./bookingHelpers";
import { getBookingStatus } from "./bookingStorage";
import {
  PDF_COLORS,
  buildPdfFilename,
  drawPdfAccentBar,
  drawPdfBrandedHeader,
  drawPdfField,
  drawPdfFooter,
  loadReceiptLogoAsset,
  sanitizePdfText,
  setPdfDrawColor,
  setPdfFillColor,
  setPdfTextColor,
} from "./receiptPdfShared";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatReceiptDateShort(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatDepartureDate(dateStr) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function mapVerifiedPaymentToReceipt(paymentData) {
  if (!paymentData) return null;

  const booking = paymentData.booking || {};
  const tour = booking.tour || {};
  const locations = Array.isArray(tour.locations)
    ? tour.locations.filter(Boolean).join(" · ")
    : [tour.location, tour.country].filter(Boolean).join(" · ");

  return {
    paymentReference: paymentData.reference || "",
    paymentSlug: paymentData.paymentSlug || "",
    bookingRef: booking.bookingCode || paymentData.bookingCode || "",
    amount: Number(paymentData.amount) || 0,
    currency: paymentData.currency || "GHS",
    amountLabel: formatBookingCurrency(paymentData.amount, paymentData.currency),
    paidAt: paymentData.paidAt,
    status: paymentData.status,
    bookingStatus: booking.status,
    tour: {
      name: tour.name || "Tour booking",
      location: locations,
      duration: tour.durationLabel || (tour.durationDays ? `${tour.durationDays} days` : ""),
      image: tour.coverImageUrl || "",
    },
    selectedDate: formatDepartureDate(booking.selectedDate),
    selectedDateRaw: booking.selectedDate,
    travelers: Number(booking.travelers) || 1,
    bookingType: booking.bookingType || "individual",
    leadTraveler: booking.leadTraveler || {},
    receiptSubtitle: "Payment receipt",
    receiptBadge: "PAID",
    amountHeading: "AMOUNT PAID",
    amountDateLabel: "Paid at",
    showPaymentReference: true,
  };
}

export function isOnsiteBooking(booking) {
  if (!booking) return false;
  const status = booking.status || getBookingStatus(booking);
  return status === "pay_onsite" || booking.paymentMode === "onsite";
}

export function mapBookingToPaymentReceipt(booking) {
  if (!booking) return null;

  const tour = booking.tour || {};
  const location = [tour.location, tour.country].filter(Boolean).join(" · ");
  const status = booking.status || getBookingStatus(booking);
  const amount = Number(booking.subtotal ?? booking.amount ?? booking.payNowAmount) || 0;
  const currency = booking.currency || "GHS";
  const isPaid = status === "paid" || status === "deposit_paid";
  const isOnsite = isOnsiteBooking(booking);

  let amountHeading = "AMOUNT PAID";
  let receiptBadge = isPaid ? "PAID" : "CONFIRMED";
  let receiptSubtitle = isPaid && booking.paymentMode === "online" ? "Payment receipt" : "Booking receipt";
  let amountDateLabel = isPaid ? "Paid at" : "Reserved on";
  let premisesNotice = "";
  let footerLines;

  if (isOnsite) {
    amountHeading = "AMOUNT DUE ON SITE";
    receiptBadge = "PAY ON SITE";
    receiptSubtitle = "Booking receipt";
    amountDateLabel = "Reserved on";
    premisesNotice =
      "Present this receipt at tour premises upon arrival. Payment is due on site at check-in.";
    footerLines = [
      `${env.appName} · ${env.contactEmail} · ${env.contactPhone}`,
      "Present this receipt at tour premises upon arrival.",
      "Payment is due on site — keep this PDF for check-in.",
    ];
  } else if (status === "deposit_paid") {
    amountHeading = "DEPOSIT PAID";
    receiptBadge = "CONFIRMED";
    amountDateLabel = "Deposit paid on";
  }

  return {
    paymentReference: booking.paymentReference || "",
    bookingRef: booking.bookingRef || booking.bookingCode || "",
    amount,
    currency,
    amountLabel: formatBookingCurrency(amount, currency),
    paidAt: booking.paidAt || booking.savedAt || booking.issuedAt,
    tour: {
      name: tour.name || "Tour booking",
      location,
      duration: tour.duration || "",
      image: tour.image || "",
    },
    selectedDate: booking.selectedDate,
    selectedDateRaw: booking.selectedDateRaw || booking.selectedDate,
    travelers: Number(booking.travelers) || 1,
    bookingType: booking.bookingType || "individual",
    leadTraveler: booking.leadTraveler || {},
    receiptSubtitle,
    receiptBadge,
    amountHeading,
    amountDateLabel,
    premisesNotice,
    footerLines,
    showPaymentReference: Boolean(booking.paymentReference) && isPaid && booking.paymentMode === "online",
    paymentMethod: isOnsite ? "Pay on site at check-in" : "",
  };
}

export function buildPaymentReceiptHtml(data) {
  const {
    paymentReference,
    bookingRef,
    amountLabel,
    paidAt,
    tour,
    selectedDate,
    travelers,
    leadTraveler,
  } = data;

  const leadName = `${leadTraveler?.firstName || ""} ${leadTraveler?.lastName || ""}`.trim() || "—";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AfriQuest Payment Receipt — ${escapeHtml(paymentReference)}</title>
  <style>
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #1C2B26;
      background: #fff;
      font-size: 12px;
      line-height: 1.45;
    }
    .receipt {
      max-width: 640px;
      margin: 0 auto;
      border: 1px solid #E0D8C8;
      border-radius: 12px;
      overflow: hidden;
    }
    .accent { height: 3px; background: linear-gradient(90deg, #2D5A47, #E3A020, #D4611A); }
    .header {
      background: #2D5A47;
      color: #fff;
      padding: 18px 22px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }
    .header h1 { font-size: 18px; font-weight: 700; }
    .header p { margin-top: 2px; font-size: 11px; opacity: 0.85; }
    .badge {
      background: rgba(227,160,32,0.22);
      border: 1px solid rgba(227,160,32,0.45);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 4px 10px;
      border-radius: 999px;
      white-space: nowrap;
    }
    .amount {
      background: #FFF8EB;
      border-bottom: 1px solid #F0EBE0;
      padding: 16px 22px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .amount-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #D4611A;
      font-weight: 700;
    }
    .amount-value { font-size: 24px; font-weight: 700; color: #2D5A47; margin-top: 2px; }
    .amount-meta { font-size: 11px; color: #5A6B64; margin-top: 2px; }
    .body { padding: 18px 22px 20px; }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 16px;
    }
    .field-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #5A6B64;
      margin-bottom: 2px;
    }
    .field-value { font-size: 13px; font-weight: 600; color: #1C2B26; }
    .field-value.mono { font-family: "Courier New", monospace; font-size: 12px; letter-spacing: 0.04em; }
    .field.full { grid-column: 1 / -1; }
    .divider { height: 1px; background: #F0EBE0; margin: 14px 0; }
    .footer {
      border-top: 1px solid #E0D8C8;
      padding: 12px 22px 14px;
      background: #FAFAF8;
      font-size: 10px;
      color: #5A6B64;
      line-height: 1.5;
    }
    .footer strong { color: #1C2B26; }
    @media print {
      body { background: #fff; }
      .receipt { border: none; border-radius: 0; max-width: 100%; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="accent"></div>

    <div class="header">
      <div>
        <h1>AfriQuest Travel &amp; Tours</h1>
        <p>Payment receipt</p>
      </div>
      <span class="badge">Paid</span>
    </div>

    <div class="amount">
      <div>
        <div class="amount-label">Amount paid</div>
        <div class="amount-value">${escapeHtml(amountLabel)}</div>
        <div class="amount-meta">${escapeHtml(formatReceiptDateShort(paidAt))}</div>
      </div>
    </div>

    <div class="body">
      <div class="grid">
        <div class="field full">
          <div class="field-label">Payment reference</div>
          <div class="field-value mono">${escapeHtml(paymentReference)}</div>
        </div>
        <div class="field full">
          <div class="field-label">Booking reference</div>
          <div class="field-value mono">${escapeHtml(bookingRef)}</div>
        </div>
        <div class="field full">
          <div class="field-label">Tour</div>
          <div class="field-value">${escapeHtml(tour.name)}</div>
        </div>
        <div class="field">
          <div class="field-label">Departure</div>
          <div class="field-value">${escapeHtml(selectedDate)}</div>
        </div>
        <div class="field">
          <div class="field-label">Travelers</div>
          <div class="field-value">${travelers}</div>
        </div>
        <div class="field full">
          <div class="field-label">Lead traveler</div>
          <div class="field-value">${escapeHtml(leadName)}</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <strong>${escapeHtml(env.appName)}</strong> · ${escapeHtml(env.contactEmail)} · ${escapeHtml(env.contactPhone)}<br />
      Present this receipt at check-in.
    </div>
  </div>
</body>
</html>`;
}

function buildReceiptFilename(data) {
  return buildPdfFilename("AfriQuest-Receipt", data.bookingRef || data.paymentReference);
}

function formatPdfAmountLabel(data) {
  const amount = Number(data.amount) || 0;
  const currency = data.currency || "GHS";

  if (currency === "USD") return `$${amount.toFixed(2)}`;
  if (currency === "GHS") return `GHS ${amount.toFixed(2)}`;
  return `${currency} ${amount.toFixed(2)}`;
}

export function buildPaymentReceiptPdf(data, JsPDF, logoAsset = null) {
  if (!JsPDF) {
    throw new Error("JsPDF constructor is required");
  }

  const {
    paymentReference,
    bookingRef,
    paidAt,
    tour,
    selectedDate,
    travelers,
    leadTraveler,
    amountLabel: receiptAmountLabel,
    receiptSubtitle = "Payment receipt",
    receiptBadge = "PAID",
    amountHeading = "AMOUNT PAID",
    showPaymentReference = true,
    amountDateLabel = "Paid at",
    premisesNotice = "",
    footerLines,
    paymentMethod = "",
  } = data;

  const amountLabel = receiptAmountLabel || formatPdfAmountLabel(data);
  const leadName = `${leadTraveler?.firstName || ""} ${leadTraveler?.lastName || ""}`.trim() || "—";
  const doc = new JsPDF({ unit: "mm", format: "a4", compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  y = drawPdfAccentBar(doc, margin, y, contentWidth);

  y = drawPdfBrandedHeader(doc, {
    margin,
    y,
    contentWidth,
    logoAsset,
    title: "AfriQuest Travel & Tours",
    subtitle: receiptSubtitle,
    badgeText: receiptBadge,
  });

  const amountH = 24;
  setPdfFillColor(doc, PDF_COLORS.cream);
  doc.rect(margin, y, contentWidth, amountH, "F");
  setPdfDrawColor(doc, PDF_COLORS.border);
  doc.line(margin, y + amountH, margin + contentWidth, y + amountH);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  setPdfTextColor(doc, PDF_COLORS.orange);
  doc.text(sanitizePdfText(amountHeading), margin + 8, y + 9);
  doc.setFontSize(18);
  setPdfTextColor(doc, PDF_COLORS.green);
  doc.text(sanitizePdfText(amountLabel), margin + 8, y + 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setPdfTextColor(doc, PDF_COLORS.muted);
  if (paidAt) {
    const dateText = `${amountDateLabel} ${formatReceiptDateShort(paidAt)}`.trim();
    doc.text(sanitizePdfText(dateText), margin + 8, y + 22);
  }
  y += amountH + 10;

  if (premisesNotice) {
    const noticeLines = doc.splitTextToSize(sanitizePdfText(premisesNotice), contentWidth - 16);
    const noticeH = 10 + noticeLines.length * 4.5;
    setPdfFillColor(doc, PDF_COLORS.cream);
    doc.rect(margin, y, contentWidth, noticeH, "F");
    setPdfDrawColor(doc, PDF_COLORS.border);
    doc.line(margin, y + noticeH, margin + contentWidth, y + noticeH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setPdfTextColor(doc, PDF_COLORS.orange);
    doc.text("PRESENT AT TOUR PREMISES", margin + 8, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setPdfTextColor(doc, PDF_COLORS.ink);
    doc.text(noticeLines, margin + 8, y + 11);
    y += noticeH + 8;
  }

  const fieldX = margin + 8;
  const fieldWidth = contentWidth - 16;
  if (showPaymentReference && paymentReference) {
    y = drawPdfField(doc, "Payment reference", paymentReference, fieldX, y, fieldWidth);
  }
  y = drawPdfField(doc, "Booking reference", bookingRef, fieldX, y, fieldWidth);
  y = drawPdfField(doc, "Tour", tour?.name, fieldX, y, fieldWidth);

  if (tour?.location) {
    y = drawPdfField(doc, "Destination", tour.location, fieldX, y, fieldWidth);
  }

  const halfW = (fieldWidth - 8) / 2;
  const rowStartY = y;
  const leftEnd = drawPdfField(doc, "Departure", selectedDate, fieldX, rowStartY, halfW);
  const rightEnd = drawPdfField(doc, "Travelers", String(travelers), fieldX + halfW + 8, rowStartY, halfW);
  y = Math.max(leftEnd, rightEnd);

  y = drawPdfField(doc, "Lead traveler", leadName, fieldX, y, fieldWidth);

  if (paymentMethod) {
    y = drawPdfField(doc, "Payment method", paymentMethod, fieldX, y, fieldWidth);
  }

  const footerY = Math.max(y + 8, 250);
  drawPdfFooter(doc, {
    margin,
    contentWidth,
    footerY,
    lines: footerLines || [
      `${env.appName} · ${env.contactEmail} · ${env.contactPhone}`,
      "Present this receipt at check-in.",
      "Keep a copy on your device or print this PDF for tour premises.",
    ],
  });

  return doc;
}

export async function downloadPaymentReceiptPdf(data) {
  if (!data) return false;

  try {
    const logoAsset = await loadReceiptLogoAsset();
    const doc = buildPaymentReceiptPdf(data, jsPDF, logoAsset);
    doc.save(buildReceiptFilename(data));
    return true;
  } catch (error) {
    console.error("Failed to generate payment receipt PDF:", error);
    return false;
  }
}

/** @deprecated Use downloadPaymentReceiptPdf instead */
export async function printPaymentReceipt(data) {
  return downloadPaymentReceiptPdf(data);
}
