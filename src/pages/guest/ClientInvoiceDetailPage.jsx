import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Container from "../../components/layout/Container";
import InvoicePreview from "../../components/invoices/InvoicePreview";
import clientInvoicesServiceApi from "../../apis/ClientInvoicesServiceApi";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { loadCompanySettings } from "../../utils/adminCompanySettings";

export default function ClientInvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const company = useMemo(() => loadCompanySettings(), []);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <h1 className="mt-4 text-2xl font-bold text-brand-ink">{invoice.invoiceNumber}</h1>
        <div className="mt-6">
          <InvoicePreview invoice={invoice} company={company} />
        </div>
      </Container>
    </section>
  );
}
