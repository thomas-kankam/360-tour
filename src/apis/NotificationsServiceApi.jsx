import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { parsePaginatedList, mapServerPagination } from "../utils/adminPaginationHelpers";
import { mapNotification } from "../utils/notificationHelpers";

function createNotificationsApi(audience) {
  const prefix = audience === "admin" ? "/admin" : "/client";

  class NotificationsServiceApi {
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

    async list(token, { page = 1, perPage = 20, unread = false } = {}) {
      const query = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
      });
      if (unread) query.set("unread", "1");

      try {
        const response = await axios.get(`${this.baseUrl}${prefix}/notifications?${query}`, {
          headers: this.getHeaders(token),
        });
        const result = parseApiEnvelope(response);
        if (!result.ok) return { ...result, items: [], pagination: null };

        const { items: rawItems, pagination } = parsePaginatedList(result.data);
        return {
          ...result,
          items: rawItems.map(mapNotification).filter(Boolean),
          pagination: mapServerPagination(pagination, { page, pageSize: perPage }),
        };
      } catch (error) {
        return { ...parseApiError(error), items: [], pagination: null };
      }
    }

    async unreadCount(token) {
      try {
        const response = await axios.get(`${this.baseUrl}${prefix}/notifications/unread-count`, {
          headers: this.getHeaders(token),
        });
        const result = parseApiEnvelope(response);
        return {
          ...result,
          count: Number(result.data?.count ?? 0),
        };
      } catch (error) {
        return { ...parseApiError(error), count: 0 };
      }
    }

    async markRead(token, id) {
      try {
        const response = await axios.patch(`${this.baseUrl}${prefix}/notifications/${id}/read`, null, {
          headers: this.getHeaders(token),
        });
        return parseApiEnvelope(response);
      } catch (error) {
        return parseApiError(error);
      }
    }

    async markAllRead(token) {
      try {
        const response = await axios.patch(`${this.baseUrl}${prefix}/notifications/read-all`, null, {
          headers: this.getHeaders(token),
        });
        return parseApiEnvelope(response);
      } catch (error) {
        return parseApiError(error);
      }
    }
  }

  return new NotificationsServiceApi();
}

export const clientNotificationsServiceApi = createNotificationsApi("client");
export const adminNotificationsServiceApi = createNotificationsApi("admin");
