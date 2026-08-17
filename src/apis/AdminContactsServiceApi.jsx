import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { parsePaginatedList } from "../utils/adminPaginationHelpers";
import { toQueryString } from "../utils/queryString";
import { buildRequestKey, dedupeRequest } from "./dedupService";

class AdminContactsServiceApi {
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

  async listContacts(token, params) {
    const result = await this.request("GET", "/admin/contacts", { token, params, dedupe: false });
    if (!result.ok) return { ...result, items: [], pagination: null };

    const { items, pagination } = parsePaginatedList(result.data);
    return { ...result, items, pagination };
  }

  getContact(token, id) {
    return this.request("GET", `/admin/contacts/${id}`, { token });
  }

  updateContact(token, id, payload) {
    return this.request("PUT", `/admin/contacts/${id}`, { token, body: payload, dedupe: false });
  }

  deleteContact(token, id) {
    return this.request("DELETE", `/admin/contacts/${id}`, { token, dedupe: false });
  }
}

const adminContactsServiceApi = new AdminContactsServiceApi();
export default adminContactsServiceApi;
