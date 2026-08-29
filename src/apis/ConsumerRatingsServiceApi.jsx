import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { parsePaginatedList, mapServerPagination } from "../utils/adminPaginationHelpers";
import { resolvePublicMediaUrl } from "../utils/mediaUrl";
import { buildRequestKey, dedupeRequest } from "./dedupService";

function mapClientRating(raw) {
  if (!raw) return null;

  const id = raw.id ?? raw.uuid ?? raw.rating_uuid;
  if (!id) return null;

  const tourImage = resolvePublicMediaUrl(
    raw.tour_image ??
      raw.tourImage ??
      raw.tour?.coverImageUrl ??
      raw.tour?.cover_image_url ??
      "",
  );

  return {
    id,
    tourTitle: raw.tour_title ?? raw.tourTitle ?? raw.tour?.name ?? raw.tour?.title ?? "Tour",
    tourSlug: raw.tour_slug ?? raw.tourSlug ?? raw.tour?.slug ?? "",
    tourImage,
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

  async getMyReviewForTour(token, tourSlug) {
    if (!token || !tourSlug) return { ok: false, review: null };

    const query = new URLSearchParams({
      tour_slug: tourSlug,
      page: "1",
      per_page: "1",
    });
    const result = await this.request("GET", `/client/ratings?${query}`, { token, dedupe: false });
    if (!result.ok) return { ...result, review: null };

    const { items: rawItems } = parsePaginatedList(result.data);
    const review = rawItems.map(mapClientRating).filter(Boolean)[0] ?? null;
    return { ...result, review };
  }

  async listMyRatings(token, { page = 1, perPage = 50, tourSlug } = {}) {
    const query = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    if (tourSlug) query.set("tour_slug", tourSlug);
    const result = await this.request("GET", `/client/ratings?${query}`, { token, dedupe: false });
    if (!result.ok) return { ...result, items: [], pagination: null };

    const { items: rawItems, pagination } = parsePaginatedList(result.data);
    return {
      ...result,
      items: rawItems.map(mapClientRating).filter(Boolean),
      pagination: mapServerPagination(pagination, { page, pageSize: perPage }),
    };
  }

  async listAllMyRatings(token) {
    const items = [];
    let page = 1;
    let lastPage = 1;

    do {
      const result = await this.listMyRatings(token, { page, perPage: 50 });
      if (!result.ok) {
        return { ...result, items: page === 1 ? [] : items };
      }

      items.push(...(result.items ?? []));
      lastPage = result.pagination?.totalPages ?? 1;
      page += 1;
    } while (page <= lastPage);

    return { ok: true, items, reason: "Ratings retrieved" };
  }

  async submitReview(token, { tourSlug, tourTitle, rating, comment, clientName, clientId }) {
    const body = {
      tour_slug: tourSlug,
      rating: Number(rating),
      comment: comment?.trim() || "",
    };

    const result = await this.request("POST", "/client/ratings", { token, body, dedupe: false });

    if (!result.ok) {
      return { ...result, review: null };
    }

    const mapped = mapClientRating(result.data);
    return {
      ...result,
      review: mapped,
      source: "api",
      reason: result.reason || "Thank you! Your review is pending approval.",
    };
  }
}

const consumerRatingsServiceApi = new ConsumerRatingsServiceApi();
export default consumerRatingsServiceApi;
