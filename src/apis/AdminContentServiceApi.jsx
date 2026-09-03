import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { mapExperience, mapStory } from "./PublicContentServiceApi";

class AdminContentServiceApi {
  constructor() {
    this.baseUrl = env.apiUrl;
  }

  headers(token) {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async request(method, path, { token, body } = {}) {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${path}`,
        data: body,
        headers: this.headers(token),
      });
      return parseApiEnvelope(response);
    } catch (error) {
      return parseApiError(error);
    }
  }

  // —— Stories ——
  async listStories(token, params = {}) {
    const query = new URLSearchParams(params).toString();
    const result = await this.request("GET", `/admin/stories${query ? `?${query}` : ""}`, { token });
    return { ...result, items: (result.data?.items || []).map(mapStory) };
  }

  async getStory(token, id) {
    const result = await this.request("GET", `/admin/stories/${id}`, { token });
    return { ...result, story: result.data?.story ? mapStory(result.data.story) : null };
  }

  async saveStory(token, payload, id = null) {
    const result = await this.request(id ? "PUT" : "POST", id ? `/admin/stories/${id}` : "/admin/stories", {
      token,
      body: payload,
    });
    return { ...result, story: result.data?.story ? mapStory(result.data.story) : null };
  }

  async deleteStory(token, id) {
    return this.request("DELETE", `/admin/stories/${id}`, { token });
  }

  async publishStory(token, id) {
    const result = await this.request("POST", `/admin/stories/${id}/publish`, { token });
    return { ...result, story: result.data?.story ? mapStory(result.data.story) : null };
  }

  async unpublishStory(token, id) {
    const result = await this.request("POST", `/admin/stories/${id}/unpublish`, { token });
    return { ...result, story: result.data?.story ? mapStory(result.data.story) : null };
  }

  // —— Experiences ——
  async listExperiences(token, params = {}) {
    const query = new URLSearchParams(params).toString();
    const result = await this.request("GET", `/admin/experiences${query ? `?${query}` : ""}`, { token });
    return { ...result, items: (result.data?.items || []).map(mapExperience) };
  }

  async getExperience(token, id) {
    const result = await this.request("GET", `/admin/experiences/${id}`, { token });
    return {
      ...result,
      experience: result.data?.experience ? mapExperience(result.data.experience) : null,
    };
  }

  async saveExperience(token, payload, id = null) {
    const result = await this.request(
      id ? "PUT" : "POST",
      id ? `/admin/experiences/${id}` : "/admin/experiences",
      { token, body: payload },
    );
    return {
      ...result,
      experience: result.data?.experience ? mapExperience(result.data.experience) : null,
    };
  }

  async deleteExperience(token, id) {
    return this.request("DELETE", `/admin/experiences/${id}`, { token });
  }

  async publishExperience(token, id) {
    const result = await this.request("POST", `/admin/experiences/${id}/publish`, { token });
    return {
      ...result,
      experience: result.data?.experience ? mapExperience(result.data.experience) : null,
    };
  }

  async unpublishExperience(token, id) {
    const result = await this.request("POST", `/admin/experiences/${id}/unpublish`, { token });
    return {
      ...result,
      experience: result.data?.experience ? mapExperience(result.data.experience) : null,
    };
  }
}

const adminContentServiceApi = new AdminContentServiceApi();
export default adminContentServiceApi;
