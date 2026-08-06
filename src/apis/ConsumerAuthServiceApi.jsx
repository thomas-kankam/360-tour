import axios from "axios";
import env from "../config/env";
import { mapClientUser } from "../utils/clientUserMapper";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { buildRequestKey, dedupeRequest } from "./dedupService";

class ConsumerAuthServiceApi {
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

  async loginConsumer(payload) {
    const result = await this.post("/client/login", payload);
    if (!result.ok) return { ...result, user: null };

    return {
      ...result,
      user: mapClientUser(result.data),
    };
  }

  async registerConsumer(payload) {
    const result = await this.post("/client/register", payload);
    if (!result.ok) return { ...result, user: null };

    return {
      ...result,
      user: mapClientUser(result.data),
    };
  }

  async verifyOtp(payload) {
    const result = await this.post("/client/verify-otp", payload, { dedupe: false });
    if (!result.ok) return { ...result, user: null, token: null };

    const token = result.data?.token ?? null;
    const user = mapClientUser(result.data);

    return {
      ...result,
      token,
      user,
    };
  }

  async resendOtp(payload) {
    const result = await this.post("/client/resend-otp", payload);
    if (!result.ok) return { ...result, user: null };

    return {
      ...result,
      user: mapClientUser(result.data),
    };
  }

  async updateProfile(token, payload) {
    const result = await this.post("/client/update-profile", payload, { token, dedupe: false });
    if (!result.ok) return { ...result, user: null };

    return {
      ...result,
      user: mapClientUser(result.data),
    };
  }
}

const consumerAuthServiceApi = new ConsumerAuthServiceApi();
export default consumerAuthServiceApi;
