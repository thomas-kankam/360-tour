import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { toQueryString } from "../utils/queryString";
import { buildRequestKey, dedupeRequest } from "./dedupService";
import {
  generateLocalInvoiceNumber,
  getLocalInvoice,
  listLocalInvoices,
  mapApiInvoice,
  mapInvoiceForApi,
  saveLocalInvoice,
  deleteLocalInvoice,
} from "../utils/invoiceHelpers";

function isEndpointUnavailable(errorOrResult, httpStatus) {
  const status = httpStatus ?? errorOrResult?.response?.status;
  return status === 404 || status === 405 || status === 501 || status === 503;
}

class AdminInvoicesServiceApi {
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
        const response = await axios({ method, url, data: body, headers: this.getHeaders(token) });
        return parseApiEnvelope(response);
      } catch (error) {
        return { ...parseApiError(error), httpStatus: error?.response?.status ?? null };
      }
    };

    return dedupe ? dedupeRequest(key, exec) : exec();
  }

  async listInvoices(token, params) {
    const result = await this.request("GET", "/admin/invoices", { token, params, dedupe: false });
    if (!result.ok) {
      if (isEndpointUnavailable(result, result.httpStatus)) {
        return { ok: true, items: listLocalInvoices(), pagination: null, source: "local" };
      }
      return { ...result, items: [], pagination: null, source: "api" };
    }

    const payload = result.data;
    const rawItems = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.items) ? payload.items : [];
    const items = rawItems.map(mapApiInvoice).filter(Boolean);

    return {
      ...result,
      items,
      pagination: payload?.pagination ?? payload?.meta ?? null,
      source: "api",
    };
  }

  async getInvoice(token, id) {
    const result = await this.request("GET", `/admin/invoices/${encodeURIComponent(id)}`, { token, dedupe: false });
    if (!result.ok) {
      if (isEndpointUnavailable(result, result.httpStatus)) {
        const local = getLocalInvoice(id);
        return { ok: Boolean(local), invoice: local, source: local ? "local" : "none" };
      }
      return { ...result, invoice: null, source: "api" };
    }

    const invoice = mapApiInvoice(result.data?.invoice ?? result.data);
    return { ...result, invoice, source: "api" };
  }

  async createInvoice(token, invoice) {
    const body = mapInvoiceForApi(invoice);
    const result = await this.request("POST", "/admin/invoices", { token, body, dedupe: false });

    if (!result.ok) {
      if (isEndpointUnavailable(result, result.httpStatus)) {
        const saved = saveLocalInvoice({
          ...invoice,
          id: invoice.id || crypto.randomUUID(),
          invoiceNumber: invoice.invoiceNumber || generateLocalInvoiceNumber(),
        });
        return { ok: true, invoice: saved, source: "local", reason: "Saved locally until the invoice API is available." };
      }
      return { ...result, invoice: null, source: "api" };
    }

    return { ...result, invoice: mapApiInvoice(result.data?.invoice ?? result.data), source: "api" };
  }

  async updateInvoice(token, id, invoice) {
    const body = mapInvoiceForApi(invoice);
    const result = await this.request("PUT", `/admin/invoices/${encodeURIComponent(id)}`, {
      token,
      body,
      dedupe: false,
    });

    if (!result.ok) {
      if (isEndpointUnavailable(result, result.httpStatus)) {
        const saved = saveLocalInvoice({ ...invoice, id });
        return { ok: true, invoice: saved, source: "local", reason: "Updated locally until the invoice API is available." };
      }
      return { ...result, invoice: null, source: "api" };
    }

    return { ...result, invoice: mapApiInvoice(result.data?.invoice ?? result.data), source: "api" };
  }

  async deleteInvoice(token, id) {
    const result = await this.request("DELETE", `/admin/invoices/${encodeURIComponent(id)}`, { token, dedupe: false });
    if (!result.ok && isEndpointUnavailable(result, result.httpStatus)) {
      deleteLocalInvoice(id);
      return { ok: true, source: "local" };
    }
    return result;
  }

  async sendInvoice(token, id, payload) {
    const result = await this.request("POST", `/admin/invoices/${encodeURIComponent(id)}/send`, {
      token,
      body: {
        email: payload.email,
        client_slug: payload.client_slug || "",
        attach_pdf: payload.attach_pdf ?? true,
        message: payload.message || "",
      },
      dedupe: false,
    });
    return result;
  }

  async generateInvoiceNumber(token) {
    const result = await this.request("POST", "/admin/invoices/generate-number", { token, body: {}, dedupe: false });
    if (!result.ok) {
      if (isEndpointUnavailable(result, result.httpStatus)) {
        return { ok: true, invoiceNumber: generateLocalInvoiceNumber(), source: "local" };
      }
      return { ok: false, invoiceNumber: "", source: "api", reason: result.reason || result.message };
    }

    const data = result.data?.invoice ?? result.data;
    return {
      ...result,
      invoiceNumber: data?.invoice_number || data?.invoiceNumber || generateLocalInvoiceNumber(),
      source: "api",
    };
  }
}

const adminInvoicesServiceApi = new AdminInvoicesServiceApi();
export default adminInvoicesServiceApi;
