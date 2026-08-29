import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { resolvePublicMediaUrl } from "../utils/mediaUrl";

class UploadServiceApi {
  constructor() {
    this.baseUrl = env.apiUrl;
  }

  async uploadImage(token, file, { variant = "generic", role = "admin" } = {}) {
    if (!file) {
      return { ok: false, url: "", reason: "No image selected." };
    }

    const form = new FormData();
    form.append("image", file);
    form.append("variant", variant);

    const path = role === "client" ? "/client/uploads/images" : "/admin/uploads/images";

    try {
      const response = await axios.post(`${this.baseUrl}${path}`, form, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const result = parseApiEnvelope(response);
      const url = resolvePublicMediaUrl(result.data?.url || "");
      return {
        ...result,
        url,
        ok: result.ok && Boolean(url),
        reason: result.ok && !url ? "Upload succeeded but no image URL was returned." : result.reason,
      };
    } catch (error) {
      return { ...parseApiError(error), url: "" };
    }
  }
}

const uploadServiceApi = new UploadServiceApi();
export default uploadServiceApi;
