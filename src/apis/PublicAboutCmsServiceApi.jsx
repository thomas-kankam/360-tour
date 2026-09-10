import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { mapApiAboutCmsContent } from "../utils/aboutCmsStorage";

class PublicAboutCmsServiceApi {
  constructor() {
    this.baseUrl = env.apiUrl;
  }

  async getPublishedContent() {
    try {
      const response = await axios.get(`${this.baseUrl}/about-cms`, {
        headers: { Accept: "application/json" },
      });
      const result = parseApiEnvelope(response);
      if (!result.ok) return { ...result, content: null };
      return { ...result, content: mapApiAboutCmsContent(result.data) };
    } catch (error) {
      return { ...parseApiError(error), content: null };
    }
  }
}

const publicAboutCmsServiceApi = new PublicAboutCmsServiceApi();
export default publicAboutCmsServiceApi;
