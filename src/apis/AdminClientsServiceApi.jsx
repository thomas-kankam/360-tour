import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { toQueryString } from "../utils/queryString";
import { buildRequestKey, dedupeRequest } from "./dedupService";
import { mapAdminClient, mapAdminClientList } from "../utils/adminClientHelpers";

class AdminClientsServiceApi {
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

  async listClients(token, params) {
    const result = await this.request("GET", "/admin/clients", { token, params, dedupe: false });
    if (!result.ok) return { ...result, items: [], pagination: null };

    const { items, pagination } = mapAdminClientList(result.data);
    return { ...result, items, pagination };
  }

  async getClient(token, clientSlug) {
    const result = await this.request("GET", `/admin/clients/${encodeURIComponent(clientSlug)}`, {
      token,
      dedupe: false,
    });
    if (!result.ok) return { ...result, client: null };

    return {
      ...result,
      client: mapAdminClient(result.data),
    };
  }
}

const adminClientsServiceApi = new AdminClientsServiceApi();
export default adminClientsServiceApi;
