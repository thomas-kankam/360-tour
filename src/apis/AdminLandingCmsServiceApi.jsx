import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import {
  mapApiLandingCmsContent,
  mapApiLandingCmsMeta,
  mapLandingCmsForApi,
} from "../utils/landingCmsHelpers";
import { buildRequestKey, dedupeRequest } from "./dedupService";
import { LANDING_CMS_DEFAULTS, loadLandingCms, saveLandingCms } from "../utils/landingCmsStorage";

function isEndpointUnavailable(errorOrResult, httpStatus) {
  const status = httpStatus ?? errorOrResult?.response?.status;
  return status === 404 || status === 405 || status === 501 || status === 503;
}

class AdminLandingCmsServiceApi {
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

  async getCms(token) {
    const local = loadLandingCms();
    const result = await this.request("GET", "/admin/landing-cms", { token, dedupe: false });

    if (!result.ok) {
      if (isEndpointUnavailable(result, result.httpStatus)) {
        return { ok: true, content: local, meta: null, source: "local" };
      }
      return { ok: false, content: local, meta: null, source: "local", reason: result.reason || result.message };
    }

    const draft = mapApiLandingCmsContent({ content: result.data?.draft });
    const published = mapApiLandingCmsContent({ content: result.data?.published });
    const content = draft || published || local;

    saveLandingCms(content);

    return {
      ok: true,
      content,
      draft,
      published,
      meta: mapApiLandingCmsMeta(result.data),
      source: "api",
    };
  }

  async saveDraft(token, content) {
    saveLandingCms(content);

    const result = await this.request("PUT", "/admin/landing-cms", {
      token,
      body: mapLandingCmsForApi(content),
      dedupe: false,
    });

    if (!result.ok) {
      if (isEndpointUnavailable(result, result.httpStatus)) {
        return {
          ok: true,
          content,
          meta: null,
          source: "local",
          reason: "Saved locally. Landing CMS API is not available yet.",
        };
      }
      return { ok: false, content, meta: null, source: "local", reason: result.reason || result.message };
    }

    const saved = mapApiLandingCmsContent(result.data?.draft ? { content: result.data.draft } : result.data) || content;
    saveLandingCms(saved);

    return {
      ok: true,
      content: saved,
      meta: mapApiLandingCmsMeta(result.data),
      source: "api",
    };
  }

  async publish(token, content) {
    saveLandingCms(content);

    const result = await this.request("POST", "/admin/landing-cms/publish", {
      token,
      body: mapLandingCmsForApi(content),
      dedupe: false,
    });

    if (!result.ok) {
      if (isEndpointUnavailable(result, result.httpStatus)) {
        return {
          ok: true,
          content,
          meta: null,
          source: "local",
          reason: "Saved locally. Publish API is not available yet.",
        };
      }

      const draftResult = await this.saveDraft(token, content);
      if (draftResult.ok) {
        return {
          ok: false,
          content,
          meta: draftResult.meta,
          source: draftResult.source,
          reason: result.reason || result.message || "Draft saved, but publish failed.",
        };
      }

      return { ok: false, content, meta: null, source: "local", reason: result.reason || result.message };
    }

    const published =
      mapApiLandingCmsContent(result.data?.published ? { content: result.data.published } : result.data) || content;
    saveLandingCms(published);

    return {
      ok: true,
      content: published,
      meta: mapApiLandingCmsMeta(result.data),
      source: "api",
    };
  }

  async resetDraft(token) {
    const defaults = structuredClone(LANDING_CMS_DEFAULTS);
    saveLandingCms(defaults);

    const result = await this.request("POST", "/admin/landing-cms/reset", { token, dedupe: false });

    if (!result.ok) {
      if (isEndpointUnavailable(result, result.httpStatus)) {
        return { ok: true, content: defaults, meta: null, source: "local" };
      }
      return { ok: false, content: defaults, meta: null, source: "local", reason: result.reason || result.message };
    }

    const content = mapApiLandingCmsContent(result.data?.draft ? { content: result.data.draft } : result.data) || defaults;
    saveLandingCms(content);

    return {
      ok: true,
      content,
      meta: mapApiLandingCmsMeta(result.data),
      source: "api",
    };
  }
}

const adminLandingCmsServiceApi = new AdminLandingCmsServiceApi();
export default adminLandingCmsServiceApi;
