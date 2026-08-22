import { company } from "../data/aboutContent";
import env from "../config/env";

const STORAGE_KEY = "360tours_admin_company_settings";
const LEGACY_CONTACT_EMAILS = new Set([
  "360tours.gh@gmail.com",
  "info@360toursghana.com",
  "accounts@360toursghana.com",
]);

function normalizeStoredEmail(email) {
  const value = String(email || "").trim();
  if (!value) return env.contactEmail;
  return LEGACY_CONTACT_EMAILS.has(value.toLowerCase()) ? env.contactEmail : value;
}

export const DEFAULT_COMPANY_SETTINGS = {
  legalName: company.name,
  tagline: company.tagline,
  email: env.contactEmail,
  phone: env.contactPhone,
  website: env.websiteUrl,
  addressLine1: "Accra, Ghana",
  addressLine2: "Amsterdam, Netherlands",
  taxId: "",
  invoiceLogo: "",
  bankName: "",
  bankAccount: "",
  bankRouting: "",
  paymentNotes: "Payment due within 14 days of invoice date.",
  paypalOrMobileMoney: "",
  invoiceTerms: "Thank you for your business.",
  defaultCurrency: "USD",
  defaultTaxPercent: 0,
};

export function loadCompanySettings() {
  if (typeof window === "undefined") return { ...DEFAULT_COMPANY_SETTINGS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_COMPANY_SETTINGS };
    const parsed = { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(raw) };
    parsed.email = normalizeStoredEmail(parsed.email);
    return parsed;
  } catch {
    return { ...DEFAULT_COMPANY_SETTINGS };
  }
}

export function saveCompanySettings(settings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function mergeCompanySettingsFromProfile(user, settings = loadCompanySettings()) {
  return {
    ...settings,
    email: user?.email || settings.email,
    phone: user?.phone || settings.phone,
    invoiceLogo: user?.profileImage || settings.invoiceLogo,
  };
}
