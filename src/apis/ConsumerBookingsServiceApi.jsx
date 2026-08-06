import axios from "axios";
import env from "../config/env";
import { mapApiBooking, mapApiBookingToListRecord } from "../utils/bookingHelpers";
import { mapPublicTourDetail } from "../utils/publicListingsHelpers";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { parsePaginatedList } from "../utils/adminPaginationHelpers";

class ConsumerBookingsServiceApi {
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

  async createBooking(token, payload) {
    const url = `${this.baseUrl}/client/bookings`;

    try {
      const response = await axios.post(url, payload, { headers: this.getHeaders(token) });
      const result = parseApiEnvelope(response);
      if (!result.ok) return { ...result, booking: null, paymentUrl: null };

      const booking = mapApiBooking(result.data);

      return {
        ...result,
        booking,
        paymentUrl: booking?.paymentUrl ?? result.data?.paymentUrl ?? result.data?.checkoutUrl ?? null,
      };
    } catch (error) {
      return { ...parseApiError(error), booking: null, paymentUrl: null };
    }
  }

  async listBookings(token, { page = 1, per_page = 15 } = {}) {
    const url = `${this.baseUrl}/client/bookings`;

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
        items: items.map(mapApiBookingToListRecord).filter(Boolean),
        pagination,
      };
    } catch (error) {
      return { ...parseApiError(error), items: [], pagination: null };
    }
  }

  async getBooking(token, bookingCode) {
    const url = `${this.baseUrl}/client/bookings/${encodeURIComponent(bookingCode)}`;

    try {
      const response = await axios.get(url, { headers: this.getHeaders(token) });
      const result = parseApiEnvelope(response);
      if (!result.ok) return { ...result, booking: null, paymentUrl: null };

      const apiBooking = mapApiBooking(result.data);
      const tourDetail = apiBooking?.tour ? mapPublicTourDetail(apiBooking.tour) : null;
      const booking = mapApiBookingToListRecord(result.data);

      return {
        ...result,
        booking,
        apiBooking,
        tourDetail,
        paymentUrl: booking?.paymentUrl ?? result.data?.paymentUrl ?? null,
      };
    } catch (error) {
      return { ...parseApiError(error), booking: null, paymentUrl: null };
    }
  }

  async updateBooking(token, bookingCode, payload) {
    const url = `${this.baseUrl}/client/bookings/${encodeURIComponent(bookingCode)}`;

    try {
      const response = await axios.put(url, payload, { headers: this.getHeaders(token) });
      const result = parseApiEnvelope(response);
      if (!result.ok) return { ...result, booking: null, paymentUrl: null };

      const booking = mapApiBookingToListRecord(result.data);

      return {
        ...result,
        booking,
        paymentUrl: booking?.paymentUrl ?? result.data?.paymentUrl ?? result.data?.checkoutUrl ?? null,
      };
    } catch (error) {
      return { ...parseApiError(error), booking: null, paymentUrl: null };
    }
  }
}

const consumerBookingsServiceApi = new ConsumerBookingsServiceApi();
export default consumerBookingsServiceApi;
