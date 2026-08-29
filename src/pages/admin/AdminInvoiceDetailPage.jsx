import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Download, Edit3, Loader2, Mail, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import adminInvoicesServiceApi from "../../apis/AdminInvoicesServiceApi";
import adminClientsServiceApi from "../../apis/AdminClientsServiceApi";
import InvoicePreview from "../../components/invoices/InvoicePreview";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { loadCompanySettings, mergeCompanySettingsFromProfile } from "../../utils/adminCompanySettings";
import { downloadInvoicePdf } from "../../utils/invoicePdf";

export default function AdminInvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const company = useMemo(() => mergeCompanySettingsFromProfile(user, loadCompanySettings()), [user]);

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [clientQuery, setClientQuery] = useState("");
  const [clientResults, setClientResults] = useState([]);
  const [selectedClientEmail, setSelectedClientEmail] = useState("");

  useEffect(() => {
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
      setSelectedClientEmail(result.invoice.billedTo?.email || "");
    }
    load();
  }, [id, navigate, token]);

  useEffect(() => {
    if (!clientQuery.trim()) {
      setClientResults([]);
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      const result = await adminClientsServiceApi.listClients(token, { search: clientQuery.trim(), limit: 8 });
      setClientResults(result.items || []);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [clientQuery, token]);

  async function handleDelete() {
    const result = await adminInvoicesServiceApi.deleteInvoice(token, id);
    if (!result.ok) {
      toast.error(result.reason || "Could not delete invoice.");
      return;
    }
    toast.success("Invoice deleted.");
    navigate(ROUTES.admin.invoices);
  }

  async function handleSend() {
    if (!selectedClientEmail) {
      toast.error("Select a client email to send the invoice.");
      return;
    }

    setSending(true);
    await downloadInvoicePdf(invoice, company);
    const result = await adminInvoicesServiceApi.sendInvoice(token, id, {
      email: selectedClientEmail,
      attach_pdf: true,
    });
    setSending(false);

    if (!result.ok) {
      toast.info("PDF downloaded. Email API unavailable — use your mail client to attach the downloaded PDF.");
      window.location.href = `mailto:${encodeURIComponent(selectedClientEmail)}?subject=${encodeURIComponent(`Invoice ${invoice.invoiceNumber}`)}&body=${encodeURIComponent("Please find your invoice attached.")}`;
      return;
    }

    toast.success(result.reason || "Invoice sent to client.");
    setInvoice((prev) => ({ ...prev, status: "sent" }));
  }

  if (loading || !invoice) {
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-primary">Invoice</p>
          <h1 className="mt-1 text-2xl font-bold text-brand-ink sm:text-3xl">{invoice.invoiceNumber}</h1>
          <p className="mt-2 text-sm text-brand-muted">{invoice.billedTo?.name || "No client assigned"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={ROUTES.admin.invoices} className="rounded-xl border border-brand-border/70 px-4 py-2 text-sm font-semibold text-brand-muted hover:bg-brand-cream">
            Back
          </Link>
          <Link to={ROUTES.admin.invoiceEdit(id)} className="inline-flex items-center gap-2 rounded-xl border border-brand-border/70 px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-brand-cream">
            <Edit3 className="h-4 w-4" aria-hidden /> Edit
          </Link>
          <button type="button" onClick={() => void downloadInvoicePdf(invoice, company)} className="inline-flex items-center gap-2 rounded-xl border border-brand-border/70 px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-brand-cream">
            <Download className="h-4 w-4" aria-hidden /> Download PDF
          </button>
          <button type="button" onClick={handleDelete} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" aria-hidden /> Delete
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <InvoicePreview invoice={invoice} company={company} />

        <div className="space-y-4 rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-brand-ink">Send to client</p>
          <p className="text-xs text-brand-muted">Search by name, email, or phone. The invoice PDF will be attached when the email service is available.</p>

          <input
            type="search"
            value={clientQuery}
            onChange={(e) => setClientQuery(e.target.value)}
            placeholder="Search clients…"
            className="h-10 w-full rounded-xl border border-brand-border/70 px-3 text-sm outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/15"
          />

          {clientResults.length > 0 ? (
            <ul className="max-h-48 space-y-1 overflow-auto rounded-xl border border-brand-border/50 p-2">
              {clientResults.map((client) => (
                <li key={client.slug || client.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClientEmail(client.email || "");
                      setInvoice((prev) => ({
                        ...prev,
                        billedTo: {
                          ...prev.billedTo,
                          name: client.name || prev.billedTo?.name,
                          email: client.email || prev.billedTo?.email,
                          phone: client.phone || prev.billedTo?.phone,
                        },
                        clientSlug: client.slug || prev.clientSlug,
                      }));
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-cream"
                  >
                    <p className="font-semibold text-brand-ink">{client.name}</p>
                    <p className="text-xs text-brand-muted">{client.email} · {client.phone || "No phone"}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">
            Recipient email
            <input
              type="email"
              value={selectedClientEmail}
              onChange={(e) => setSelectedClientEmail(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-brand-border/70 px-3 text-sm outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/15"
            />
          </label>

          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary/90 disabled:opacity-60"
          >
            <Mail className="h-4 w-4" aria-hidden />
            {sending ? "Sending…" : "Send invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}
