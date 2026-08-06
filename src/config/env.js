function normalizeWhatsAppNumber(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizePhoneForTel(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

const env = {
  appName: process.env.REACT_APP_APP_NAME || "AfriQuest Global",
  // apiUrl:"https://afriquestgh.omnicarsgh.com/api",

  apiUrl: "https://api.afriquestglobaltours.com/api",
  contactEmail: process.env.REACT_APP_CONTACT_EMAIL || "info@afriquestglobaltours.com",
  contactPhone: process.env.REACT_APP_CONTACT_PHONE_US || "+1 (346) 433-1792",
  whatsappNumber: normalizeWhatsAppNumber(
    process.env.REACT_APP_WHATSAPP_NUMBER || "13464331792",
  ),
  websiteUrl: process.env.REACT_APP_WEBSITE_URL || "https://afriquestglobaltours.com",
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
