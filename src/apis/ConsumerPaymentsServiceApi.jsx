import axios from "axios";
import env from "../config/env";
import consumerBookingsServiceApi from "./ConsumerBookingsServiceApi";
import { buildRetryPaymentPayload, mapApiBooking } from "../utils/bookingHelpers";
import { mapApiPaymentToListRecord, getLatestPendingPayment, extractPaymentRedirectUrl } from "../utils/paymentHelpers";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { parsePaginatedList } from "../utils/adminPaginationHelpers";

class ConsumerPaymentsServiceApi {
  constructor() {
    this.baseUrl = env.apiUrl;
  }

  getHeaders(token) {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async listPayments(token, { page = 1, per_page = 15 } = {}) {
    const url = `${this.baseUrl}/client/payments`;

    try {
      const response = await axios.get(url, {
        headers: this.getHeaders(token),
        params: { page, per_page },
      });
      const result = parseApiEnvelope(response);
      if (!result.ok) return { ...result, items: [], pagination: null };

      const { items, pagination } = parsePaginatedList(result.data);

      return {
        ...result,
        items: items.map(mapApiPaymentToListRecord).filter(Boolean),
        pagination,
      };
    } catch (error) {
      return { ...parseApiError(error), items: [], pagination: null };
    }
  }

  async getPayment(token, paymentSlug) {
    const url = `${this.baseUrl}/client/payments/${encodeURIComponent(paymentSlug)}`;

    try {
      const response = await axios.get(url, { headers: this.getHeaders(token) });
      const result = parseApiEnvelope(response);
      if (!result.ok) return { ...result, payment: null };

      const payment = mapApiPaymentToListRecord(result.data);

      return {
        ...result,
        payment,
      };
    } catch (error) {
      return { ...parseApiError(error), payment: null };
    }
  }

  async retryPayment(token, paymentSlug, booking = null) {
    const url = `${this.baseUrl}/client/payments/${encodeURIComponent(paymentSlug)}/retry`;
    const payload = buildRetryPaymentPayload(booking);

    if (!payload) {
      return {
        ok: false,
        reason: "Booking details required to retry payment.",
        message: "Booking details required to retry payment.",
        payment: null,
        paymentUrl: null,
      };
    }

    try {
      const response = await axios.post(url, payload, { headers: this.getHeaders(token) });
      const result = parseApiEnvelope(response);
      if (!result.ok) return { ...result, payment: null, paymentUrl: null };

      const payment = mapApiPaymentToListRecord(result.data);

      return {
        ...result,
        payment,
        paymentUrl: extractPaymentRedirectUrl({ payment, paymentUrl: result.data?.paymentUrl }),
      };
    } catch (error) {
      return { ...parseApiError(error), payment: null, paymentUrl: null };
    }
  }

  async verifyPayment(reference) {
    const url = `${this.baseUrl}/payment/verify`;

    try {
      const response = await axios.get(url, {
        params: { ref: reference },
        headers: { Accept: "application/json" },
      });
      const result = parseApiEnvelope(response);
      if (!result.ok) return { ...result, payment: null, verified: false };

      const payment = mapApiPaymentToListRecord(result.data);
      const verified = payment?.status === "paid";

      return {
        ...result,
        verified,
        payment,
      };
    } catch (error) {
      return { ...parseApiError(error), payment: null, verified: false };
    }
  }

  async retryPaymentForBooking(token, bookingCode, { booking: bookingData, paymentSlug } = {}) {
    let booking = bookingData || null;
    let slug = paymentSlug || null;

    if (!booking && bookingCode) {
      const bookingResult = await consumerBookingsServiceApi.getBooking(token, bookingCode);
      if (!bookingResult.ok) {
        return { ...bookingResult, payment: null, paymentUrl: null };
      }
      booking = bookingResult.apiBooking || bookingResult.booking;
    }

    if (!slug && bookingCode) {
      const listResult = await this.listPayments(token, { page: 1, per_page: 50 });
      if (!listResult.ok) {
        return { ...listResult, payment: null, paymentUrl: null };
      }

      slug = getLatestPendingPayment(listResult.items, bookingCode)?.paymentSlug || null;
    }

    if (!booking && slug) {
      const paymentResult = await this.getPayment(token, slug);
      if (!paymentResult.ok) {
        return { ...paymentResult, payment: null, paymentUrl: null };
      }

      booking = mapApiBooking(paymentResult.data?.booking) || paymentResult.payment?.booking || null;
    }

    if (!slug) {
      return {
        ok: false,
        reason: "No pending payment found for this booking.",
        message: "No pending payment found for this booking.",
        payment: null,
        paymentUrl: null,
      };
    }

    return this.retryPayment(token, slug, booking);
  }
}

const consumerPaymentsServiceApi = new ConsumerPaymentsServiceApi();
export default consumerPaymentsServiceApi;
