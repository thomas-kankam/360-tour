import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Container from "../../components/layout/Container";
import clientInvoicesServiceApi from "../../apis/ClientInvoicesServiceApi";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  responded: "bg-emerald-100 text-emerald-800",
  closed: "bg-brand-cream text-brand-muted",
};

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function ClientInvoiceRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await clientInvoicesServiceApi.getRequest(token, id);
      setLoading(false);
      if (!result.request) {
        toast.error(result.reason || "Request not found.");
        navigate(ROUTES.myInvoices);
        return;
      }
      setRequest(result.request);
    }
    if (token) load();
  }, [id, navigate, token]);

  if (loading || !request) {
    return (
      <div className="flex justify-center py-20 text-brand-muted">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      </div>
    );
  }

  const hasAttachment = Boolean(request.attachment_url || request.has_attachment);

  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        <Link to={ROUTES.myInvoices} className="text-sm font-semibold text-brand-primary hover:underline">
          ← Back to quotes & invoices
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
              {request.type} request
            </p>
            <h1 className="mt-1 text-2xl font-bold capitalize text-brand-ink">{request.type} details</h1>
            <p className="mt-1 text-sm text-brand-muted">Submitted {formatDate(request.created_at)}</p>
          </div>
          <span
            className={[
              "rounded-full px-3 py-1 text-[11px] font-bold uppercase",
              STATUS_STYLES[request.status] || STATUS_STYLES.pending,
            ].join(" ")}
          >
            {request.status}
          </span>
        </div>

        <div className="mt-8 space-y-4">
          <article className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Your message</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-brand-ink">{request.message}</p>
          </article>

          <article className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Admin response</p>
            {request.admin_response ? (
              <>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-brand-ink">{request.admin_response}</p>
                <p className="mt-3 text-xs text-brand-muted">
                  A copy of this response was also sent to your email
                  {hasAttachment ? " with the attachment available here for download" : ""}.
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-brand-muted">No response yet. You’ll get an email and notification when admin replies.</p>
            )}
          </article>

          {hasAttachment ? (
            <article className="rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-primary shadow-sm">
                    <FileText className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-brand-ink">Attached {request.type} file</p>
                    <p className="mt-0.5 text-xs text-brand-muted">{request.attachment_name || "Downloadable document"}</p>
                  </div>
                </div>
                <a
                  href={request.attachment_url}
                  target="_blank"
                  rel="noreferrer"
                  download={request.attachment_name || undefined}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary/90"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Download
                </a>
              </div>
            </article>
          ) : null}

          {request.invoice_uuid ? (
            <Link
              to={ROUTES.myInvoiceDetail(request.invoice_uuid)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline"
            >
              Open linked invoice
            </Link>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
