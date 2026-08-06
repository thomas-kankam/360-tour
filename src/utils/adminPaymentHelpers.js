import { formatBookingCurrency } from "./bookingHelpers";
import { parsePaginatedList } from "./adminPaginationHelpers";
import { mapApiPayment } from "./paymentHelpers";
import { mapAdminBooking } from "./adminBookingHelpers";
import {
  getOperatorPaymentMethodConfig,
  summarizeOperatorPayments,
} from "./operatorPaymentHelpers";

export function mapAdminPayment(raw) {
  const payment = mapApiPayment(raw);
  if (!payment) return null;

  const booking = raw.booking ? mapAdminBooking(raw.booking) : null;
  const resolvedAmount = booking?.subtotal ?? payment.amount;
  const traveler = booking?.leadTraveler || raw.booking?.leadTraveler || {};

  return {
    ...payment,
    paymentMethod: raw.paymentMethod || payment.paymentMethod || "online",
    amount: resolvedAmount,
    amountLabel: formatBookingCurrency(resolvedAmount, payment.currency),
    tourName: booking?.tourTitle || booking?.tour?.name || raw.booking?.tour?.name || "Tour booking",
    tourImage: booking?.tourImage || booking?.tour?.image || raw.booking?.tour?.coverImageUrl || "",
    travelerName: booking?.travelerName || `${traveler.firstName || ""} ${traveler.lastName || ""}`.trim(),
    clientName: booking?.clientName || booking?.client?.name || "",
    operatorName: booking?.operatorOrganization || booking?.operatorName || "",
    booking,
  };
}

export function mapAdminPaymentList(data) {
  const { items, pagination } = parsePaginatedList(data);
  return {
    items: items.map(mapAdminPayment).filter(Boolean),
    pagination,
  };
}

export const getAdminPaymentMethodConfig = getOperatorPaymentMethodConfig;
export const summarizeAdminPayments = summarizeOperatorPayments;
