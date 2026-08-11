const STORAGE_KEY = "360tours_admin_invoices";

export const INVOICE_STATUSES = ["draft", "sent", "paid", "cancelled"];

export function createEmptyLineItem() {
  return { id: crypto.randomUUID(), description: "", quantity: 1, rate: 0 };
}

export function createEmptyInvoice(overrides = {}) {
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

  return {
    id: crypto.randomUUID(),
    invoiceNumber: "",
    status: "draft",
    issueDate: today,
    dueDate: due,
    reference: "",
    project: "",
    currency: "USD",
    taxPercent: 0,
    discountPercent: 0,
    shipping: 0,
    notes: "",
    terms: "Thank you for your business.",
    paymentDetails: "",
    from: {},
    billedTo: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
    lineItems: [createEmptyLineItem()],
    clientSlug: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function calculateInvoiceTotals(invoice) {
  const lineItems = invoice.lineItems || [];
  const subtotal = lineItems.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    return sum + qty * rate;
  }, 0);

  const discountPercent = Number(invoice.discountPercent) || 0;
  const discountAmount = subtotal * (discountPercent / 100);
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxPercent = Number(invoice.taxPercent) || 0;
  const taxAmount = afterDiscount * (taxPercent / 100);
  const shipping = Number(invoice.shipping) || 0;
  const total = afterDiscount + taxAmount + shipping;

  return { subtotal, discountAmount, taxAmount, shipping, total };
}

function readLocalInvoices() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalInvoices(invoices) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

export function listLocalInvoices() {
  return readLocalInvoices().sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export function getLocalInvoice(id) {
  return readLocalInvoices().find((invoice) => invoice.id === id) || null;
}

export function saveLocalInvoice(invoice) {
  const items = readLocalInvoices();
  const index = items.findIndex((item) => item.id === invoice.id);
  const next = { ...invoice, updatedAt: new Date().toISOString() };
  if (index >= 0) items[index] = next;
  else items.unshift(next);
  writeLocalInvoices(items);
  return next;
}

export function deleteLocalInvoice(id) {
  writeLocalInvoices(readLocalInvoices().filter((invoice) => invoice.id !== id));
}

export function generateLocalInvoiceNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const count = readLocalInvoices().length + 1;
  return `INV-${date}-${String(count).padStart(4, "0")}`;
}

export function mapApiInvoice(raw) {
  if (!raw) return null;
  return {
    id: raw.id || raw.uuid || raw.slug,
    invoiceNumber: raw.invoice_number || raw.invoiceNumber || "",
    status: raw.status || "draft",
    issueDate: raw.issue_date || raw.issueDate || "",
    dueDate: raw.due_date || raw.dueDate || "",
    reference: raw.reference || "",
    project: raw.project || "",
    currency: raw.currency || "USD",
    taxPercent: Number(raw.tax_percent ?? raw.taxPercent ?? 0),
    discountPercent: Number(raw.discount_percent ?? raw.discountPercent ?? 0),
    shipping: Number(raw.shipping ?? 0),
    notes: raw.notes || "",
    terms: raw.terms || "",
    paymentDetails: raw.payment_details || raw.paymentDetails || "",
    from: raw.from || {},
    billedTo: {
      name: raw.billed_to_name || raw.billedTo?.name || "",
      email: raw.billed_to_email || raw.billedTo?.email || "",
      phone: raw.billed_to_phone || raw.billedTo?.phone || "",
      address: raw.billed_to_address || raw.billedTo?.address || "",
    },
    lineItems: (raw.line_items || raw.lineItems || []).map((item, index) => ({
      id: item.id || `line-${index}`,
      description: item.description || "",
      quantity: Number(item.quantity) || 0,
      rate: Number(item.rate) || 0,
    })),
    clientSlug: raw.client_slug || raw.clientSlug || "",
    createdAt: raw.created_at || raw.createdAt || "",
    updatedAt: raw.updated_at || raw.updatedAt || "",
  };
}

export function mapInvoiceForApi(invoice) {
  return {
    invoice_number: invoice.invoiceNumber || undefined,
    status: invoice.status,
    issue_date: invoice.issueDate,
    due_date: invoice.dueDate,
    reference: invoice.reference || "",
    project: invoice.project || "",
    currency: invoice.currency || "USD",
    tax_percent: Number(invoice.taxPercent) || 0,
    discount_percent: Number(invoice.discountPercent) || 0,
    shipping: Number(invoice.shipping) || 0,
    notes: invoice.notes || "",
    terms: invoice.terms || "",
    payment_details: invoice.paymentDetails || "",
    billed_to_name: invoice.billedTo?.name || "",
    billed_to_email: invoice.billedTo?.email || "",
    billed_to_phone: invoice.billedTo?.phone || "",
    billed_to_address: invoice.billedTo?.address || "",
    client_slug: invoice.clientSlug || "",
    line_items: (invoice.lineItems || []).map(({ description, quantity, rate }) => ({
      description: description || "",
      quantity: Number(quantity) || 0,
      rate: Number(rate) || 0,
    })),
  };
}

export function mapCompanySettingsForApi(settings) {
  return {
    legal_name: settings.legalName,
    tagline: settings.tagline,
    email: settings.email,
    phone: settings.phone,
    website: settings.website,
    address_line_1: settings.addressLine1,
    address_line_2: settings.addressLine2,
    tax_id: settings.taxId,
    invoice_logo: settings.invoiceLogo,
    bank_name: settings.bankName,
    bank_account: settings.bankAccount,
    bank_routing: settings.bankRouting,
    payment_notes: settings.paymentNotes,
    paypal_or_mobile_money: settings.paypalOrMobileMoney,
    invoice_terms: settings.invoiceTerms,
    default_currency: settings.defaultCurrency,
    default_tax_percent: Number(settings.defaultTaxPercent) || 0,
  };
}

export function mapApiCompanySettings(raw) {
  if (!raw) return null;
  return {
    legalName: raw.legal_name ?? raw.legalName ?? "",
    tagline: raw.tagline ?? "",
    email: raw.email ?? "",
    phone: raw.phone ?? "",
    website: raw.website ?? "",
    addressLine1: raw.address_line_1 ?? raw.addressLine1 ?? "",
    addressLine2: raw.address_line_2 ?? raw.addressLine2 ?? "",
    taxId: raw.tax_id ?? raw.taxId ?? "",
    invoiceLogo: raw.invoice_logo ?? raw.invoiceLogo ?? "",
    bankName: raw.bank_name ?? raw.bankName ?? "",
    bankAccount: raw.bank_account ?? raw.bankAccount ?? "",
    bankRouting: raw.bank_routing ?? raw.bankRouting ?? "",
    paymentNotes: raw.payment_notes ?? raw.paymentNotes ?? "",
    paypalOrMobileMoney: raw.paypal_or_mobile_money ?? raw.paypalOrMobileMoney ?? "",
    invoiceTerms: raw.invoice_terms ?? raw.invoiceTerms ?? "",
    defaultCurrency: raw.default_currency ?? raw.defaultCurrency ?? "USD",
    defaultTaxPercent: Number(raw.default_tax_percent ?? raw.defaultTaxPercent ?? 0),
  };
}
