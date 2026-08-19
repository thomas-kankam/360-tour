function normalizeWhatsAppNumber(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizePhoneForTel(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

const env = {
  appName: process.env.REACT_APP_APP_NAME || "360 Tours and Investment Limited",
  apiUrl:
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:8000/api"
      : "https://api.360toursghana.com/api"),
  contactEmail: (process.env.REACT_APP_CONTACT_EMAIL || "360tours.gh@gmail.com").replace(/^\./, ""),
  contactPhone: process.env.REACT_APP_CONTACT_PHONE_US || "+(31) 0684724905",
  whatsappNumber: normalizeWhatsAppNumber(
    process.env.REACT_APP_WHATSAPP_NUMBER || "233500404151",
  ),
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

export default env;
