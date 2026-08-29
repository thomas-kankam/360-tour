import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { parsePaginatedList, mapServerPagination } from "../utils/adminPaginationHelpers";
import { mapPublicReview } from "../utils/tourReviewsHelpers";
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
          return { ...result, items: [], pagination: null, source: "api" };
        }

        const { items: rawItems, pagination } = parsePaginatedList(result.data);
        const items = rawItems
          .map(mapPublicReview)
          .filter((item) => item && item.status === "approved");

        return {
          ...result,
          items,
          pagination: mapServerPagination(pagination, { page, pageSize: perPage }),
          source: "api",
        };
      } catch (error) {
        return { ...parseApiError(error), items: [], pagination: null, source: "api" };
      }
    };

    return dedupeRequest(key, exec);
  }
}

const publicRatingsServiceApi = new PublicRatingsServiceApi();
export default publicRatingsServiceApi;
