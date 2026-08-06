import axios from "axios";
import env from "../config/env";
import { mapAdminUser } from "../utils/adminUserMapper";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { buildRequestKey, dedupeRequest } from "./dedupService";

class AdminAuthServiceApi {
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

  async post(path, payload, { token, dedupe = true } = {}) {
    const url = `${this.baseUrl}${path}`;
    const key = buildRequestKey({ method: "POST", url, body: payload });

    const exec = async () => {
      try {
        const response = await axios.post(url, payload, { headers: this.getHeaders(token) });
        return parseApiEnvelope(response);
      } catch (error) {
        return parseApiError(error);
      }
    };

    return dedupe ? dedupeRequest(key, exec) : exec();
  }

  async loginAdmin(payload) {
    const result = await this.post("/admin/login", payload);
    if (!result.ok) return { ...result, user: null };

    return {
      ...result,
      user: mapAdminUser(result.data),
    };
  }

  async verifyOtp(payload) {
    const result = await this.post("/admin/verify-otp", payload, { dedupe: false });
    if (!result.ok) return { ...result, user: null, token: null };

    return {
      ...result,
      token: result.data?.token ?? null,
      user: mapAdminUser(result.data),
    };
  }

  async resendOtp(payload) {
    // payload: { emailOrPhone, type: "login" }
    const result = await this.post("/admin/resend-otp", payload);
    if (!result.ok) return { ...result, user: null };

    return {
      ...result,
      user: mapAdminUser(result.data),
    };
  }

  async updateProfile(token, payload) {
    const result = await this.post("/admin/update-profile", payload, { token, dedupe: false });
    if (!result.ok) return { ...result, user: null };

    return {
      ...result,
      user: mapAdminUser(result.data),
    };
  }

  async logout(token) {
    return this.post("/admin/logout", {}, { token, dedupe: false });
  }
}

const adminAuthServiceApi = new AdminAuthServiceApi();
export default adminAuthServiceApi;
