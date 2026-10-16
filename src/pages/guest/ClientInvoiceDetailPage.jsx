import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Download, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Container from "../../components/layout/Container";
import InvoicePreview from "../../components/invoices/InvoicePreview";
import clientInvoicesServiceApi from "../../apis/ClientInvoicesServiceApi";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { loadCompanySettings } from "../../utils/adminCompanySettings";
import { downloadInvoicePdf } from "../../utils/invoicePdf";

function invoiceStatusLabel(status) {
  if (status === "paid") return "Paid";
  if (status === "sent") return "Emailed";
  return status || "Emailed";
}

export default function ClientInvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const company = useMemo(() => loadCompanySettings(), []);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!invoice) return;
    setDownloading(true);
    try {
      await downloadInvoicePdf(invoice, company);
      toast.success("Invoice downloaded.");
    } catch {
      toast.error("Could not download this invoice.");
    } finally {
      setDownloading(false);
    }
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await clientInvoicesServiceApi.getInvoice(token, id);
      setLoading(false);
      if (!result.invoice) {
        toast.error("Invoice not found.");
        navigate(ROUTES.myInvoices);
        return;
      }
      setInvoice(result.invoice);
    }
    if (token) load();
  }, [id, navigate, token]);

  if (loading || !invoice) {
    return (
      <div className="flex justify-center py-20 text-brand-muted">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      </div>
    );
  }

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <Link to={ROUTES.myInvoices} className="text-sm font-semibold text-brand-primary hover:underline">
          ← Back to invoices
        </Link>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-brand-ink">{invoice.invoiceNumber}</h1>
              <span className="rounded-full bg-brand-accent/25 px-2.5 py-0.5 text-[10px] font-bold uppercase text-brand-primary">
                {invoiceStatusLabel(invoice.status)}
              </span>
            </div>
            <p className="mt-1 text-sm text-brand-muted">
              {invoice.status === "paid"
                ? "This invoice has been marked paid."
                : "Emailed means 360 Tours sent this invoice to your email."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-dark disabled:opacity-60"
          >
            <Download className="h-4 w-4" aria-hidden />
            {downloading ? "Preparing…" : "Download PDF"}
          </button>
        </div>
        <div className="mt-6">
          <InvoicePreview invoice={invoice} company={company} />
        </div>
      </Container>
    </section>
  );
}
