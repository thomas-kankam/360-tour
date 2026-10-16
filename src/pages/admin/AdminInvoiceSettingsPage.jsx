import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Loader2, Save } from "lucide-react";
import { toast } from "react-toastify";
import adminCompanySettingsApi from "../../apis/AdminCompanySettingsApi";
import uploadServiceApi from "../../apis/UploadServiceApi";
import BankSearchSelect from "../../components/forms/BankSearchSelect";
import { useAuth } from "../../hooks/useAuth";
import { INVOICE_CURRENCIES, MOBILE_MONEY_NETWORKS } from "../../data/ghanaBanks";
import {
  buildPaymentDetailsFromSettings,
  loadCompanySettings,
  mergeCompanySettingsFromProfile,
} from "../../utils/adminCompanySettings";

function Field({ id, label, hint, children, className = "" }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-[11px] text-brand-muted">{hint}</p> : null}
    </div>
  );
}

const inputClass =
  "mt-2 w-full rounded-xl border-2 border-brand-border bg-white px-4 py-3 text-sm font-medium text-brand-ink outline-none transition-all focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15";

function Section({ kicker, title, children }) {
  return (
    <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">{kicker}</p>
      <h2 className="mt-1 text-xl font-bold text-brand-ink">{title}</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function AdminInvoiceSettingsPage() {
  const { token, user } = useAuth();
  const logoInputRef = useRef(null);
  const [form, setForm] = useState(() => mergeCompanySettingsFromProfile(user, loadCompanySettings()));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const paymentPreview = useMemo(() => buildPaymentDetailsFromSettings(form), [form]);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    adminCompanySettingsApi.getSettings(token).then((result) => {
      if (cancelled) return;
      if (result.settings) setForm(mergeCompanySettingsFromProfile(user, result.settings));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [token, user]);

  const update = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  async function handleLogo(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !token) return;
    const result = await uploadServiceApi.uploadImage(token, file, { variant: "logo", role: "admin" });
    if (!result.ok || !result.url) {
      toast.error(result.reason || "Could not upload logo.");
      return;
    }
    update("invoiceLogo", result.url);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const result = await adminCompanySettingsApi.saveSettings(token, form);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.reason || "Could not save invoice settings.");
      return;
    }
    if (result.settings) setForm(mergeCompanySettingsFromProfile(user, result.settings));
    toast.success("Invoice settings saved. New invoices will use these details.");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-brand-muted">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">Invoicing</p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-brand-ink">Invoice settings</h1>
          <p className="mt-2 max-w-2xl text-sm text-brand-muted">
            These details are filled in when you create an invoice. Saved values stay as you left them.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary inline-flex items-center gap-2 px-4 py-3 text-sm disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
          Save invoice settings
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Section kicker="Company" title="Business details">
            <Field id="legalName" label="Legal company name" className="sm:col-span-2">
              <input id="legalName" className={inputClass} value={form.legalName} onChange={(e) => update("legalName", e.target.value)} />
            </Field>
            <Field id="tagline" label="Tagline" className="sm:col-span-2">
              <input id="tagline" className={inputClass} value={form.tagline} onChange={(e) => update("tagline", e.target.value)} />
            </Field>
            <Field id="taxId" label="Tax ID / VAT number">
              <input id="taxId" className={inputClass} value={form.taxId} onChange={(e) => update("taxId", e.target.value)} />
            </Field>
            <Field id="website" label="Website">
              <input id="website" className={inputClass} value={form.website} onChange={(e) => update("website", e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">Invoice logo</p>
              <div className="mt-2 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-brand-border bg-brand-cream/40"
                >
                  {form.invoiceLogo ? (
                    <img src={form.invoiceLogo} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <Camera className="h-6 w-6 text-brand-muted" aria-hidden />
                  )}
                </button>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                <button type="button" onClick={() => logoInputRef.current?.click()} className="rounded-xl border border-brand-border px-3 py-1.5 text-xs font-semibold">
                  Upload logo
                </button>
                {form.invoiceLogo ? (
                  <button type="button" onClick={() => update("invoiceLogo", "")} className="text-xs font-semibold text-red-600">
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          </Section>

          <Section kicker="Contact" title="Billing contact">
            <Field id="companyEmail" label="Billing email">
              <input id="companyEmail" type="email" className={inputClass} value={form.email} onChange={(e) => update("email", e.target.value)} />
            </Field>
            <Field id="companyPhone" label="Billing phone">
              <input id="companyPhone" className={inputClass} value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </Field>
            <Field id="addressLine1" label="Address line 1" className="sm:col-span-2">
              <input id="addressLine1" className={inputClass} value={form.addressLine1} onChange={(e) => update("addressLine1", e.target.value)} />
            </Field>
            <Field id="addressLine2" label="Address line 2" className="sm:col-span-2">
              <input id="addressLine2" className={inputClass} value={form.addressLine2} onChange={(e) => update("addressLine2", e.target.value)} />
            </Field>
          </Section>

          <Section kicker="Accounts" title="Bank and mobile money">
            <Field id="bankName" label="Bank" hint="Search every licensed bank, or type a name that is not listed." className="sm:col-span-2">
              <BankSearchSelect
                value={form.bankName}
                onChange={({ name, swift }) => {
                  update("bankName", name);
                  update("bankRouting", swift);
                }}
              />
            </Field>
            <Field id="accountName" label="Account name">
              <input id="accountName" className={inputClass} value={form.accountName} onChange={(e) => update("accountName", e.target.value)} />
            </Field>
            <Field id="bankAccount" label="Account number / IBAN">
              <input id="bankAccount" className={inputClass} value={form.bankAccount} onChange={(e) => update("bankAccount", e.target.value)} />
            </Field>
            <Field id="bankRouting" label="SWIFT / routing" hint="Filled from the bank you pick. You can change it.">
              <input id="bankRouting" className={inputClass} value={form.bankRouting} onChange={(e) => update("bankRouting", e.target.value)} />
            </Field>
            <Field id="mobileMoneyNetwork" label="Mobile money network">
              <select id="mobileMoneyNetwork" className={inputClass} value={form.mobileMoneyNetwork} onChange={(e) => update("mobileMoneyNetwork", e.target.value)}>
                <option value="">None</option>
                {MOBILE_MONEY_NETWORKS.map((network) => (
                  <option key={network} value={network}>{network}</option>
                ))}
              </select>
            </Field>
            <Field id="mobileMoneyNumber" label="Mobile money number">
              <input id="mobileMoneyNumber" className={inputClass} value={form.mobileMoneyNumber} onChange={(e) => update("mobileMoneyNumber", e.target.value)} />
            </Field>
            <Field id="paypalEmail" label="PayPal email">
              <input id="paypalEmail" type="email" className={inputClass} value={form.paypalEmail} onChange={(e) => update("paypalEmail", e.target.value)} />
            </Field>
          </Section>

          <Section kicker="Invoice defaults" title="What new invoices start with">
            <Field id="defaultCurrency" label="Currency">
              <select id="defaultCurrency" className={inputClass} value={form.defaultCurrency} onChange={(e) => update("defaultCurrency", e.target.value)}>
                {INVOICE_CURRENCIES.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </Field>
            <Field id="defaultTaxPercent" label="Default tax %">
              <input id="defaultTaxPercent" type="number" min="0" step="0.01" className={inputClass} value={form.defaultTaxPercent} onChange={(e) => update("defaultTaxPercent", e.target.value)} />
            </Field>
            <Field id="paymentNotes" label="Payment notes" className="sm:col-span-2">
              <textarea id="paymentNotes" rows={3} className={inputClass} value={form.paymentNotes} onChange={(e) => update("paymentNotes", e.target.value)} />
            </Field>
            <Field id="invoiceTerms" label="Invoice terms" className="sm:col-span-2">
              <textarea id="invoiceTerms" rows={3} className={inputClass} value={form.invoiceTerms} onChange={(e) => update("invoiceTerms", e.target.value)} />
            </Field>
          </Section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">On the invoice</p>
            <h2 className="mt-1 text-lg font-bold text-brand-ink">{form.legalName || "Company name"}</h2>
            <div className="mt-3 space-y-1 text-sm text-brand-muted">
              {form.addressLine1 ? <p>{form.addressLine1}</p> : null}
              {form.addressLine2 ? <p>{form.addressLine2}</p> : null}
              {form.email ? <p>{form.email}</p> : null}
              {form.phone ? <p>{form.phone}</p> : null}
              {form.taxId ? <p>Tax ID: {form.taxId}</p> : null}
            </div>
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Payment block</p>
            <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-brand-ink">{paymentPreview || "Add an account to see it here."}</pre>
            <p className="mt-4 text-xs text-brand-muted">Currency {form.defaultCurrency || "USD"} · Tax {form.defaultTaxPercent || 0}%</p>
          </div>
        </aside>
      </div>
    </form>
  );
}
