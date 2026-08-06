import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { toQueryString } from "../utils/queryString";
import { buildRequestKey, dedupeRequest } from "./dedupService";
import { mapAdminOperatorList } from "../utils/adminOperatorHelpers";
import { mapAdminOperator } from "../utils/adminListingHelpers";

class AdminOperatorsServiceApi {
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

  async listOperators(token, params) {
    const result = await this.request("GET", "/admin/operators", { token, params, dedupe: false });
    if (!result.ok) return { ...result, items: [], pagination: null };

    const { items, pagination } = mapAdminOperatorList(result.data);
    return { ...result, items, pagination };
  }

  async getOperator(token, operatorSlug) {
    const result = await this.request("GET", `/admin/operators/${encodeURIComponent(operatorSlug)}`, {
      token,
      dedupe: false,
    });
    if (!result.ok) return { ...result, operator: null };

    return {
      ...result,
      operator: mapAdminOperator(result.data),
    };
  }
}

const adminOperatorsServiceApi = new AdminOperatorsServiceApi();
export default adminOperatorsServiceApi;
