import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { toQueryString } from "../utils/queryString";
import { buildRequestKey, dedupeRequest } from "./dedupService";
import { mapOperatorBooking, mapOperatorBookingList } from "../utils/operatorBookingHelpers";

class OperatorBookingsServiceApi {
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
    const result = await this.request("GET", "/operator/bookings", { token, params, dedupe: false });
    if (!result.ok) return { ...result, items: [], pagination: null };

    const { items, pagination } = mapOperatorBookingList(result.data);
    return { ...result, items, pagination };
  }

  async getBooking(token, bookingCode) {
    const result = await this.request("GET", `/operator/bookings/${encodeURIComponent(bookingCode)}`, {
      token,
      dedupe: false,
    });
    if (!result.ok) return { ...result, booking: null };

    return {
      ...result,
      booking: mapOperatorBooking(result.data),
    };
  }
}

const operatorBookingsServiceApi = new OperatorBookingsServiceApi();
export default operatorBookingsServiceApi;
