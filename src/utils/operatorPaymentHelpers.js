import { formatBookingCurrency } from "./bookingHelpers";
import { parsePaginatedList } from "./adminPaginationHelpers";
import { mapApiPayment } from "./paymentHelpers";
import { mapOperatorBooking } from "./operatorBookingHelpers";
import { resolvePublicMediaUrl } from "./mediaUrl";

export const OPERATOR_PAYMENT_METHOD = {
  online: { label: "Online", className: "bg-brand-primary/10 text-brand-primary ring-brand-primary/20" },
  onsite: { label: "On site", className: "bg-brand-accent/25 text-brand-primary ring-brand-accent/30" },
};

export function getOperatorPaymentMethodConfig(payment) {
  const key = String(payment?.paymentMethod || "").toLowerCase();
  return OPERATOR_PAYMENT_METHOD[key] || {
    label: key || "—",
    className: "bg-brand-muted/10 text-brand-muted ring-brand-border",
  };
}

export function mapOperatorPayment(raw) {
  const payment = mapApiPayment(raw);
  if (!payment) return null;

  const booking = raw.booking ? mapOperatorBooking(raw.booking) : null;
  const resolvedAmount = booking?.subtotal ?? payment.amount;
  const traveler = booking?.leadTraveler || raw.booking?.leadTraveler || {};

  return {
    ...payment,
    paymentMethod: raw.paymentMethod || payment.paymentMethod || "online",
    amount: resolvedAmount,
    amountLabel: formatBookingCurrency(resolvedAmount, payment.currency),
    tourName: booking?.tour?.name || raw.booking?.tour?.name || "Tour booking",
    tourImage: resolvePublicMediaUrl(booking?.tour?.image || raw.booking?.tour?.coverImageUrl || ""),
    travelerName: `${traveler.firstName || ""} ${traveler.lastName || ""}`.trim(),
    booking,
  };
}

export function mapOperatorPaymentList(data) {
  const { items, pagination } = parsePaginatedList(data);
  return {
    items: items.map(mapOperatorPayment).filter(Boolean),
    pagination,
  };
}

function normalizePaymentCurrency(currency) {
  const code = String(currency || "GHS").toUpperCase();
  return code === "USD" ? "USD" : "GHS";
}

export function summarizeOperatorPayments(payments = []) {
  const paidTotals = { GHS: 0, USD: 0 };
  const paidCounts = { GHS: 0, USD: 0 };
  let pendingCount = 0;
  let onsiteCount = 0;

  payments.forEach((payment) => {
    if (payment.status === "paid") {
      const currency = normalizePaymentCurrency(payment.currency);
      paidCounts[currency] += 1;
      paidTotals[currency] += Number(payment.amount) || 0;
    }
    if (payment.status === "pending") pendingCount += 1;
    if (payment.paymentMethod === "onsite") onsiteCount += 1;
  });

  const paidCount = paidCounts.GHS + paidCounts.USD;

  return {
    paidTotals,
    paidCounts,
    paidTotal: paidTotals.GHS + paidTotals.USD,
    paidTotalLabels: {
      GHS: formatBookingCurrency(paidTotals.GHS, "GHS"),
      USD: formatBookingCurrency(paidTotals.USD, "USD"),
    },
    paidTotalLabel: formatBookingCurrency(paidTotals.GHS, "GHS"),
    paidCount,
    pendingCount,
    onsiteCount,
  };
}
