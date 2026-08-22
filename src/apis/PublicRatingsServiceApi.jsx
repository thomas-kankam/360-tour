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

  async getTourReviews(tourSlug, { page = 1, perPage = 10 } = {}) {
    const url = `${this.baseUrl}/listings/${encodeURIComponent(tourSlug)}/reviews?page=${page}&per_page=${perPage}`;
    const key = buildRequestKey({ method: "GET", url });

    const exec = async () => {
      try {
        const response = await axios.get(url, { headers: this.getHeaders() });
        const result = parseApiEnvelope(response);
        if (!result.ok) {
          return { ...result, items: getLocalTourReviews(tourSlug), source: "local", pagination: null };
        }

        const payload = result.data;
        const nested = payload?.data ?? payload;
        const rawItems = Array.isArray(nested?.data)
          ? nested.data
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.reviews)
              ? payload.reviews
              : Array.isArray(payload)
                ? payload
                : [];
        const items = rawItems.map(mapPublicReview).filter((item) => item && item.status === "approved");
        const pagination = nested?.pagination ?? payload?.pagination ?? null;

        return { ...result, items, pagination, source: "api" };
      } catch (error) {
        const status = error?.response?.status;
        if (status === 404 || status === 405 || status === 501) {
          return { ok: true, items: getLocalTourReviews(tourSlug), source: "local", pagination: null };
        }
        return { ...parseApiError(error), items: getLocalTourReviews(tourSlug), source: "local", pagination: null };
      }
    };

    return dedupeRequest(key, exec);
  }
}

const publicRatingsServiceApi = new PublicRatingsServiceApi();
export default publicRatingsServiceApi;
