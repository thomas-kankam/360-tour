function normalizeWhatsAppNumber(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizePhoneForTel(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

const PUBLIC_CONTACT_EMAIL = "360toursghana@gmail.com";
const LEGACY_CONTACT_EMAILS = new Set([
  "360tours.gh@gmail.com",
  "info@360toursghana.com",
  "accounts@360toursghana.com",
]);

function normalizeContactEmail(value) {
  const email = String(value || "").trim();
  if (!email) return PUBLIC_CONTACT_EMAIL;
  return LEGACY_CONTACT_EMAILS.has(email.toLowerCase()) ? PUBLIC_CONTACT_EMAIL : email;
}

const env = {
  appName: process.env.REACT_APP_APP_NAME || "360 Tours and Investment Limited",
  apiUrl:
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === "development"
      ? "/api"
      : "https://api.360toursghana.com/api"),
  contactEmail: normalizeContactEmail(process.env.REACT_APP_CONTACT_EMAIL || PUBLIC_CONTACT_EMAIL).replace(/^\./, ""),
  contactPhone: process.env.REACT_APP_CONTACT_PHONE || "+233 50 040 4105",
  whatsappNumber: normalizeWhatsAppNumber(
    process.env.REACT_APP_WHATSAPP_NUMBER || "233500404105",
  ),
  instagramUrl:
    process.env.REACT_APP_INSTAGRAM_URL ||
    "https://www.instagram.com/360toursghana?igsi=MTc2aDRwbm9pdHh6bA%3D%3D&utm_source=qr",
  websiteUrl: process.env.REACT_APP_WEBSITE_URL || "https://360toursghana.com",
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
};

export function getContactPhoneTelHref(phone = env.contactPhone) {
  return `tel:${normalizePhoneForTel(phone)}`;
}

export function getWhatsAppUrl(message = "") {
  const number = env.whatsappNumber;
  if (!number) return "https://wa.me/";

  const text = encodeURIComponent(message);
  return `https://wa.me/${number}${text ? `?text=${text}` : ""}`;
}

export function getWebsiteBaseUrl() {
  return String(env.websiteUrl || "").replace(/\/+$/, "");
}

export function buildWebsiteUrl(path = "") {
  const base = getWebsiteBaseUrl();
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Origin that serves Laravel `/storage` files (API host in production, CRA origin in dev). */
export function getApiOrigin() {
  const apiUrl = String(env.apiUrl || "").trim();
  if (/^https?:\/\//i.test(apiUrl)) {
    try {
      return new URL(apiUrl).origin;
    } catch {
      return "";
    }
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
}

export default env;
