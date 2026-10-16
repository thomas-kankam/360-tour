import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, FileText, Loader2 } from "lucide-react";
import Container from "../../components/layout/Container";
import clientInvoicesServiceApi from "../../apis/ClientInvoicesServiceApi";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";

export default function MyInvoicesPage() {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoices() {
      setLoading(true);
      const invoiceResult = await clientInvoicesServiceApi.listInvoices(token);
      setInvoices(invoiceResult.items ?? []);
      setLoading(false);
    }
    if (token) loadInvoices();
  }, [token]);

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">Billing</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-brand-primary">Invoices</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          Invoices sent to you by 360 Tours appear here after they are emailed.
        </p>

        {loading ? (
          <div className="flex justify-center py-16 text-brand-muted">
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

            {invoices.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-brand-border/70 bg-white px-6 py-12 text-center text-sm text-brand-muted">
                No invoices yet. When admin sends one to your email, it will appear here.
              </div>
            ) : null}
          </>
        )}
      </Container>
    </section>
  );
}
