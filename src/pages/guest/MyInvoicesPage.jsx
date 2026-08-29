import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, FileText, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Container from "../../components/layout/Container";
import clientInvoicesServiceApi from "../../apis/ClientInvoicesServiceApi";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";

export default function MyInvoicesPage() {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestType, setRequestType] = useState("invoice");
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [invoiceResult, requestResult] = await Promise.all([
        clientInvoicesServiceApi.listInvoices(token),
        clientInvoicesServiceApi.listRequests(token),
      ]);
      setLoading(false);
      setInvoices(invoiceResult.items ?? []);
      setRequests(requestResult.items ?? []);
    }
    if (token) load();
  }, [token]);

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
    toast.success("Request sent. We will respond by email and in your notifications.");
    setRequestMessage("");
    const requestResult = await clientInvoicesServiceApi.listRequests(token);
    setRequests(requestResult.items ?? []);
  }

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">Billing</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-brand-primary">My invoices</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          Invoices sent by 360 Tours appear here. You can also request a quote or invoice below.
        </p>

        {loading ? (
          <div className="flex justify-center py-20 text-brand-muted">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

            {!loading && invoices.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-brand-border/70 bg-white px-6 py-12 text-center text-sm text-brand-muted">
                No invoices yet. When admin sends one to your email, it will appear here too.
              </div>
            ) : null}

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <form onSubmit={handleRequestSubmit} className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-brand-ink">Request a quote or invoice</h2>
                <p className="mt-1 text-sm text-brand-muted">Tell us what you need and we will respond in notifications and by email.</p>
                <div className="mt-4 flex gap-2">
                  {["invoice", "quote"].map((type) => (
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
                  {submitting ? "Sending…" : "Submit request"}
                </button>
              </form>

              <div className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-brand-ink">Your requests</h2>
                {requests.length === 0 ? (
                  <p className="mt-3 text-sm text-brand-muted">No requests submitted yet.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {requests.map((request) => (
                      <li key={request.id} className="rounded-xl border border-brand-border/50 px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold capitalize text-brand-ink">{request.type} request</p>
                          <span className="text-[10px] font-bold uppercase text-brand-muted">{request.status}</span>
                        </div>
                        <p className="mt-1 text-sm text-brand-muted">{request.message}</p>
                        {request.admin_response ? (
                          <p className="mt-2 rounded-lg bg-brand-cream px-3 py-2 text-sm text-brand-ink">{request.admin_response}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
