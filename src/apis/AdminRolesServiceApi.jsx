import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { toQueryString } from "../utils/queryString";
import { buildRequestKey, dedupeRequest } from "./dedupService";

class AdminRolesServiceApi {
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

  listPermissions(token, params) {
    return this.request("GET", "/admin/permissions", { token, params, dedupe: false });
  }

  getPermission(token, id) {
    return this.request("GET", `/admin/permissions/${id}`, { token });
  }

  createPermission(token, payload) {
    return this.request("POST", "/admin/permissions", { token, body: payload, dedupe: false });
  }

  updatePermission(token, id, payload) {
    return this.request("PUT", `/admin/permissions/${id}`, { token, body: payload, dedupe: false });
  }

  deletePermission(token, id) {
    return this.request("DELETE", `/admin/permissions/${id}`, { token, dedupe: false });
  }

  listRoles(token, params) {
    return this.request("GET", "/admin/roles", { token, params, dedupe: false });
  }

  getRole(token, id) {
    return this.request("GET", `/admin/roles/${id}`, { token });
  }

  createRole(token, payload) {
    return this.request("POST", "/admin/roles", { token, body: payload, dedupe: false });
  }

  updateRole(token, id, payload) {
    return this.request("PUT", `/admin/roles/${id}`, { token, body: payload, dedupe: false });
  }

  deleteRole(token, id) {
    return this.request("DELETE", `/admin/roles/${id}`, { token, dedupe: false });
  }
}

const adminRolesServiceApi = new AdminRolesServiceApi();
export default adminRolesServiceApi;
