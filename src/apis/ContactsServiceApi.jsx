import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { buildRequestKey, dedupeRequest } from "./dedupService";

class ContactsServiceApi {
  constructor() {
    this.baseUrl = env.apiUrl;
  }

  getHeaders(token) {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async post(path, payload, { token, dedupe = true } = {}) {
    const url = `${this.baseUrl}${path}`;
    const key = buildRequestKey({ method: "POST", url, body: payload });

    const exec = async () => {
      try {
        const response = await axios.post(url, payload, { headers: this.getHeaders(token) });
        return parseApiEnvelope(response);
      } catch (error) {
        return parseApiError(error);
      }
    };

    return dedupe ? dedupeRequest(key, exec) : exec();
  }

  submitContact(payload, { token } = {}) {
    return this.post("/contacts", payload, { token, dedupe: false });
  }
}

const contactsServiceApi = new ContactsServiceApi();
export default contactsServiceApi;
