const STORAGE_KEY = "360tours_bookings";
const LEGACY_STORAGE_KEY = "afriqwest_bookings";
const BOOKINGS_UPDATED_EVENT = "360tours:bookings-updated";

export function getBookingStatus(booking) {
  if (booking.apiStatus === "confirmed" && booking.paymentStatus === "paid") return "paid";
  if (booking.paymentStatus === "paid" || booking.paymentStatus === "completed") return "paid";
  if (booking.paymentStatus === "pending" && booking.paymentMode === "online") return "reserved";
  if (booking.paymentStatus === "onsite") return "pay_onsite";
  if (booking.paymentMode === "online" && booking.paymentStatus !== "pending") return "paid";
  if (booking.paymentMode === "onsite") return "pay_onsite";
  if (booking.paymentMode === "now") {
    return booking.payType === "full" ? "paid" : "deposit_paid";
  }
  return "reserved";
}

export function getBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBooking(booking) {
  const record = {
    ...booking,
    status: getBookingStatus(booking),
    savedAt: new Date().toISOString(),
  };
  const existing = getBookings();
  const updated = [record, ...existing.filter((b) => b.bookingRef !== record.bookingRef)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(BOOKINGS_UPDATED_EVENT));
  return record;
}

export function getBookingByRef(ref) {
  if (!ref) return null;
  return getBookings().find(
    (booking) =>
      booking.bookingRef === ref ||
      booking.bookingSlug === ref ||
      booking.bookingCode === ref,
  ) || null;
}

export function parseDepartureDate(dateStr) {
  const parsed = Date.parse(dateStr);
  return Number.isNaN(parsed) ? null : new Date(parsed);
}

export function isUpcoming(booking) {
  const dep = parseDepartureDate(booking.selectedDateRaw || booking.selectedDate);
  if (!dep) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dep >= today;
}
