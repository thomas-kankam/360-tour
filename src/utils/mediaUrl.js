import { getApiOrigin } from "../config/env";

const LOOPBACK_HOST = /^(localhost|127\.0\.0\.1|\[::1\]|::1)$/i;

function storagePathFromUrl(value) {
  const url = String(value || "").trim();
  if (!url || url.startsWith("data:") || url.startsWith("blob:")) return "";

  if (url.startsWith("/storage/")) {
    return url.split("?")[0];
  }

  try {
    const parsed = new URL(url);
    if (parsed.pathname.includes("/storage/")) {
      return `/storage/${parsed.pathname.replace(/^.*?\/storage\//, "")}`;
    }
  } catch {
    return "";
  }

  return "";
}

/** Persist hostless `/storage/...` paths so localhost APP_URL never gets saved again. */
export function toStorageRelativeUrl(value) {
  return storagePathFromUrl(value) || String(value || "").trim();
}

/**
 * Point uploaded files at the API host. Production responses were baked as
 * http://127.0.0.1:8000/storage/... which the browser cannot load.
 */
export function resolvePublicMediaUrl(value) {
  const url = String(value || "").trim();
  if (!url || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }

  const origin = String(getApiOrigin() || "").replace(/\/+$/, "");
  const storagePath = storagePathFromUrl(url);

  if (storagePath) {
    return origin ? `${origin}${storagePath}` : storagePath;
  }

  if (!origin) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (!LOOPBACK_HOST.test(parsed.hostname)) {
      return url;
    }
  } catch {
    return url;
  }

  return url;
}
