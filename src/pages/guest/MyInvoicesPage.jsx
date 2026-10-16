import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Download, FileText, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import AdminPagination from "../../components/admin/AdminPagination";
import Container from "../../components/layout/Container";
import adminCompanySettingsApi from "../../apis/AdminCompanySettingsApi";
import clientInvoicesServiceApi from "../../apis/ClientInvoicesServiceApi";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { loadCompanySettings, mergeCompanySettingsFromProfile } from "../../utils/adminCompanySettings";
import { downloadInvoicePdf } from "../../utils/invoicePdf";

const PAGE_SIZE = 6;

function invoiceStatusLabel(status) {
  if (status === "paid") return "Paid";
  if (status === "sent") return "Emailed";
  return status || "Emailed";
}

export default function MyInvoicesPage() {
  const { token } = useAuth();
  const [company, setCompany] = useState(() => loadCompanySettings());
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  const paginationMeta = pagination ?? { page, totalPages: 1, totalItems: 0, rangeStart: 0, rangeEnd: 0 };

  useEffect(() => {
    let cancelled = false;
    adminCompanySettingsApi.getPublicSettings().then((result) => {
      if (!cancelled && result.settings) setCompany(mergeCompanySettingsFromProfile(null, result.settings));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInvoices() {
      setLoading(true);
      const invoiceResult = await clientInvoicesServiceApi.listInvoices(token, { page, perPage: PAGE_SIZE });
      if (cancelled) return;
      setInvoices(invoiceResult.items ?? []);
      setPagination(invoiceResult.pagination);
      setLoading(false);
    }

    if (token) loadInvoices();
    return () => {
      cancelled = true;
    };
  }, [page, token]);

  async function handleDownload(invoice) {
    setDownloadingId(invoice.id);
    try {
      await downloadInvoicePdf(invoice, company);
      toast.success("Invoice downloaded.");
    } catch {
      toast.error("Could not download this invoice.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">Billing</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-brand-primary">Invoices</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          These are invoices 360 Tours emailed to you. Emailed means it was sent to your inbox. Paid means it has been settled. Download the PDF here or open the invoice.
        </p>

        {loading ? (
          <div className="flex justify-center py-16 text-brand-muted">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          </div>
        ) : invoices.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-brand-border/70 bg-white px-6 py-12 text-center text-sm text-brand-muted">
            No invoices yet. When admin sends one to your email, it will appear here.
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-3">
              {invoices.map((invoice) => (
                <article
                  key={invoice.id}
                  className="flex flex-col gap-4 rounded-2xl border border-brand-border/60 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <FileText className="mt-0.5 h-8 w-8 shrink-0 text-brand-primary" aria-hidden />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-sm font-bold text-brand-ink">{invoice.invoiceNumber}</p>
                        <span className="rounded-full bg-brand-accent/25 px-2.5 py-0.5 text-[10px] font-bold uppercase text-brand-primary">
                          {invoiceStatusLabel(invoice.status)}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-brand-muted">{invoice.project || invoice.billedTo?.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDownload(invoice)}
                      disabled={downloadingId === invoice.id}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-3 py-2 text-sm font-semibold text-brand-ink transition hover:border-brand-primary/30 hover:text-brand-primary disabled:opacity-60"
                    >
                      <Download className="h-4 w-4" aria-hidden />
                      {downloadingId === invoice.id ? "Preparing…" : "Download PDF"}
                    </button>
                    <Link
                      to={ROUTES.myInvoiceDetail(invoice.id)}
                      className="inline-flex items-center gap-1 rounded-xl bg-brand-primary px-3 py-2 text-sm font-semibold text-white hover:bg-brand-primary-dark"
                    >
                      View invoice <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <AdminPagination
              className="mt-6"
              page={page}
              totalPages={paginationMeta.totalPages}
              totalItems={paginationMeta.totalItems}
              rangeStart={paginationMeta.rangeStart}
              rangeEnd={paginationMeta.rangeEnd}
              onPageChange={setPage}
            />
          </>
        )}
      </Container>
    </section>
  );
}
