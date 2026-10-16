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
  accountName: "",
  bankAccount: "",
  bankRouting: "",
  paymentNotes: "Payment due within 14 days of invoice date.",
  paypalOrMobileMoney: "",
  mobileMoneyNetwork: "",
  mobileMoneyNumber: "",
  paypalEmail: "",
  invoiceTerms: "Thank you for your business.",
  defaultCurrency: "USD",
  defaultTaxPercent: 0,
};

function isBlank(value) {
  return value == null || String(value).trim() === "";
}

export function buildPaymentDetailsFromSettings(settings = {}) {
  const lines = [];
  if (settings.bankName) lines.push(`Bank: ${settings.bankName}`);
  if (settings.accountName) lines.push(`Account name: ${settings.accountName}`);
  if (settings.bankAccount) lines.push(`Account number: ${settings.bankAccount}`);
  if (settings.bankRouting) lines.push(`SWIFT / routing: ${settings.bankRouting}`);
  const mobileMoney = [settings.mobileMoneyNetwork, settings.mobileMoneyNumber].filter((part) => !isBlank(part)).join(" ");
  if (mobileMoney) lines.push(`Mobile money: ${mobileMoney}`);
  if (!isBlank(settings.paypalEmail)) lines.push(`PayPal: ${settings.paypalEmail}`);
  if (!isBlank(settings.paypalOrMobileMoney) && isBlank(mobileMoney) && isBlank(settings.paypalEmail)) {
    lines.push(settings.paypalOrMobileMoney);
  }
  if (!isBlank(settings.paymentNotes)) lines.push(settings.paymentNotes);
  return lines.join("\n");
}

export function applyCompanySettingsToInvoice(invoice, settings = {}) {
  return {
    ...invoice,
    currency: settings.defaultCurrency || invoice.currency || "USD",
    taxPercent: Number(settings.defaultTaxPercent ?? invoice.taxPercent ?? 0),
    terms: settings.invoiceTerms || invoice.terms || "",
    paymentDetails: buildPaymentDetailsFromSettings(settings),
  };
}

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
  const merged = { ...DEFAULT_COMPANY_SETTINGS, ...settings };
  if (isBlank(merged.email)) merged.email = user?.email || DEFAULT_COMPANY_SETTINGS.email;
  if (isBlank(merged.phone)) merged.phone = user?.phone || DEFAULT_COMPANY_SETTINGS.phone;
  if (isBlank(merged.invoiceLogo) && user?.profileImage) merged.invoiceLogo = user.profileImage;
  if (isBlank(merged.accountName)) merged.accountName = merged.legalName || "";
  if (isBlank(merged.mobileMoneyNumber) && !isBlank(merged.paypalOrMobileMoney) && isBlank(merged.paypalEmail)) {
    merged.mobileMoneyNumber = merged.paypalOrMobileMoney;
  }
  return merged;
}
