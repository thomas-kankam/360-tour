import axios from "axios";
import env from "./env";

const LEGACY_APP_HOSTS = new Set(["afriquestgh.netlify.app"]);

function normalizeWebsiteBase(url = env.websiteUrl) {
  return String(url || "").replace(/\/+$/, "");
}

export function getCanonicalOrigin() {
  try {
    return new URL(normalizeWebsiteBase()).origin;
  } catch {
    return "https://afriquestglobaltours.com";
  }
}

export function getFrontendUrl(path = "") {
  const base = normalizeWebsiteBase();
  if (!path) return base;

  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

export function ensureCanonicalOrigin() {
  if (typeof window === "undefined") return;

  const canonicalOrigin = getCanonicalOrigin();
  const { hostname, pathname, search, hash } = window.location;

  if (hostname === new URL(canonicalOrigin).hostname) return;
  if (!LEGACY_APP_HOSTS.has(hostname)) return;

  window.location.replace(`${canonicalOrigin}${pathname}${search}${hash}`);
}

const frontendUrl = normalizeWebsiteBase();

axios.interceptors.request.use((config) => {
  const method = String(config.method || "get").toLowerCase();
  if (!["post", "put", "patch"].includes(method)) return config;

  if (config.data && typeof config.data === "object" && !(config.data instanceof FormData)) {
    config.data = {
      frontend_url: frontendUrl,
      ...config.data,
    };
  }

  return config;
});

export default axios;
