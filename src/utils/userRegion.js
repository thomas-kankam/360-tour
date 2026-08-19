import {
  countryCodeToPaymentRegion,
  GHANA_COUNTRY_CODE,
  isGhanaCountryCode,
} from "../constants/paymentRegions";

const CACHE_KEY = "360tours_user_region";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const LOOKUP_TIMEOUT_MS = 5000;

export const USER_REGION_SOURCE = {
  CACHE: "cache",
  IPAPI: "ipapi",
  CLOUDFLARE: "cloudflare",
  TIMEZONE: "timezone",
  OVERRIDE: "override",
  DEFAULT: "default",
};

/**
 * @typedef {Object} UserRegion
 * @property {string|null} countryCode ISO 3166-1 alpha-2 (e.g. "GH", "US")
 * @property {boolean} isInGhana
 * @property {"domestic"|"international"} paymentRegion
 * @property {string} source One of USER_REGION_SOURCE
 * @property {number} detectedAt Unix timestamp (ms)
 */

function normalizeCountryCode(value) {
  const code = String(value || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

export function buildUserRegion(countryCode, source) {
  const normalized = normalizeCountryCode(countryCode);

  return {
    countryCode: normalized,
    isInGhana: isGhanaCountryCode(normalized),
    paymentRegion: countryCodeToPaymentRegion(normalized),
    source,
    detectedAt: Date.now(),
  };
}

function readCachedRegion() {
  if (typeof sessionStorage === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.detectedAt || Date.now() - parsed.detectedAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    return {
      ...parsed,
      source: USER_REGION_SOURCE.CACHE,
    };
  } catch {
    sessionStorage.removeItem(CACHE_KEY);
    return null;
  }
}

function writeCachedRegion(region) {
  if (typeof sessionStorage === "undefined") return;

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(region));
  } catch {
    // Ignore quota / private-mode storage errors.
  }
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchCountryFromIpApi() {
  try {
    const response = await fetchWithTimeout("https://ipapi.co/json/", {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return normalizeCountryCode(data?.country_code);
  } catch {
    return null;
  }
}

async function fetchCountryFromCloudflare() {
  try {
    const response = await fetchWithTimeout("https://1.1.1.1/cdn-cgi/trace");
    if (!response.ok) return null;

    const text = await response.text();
    const match = text.match(/^loc=([A-Z]{2})$/m);
    return normalizeCountryCode(match?.[1]);
  } catch {
    return null;
  }
}

function detectCountryFromTimezone() {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone === "Africa/Accra") return GHANA_COUNTRY_CODE;
  } catch {
    // Ignore environments without Intl support.
  }

  return null;
}

/**
 * Detect whether the user is likely in Ghana and derive a payment region hint.
 * Results are cached in sessionStorage for 24 hours.
 *
 * Fallback order: cache → ipapi.co → Cloudflare trace → timezone → international default.
 */
export async function detectUserRegion() {
  const cached = readCachedRegion();
  if (cached) return cached;

  let countryCode = await fetchCountryFromIpApi();
  let source = USER_REGION_SOURCE.IPAPI;

  if (!countryCode) {
    countryCode = await fetchCountryFromCloudflare();
    source = USER_REGION_SOURCE.CLOUDFLARE;
  }

  if (!countryCode) {
    countryCode = detectCountryFromTimezone();
    source = USER_REGION_SOURCE.TIMEZONE;
  }

  if (!countryCode) {
    source = USER_REGION_SOURCE.DEFAULT;
  }

  const region = buildUserRegion(countryCode, source);
  writeCachedRegion(region);
  return region;
}

/** Returns a cached region synchronously, or null if missing / expired. */
export function getCachedUserRegion() {
  return readCachedRegion();
}

export function clearUserRegionCache() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(CACHE_KEY);
}
