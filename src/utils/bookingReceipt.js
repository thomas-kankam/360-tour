import env from "../config/env";
import consumerPaymentsServiceApi from "../apis/ConsumerPaymentsServiceApi";
import { formatBookingCurrency } from "./bookingHelpers";
import {
  downloadPaymentReceiptPdf,
  isOnsiteBooking,
  mapBookingToPaymentReceipt,
  mapVerifiedPaymentToReceipt,
} from "./paymentReceipt";

function formatCurrency(amount, currency = "GHS") {
  return formatBookingCurrency(amount, currency);
}

function formatDate(iso) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildTravelerRows(leadTraveler, additionalTravelers) {
  const rows = [
    {
      label: "Lead traveler",
      name: `${leadTraveler.firstName} ${leadTraveler.lastName}`.trim(),
      email: leadTraveler.email,
      phone: leadTraveler.phone,
    },
    ...additionalTravelers.map((t, i) => ({
      label: `Traveler ${i + 2}`,
      name: t.name,
      email: t.email,
      phone: t.phone,
    })),
  ];

  return rows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.label)}</td>
          <td>${escapeHtml(row.name)}</td>
          <td>${escapeHtml(row.email)}</td>
          <td>${escapeHtml(row.phone)}</td>
        </tr>
      `,
    )
    .join("");
}

export function buildReceiptHtml(data) {
  const {
    bookingRef,
    tour,
    selectedDate,
    travelers,
    paymentMode,
    payType,
    payNowAmount,
    subtotal,
    depositAmount,
    payLaterHoldHours,
    depositPercent,
    leadTraveler,
    additionalTravelers = [],
    bookingType,
    groupDetails,
    specialRequests,
    dietaryNeeds,
    issuedAt = new Date().toISOString(),
    currency = "GHS",
  } = data;

  const statusLabel =
    paymentMode === "online"
      ? "Paid in full — online"
      : paymentMode === "onsite"
        ? "Reserved — pay on site at check-in"
        : paymentMode === "now"
          ? payType === "deposit"
            ? "Deposit paid — balance due before departure"
            : "Paid in full"
          : `Reserved — ${depositPercent}% deposit due within ${payLaterHoldHours}h`;

  const amountLine =
    paymentMode === "online"
      ? `<tr><td>Amount paid today</td><td><strong>${escapeHtml(formatCurrency(payNowAmount, currency))}</strong></td></tr>`
      : paymentMode === "onsite"
        ? `<tr><td>Total due on site</td><td><strong>${escapeHtml(formatCurrency(subtotal, currency))}</strong></td></tr>
           <tr><td>Amount paid today</td><td>${escapeHtml(formatCurrency(0, currency))} — pay at check-in</td></tr>`
        : paymentMode === "now"
          ? `<tr><td>Amount paid today</td><td><strong>${escapeHtml(formatCurrency(payNowAmount, currency))}</strong></td></tr>`
          : `<tr><td>Total tour cost</td><td>${escapeHtml(formatCurrency(subtotal, currency))}</td></tr>
             <tr><td>Deposit due within ${payLaterHoldHours}h</td><td><strong>${escapeHtml(formatCurrency(depositAmount, currency))}</strong></td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>360 Tours Booking Receipt — ${escapeHtml(bookingRef)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, "Times New Roman", serif; color: #1C2B26; background: #F7F3EB; padding: 32px 16px; }
    .receipt { max-width: 720px; margin: 0 auto; background: #fff; border: 1px solid #E0D8C8; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 40px rgba(28,43,38,0.12); }
    .header { background: linear-gradient(135deg, #2D5A47 0%, #234839 100%); color: #fff; padding: 28px 32px; }
    .header h1 { font-size: 22px; font-weight: 700; letter-spacing: 0.02em; }
    .header p { margin-top: 4px; font-size: 13px; opacity: 0.85; }
    .ref { margin-top: 20px; display: inline-block; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); border-radius: 10px; padding: 10px 16px; }
    .ref-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.8; }
    .ref-value { font-family: "Courier New", monospace; font-size: 20px; font-weight: 700; margin-top: 4px; letter-spacing: 0.08em; }
    .notice { background: #FFF8EB; border-left: 4px solid #E3A020; padding: 16px 20px; margin: 0; }
    .notice strong { display: block; color: #B55215; font-size: 14px; margin-bottom: 6px; }
    .notice p { font-size: 13px; line-height: 1.5; color: #5A6B64; }
    .body { padding: 28px 32px 32px; }
    .section { margin-bottom: 24px; }
    .section h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: #D4611A; margin-bottom: 12px; font-family: Arial, sans-serif; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    table.info td { padding: 8px 0; vertical-align: top; border-bottom: 1px solid #F0EBE0; }
    table.info td:first-child { width: 38%; color: #5A6B64; font-family: Arial, sans-serif; }
    table.info td:last-child { font-weight: 600; }
    table.travelers { font-family: Arial, sans-serif; font-size: 12px; }
    table.travelers th { text-align: left; padding: 8px 10px; background: #F7F3EB; color: #5A6B64; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; }
    table.travelers td { padding: 10px; border-bottom: 1px solid #F0EBE0; vertical-align: top; }
    .status { display: inline-block; background: #EAF2EE; color: #2D5A47; font-family: Arial, sans-serif; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 999px; }
    .footer { border-top: 1px solid #E0D8C8; padding: 20px 32px; background: #FAFAF8; font-family: Arial, sans-serif; font-size: 11px; color: #5A6B64; line-height: 1.6; }
    .footer strong { color: #1C2B26; }
    @media print {
      body { background: #fff; padding: 0; }
      .receipt { box-shadow: none; border: none; border-radius: 0; max-width: 100%; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>360 Tours and Investment Limited</h1>
      <p>Official booking receipt</p>
      <div class="ref">
        <div class="ref-label">Booking reference</div>
        <div class="ref-value">${escapeHtml(bookingRef)}</div>
      </div>
    </div>

    <div class="notice">
      <strong>⚠ Present this receipt at the premises upon arrival</strong>
      <p>Please download, print, or save this receipt on your device and show it to 360 Tours staff or your tour guide when you arrive. This confirms your booking and traveler details.</p>
    </div>

    <div class="body">
      <div class="section">
        <h2>Tour details</h2>
        <table class="info">
          <tr><td>Tour</td><td>${escapeHtml(tour.name)}</td></tr>
          <tr><td>Location</td><td>${escapeHtml(tour.location)}</td></tr>
          <tr><td>Country</td><td>${escapeHtml(tour.country)}</td></tr>
          <tr><td>Departure date</td><td>${escapeHtml(selectedDate)}</td></tr>
          <tr><td>Duration</td><td>${escapeHtml(tour.duration)}</td></tr>
          <tr><td>Travelers</td><td>${travelers}</td></tr>
          <tr><td>Booking type</td><td>${escapeHtml(bookingType === "group" ? "Group booking" : "Individual")}</td></tr>
          ${groupDetails?.groupName ? `<tr><td>Group</td><td>${escapeHtml(groupDetails.groupName)}</td></tr>` : ""}
          ${groupDetails?.groupType ? `<tr><td>Group type</td><td>${escapeHtml(groupDetails.groupType)}</td></tr>` : ""}
          ${dietaryNeeds ? `<tr><td>Dietary / accessibility</td><td>${escapeHtml(dietaryNeeds)}</td></tr>` : ""}
          ${specialRequests ? `<tr><td>Special requests</td><td>${escapeHtml(specialRequests)}</td></tr>` : ""}
          <tr><td>Status</td><td><span class="status">${escapeHtml(statusLabel)}</span></td></tr>
          ${amountLine}
          <tr><td>Issued</td><td>${escapeHtml(formatDate(issuedAt))}</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>Traveler information</h2>
        <table class="travelers">
          <thead>
            <tr>
              <th>Role</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            ${buildTravelerRows(leadTraveler, additionalTravelers)}
          </tbody>
        </table>
      </div>
    </div>

    <div class="footer">
      <strong>${escapeHtml(env.appName)}</strong><br />
      Email: ${escapeHtml(env.contactEmail)} · Phone: ${escapeHtml(env.contactPhone)}<br />
      ${escapeHtml(env.websiteUrl)}<br /><br />
      This receipt is your proof of booking. Keep it safe and present it at check-in.
      <p class="no-print" style="margin-top:16px;">
        <button onclick="window.print()" style="background:#2D5A47;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:13px;cursor:pointer;font-weight:600;">
          Print receipt
        </button>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function resolveBookingReceiptData(booking, { token } = {}) {
  if (!booking) return null;

  if (isOnsiteBooking(booking)) {
    return mapBookingToPaymentReceipt(booking);
  }

  const bookingCode = booking.bookingCode || booking.bookingRef;

  if (bookingCode) {
    const verifyResult = await consumerPaymentsServiceApi.verifyPayment(bookingCode);
    if (verifyResult.ok && verifyResult.verified && verifyResult.data?.status === "paid") {
      return mapVerifiedPaymentToReceipt(verifyResult.data);
    }
  }

  if (token && bookingCode) {
    const paymentsResult = await consumerPaymentsServiceApi.listPayments(token, { page: 1, per_page: 50 });
    if (paymentsResult.ok) {
      const paidPayment = paymentsResult.items
        .filter((item) => item.bookingCode === bookingCode && item.status === "paid")
        .sort((a, b) => new Date(b.paidAt || 0) - new Date(a.paidAt || 0))[0];

      if (paidPayment) {
        return mapVerifiedPaymentToReceipt(paidPayment);
      }
    }
  }

  return mapBookingToPaymentReceipt(booking);
}

export async function downloadBookingReceipt(booking, { token } = {}) {
  if (!booking) return false;

  try {
    const receipt = await resolveBookingReceiptData(booking, { token });
    if (!receipt) return false;
    return downloadPaymentReceiptPdf(receipt);
  } catch (error) {
    console.error("Failed to generate booking receipt PDF:", error);
    return false;
  }
}
