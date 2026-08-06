import axios from "axios";
import env from "../config/env";
import { mapOperatorUser } from "../utils/operatorUserMapper";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { buildRequestKey, dedupeRequest } from "./dedupService";

class OperatorAuthServiceApi {
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

  async registerOperator(payload) {
    const result = await this.post("/operator/register", payload, { dedupe: false });
    if (!result.ok) return { ...result, user: null };

    return {
      ...result,
      user: mapOperatorUser(result.data),
    };
  }

  async loginOperator(payload) {
    const result = await this.post("/operator/login", payload, { dedupe: false });
    if (!result.ok) return { ...result, user: null };

    return {
      ...result,
      user: mapOperatorUser(result.data),
    };
  }

  async verifyOtp(payload) {
    const result = await this.post("/operator/verify-otp", payload, { dedupe: false });
    if (!result.ok) return { ...result, user: null, token: null };

    const token = result.data?.token ?? null;
    const user = mapOperatorUser(result.data);

    return {
      ...result,
      token,
      user,
    };
  }

  async resendOtp(payload) {
    const result = await this.post("/operator/resend-otp", payload, { dedupe: false });
    if (!result.ok) return { ...result, user: null };

    return {
      ...result,
      user: mapOperatorUser(result.data),
    };
  }

  async updateProfile(token, payload) {
    const result = await this.post("/operator/update-profile", payload, { token, dedupe: false });
    if (!result.ok) return { ...result, user: null };

    return {
      ...result,
      user: mapOperatorUser(result.data),
    };
  }

  async logout(token) {
    return this.post("/operator/logout", {}, { token, dedupe: false });
  }
}

const operatorAuthServiceApi = new OperatorAuthServiceApi();
export default operatorAuthServiceApi;
