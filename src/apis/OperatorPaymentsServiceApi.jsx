import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { toQueryString } from "../utils/queryString";
import { buildRequestKey, dedupeRequest } from "./dedupService";
import { mapOperatorPayment, mapOperatorPaymentList } from "../utils/operatorPaymentHelpers";

class OperatorPaymentsServiceApi {
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

  async listPayments(token, params) {
    const result = await this.request("GET", "/operator/payments", { token, params, dedupe: false });
    if (!result.ok) return { ...result, items: [], pagination: null };

    const { items, pagination } = mapOperatorPaymentList(result.data);
    return { ...result, items, pagination };
  }

  async getPayment(token, paymentSlug) {
    const result = await this.request("GET", `/operator/payments/${encodeURIComponent(paymentSlug)}`, {
      token,
      dedupe: false,
    });
    if (!result.ok) return { ...result, payment: null };

    return {
      ...result,
      payment: mapOperatorPayment(result.data),
    };
  }

  async recordOnsitePayment(token, { bookingCode, amount }) {
    const result = await this.request("POST", "/operator/payments", {
      token,
      body: {
        bookingCode: String(bookingCode || "").trim(),
        amount: String(amount ?? "").trim(),
      },
      dedupe: false,
    });
    if (!result.ok) return { ...result, payment: null };

    return {
      ...result,
      payment: mapOperatorPayment(result.data),
    };
  }
}

const operatorPaymentsServiceApi = new OperatorPaymentsServiceApi();
export default operatorPaymentsServiceApi;
