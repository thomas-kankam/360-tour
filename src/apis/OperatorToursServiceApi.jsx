import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { toQueryString } from "../utils/queryString";
import { buildRequestKey, dedupeRequest } from "./dedupService";
import { mapOperatorTour, mapOperatorTourList } from "../utils/operatorTourMapper";

class OperatorToursServiceApi {
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

  async listTours(token, params) {
    const result = await this.request("GET", "/operator/tours", { token, params, dedupe: false });
    if (!result.ok) return { ...result, items: [], pagination: null };

    const { items, pagination } = mapOperatorTourList(result.data);
    return { ...result, items, pagination };
  }

  async getTour(token, slug) {
    const result = await this.request("GET", `/operator/tours/${slug}`, { token });
    if (!result.ok) return { ...result, tour: null };

    return {
      ...result,
      tour: mapOperatorTour(result.data),
    };
  }

  async createTour(token, payload) {
    const result = await this.request("POST", "/operator/tours", { token, body: payload, dedupe: false });
    if (!result.ok) return { ...result, tour: null };

    return {
      ...result,
      tour: mapOperatorTour(result.data),
    };
  }

  async updateTour(token, slug, payload) {
    const result = await this.request("PUT", `/operator/tours/${slug}`, { token, body: payload, dedupe: false });
    if (!result.ok) return { ...result, tour: null };

    return {
      ...result,
      tour: mapOperatorTour(result.data),
    };
  }

  async deleteTour(token, slug) {
    return this.request("DELETE", `/operator/tours/${slug}`, { token, dedupe: false });
  }
}

const operatorToursServiceApi = new OperatorToursServiceApi();
export default operatorToursServiceApi;
