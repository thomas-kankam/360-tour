import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
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

  async request(method, path, { token, dedupe = true } = {}) {
    const url = `${this.baseUrl}${path}`;
    const key = buildRequestKey({ method, url });

    const exec = async () => {
      try {
        const response = await axios({ method, url, headers: this.getHeaders(token) });
        return parseApiEnvelope(response);
      } catch (error) {
        return parseApiError(error);
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
}

const consumerRatingsServiceApi = new ConsumerRatingsServiceApi();
export default consumerRatingsServiceApi;
