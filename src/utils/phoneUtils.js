import { parsePhoneNumberFromString } from "libphonenumber-js";

export const DEFAULT_PHONE_COUNTRY = "GH";

const GHANA_COUNTRY_CODE = "233";

/**
 * API format: digits only with country calling code, never a leading "+".
 * Example: +233 24 123 4567 → 233241234567
 */
export function normalizePhoneForApi(phone, defaultCountry = DEFAULT_PHONE_COUNTRY) {
  const trimmed = String(phone || "").trim();
  if (!trimmed) return "";

  const parsed = parsePhoneNumberFromString(trimmed, defaultCountry);
  if (parsed?.isValid()) {
    return `${parsed.countryCallingCode}${parsed.nationalNumber}`;
  }

  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";

  // Local Ghana format: 0XXXXXXXXX → 233XXXXXXXXX
  if (digits.length === 10 && digits.startsWith("0")) {
    digits = `${GHANA_COUNTRY_CODE}${digits.slice(1)}`;
  }

  return digits;
}

/** Email unchanged; phone normalized for API */
export function normalizeEmailOrPhoneForApi(value, defaultCountry = DEFAULT_PHONE_COUNTRY) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (trimmed.includes("@")) return trimmed;
  return normalizePhoneForApi(trimmed, defaultCountry);
}

export function phoneNumberHasCountryCode(phone, defaultCountry = DEFAULT_PHONE_COUNTRY) {
  const normalized = normalizePhoneForApi(phone, defaultCountry);
  if (!normalized) return false;

  const parsed = parsePhoneNumberFromString(`+${normalized}`, defaultCountry);
  return Boolean(parsed?.isValid() && parsed.countryCallingCode);
}
