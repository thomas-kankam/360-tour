import { mapApiBookingToListRecord, formatBookingCurrency } from "./bookingHelpers";
import { parsePaginatedList } from "./adminPaginationHelpers";

export const OPERATOR_BOOKING_STATUS = {
  confirmed: { label: "Confirmed", className: "bg-brand-green/10 text-brand-green ring-brand-green/20" },
  pending: { label: "Pending", className: "bg-brand-accent/20 text-brand-primary ring-brand-accent/30" },
  cancelled: { label: "Cancelled", className: "bg-red-50 text-red-600 ring-red-200" },
};

export const OPERATOR_PAYMENT_STATUS = {
  paid: { label: "Paid", className: "bg-brand-green/10 text-brand-green ring-brand-green/20" },
  pending: { label: "Pending", className: "bg-brand-accent/20 text-brand-primary ring-brand-accent/30" },
  failed: { label: "Failed", className: "bg-red-50 text-red-600 ring-red-200" },
};

export function normalizePaymentStatusKey(booking) {
  const raw = String(booking?.apiPaymentStatus || booking?.paymentStatus || "").toLowerCase();

  if (raw === "paid" || raw === "completed") return "paid";
  if (raw === "failed") return "failed";

  // API may return "onsite" as paymentStatus — that is payment mode, not status
  return "pending";
}

export function getOperatorPaymentStatusConfig(booking) {
  return OPERATOR_PAYMENT_STATUS[normalizePaymentStatusKey(booking)];
}

export const OPERATOR_PAYMENT_MODE = {
  online: { label: "Online", className: "bg-brand-green/10 text-brand-green ring-brand-green/20" },
  onsite: { label: "On site", className: "bg-brand-accent/25 text-brand-primary ring-brand-accent/30" },
};

const GROUP_TYPE_LABELS = {
  university: "University / school",
  corporate: "Corporate",
  family: "Family",
  friends: "Friends",
  church: "Church / faith group",
  other: "Other",
};

export function normalizeBookingCodeInput(value) {
  return String(value || "").trim().toUpperCase();
}

export function mapOperatorBooking(raw) {
  const record = mapApiBookingToListRecord(raw);
  if (!record) return null;

  return {
    ...record,
    apiStatus: raw.status || record.apiStatus,
    apiPaymentStatus: raw.paymentStatus || record.paymentStatus,
    amountLabel: formatBookingCurrency(record.subtotal, record.currency),
    groupTypeLabel: GROUP_TYPE_LABELS[raw.groupDetails?.groupType] || raw.groupDetails?.groupType || "",
    updatedAt: raw.updatedAt,
  };
}

export function mapOperatorBookingList(data) {
  const { items, pagination } = parsePaginatedList(data);
  return {
    items: items.map(mapOperatorBooking).filter(Boolean),
    pagination,
  };
}

export function getOperatorBookingStatusConfig(booking) {
  const key = booking?.apiStatus || booking?.status;
  return OPERATOR_BOOKING_STATUS[key] || OPERATOR_BOOKING_STATUS.pending;
}

export function getOperatorPaymentModeConfig(booking) {
  const key = booking?.paymentMode;
  return OPERATOR_PAYMENT_MODE[key] || {
    label: key || "—",
    className: "bg-brand-muted/10 text-brand-muted ring-brand-border",
  };
}

export function canRecordOnsitePayment(booking) {
  if (!booking) return false;
  if (booking.paymentMode !== "onsite") return false;
  return normalizePaymentStatusKey(booking) === "pending";
}

export function formatOperatorBookingDate(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
