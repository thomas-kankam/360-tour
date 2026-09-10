import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Download, FileText, Loader2, MessageSquareQuote } from "lucide-react";
import { toast } from "react-toastify";
import Container from "../../components/layout/Container";
import AdminPagination from "../../components/admin/AdminPagination";
import clientInvoicesServiceApi from "../../apis/ClientInvoicesServiceApi";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  responded: "bg-emerald-100 text-emerald-800",
  closed: "bg-brand-cream text-brand-muted",
};

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function MyInvoicesPage() {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [requestPagination, setRequestPagination] = useState(null);
  const [requestPage, setRequestPage] = useState(1);
  const [requestTypeFilter, setRequestTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestType, setRequestType] = useState("quote");
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    async function loadInvoices() {
      setLoading(true);
      const invoiceResult = await clientInvoicesServiceApi.listInvoices(token);
      setInvoices(invoiceResult.items ?? []);
      setLoading(false);
    }
    if (token) loadInvoices();
  }, [token]);

  useEffect(() => {
    async function loadRequests() {
      setRequestsLoading(true);
      const requestResult = await clientInvoicesServiceApi.listRequests(token, {
        page: requestPage,
        perPage: 8,
        type: requestTypeFilter === "all" ? undefined : requestTypeFilter,
      });
      setRequests(requestResult.items ?? []);
      setRequestPagination(requestResult.pagination);
      setRequestsLoading(false);
    }
    if (token) loadRequests();
  }, [token, requestPage, requestTypeFilter]);

  async function handleRequestSubmit(e) {
    e.preventDefault();
    if (!requestMessage.trim()) {
      toast.error("Please describe what you need.");
      return;
    }
    setSubmitting(true);
    const result = await clientInvoicesServiceApi.submitRequest(token, {
      type: requestType,
      message: requestMessage.trim(),
    });
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.reason || "Could not submit request.");
      return;
    }
    toast.success("Request sent. We’ll reply by email and in your notifications.");
    setRequestMessage("");
    setRequestPage(1);
    setRequestTypeFilter("all");
    const requestResult = await clientInvoicesServiceApi.listRequests(token, { page: 1, perPage: 8 });
    setRequests(requestResult.items ?? []);
    setRequestPagination(requestResult.pagination);
  }

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">Billing</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-brand-primary">Quotes & invoices</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          Request a quote, track responses with attachments, and open invoices sent to your account.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleRequestSubmit} className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-brand-ink">
              <MessageSquareQuote className="h-5 w-5 text-brand-primary" aria-hidden />
              Request a quote or invoice
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Tell us what you need. Admin will respond with a message and can attach a quote file for download.
            </p>
            <div className="mt-4 flex gap-2">
              {["quote", "invoice"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRequestType(type)}
                  className={[
                    "rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide",
                    requestType === type ? "bg-brand-primary text-white" : "bg-brand-cream text-brand-muted",
                  ].join(" ")}
                >
                  {type}
                </button>
              ))}
            </div>
            <textarea
              rows={4}
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Describe your trip, dates, group size, or billing needs…"
              className="mt-4 w-full rounded-xl border border-brand-border/70 px-4 py-3 text-sm outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/15"
            />
            <button type="submit" disabled={submitting} className="btn-primary mt-4 px-5 py-2.5 text-sm disabled:opacity-60">
              {submitting ? "Sending…" : `Submit ${requestType} request`}
            </button>
          </form>

          <div className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-brand-ink">Your requests</h2>
              <div className="flex gap-1.5">
                {[
                  { id: "all", label: "All" },
                  { id: "quote", label: "Quotes" },
                  { id: "invoice", label: "Invoices" },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => {
                      setRequestTypeFilter(filter.id);
                      setRequestPage(1);
                    }}
                    className={[
                      "rounded-full px-3 py-1 text-[11px] font-bold uppercase",
                      requestTypeFilter === filter.id ? "bg-brand-primary text-white" : "bg-brand-cream text-brand-muted",
                    ].join(" ")}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {requestsLoading ? (
              <div className="flex justify-center py-10 text-brand-muted">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              </div>
            ) : requests.length === 0 ? (
              <p className="mt-6 text-sm text-brand-muted">No requests yet. Submit one on the left to get started.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {requests.map((request) => (
                  <li key={request.id}>
                    <Link
                      to={ROUTES.myInvoiceRequestDetail(request.id)}
                      className="block rounded-xl border border-brand-border/50 px-4 py-3 transition hover:border-brand-primary/30 hover:bg-brand-cream/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold capitalize text-brand-ink">{request.type} request</p>
                        <span
                          className={[
                            "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                            STATUS_STYLES[request.status] || STATUS_STYLES.pending,
                          ].join(" ")}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-brand-muted">{request.message}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-brand-muted">
                        <span>{formatDate(request.created_at)}</span>
                        {request.has_attachment || request.attachment_url ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-brand-primary">
                            <Download className="h-3 w-3" aria-hidden /> File attached
                          </span>
                        ) : null}
                        {request.status === "responded" ? (
                          <span className="font-semibold text-emerald-700">Response emailed</span>
                        ) : null}
                        <span className="inline-flex items-center gap-1 font-semibold text-brand-primary">
                          View <ArrowRight className="h-3 w-3" aria-hidden />
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {requestPagination?.totalPages > 1 ? (
              <AdminPagination
                className="mt-4"
                page={requestPagination.page || requestPage}
                totalPages={requestPagination.totalPages}
                totalItems={requestPagination.totalItems}
                rangeStart={requestPagination.rangeStart}
                rangeEnd={requestPagination.rangeEnd}
                onPageChange={setRequestPage}
              />
            ) : null}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold text-brand-ink">Sent invoices</h2>
          <p className="mt-1 text-sm text-brand-muted">Formal invoices emailed to you by 360 Tours.</p>

          {loading ? (
            <div className="flex justify-center py-16 text-brand-muted">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {invoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    to={ROUTES.myInvoiceDetail(invoice.id)}
                    className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <FileText className="h-8 w-8 text-brand-primary" aria-hidden />
                      <span className="rounded-full bg-brand-accent/25 px-2.5 py-0.5 text-[10px] font-bold uppercase text-brand-primary">
                        {invoice.status}
                      </span>
                    </div>
                    <p className="mt-4 font-mono text-sm font-bold text-brand-ink">{invoice.invoiceNumber}</p>
                    <p className="mt-1 text-sm text-brand-muted">{invoice.project || invoice.billedTo?.name}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary">
                      View invoice <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </Link>
                ))}
              </div>

              {invoices.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-brand-border/70 bg-white px-6 py-12 text-center text-sm text-brand-muted">
                  No invoices yet. When admin sends one to your email, it will appear here.
                </div>
              ) : null}
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
