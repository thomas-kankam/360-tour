import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { FileText, Loader2, Plus, Search } from "lucide-react";
import { toast } from "react-toastify";
import adminInvoicesServiceApi from "../../apis/AdminInvoicesServiceApi";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";

const STATUS_STYLES = {
  draft: "bg-brand-cream text-brand-muted",
  sent: "bg-sky-100 text-sky-700",
  paid: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminInvoicesPage() {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    const result = await adminInvoicesServiceApi.listInvoices(token, { search });
    setLoading(false);
    if (!result.ok && result.source !== "local") {
      toast.error(result.reason || "Could not load invoices.");
    }
    setInvoices(result.items || []);
  }, [token, search]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-green">Billing</p>
          <h1 className="mt-1 text-2xl font-bold text-brand-ink sm:text-3xl">Invoices</h1>
          <p className="mt-2 max-w-2xl text-sm text-brand-muted">
            Create professional invoices, download PDFs, and send them directly to clients.
          </p>
        </div>
        <Link
          to={ROUTES.admin.invoiceNew}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-green/90"
        >
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
          New invoice
        </Link>
      </div>

      <div className="rounded-2xl border border-brand-border/60 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice no., client, or email…"
            className="h-10 w-full rounded-xl border border-brand-border/70 bg-white pl-10 pr-4 text-sm outline-none focus:border-brand-green/50 focus:ring-2 focus:ring-brand-green/15"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-brand-muted">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-border/70 bg-white px-6 py-16 text-center">
          <FileText className="mx-auto h-8 w-8 text-brand-muted/40" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-brand-ink">No invoices yet</p>
          <p className="mt-1 text-sm text-brand-muted">Create your first invoice to bill a client.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand-border/60 bg-white shadow-sm">
          <table className="min-w-full">
            <thead className="bg-brand-cream/60 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">
              <tr>
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Issue date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t border-brand-border/30 hover:bg-brand-cream/30">
                  <td className="px-5 py-4 text-sm font-semibold text-brand-ink">{invoice.invoiceNumber || "Draft"}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-brand-ink">{invoice.billedTo?.name || "—"}</p>
                    <p className="text-xs text-brand-muted">{invoice.billedTo?.email || ""}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-brand-muted">{invoice.issueDate || "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[invoice.status] || STATUS_STYLES.draft}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link to={ROUTES.admin.invoiceDetail(invoice.id)} className="text-sm font-semibold text-brand-green hover:underline">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
