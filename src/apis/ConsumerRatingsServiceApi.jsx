import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import {
  buildLocalPendingReview,
  mapPublicReview,
  saveLocalTourReview,
} from "../utils/tourReviewsHelpers";
import { buildRequestKey, dedupeRequest } from "./dedupService";

function mapClientRating(raw) {
  if (!raw) return null;

  return {
    id: raw.id ?? raw.uuid ?? raw.slug,
    tourTitle: raw.tour_title ?? raw.tourTitle ?? raw.tour?.title ?? raw.tour?.name ?? "Tour",
    tourSlug: raw.tour_slug ?? raw.tourSlug ?? raw.tour?.slug ?? "",
    rating: Number(raw.rating ?? raw.score ?? 0),
    comment: raw.comment ?? raw.review ?? raw.body ?? "",
    status: raw.status ?? "pending",
    createdAt: raw.created_at ?? raw.createdAt ?? null,
  };
}

class ConsumerRatingsServiceApi {
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

  async listMyRatings(token) {
    const result = await this.request("GET", "/client/ratings", { token, dedupe: false });
    if (!result.ok) return { ...result, items: [] };

    const payload = result.data;
    const rawItems = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    return { ...result, items: rawItems.map(mapClientRating).filter(Boolean) };
  }

  async submitReview(token, { tourSlug, tourTitle, rating, comment, clientName, clientId }) {
    const body = {
      tour_slug: tourSlug,
      rating: Number(rating),
      comment: comment?.trim() || "",
    };

    const result = await this.request("POST", "/client/ratings", { token, body, dedupe: false });

    if (!result.ok) {
      const unavailable = [404, 405, 501, 503].includes(result.httpStatus);
      if (unavailable) {
        const review = saveLocalTourReview(
          buildLocalPendingReview({ tourSlug, tourTitle, rating, comment, clientName, clientId }),
        );
        return {
          ok: true,
          review: mapPublicReview(review),
          source: "local",
          reason: "Review saved locally and will appear after admin approval.",
        };
      }
      return { ...result, review: null };
    }

    return {
      ...result,
      review: mapPublicReview(result.data?.review ?? result.data),
      source: "api",
      reason: result.reason || "Thank you! Your review is pending approval.",
    };
  }
}

const consumerRatingsServiceApi = new ConsumerRatingsServiceApi();
export default consumerRatingsServiceApi;
