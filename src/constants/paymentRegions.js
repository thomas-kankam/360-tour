export const GHANA_COUNTRY_CODE = "GH";

export const PAYMENT_REGION = {
  DOMESTIC: "domestic",
  INTERNATIONAL: "international",
};

export function isGhanaCountryCode(countryCode) {
  return String(countryCode || "").trim().toUpperCase() === GHANA_COUNTRY_CODE;
}

export function countryCodeToPaymentRegion(countryCode) {
  return isGhanaCountryCode(countryCode)
    ? PAYMENT_REGION.DOMESTIC
    : PAYMENT_REGION.INTERNATIONAL;
}
