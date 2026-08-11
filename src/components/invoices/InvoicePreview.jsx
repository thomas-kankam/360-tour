import { calculateInvoiceTotals } from "../../utils/invoiceHelpers";
import { loadCompanySettings } from "../../utils/adminCompanySettings";

function formatMoney(amount, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(amount) || 0);
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
}

export default function InvoicePreview({ invoice, company = loadCompanySettings() }) {
  const totals = calculateInvoiceTotals(invoice);

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border/60 bg-white shadow-[0_20px_60px_-30px_rgba(21,67,96,0.35)]">
      <div className="h-2 bg-brand-primary" />
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-brand-border/40 pb-6">
          <div className="flex items-start gap-4">
            {company.invoiceLogo ? (
              <img src={company.invoiceLogo} alt="" className="h-14 w-14 rounded-xl object-cover ring-1 ring-brand-border/50" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-cream text-xs font-bold text-brand-primary">
                360
              </div>
            )}
            <div>
              <p className="text-lg font-bold text-brand-primary">{company.legalName}</p>
              <p className="mt-1 text-xs text-brand-muted">{company.tagline}</p>
              <div className="mt-2 space-y-0.5 text-xs text-brand-muted">
                {company.addressLine1 ? <p>{company.addressLine1}</p> : null}
                {company.addressLine2 ? <p>{company.addressLine2}</p> : null}
                {company.email ? <p>{company.email}</p> : null}
                {company.phone ? <p>{company.phone}</p> : null}
                {company.taxId ? <p>Tax ID: {company.taxId}</p> : null}
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold tracking-tight text-brand-primary">INVOICE</p>
            <p className="mt-2 text-sm font-semibold text-brand-ink">{invoice.invoiceNumber || "Draft"}</p>
            <p className="mt-1 text-xs text-brand-muted">Issue: {invoice.issueDate || "—"}</p>
            <p className="text-xs text-brand-muted">Due: {invoice.dueDate || "—"}</p>
            {invoice.reference ? <p className="mt-1 text-xs text-brand-muted">Ref: {invoice.reference}</p> : null}
          </div>
        </div>

        <div className="grid gap-6 py-6 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted">From</p>
            <p className="mt-2 text-sm font-semibold text-brand-ink">{company.legalName}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted">Billed to</p>
            <div className="mt-2 space-y-0.5 text-sm text-brand-ink">
              <p className="font-semibold">{invoice.billedTo?.name || "Client name"}</p>
              {invoice.billedTo?.email ? <p className="text-brand-muted">{invoice.billedTo.email}</p> : null}
              {invoice.billedTo?.phone ? <p className="text-brand-muted">{invoice.billedTo.phone}</p> : null}
              {invoice.billedTo?.address ? <p className="text-brand-muted">{invoice.billedTo.address}</p> : null}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-brand-border/50">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-cream/70 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">
              <tr>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.lineItems || []).map((item) => {
                const amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                return (
                  <tr key={item.id} className="border-t border-brand-border/30">
                    <td className="px-4 py-3 text-brand-ink">{item.description || "Item"}</td>
                    <td className="px-4 py-3 text-brand-muted">{item.quantity}</td>
                    <td className="px-4 py-3 text-brand-muted">{formatMoney(item.rate, invoice.currency)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-brand-ink">
                      {formatMoney(amount, invoice.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-brand-muted">
              <span>Subtotal</span>
              <span>{formatMoney(totals.subtotal, invoice.currency)}</span>
            </div>
            {totals.discountAmount ? (
              <div className="flex justify-between text-brand-muted">
                <span>Discount</span>
                <span>- {formatMoney(totals.discountAmount, invoice.currency)}</span>
              </div>
            ) : null}
            {totals.taxAmount ? (
              <div className="flex justify-between text-brand-muted">
                <span>Tax ({invoice.taxPercent}%)</span>
                <span>{formatMoney(totals.taxAmount, invoice.currency)}</span>
              </div>
            ) : null}
            {totals.shipping ? (
              <div className="flex justify-between text-brand-muted">
                <span>Shipping</span>
                <span>{formatMoney(totals.shipping, invoice.currency)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-brand-border/50 pt-2 text-base font-bold text-brand-primary">
              <span>Total</span>
              <span>{formatMoney(totals.total, invoice.currency)}</span>
            </div>
          </div>
        </div>

        {(invoice.notes || company.paymentNotes) && (
          <div className="mt-6 rounded-xl bg-brand-cream/50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Notes</p>
            <p className="mt-2 text-sm text-brand-ink">{invoice.notes || company.paymentNotes}</p>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-brand-border/40 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Payment details</p>
            <div className="mt-2 space-y-1 text-xs text-brand-ink">
              {invoice.paymentDetails ? <p>{invoice.paymentDetails}</p> : null}
              {company.bankName ? <p>Bank: {company.bankName}</p> : null}
              {company.bankAccount ? <p>Account: {company.bankAccount}</p> : null}
              {company.bankRouting ? <p>Routing / SWIFT: {company.bankRouting}</p> : null}
              {company.paypalOrMobileMoney ? <p>{company.paypalOrMobileMoney}</p> : null}
            </div>
          </div>
          <div className="rounded-xl border border-brand-border/40 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Terms</p>
            <p className="mt-2 text-xs text-brand-muted">{invoice.terms || company.invoiceTerms}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
