import { formatBookingCurrency, resolveBookingAmount, mapApiBookingToListRecord } from "./bookingHelpers";
import { resolvePublicMediaUrl } from "./mediaUrl";

export function mapApiPayment(data) {
  if (!data) return null;

  return {
    paymentSlug: data.paymentSlug,
    bookingCode: data.bookingCode || null,
    reference: data.reference || "",
    amount: Number(data.amount) || 0,
    currency: data.currency || "GHS",
    paymentMethod: data.paymentMethod || data.booking?.paymentMode || "online",
    status: data.status || "",
    paymentUrl: data.paymentUrl || null,
    paidAt: data.paidAt || null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    booking: data.booking || null,
  };
}

export function mapApiPaymentToListRecord(raw) {
  const payment = mapApiPayment(raw);
  if (!payment) return null;

  const booking = payment.booking ? mapApiBookingToListRecord(payment.booking) : null;
  const computedAmount = payment.booking ? resolveBookingAmount(payment.booking) : 0;
  const resolvedAmount = computedAmount > 0 ? computedAmount : (booking?.subtotal ?? payment.amount);

  return {
    ...payment,
    amount: resolvedAmount,
    amountLabel: formatBookingCurrency(resolvedAmount, payment.currency),
    tourName: booking?.tour?.name || payment.booking?.tour?.name || "Tour booking",
    tourImage: resolvePublicMediaUrl(booking?.tour?.image || payment.booking?.tour?.coverImageUrl || ""),
    booking,
  };
}

export function extractPaymentRedirectUrl(result) {
  if (!result) return null;

  return (
    result.paymentUrl
    || result.booking?.paymentUrl
    || result.data?.paymentUrl
    || result.data?.checkoutUrl
    || result.payment?.paymentUrl
    || null
  );
}

/**
 * Redirect the browser to Paystack, Stripe, or any backend-provided checkout URL.
 */
export function redirectToPaymentCheckout(result, { onMissing } = {}) {
  const paymentUrl = extractPaymentRedirectUrl(result);

  if (paymentUrl) {
    window.location.assign(paymentUrl);
    return true;
  }

  onMissing?.(result);
  return false;
}

export function getLatestPendingPayment(items, bookingCode) {
  if (!bookingCode || !Array.isArray(items)) return null;

  return (
    items
      .filter((item) => item.bookingCode === bookingCode && item.status === "pending")
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0] || null
  );
}

export const PAYMENT_STATUS_CONFIG = {
  paid: { label: "Paid", className: "bg-brand-green/10 text-brand-green ring-brand-green/20" },
  pending: { label: "Pending", className: "bg-brand-orange/10 text-brand-orange ring-brand-orange/20" },
  failed: { label: "Failed", className: "bg-red-50 text-red-600 ring-red-200" },
};

export function formatPaymentDate(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatPaymentReferenceDisplay(
  reference,
  { maxLength = 14, head = 8, tail = 4 } = {},
) {
  const value = String(reference || "").trim();
  if (!value) return "—";
  if (value.length <= maxLength) return value;

  const safeHead = Math.min(head, Math.max(1, value.length - tail - 1));
  const safeTail = Math.min(tail, Math.max(1, value.length - safeHead - 1));
  if (safeHead + safeTail >= value.length) return value;

  return `${value.slice(0, safeHead)}…${value.slice(-safeTail)}`;
}
