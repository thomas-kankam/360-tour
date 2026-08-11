import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { toQueryString } from "../utils/queryString";
import { buildRequestKey, dedupeRequest } from "./dedupService";

function mapRating(raw) {
  if (!raw) return null;

  return {
    id: raw.id ?? raw.slug ?? raw.uuid,
    tourTitle: raw.tour_title ?? raw.tourTitle ?? raw.tour?.title ?? raw.tour?.name ?? "Unknown tour",
    tourSlug: raw.tour_slug ?? raw.tourSlug ?? raw.tour?.slug ?? "",
    clientName: raw.client_name ?? raw.clientName ?? raw.author_name ?? raw.authorName ?? "Anonymous",
    clientEmail: raw.client_email ?? raw.clientEmail ?? raw.author_email ?? "",
    rating: Number(raw.rating ?? raw.score ?? 0),
    comment: raw.comment ?? raw.review ?? raw.body ?? "",
    status: raw.status ?? "pending",
    createdAt: raw.created_at ?? raw.createdAt ?? null,
  };
}

function mapRatingList(data) {
  const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  const pagination = data?.pagination ?? data?.meta ?? null;

  return {
    items: items.map(mapRating).filter(Boolean),
    pagination,
  };
}

class AdminRatingsServiceApi {
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

  async request(method, path, { token, body, params, dedupe = true } = {}) {
    const url = `${this.baseUrl}${path}${toQueryString(params)}`;
    const key = buildRequestKey({ method, url, body });

    const exec = async () => {
      try {
        const response = await axios({
          method,
          url,
          data: body,
          headers: this.getHeaders(token),
        });
        return parseApiEnvelope(response);
      } catch (error) {
        return parseApiError(error);
      }
    };

    return dedupe ? dedupeRequest(key, exec) : exec();
  }

  async listRatings(token, params) {
    const result = await this.request("GET", "/admin/ratings", { token, params, dedupe: false });
    if (!result.ok) return { ...result, items: [], pagination: null };

    const { items, pagination } = mapRatingList(result.data);
    return { ...result, items, pagination };
  }

  async updateRatingStatus(token, id, status) {
    return this.request("PATCH", `/admin/ratings/${encodeURIComponent(id)}`, {
      token,
      body: { status },
      dedupe: false,
    });
  }
}

const adminRatingsServiceApi = new AdminRatingsServiceApi();
export default adminRatingsServiceApi;
