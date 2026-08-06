import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { mapOperatorTourList } from "../utils/operatorTourMapper";
import {
  mapPublicTourCard,
  mapPublicTourDetail,
  mapPublicTourToPopularCard,
} from "../utils/publicListingsHelpers";
import { toQueryString } from "../utils/queryString";
import { buildRequestKey, dedupeRequest } from "./dedupService";

class PublicListingsServiceApi {
  constructor() {
    this.baseUrl = env.apiUrl;
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  async listListings(payload = {}, params = {}) {
    const url = `${this.baseUrl}/listings${toQueryString(params)}`;
    const key = buildRequestKey({ method: "POST", url, body: payload });

    const exec = async () => {
      try {
        const response = await axios.post(url, payload, { headers: this.getHeaders() });
        const result = parseApiEnvelope(response);
        if (!result.ok) return { ...result, items: [], pagination: null };

        const { items, pagination } = mapOperatorTourList(result.data);
        return {
          ...result,
          items: items.map(mapPublicTourCard).filter(Boolean),
          pagination,
        };
      } catch (error) {
        return { ...parseApiError(error), items: [], pagination: null };
      }
    };

    return dedupeRequest(key, exec);
  }

  async getRandomListings() {
    const url = `${this.baseUrl}/listings/random`;
    const key = buildRequestKey({ method: "GET", url });

    const exec = async () => {
      try {
        const response = await axios.get(url, { headers: this.getHeaders() });
        const result = parseApiEnvelope(response);
        if (!result.ok) return { ...result, items: [] };

        const listings = Array.isArray(result.data) ? result.data : [];
        return {
          ...result,
          items: listings.map(mapPublicTourToPopularCard).filter(Boolean),
        };
      } catch (error) {
        return { ...parseApiError(error), items: [] };
      }
    };

    return dedupeRequest(key, exec);
  }

  async getListing(slug) {
    const url = `${this.baseUrl}/listings/${slug}`;
    const key = buildRequestKey({ method: "GET", url });

    const exec = async () => {
      try {
        const response = await axios.get(url, { headers: this.getHeaders() });
        const result = parseApiEnvelope(response);
        if (!result.ok) return { ...result, tour: null };

        return {
          ...result,
          tour: mapPublicTourDetail(result.data),
        };
      } catch (error) {
        return { ...parseApiError(error), tour: null };
      }
    };

    return dedupeRequest(key, exec);
  }
}

const publicListingsServiceApi = new PublicListingsServiceApi();
export default publicListingsServiceApi;
