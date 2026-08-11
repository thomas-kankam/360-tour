import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { buildRequestKey, dedupeRequest } from "./dedupService";
import {
  DEFAULT_COMPANY_SETTINGS,
  loadCompanySettings,
  saveCompanySettings,
} from "../utils/adminCompanySettings";
import { mapApiCompanySettings, mapCompanySettingsForApi } from "../utils/invoiceHelpers";

class AdminCompanySettingsApi {
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

  async request(method, path, { token, body, dedupe = true } = {}) {
    const url = `${this.baseUrl}${path}`;
    const key = buildRequestKey({ method, url, body });

    const exec = async () => {
      try {
        const response = await axios({ method, url, data: body, headers: this.getHeaders(token) });
        return parseApiEnvelope(response);
      } catch (error) {
        return { ...parseApiError(error), httpStatus: error?.response?.status ?? null };
      }
    };

    return dedupe ? dedupeRequest(key, exec) : exec();
  }

  async getSettings(token) {
    const local = loadCompanySettings();
    const result = await this.request("GET", "/admin/company-settings", { token, dedupe: false });

    if (!result.ok) {
      return { ok: true, settings: local, source: "local" };
    }

    const mapped = mapApiCompanySettings(result.data?.settings ?? result.data);
    const merged = { ...DEFAULT_COMPANY_SETTINGS, ...local, ...mapped };
    saveCompanySettings(merged);
    return { ok: true, settings: merged, source: "api" };
  }

  async saveSettings(token, settings) {
    saveCompanySettings(settings);

    const result = await this.request("POST", "/admin/company-settings", {
      token,
      body: { settings: mapCompanySettingsForApi(settings) },
      dedupe: false,
    });

    if (!result.ok) {
      const unavailable = [404, 405, 501, 503].includes(result.httpStatus);
      return {
        ok: true,
        settings,
        source: unavailable ? "local" : "local",
        reason: unavailable ? "Saved locally. Company settings API is not available yet." : result.reason || result.message,
      };
    }

    const mapped = mapApiCompanySettings(result.data?.settings ?? result.data) || settings;
    const merged = { ...settings, ...mapped };
    saveCompanySettings(merged);
    return { ok: true, settings: merged, source: "api" };
  }
}

const adminCompanySettingsApi = new AdminCompanySettingsApi();
export default adminCompanySettingsApi;
