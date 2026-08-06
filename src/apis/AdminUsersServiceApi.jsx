import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { toQueryString } from "../utils/queryString";
import { buildRequestKey, dedupeRequest } from "./dedupService";

class AdminUsersServiceApi {
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

  listAdmins(token, params) {
    return this.request("GET", "/admin/admins", { token, params, dedupe: false });
  }

  getAdmin(token, id) {
    return this.request("GET", `/admin/admins/${id}`, { token });
  }

  createAdmin(token, payload) {
    return this.request("POST", "/admin/admins", { token, body: payload, dedupe: false });
  }

  updateAdmin(token, id, payload) {
    return this.request("PUT", `/admin/admins/${id}`, { token, body: payload, dedupe: false });
  }

  deleteAdmin(token, id) {
    return this.request("DELETE", `/admin/admins/${id}`, { token, dedupe: false });
  }
}

const adminUsersServiceApi = new AdminUsersServiceApi();
export default adminUsersServiceApi;
