import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { resolvePublicMediaUrl } from "../utils/mediaUrl";
import { prepareImageForUpload, UPLOAD_MAX_BYTES } from "../utils/imageOptimize";

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
        const prepared = await prepareImageForUpload(file, variant, UPLOAD_MAX_BYTES);
        if (prepared.file.size > UPLOAD_MAX_BYTES) {
          return {
            ok: false,
            url: "",
            reason: `Could not compress this image below 2 MB (still ${Math.round(prepared.file.size / 1024)} KB).`,
          };
        }
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

  async uploadVideo(token, file, { role = "admin" } = {}) {
    if (!file) {
      return { ok: false, url: "", reason: "No video selected." };
    }

    const maxBytes = 25 * 1024 * 1024;
    if (file.size > maxBytes) {
      return {
        ok: false,
        url: "",
        reason: `Video is too large (${Math.round(file.size / (1024 * 1024))} MB). Keep it under 25 MB.`,
      };
    }

    const type = String(file.type || "").toLowerCase();
    const name = String(file.name || "").toLowerCase();
    const looksOk =
      type.includes("mp4") ||
      type.includes("webm") ||
      type.includes("quicktime") ||
      name.endsWith(".mp4") ||
      name.endsWith(".webm") ||
      name.endsWith(".mov");
    if (!looksOk) {
      return { ok: false, url: "", reason: "Upload an MP4 or WebM video." };
    }

    const form = new FormData();
    form.append("video", file);

    const path = role === "client" ? "/client/uploads/videos" : "/admin/uploads/videos";

    try {
      const response = await axios.post(`${this.baseUrl}${path}`, form, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        // Large files can take a while on mobile networks.
        timeout: 120000,
      });
      const result = parseApiEnvelope(response);
      const url = resolvePublicMediaUrl(result.data?.url || "");
      return {
        ...result,
        url,
        ok: result.ok && Boolean(url),
        reason: result.ok && !url ? "Upload succeeded but no video URL was returned." : result.reason,
      };
    } catch (error) {
      return { ...parseApiError(error), url: "" };
    }
  }
}

const uploadServiceApi = new UploadServiceApi();
export default uploadServiceApi;
