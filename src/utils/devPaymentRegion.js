import { PAYMENT_REGION } from "../constants/paymentRegions";

export const DEV_PAYMENT_REGION_KEY = "afriquest_dev_payment_region";
export const PAYMENT_REGION_OVERRIDE_EVENT = "afriquest:payment-region-override-changed";

export function isDevPaymentRegionEnabled() {
  return process.env.NODE_ENV !== "production";
}

export function normalizePaymentRegionParam(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (["domestic", "local", "gh", "ghana", "paystack"].includes(normalized)) {
    return PAYMENT_REGION.DOMESTIC;
  }

  if (["international", "foreign", "intl", "usd", "stripe", "abroad"].includes(normalized)) {
    return PAYMENT_REGION.INTERNATIONAL;
  }

  return null;
}

export function readDevPaymentRegionOverride() {
  if (!isDevPaymentRegionEnabled() || typeof localStorage === "undefined") return null;

  try {
    return normalizePaymentRegionParam(localStorage.getItem(DEV_PAYMENT_REGION_KEY));
  } catch {
    return null;
  }
}

export function writeDevPaymentRegionOverride(paymentRegion) {
  if (!isDevPaymentRegionEnabled() || typeof window === "undefined") return;

  try {
    if (paymentRegion) {
      localStorage.setItem(DEV_PAYMENT_REGION_KEY, paymentRegion);
    } else {
      localStorage.removeItem(DEV_PAYMENT_REGION_KEY);
    }
  } catch {
    // Ignore private-mode storage errors.
  }

  window.dispatchEvent(
    new CustomEvent(PAYMENT_REGION_OVERRIDE_EVENT, {
      detail: { paymentRegion: paymentRegion || null },
    }),
  );
}

/**
 * Apply ?paymentRegion=domestic|international or ?clearPaymentRegion=1 from the URL.
 * Returns the active dev override after applying URL params.
 */
export function applyDevPaymentRegionFromUrl(search = "") {
  if (!isDevPaymentRegionEnabled()) return null;

  const params = new URLSearchParams(search);

  if (params.has("clearPaymentRegion")) {
    writeDevPaymentRegionOverride(null);
    return null;
  }

  const param = params.get("paymentRegion");
  if (param) {
    const normalized = normalizePaymentRegionParam(param);
    if (normalized) {
      writeDevPaymentRegionOverride(normalized);
      return normalized;
    }
  }

  return readDevPaymentRegionOverride();
}

export function installDevPaymentRegionConsoleHelpers() {
  if (!isDevPaymentRegionEnabled() || typeof window === "undefined") return;

  window.afriquestDev = {
    setPaymentRegion: (value) => {
      const normalized = normalizePaymentRegionParam(value);
      if (!normalized) {
        console.warn(
          "Use afriquestDev.setPaymentRegion('domestic') or afriquestDev.setPaymentRegion('international')",
        );
        return null;
      }
      writeDevPaymentRegionOverride(normalized);
      return normalized;
    },
    clearPaymentRegion: () => {
      writeDevPaymentRegionOverride(null);
    },
    getPaymentRegion: () => readDevPaymentRegionOverride(),
  };
}
