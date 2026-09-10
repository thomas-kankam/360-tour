import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Download, Edit3, Loader2, Mail, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "react-toastify";
import adminInvoicesServiceApi from "../../apis/AdminInvoicesServiceApi";
import adminClientsServiceApi from "../../apis/AdminClientsServiceApi";
import InvoicePreview from "../../components/invoices/InvoicePreview";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { loadCompanySettings, mergeCompanySettingsFromProfile } from "../../utils/adminCompanySettings";
import { downloadInvoicePdf } from "../../utils/invoicePdf";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [searching, setSearching] = useState(false);
  const [selectedClientEmail, setSelectedClientEmail] = useState("");
  const [selectedClientSlug, setSelectedClientSlug] = useState("");
  const [selectedClientName, setSelectedClientName] = useState("");
  const [isExternalRecipient, setIsExternalRecipient] = useState(false);
  const [sendMessage, setSendMessage] = useState("");

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
      setSelectedClientSlug(result.invoice.clientSlug || "");
      setSelectedClientName(result.invoice.billedTo?.name || "");
      setIsExternalRecipient(!result.invoice.clientSlug && Boolean(result.invoice.billedTo?.email));
    }
    load();
  }, [id, navigate, token]);

  useEffect(() => {
    if (!clientQuery.trim()) {
      setClientResults([]);
      setSearching(false);
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      setSearching(true);
      const result = await adminClientsServiceApi.listClients(token, {
        search: clientQuery.trim(),
        per_page: 8,
        page: 1,
      });
      setClientResults(result.items || []);
      setSearching(false);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [clientQuery, token]);

  const queryLooksLikeEmail = EMAIL_RE.test(clientQuery.trim());
  const exactEmailMatch = clientResults.some(
    (client) => (client.email || "").toLowerCase() === clientQuery.trim().toLowerCase(),
  );
  const showExternalOption = queryLooksLikeEmail && !exactEmailMatch;

  function selectRegisteredClient(client) {
    const slug = client.clientSlug || "";
    const email = client.email || "";
    const name = client.name || "";
    const phone = client.phoneNumber || client.phone || "";

    setSelectedClientEmail(email);
    setSelectedClientSlug(slug);
    setSelectedClientName(name);
    setIsExternalRecipient(false);
    setClientQuery("");
    setClientResults([]);
    setInvoice((prev) => ({
      ...prev,
      billedTo: {
        ...prev.billedTo,
        name: name || prev.billedTo?.name,
        email: email || prev.billedTo?.email,
        phone: phone || prev.billedTo?.phone,
      },
      clientSlug: slug || prev.clientSlug,
    }));
  }

  function selectExternalEmail(email) {
    const value = email.trim();
    setSelectedClientEmail(value);
    setSelectedClientSlug("");
    setSelectedClientName("");
    setIsExternalRecipient(true);
    setClientQuery("");
    setClientResults([]);
    setInvoice((prev) => ({
      ...prev,
      billedTo: {
        ...prev.billedTo,
        name: prev.billedTo?.name || value.split("@")[0],
        email: value,
      },
      clientSlug: "",
    }));
  }

  function handleRecipientEmailChange(value) {
    setSelectedClientEmail(value);
    if (!value.trim()) {
      setSelectedClientSlug("");
      setIsExternalRecipient(false);
      return;
    }

    const match = clientResults.find((client) => (client.email || "").toLowerCase() === value.trim().toLowerCase());
    if (match) {
      selectRegisteredClient(match);
      setSelectedClientEmail(value);
      return;
    }

    setSelectedClientSlug("");
    setIsExternalRecipient(EMAIL_RE.test(value.trim()));
  }

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
    if (!selectedClientEmail || !EMAIL_RE.test(selectedClientEmail.trim())) {
      toast.error("Enter a valid recipient email.");
      return;
    }

    setSending(true);
    await downloadInvoicePdf(invoice, company);
    const result = await adminInvoicesServiceApi.sendInvoice(token, id, {
      email: selectedClientEmail.trim(),
      client_slug: selectedClientSlug || undefined,
      attach_pdf: true,
      message: sendMessage.trim(),
    });
    setSending(false);

    if (!result.ok) {
      toast.error(result.reason || "Could not send invoice.");
      return;
    }

    toast.success(
      isExternalRecipient || !selectedClientSlug
        ? "Invoice emailed to external recipient."
        : result.reason || "Invoice sent to client.",
    );
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
          <p className="text-sm font-bold text-brand-ink">Send invoice</p>
          <p className="text-xs text-brand-muted">
            Search registered clients, or type any email to send to an external recipient who is not in your client base.
          </p>

          <input
            type="search"
            value={clientQuery}
            onChange={(e) => setClientQuery(e.target.value)}
            placeholder="Search clients or type an email…"
            className="h-10 w-full rounded-xl border border-brand-border/70 px-3 text-sm outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/15"
          />

          {searching ? <p className="text-xs text-brand-muted">Searching…</p> : null}

          {clientResults.length > 0 || showExternalOption ? (
            <ul className="max-h-56 space-y-1 overflow-auto rounded-xl border border-brand-border/50 p-2">
              {clientResults.map((client) => (
                <li key={client.clientSlug || client.id}>
                  <button
                    type="button"
                    onClick={() => selectRegisteredClient(client)}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-cream"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-brand-primary" aria-hidden />
                      <p className="font-semibold text-brand-ink">{client.name || "Unnamed client"}</p>
                      <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-primary">
                        Registered
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-brand-muted">
                      {client.email} · {client.phoneNumber || "No phone"}
                    </p>
                  </button>
                </li>
              ))}

              {showExternalOption ? (
                <li>
                  <button
                    type="button"
                    onClick={() => selectExternalEmail(clientQuery.trim())}
                    className="w-full rounded-lg border border-dashed border-brand-border/70 px-3 py-2 text-left text-sm hover:bg-amber-50"
                  >
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-3.5 w-3.5 text-amber-700" aria-hidden />
                      <p className="font-semibold text-brand-ink">Use {clientQuery.trim()}</p>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                        External
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-brand-muted">
                      This email is not part of your client base. They will receive the invoice by email only.
                    </p>
                  </button>
                </li>
              ) : null}
            </ul>
          ) : null}

          <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">
            Recipient email
            <input
              type="email"
              value={selectedClientEmail}
              onChange={(e) => handleRecipientEmailChange(e.target.value)}
              placeholder="client@example.com"
              className="mt-1.5 h-10 w-full rounded-xl border border-brand-border/70 px-3 text-sm outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/15"
            />
          </label>

          {selectedClientEmail ? (
            <div
              className={[
                "rounded-xl px-3 py-2 text-xs",
                selectedClientSlug && !isExternalRecipient
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "bg-amber-50 text-amber-900",
              ].join(" ")}
            >
              {selectedClientSlug && !isExternalRecipient ? (
                <p className="inline-flex items-center gap-1.5 font-semibold">
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  Registered client{selectedClientName ? ` · ${selectedClientName}` : ""} — email + in-app notification
                </p>
              ) : (
                <p className="inline-flex items-center gap-1.5 font-semibold">
                  <UserPlus className="h-3.5 w-3.5" aria-hidden />
                  External client — not in your client base. Email only (no dashboard account required).
                </p>
              )}
            </div>
          ) : null}

          <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">
            Message (optional)
            <textarea
              rows={3}
              value={sendMessage}
              onChange={(e) => setSendMessage(e.target.value)}
              placeholder="Add a note for the recipient…"
              className="mt-1.5 w-full rounded-xl border border-brand-border/70 px-3 py-2 text-sm outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/15"
            />
          </label>

          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary/90 disabled:opacity-60"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Mail className="h-4 w-4" aria-hidden />}
            {sending ? "Sending…" : "Send invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}
