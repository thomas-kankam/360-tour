import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import {
  ABOUT_CMS_DEFAULTS,
  loadAboutCms,
  mapAboutCmsForApi,
  mapApiAboutCmsContent,
  mapApiAboutCmsMeta,
  saveAboutCms,
} from "../utils/aboutCmsStorage";

class AdminAboutCmsServiceApi {
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

  async getCms(token) {
    try {
      const response = await axios.get(`${this.baseUrl}/admin/about-cms`, {
        headers: this.getHeaders(token),
      });
      const result = parseApiEnvelope(response);
      if (!result.ok) {
        const local = loadAboutCms();
        return { ...result, content: local, draft: local, published: null, meta: {} };
      }

      const draft = mapApiAboutCmsContent({ content: result.data?.draft }) || ABOUT_CMS_DEFAULTS;
      const published = mapApiAboutCmsContent({ content: result.data?.published });
      saveAboutCms(draft);
      return {
        ...result,
        content: draft,
        draft,
        published,
        meta: mapApiAboutCmsMeta(result.data),
      };
    } catch (error) {
      const local = loadAboutCms();
      return { ...parseApiError(error), content: local, draft: local, published: null, meta: {} };
    }
  }

  async saveDraft(token, content) {
    saveAboutCms(content);
    try {
      const response = await axios.put(`${this.baseUrl}/admin/about-cms`, mapAboutCmsForApi(content), {
        headers: this.getHeaders(token),
      });
      const result = parseApiEnvelope(response);
      if (!result.ok) return { ...result, content };
      const saved = mapApiAboutCmsContent({ content: result.data?.draft }) || content;
      saveAboutCms(saved);
      return { ...result, content: saved, meta: mapApiAboutCmsMeta(result.data) };
    } catch (error) {
      return { ...parseApiError(error), content };
    }
  }

  async publish(token, content) {
    saveAboutCms(content);
    try {
      const response = await axios.post(
        `${this.baseUrl}/admin/about-cms/publish`,
        mapAboutCmsForApi(content),
        { headers: this.getHeaders(token) },
      );
      const result = parseApiEnvelope(response);
      if (!result.ok) return { ...result, content };
      const published =
        mapApiAboutCmsContent({ content: result.data?.published }) || content;
      saveAboutCms(published);
      return { ...result, content: published, meta: mapApiAboutCmsMeta(result.data) };
    } catch (error) {
      return { ...parseApiError(error), content };
    }
  }

  async resetDraft(token) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/admin/about-cms/reset`,
        {},
        { headers: this.getHeaders(token) },
      );
      const result = parseApiEnvelope(response);
      const content =
        mapApiAboutCmsContent({ content: result.data?.draft }) || ABOUT_CMS_DEFAULTS;
      saveAboutCms(content);
      return { ...result, content, meta: mapApiAboutCmsMeta(result.data) };
    } catch (error) {
      saveAboutCms(ABOUT_CMS_DEFAULTS);
      return { ...parseApiError(error), content: ABOUT_CMS_DEFAULTS };
    }
  }
}

const adminAboutCmsServiceApi = new AdminAboutCmsServiceApi();
export default adminAboutCmsServiceApi;
