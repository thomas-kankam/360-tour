import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { parsePaginatedList, mapServerPagination } from "../utils/adminPaginationHelpers";
import { mapApiInvoice } from "../utils/invoiceHelpers";

class ClientInvoicesServiceApi {
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

  async listInvoices(token, { page = 1, perPage = 20 } = {}) {
    const query = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    try {
      const response = await axios.get(`${this.baseUrl}/client/invoices?${query}`, {
        headers: this.getHeaders(token),
      });
      const result = parseApiEnvelope(response);
      if (!result.ok) return { ...result, items: [], pagination: null };
      const { items, pagination } = parsePaginatedList(result.data);
      return {
        ...result,
        items: items.map(mapApiInvoice).filter(Boolean),
        pagination: mapServerPagination(pagination, { page, pageSize: perPage }),
      };
    } catch (error) {
      return { ...parseApiError(error), items: [], pagination: null };
    }
  }

  async getInvoice(token, id) {
    try {
      const response = await axios.get(`${this.baseUrl}/client/invoices/${encodeURIComponent(id)}`, {
        headers: this.getHeaders(token),
      });
      const result = parseApiEnvelope(response);
      return { ...result, invoice: result.data ? mapApiInvoice(result.data) : null };
    } catch (error) {
      return { ...parseApiError(error), invoice: null };
    }
  }

  async listRequests(token, { page = 1, perPage = 20 } = {}) {
    const query = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    try {
      const response = await axios.get(`${this.baseUrl}/client/invoice-requests?${query}`, {
        headers: this.getHeaders(token),
      });
      const result = parseApiEnvelope(response);
      if (!result.ok) return { ...result, items: [], pagination: null };
      const { items, pagination } = parsePaginatedList(result.data);
      return {
        ...result,
        items,
        pagination: mapServerPagination(pagination, { page, pageSize: perPage }),
      };
    } catch (error) {
      return { ...parseApiError(error), items: [], pagination: null };
    }
  }

  async submitRequest(token, { type, message }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/client/invoice-requests`,
        { type, message },
        { headers: this.getHeaders(token) },
      );
      return parseApiEnvelope(response);
    } catch (error) {
      return parseApiError(error);
    }
  }
}

const clientInvoicesServiceApi = new ClientInvoicesServiceApi();
export default clientInvoicesServiceApi;
