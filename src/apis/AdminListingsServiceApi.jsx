import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { toQueryString } from "../utils/queryString";
import { buildRequestKey, dedupeRequest } from "./dedupService";
import { mapAdminListing, mapAdminListingList } from "../utils/adminListingHelpers";

class AdminListingsServiceApi {
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

  async listListings(token, params) {
    const result = await this.request("GET", "/admin/listings", { token, params, dedupe: false });
    if (!result.ok) return { ...result, items: [], pagination: null };

    const { items, pagination } = mapAdminListingList(result.data);
    return { ...result, items, pagination };
  }

  async getListing(token, slug) {
    const result = await this.request("GET", `/admin/listings/${encodeURIComponent(slug)}`, {
      token,
      dedupe: false,
    });
    if (!result.ok) return { ...result, listing: null };

    return {
      ...result,
      listing: mapAdminListing(result.data),
    };
  }
}

const adminListingsServiceApi = new AdminListingsServiceApi();
export default adminListingsServiceApi;
