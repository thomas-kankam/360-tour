import uploadServiceApi from "../apis/UploadServiceApi";
import { optimizeImageFile } from "./imageOptimize";

export function resolveProfileImageSrc(value) {
  if (!value) return "";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return resolveProfileImageSrc(JSON.parse(trimmed));
      } catch {
        return "";
      }
    }
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      try {
        return resolveProfileImageSrc(JSON.parse(trimmed));
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }

  if (typeof value === "object") {
    if (value.data) {
      const data = String(value.data);
      if (data.startsWith("data:")) return data;
      if (value.mimeType) return `data:${value.mimeType};base64,${data}`;
    }
    return value.url || value.uri || value.src || value.profileImage || "";
  }

  return "";
}

export async function uploadProfilePhoto(token, file, role = "client") {
  const optimized = await optimizeImageFile(file, "profile");
  return uploadServiceApi.uploadImage(token, optimized, { variant: "profile", role });
}
