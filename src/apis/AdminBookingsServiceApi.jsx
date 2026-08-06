import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { toQueryString } from "../utils/queryString";
import { buildRequestKey, dedupeRequest } from "./dedupService";
import { mapAdminBooking, mapAdminBookingList } from "../utils/adminBookingHelpers";

class AdminBookingsServiceApi {
  constructor() {
    this.baseUrl = env.apiUrl;
  }

  getHeaders(token) {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async request(method, path, { token, body, params, dedupe = true } = {}) {
    const url = `${this.baseUrl}${path}${toQueryString(params)}`;
    const key = buildRequestKey({ method, url, body });

    const exec = async () => {
      try {
        const response = await axios({
          method,
          url,
          data: body,
          headers: this.getHeaders(token),
        });
        return parseApiEnvelope(response);
      } catch (error) {
        return parseApiError(error);
      }
    };

    return dedupe ? dedupeRequest(key, exec) : exec();
  }

  async listBookings(token, params) {
    const result = await this.request("GET", "/admin/bookings", { token, params });
    if (!result.ok) return { ...result, items: [], pagination: null };

    const { items, pagination } = mapAdminBookingList(result.data);
    return { ...result, items, pagination };
  }

  async getBooking(token, bookingCode) {
    const result = await this.request("GET", `/admin/bookings/${encodeURIComponent(bookingCode)}`, {
      token,
    });
    if (!result.ok) return { ...result, booking: null };

    return {
      ...result,
      booking: mapAdminBooking(result.data),
    };
  }
}

const adminBookingsServiceApi = new AdminBookingsServiceApi();
export default adminBookingsServiceApi;
