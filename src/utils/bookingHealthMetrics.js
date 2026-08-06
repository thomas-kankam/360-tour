export function categorizeBookingForHealth(status) {
  const normalized = status ?? "pending";

  if (["confirmed", "completed", "paid"].includes(normalized)) {
    return "confirmed";
  }

  if (normalized === "cancelled") {
    return "cancelled";
  }

  if (
    ["pending", "payment-processing", "reserved", "deposit_paid", "pay_onsite"].includes(normalized)
  ) {
    return "pending";
  }

  return "pending";
}

export function countBookingsByHealthCategory(bookings) {
  return bookings.reduce(
    (acc, booking) => {
      const category = categorizeBookingForHealth(booking.status);
      acc[category] += 1;
      return acc;
    },
    { confirmed: 0, pending: 0, cancelled: 0 }
  );
}
