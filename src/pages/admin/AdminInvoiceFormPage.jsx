import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import adminInvoicesServiceApi from "../../apis/AdminInvoicesServiceApi";
import InvoicePreview from "../../components/invoices/InvoicePreview";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { loadCompanySettings, mergeCompanySettingsFromProfile } from "../../utils/adminCompanySettings";
import { createEmptyInvoice, createEmptyLineItem } from "../../utils/invoiceHelpers";

function Field({ label, children, className = "" }) {
  return (
    <label className={["block", className].join(" ")}>
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass =
  "h-10 w-full rounded-xl border border-brand-border/70 bg-white px-3 text-sm outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/15";

export default function AdminInvoiceFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const company = useMemo(() => mergeCompanySettingsFromProfile(user, loadCompanySettings()), [user]);

  const [invoice, setInvoice] = useState(() => createEmptyInvoice());
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      adminInvoicesServiceApi.generateInvoiceNumber(token).then((result) => {
        if (result.invoiceNumber) {
          setInvoice((prev) => ({ ...prev, invoiceNumber: result.invoiceNumber }));
        }
      });
      return;
    }

    async function load() {
      setLoading(true);
      const result = await adminInvoicesServiceApi.getInvoice(token, id);
      setLoading(false);
      if (!result.invoice) {
        toast.error("Invoice not found.");
        navigate(ROUTES.admin.invoices);
        return;
      }
      setInvoice(result.invoice);
    }

    load();
  }, [id, isEdit, navigate, token]);

  function patch(values) {
    setInvoice((prev) => ({ ...prev, ...values }));
  }

  function patchBilledTo(values) {
    setInvoice((prev) => ({ ...prev, billedTo: { ...prev.billedTo, ...values } }));
  }

  function updateLineItem(index, values) {
    setInvoice((prev) => {
      const lineItems = [...prev.lineItems];
      lineItems[index] = { ...lineItems[index], ...values };
      return { ...prev, lineItems };
    });
  }

  async function handleSave() {
    setSaving(true);
    const payload = { ...invoice };
    const result = isEdit
      ? await adminInvoicesServiceApi.updateInvoice(token, id, payload)
      : await adminInvoicesServiceApi.createInvoice(token, payload);
    setSaving(false);

    if (!result.ok && !result.invoice) {
      toast.error(result.reason || "Could not save invoice.");
      return;
    }

    toast.success(result.reason || "Invoice saved.");
    navigate(ROUTES.admin.invoiceDetail(result.invoice.id));
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-brand-muted">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-primary">Invoice generator</p>
          <h1 className="mt-1 text-2xl font-bold text-brand-ink sm:text-3xl">{isEdit ? "Edit invoice" : "Create invoice"}</h1>
        </div>
        <div className="flex gap-2">
          <Link to={ROUTES.admin.invoices} className="rounded-xl border border-brand-border/70 px-4 py-2 text-sm font-semibold text-brand-muted hover:bg-brand-cream">
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 disabled:opacity-60"
          >
            <Save className="h-4 w-4" aria-hidden />
            {saving ? "Saving…" : "Save invoice"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5 rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Invoice number">
              <input className={inputClass} value={invoice.invoiceNumber} readOnly />
            </Field>
            <Field label="Status">
              <select className={inputClass} value={invoice.status} onChange={(e) => patch({ status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </Field>
            <Field label="Issue date">
              <input type="date" className={inputClass} value={invoice.issueDate} onChange={(e) => patch({ issueDate: e.target.value })} />
            </Field>
            <Field label="Due date">
              <input type="date" className={inputClass} value={invoice.dueDate} onChange={(e) => patch({ dueDate: e.target.value })} />
            </Field>
            <Field label="Reference">
              <input className={inputClass} value={invoice.reference} onChange={(e) => patch({ reference: e.target.value })} />
            </Field>
            <Field label="Currency">
              <select className={inputClass} value={invoice.currency} onChange={(e) => patch({ currency: e.target.value })}>
                {["USD", "EUR", "GBP", "GHS"].map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="border-t border-brand-border/40 pt-5">
            <p className="text-sm font-bold text-brand-ink">Billed to</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Client name">
                <input className={inputClass} value={invoice.billedTo.name} onChange={(e) => patchBilledTo({ name: e.target.value })} />
              </Field>
              <Field label="Email">
                <input type="email" className={inputClass} value={invoice.billedTo.email} onChange={(e) => patchBilledTo({ email: e.target.value })} />
              </Field>
              <Field label="Phone">
                <input className={inputClass} value={invoice.billedTo.phone} onChange={(e) => patchBilledTo({ phone: e.target.value })} />
              </Field>
              <Field label="Address">
                <input className={inputClass} value={invoice.billedTo.address} onChange={(e) => patchBilledTo({ address: e.target.value })} />
              </Field>
            </div>
          </div>

          <div className="border-t border-brand-border/40 pt-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-brand-ink">Line items</p>
              <button
                type="button"
                onClick={() => patch({ lineItems: [...invoice.lineItems, createEmptyLineItem()] })}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden /> Add item
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {invoice.lineItems.map((item, index) => (
                <div key={item.id} className="grid gap-3 rounded-xl border border-brand-border/50 bg-brand-cream/30 p-3 sm:grid-cols-[1fr_5rem_6rem_auto]">
                  <input
                    className={inputClass}
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, { description: e.target.value })}
                  />
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, { quantity: e.target.value })}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClass}
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => updateLineItem(index, { rate: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => patch({ lineItems: invoice.lineItems.filter((_, i) => i !== index) })}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                    aria-label="Remove line item"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 border-t border-brand-border/40 pt-5">
            <Field label="Tax %">
              <input type="number" className={inputClass} value={invoice.taxPercent} onChange={(e) => patch({ taxPercent: e.target.value })} />
            </Field>
            <Field label="Discount %">
              <input type="number" className={inputClass} value={invoice.discountPercent} onChange={(e) => patch({ discountPercent: e.target.value })} />
            </Field>
            <Field label="Shipping">
              <input type="number" className={inputClass} value={invoice.shipping} onChange={(e) => patch({ shipping: e.target.value })} />
            </Field>
          </div>

          <Field label="Notes">
            <textarea className={`${inputClass} min-h-[90px] py-2`} value={invoice.notes} onChange={(e) => patch({ notes: e.target.value })} />
          </Field>
          <Field label="Payment details">
            <textarea className={`${inputClass} min-h-[90px] py-2`} value={invoice.paymentDetails} onChange={(e) => patch({ paymentDetails: e.target.value })} />
          </Field>
          <Field label="Terms">
            <textarea className={`${inputClass} min-h-[70px] py-2`} value={invoice.terms} onChange={(e) => patch({ terms: e.target.value })} />
          </Field>
        </div>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-brand-muted">Live preview</p>
          <InvoicePreview invoice={invoice} company={company} />
        </div>
      </div>
    </div>
  );
}
