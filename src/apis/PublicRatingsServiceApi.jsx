import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { getLocalTourReviews, mapPublicReview } from "../utils/tourReviewsHelpers";
import { buildRequestKey, dedupeRequest } from "./dedupService";

class PublicRatingsServiceApi {
  constructor() {
    this.baseUrl = env.apiUrl;
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  async getTourReviews(tourSlug) {
    const url = `${this.baseUrl}/listings/${encodeURIComponent(tourSlug)}/reviews`;
    const key = buildRequestKey({ method: "GET", url });

    const exec = async () => {
      try {
        const response = await axios.get(url, { headers: this.getHeaders() });
        const result = parseApiEnvelope(response);
        if (!result.ok) {
          return { ...result, items: getLocalTourReviews(tourSlug), source: "local" };
        }

        const payload = result.data;
        const rawItems = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.reviews) ? payload.reviews : Array.isArray(payload) ? payload : [];
        const items = rawItems.map(mapPublicReview).filter((item) => item && item.status === "approved");

        return { ...result, items, source: "api" };
      } catch (error) {
        const status = error?.response?.status;
        if (status === 404 || status === 405 || status === 501) {
          return { ok: true, items: getLocalTourReviews(tourSlug), source: "local" };
        }
        return { ...parseApiError(error), items: getLocalTourReviews(tourSlug), source: "local" };
      }
    };

    return dedupeRequest(key, exec);
  }
}

const publicRatingsServiceApi = new PublicRatingsServiceApi();
export default publicRatingsServiceApi;
