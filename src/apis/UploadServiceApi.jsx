import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { resolvePublicMediaUrl } from "../utils/mediaUrl";
import { prepareImageForUpload } from "../utils/imageOptimize";

class UploadServiceApi {
  constructor() {
    this.baseUrl = env.apiUrl;
  }

  async uploadImage(token, file, { variant = "generic", role = "admin", optimize = true } = {}) {
    if (!file) {
      return { ok: false, url: "", reason: "No image selected." };
    }

    let uploadFile = file;
    let optimizeMeta = null;

    if (optimize) {
      try {
        const prepared = await prepareImageForUpload(file, variant);
        uploadFile = prepared.file;
        optimizeMeta = prepared;
      } catch (error) {
        return {
          ok: false,
          url: "",
          reason: error?.message || "Could not prepare image for upload.",
        };
      }
    }

    const form = new FormData();
    form.append("image", uploadFile);
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
        optimizeMeta,
        reason: result.ok && !url ? "Upload succeeded but no image URL was returned." : result.reason,
      };
    } catch (error) {
      return { ...parseApiError(error), url: "" };
    }
  }
}

const uploadServiceApi = new UploadServiceApi();
export default uploadServiceApi;
