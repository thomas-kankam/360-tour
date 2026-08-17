import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { mapApiLandingCmsContent } from "../utils/landingCmsHelpers";
import { buildRequestKey, dedupeRequest } from "./dedupService";

class PublicLandingCmsServiceApi {
  constructor() {
    this.baseUrl = env.apiUrl;
  }

  getHeaders() {
    return {
      Accept: "application/json",
    };
  }

  async getPublishedContent() {
    const url = `${this.baseUrl}/landing-cms`;
    const key = buildRequestKey({ method: "GET", url });

    const exec = async () => {
      try {
        const response = await axios.get(url, { headers: this.getHeaders() });
        const result = parseApiEnvelope(response);
        if (!result.ok) {
          return { ...result, content: null, publishedAt: null };
        }

        const content = mapApiLandingCmsContent(result.data);
        return {
          ...result,
          content,
          publishedAt: result.data?.published_at ?? result.data?.publishedAt ?? null,
        };
      } catch (error) {
        return { ...parseApiError(error), content: null, publishedAt: null };
      }
    };

    return dedupeRequest(key, exec);
  }
}

const publicLandingCmsServiceApi = new PublicLandingCmsServiceApi();
export default publicLandingCmsServiceApi;
