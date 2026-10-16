import { parsePaginatedList } from "./adminPaginationHelpers";
import { formatBookingCurrency } from "./bookingHelpers";
import { mapAdminClient } from "./adminClientHelpers";
import { resolvePublicMediaUrl } from "./mediaUrl";
import {
  formatOperatorBookingDate,
  getOperatorBookingStatusConfig,
  getOperatorPaymentModeConfig,
  getOperatorPaymentStatusConfig,
  mapOperatorBooking,
  normalizePaymentStatusKey,
} from "./operatorBookingHelpers";

export const ADMIN_BOOKING_STATUS_STYLES = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-brand-primary/10 text-brand-primary",
};

function mapAdminAccount(raw) {
  if (!raw) return null;

  const firstName = raw.firstName || raw.first_name || "";
  const lastName = raw.lastName || raw.last_name || "";

  return {
    name: `${firstName} ${lastName}`.trim(),
    email: raw.email || "",
    adminSlug: raw.adminSlug || raw.admin_slug || "",
  };
}

export function getAdminBookedByLabel(booking) {
  const clientName = booking?.client?.name || booking?.clientName || booking?.travelerName || "";
  const adminName = booking?.admin?.name || "";

  if (String(booking?.bookedByType || "").toLowerCase() === "admin") {
    return adminName || "Admin";
  }

  return clientName || "Client";
}

export function mapAdminBooking(raw) {
  const booking = mapOperatorBooking(raw);
  if (!booking) return null;

  const traveler = booking.leadTraveler || {};
  const client = mapAdminClient(raw.client);
  const admin = mapAdminAccount(raw.admin);

  return {
    ...booking,
    client,
    admin,
    bookedByType: raw.bookedByType || booking.bookedByType || "",
    bookedBySlug: raw.bookedBySlug || booking.bookedBySlug || "",
    clientName: client?.name || "",
    travelerName: `${traveler.firstName || ""} ${traveler.lastName || ""}`.trim(),
    tourTitle: booking.tour?.name || raw.tour?.name || "",
    tourImage: resolvePublicMediaUrl(booking.tour?.image || raw.tour?.coverImageUrl || ""),
  };
}

export function mapAdminBookingList(data) {
  const { items, pagination } = parsePaginatedList(data);
  return {
    items: items.map(mapAdminBooking).filter(Boolean),
    pagination,
  };
}

export function getAdminBookingStatusConfig(booking) {
  return getOperatorBookingStatusConfig(booking);
}

export function getAdminPaymentStatusConfig(booking) {
  return getOperatorPaymentStatusConfig(booking);
}

export function getAdminPaymentModeConfig(booking) {
  return getOperatorPaymentModeConfig(booking);
}

export function formatAdminBookingDate(iso) {
  return formatOperatorBookingDate(iso);
}

function normalizeBookingCurrency(currency) {
  const code = String(currency || "GHS").toUpperCase();
  return code === "USD" ? "USD" : "GHS";
}

export function summarizeAdminBookings(bookings = []) {
  let confirmed = 0;
  let pending = 0;
  const revenueTotals = { GHS: 0, USD: 0 };
  const revenueCounts = { GHS: 0, USD: 0 };

  bookings.forEach((booking) => {
    const status = booking.apiStatus || booking.status;
    if (status === "completed" || status === "confirmed") confirmed += 1;
    if (status === "pending") pending += 1;

    if (normalizePaymentStatusKey(booking) === "paid") {
      const currency = normalizeBookingCurrency(booking.currency);
      revenueTotals[currency] += Number(booking.subtotal) || 0;
      revenueCounts[currency] += 1;
    }
  });

  return {
    confirmed,
    pending,
    revenue: revenueTotals.GHS + revenueTotals.USD,
    revenueTotals,
    revenueCounts,
    revenueLabels: {
      GHS: formatBookingCurrency(revenueTotals.GHS, "GHS"),
      USD: formatBookingCurrency(revenueTotals.USD, "USD"),
    },
  };
}
