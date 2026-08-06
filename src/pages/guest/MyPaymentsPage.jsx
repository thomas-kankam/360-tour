import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  CreditCard,
  ExternalLink,
  Globe2,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import Container from "../../components/layout/Container";
import { ROUTES } from "../../constants/routes";
import consumerPaymentsServiceApi from "../../apis/ConsumerPaymentsServiceApi";
import { useAuth } from "../../hooks/useAuth";
import { mapServerPagination } from "../../utils/adminPaginationHelpers";
import { formatPaymentDate, PAYMENT_STATUS_CONFIG, extractPaymentRedirectUrl, formatPaymentReferenceDisplay } from "../../utils/paymentHelpers";

const EASE = [0.16, 1, 0.3, 1];

const FILTERS = [
  { id: "all", label: "All payments" },
  { id: "paid", label: "Paid" },
  { id: "pending", label: "Pending" },
];

function PaymentStatusBadge({ status }) {
  const config = PAYMENT_STATUS_CONFIG[status] ?? PAYMENT_STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${config.className}`}>
      {config.label}
    </span>
  );
}

function PaymentTableRow({ payment, onRetry, retryingSlug }) {
  const canRetry = payment.status === "pending" && payment.paymentSlug;
  const isRetrying = retryingSlug === payment.paymentSlug;
  const referenceLabel = formatPaymentReferenceDisplay(payment.reference);
  const referenceTitle = payment.reference?.trim() || undefined;

  return (
    <tr className="border-b border-brand-border/40 last:border-0 transition-colors hover:bg-brand-cream/40">
      <td className="w-[7.5rem] max-w-[7.5rem] px-4 py-4 sm:px-5">
        <p
          className="truncate font-mono text-xs font-bold text-brand-green"
          title={referenceTitle}
        >
          {referenceLabel}
        </p>
      </td>
      <td className="px-4 py-4 sm:px-5">
        <div className="flex min-w-[10rem] items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-brand-cream ring-1 ring-brand-border/50">
            {payment.tourImage ? (
              <img src={payment.tourImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-brand-muted">
                <Globe2 className="h-4 w-4 opacity-40" strokeWidth={1.5} aria-hidden />
              </div>
            )}
          </div>
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-brand-ink">{payment.tourName}</p>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-4 sm:px-5">
        {payment.bookingCode ? (
          <Link
            to={ROUTES.myBookingDetail(payment.bookingCode)}
            className="font-mono text-xs font-semibold text-brand-ink transition-colors hover:text-brand-green"
          >
            {payment.bookingCode}
          </Link>
        ) : (
          <span className="text-sm text-brand-muted">—</span>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-4 sm:px-5">
        <span className="text-sm font-bold text-brand-ink">{payment.amountLabel}</span>
      </td>
      <td className="whitespace-nowrap px-4 py-4 sm:px-5">
        <PaymentStatusBadge status={payment.status} />
      </td>
      <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-brand-muted lg:table-cell lg:px-5">
        {formatPaymentDate(payment.createdAt)}
      </td>
      <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-brand-muted xl:table-cell xl:px-5">
        {formatPaymentDate(payment.paidAt)}
      </td>
      <td className="whitespace-nowrap px-4 py-4 sm:px-5">
        <div className="flex items-center justify-end gap-2">
          {canRetry ? (
            <button
              type="button"
              onClick={() => onRetry(payment)}
              disabled={isRetrying}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-accent px-3 py-1.5 text-[11px] font-semibold text-brand-primary transition-colors hover:bg-brand-accent-dark disabled:opacity-60"
            >
              {isRetrying ? "Redirecting…" : "Pay now"}
            </button>
          ) : null}
          {payment.bookingCode ? (
            <Link
              to={ROUTES.myBookingDetail(payment.bookingCode)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border/70 text-brand-muted transition-colors hover:border-brand-green/30 hover:text-brand-green"
              aria-label={`View booking ${payment.bookingCode}`}
            >
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </Link>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

function PaymentMobileCard({ payment, onRetry, retryingSlug }) {
  const canRetry = payment.status === "pending" && payment.paymentSlug;
  const isRetrying = retryingSlug === payment.paymentSlug;
  const referenceLabel = formatPaymentReferenceDisplay(payment.reference);
  const referenceTitle = payment.reference?.trim() || undefined;

  return (
    <article className="rounded-2xl border border-brand-border/60 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-brand-cream ring-1 ring-brand-border/50">
            {payment.tourImage ? (
              <img src={payment.tourImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-brand-muted">
                <Globe2 className="h-4 w-4 opacity-40" strokeWidth={1.5} aria-hidden />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p
              className="truncate font-mono text-[11px] font-bold text-brand-green"
              title={referenceTitle}
            >
              {referenceLabel}
            </p>
            <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-brand-ink">{payment.tourName}</p>
            {payment.bookingCode ? (
              <Link
                to={ROUTES.myBookingDetail(payment.bookingCode)}
                className="mt-1 inline-block font-mono text-xs text-brand-muted hover:text-brand-green"
              >
                {payment.bookingCode}
              </Link>
            ) : null}
          </div>
        </div>
        <PaymentStatusBadge status={payment.status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-brand-border/40 pt-3 text-sm">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">Amount</dt>
          <dd className="mt-0.5 font-bold text-brand-ink">{payment.amountLabel}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">Created</dt>
          <dd className="mt-0.5 text-brand-ink">{formatPaymentDate(payment.createdAt)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">Paid</dt>
          <dd className="mt-0.5 text-brand-ink">{formatPaymentDate(payment.paidAt)}</dd>
        </div>
      </dl>

      {(canRetry || payment.bookingCode) ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {canRetry ? (
            <button
              type="button"
              onClick={() => onRetry(payment)}
              disabled={isRetrying}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-accent px-4 py-2 text-xs font-semibold text-brand-primary hover:bg-brand-accent-dark disabled:opacity-60"
            >
              {isRetrying ? "Redirecting…" : "Complete payment"}
            </button>
          ) : null}
          {payment.bookingCode ? (
            <Link
              to={ROUTES.myBookingDetail(payment.bookingCode)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-border px-4 py-2 text-xs font-semibold text-brand-ink hover:border-brand-green/30 hover:text-brand-green"
            >
              View booking
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </Link>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default function MyPaymentsPage() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [retryingSlug, setRetryingSlug] = useState(null);

  const paginationMeta = useMemo(
    () => mapServerPagination(pagination, { page }),
    [pagination, page],
  );

  const loadPayments = useCallback(async () => {
    if (!token) {
      setPayments([]);
      setPagination(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const result = await consumerPaymentsServiceApi.listPayments(token, { page, per_page: 15 });
    setLoading(false);

    if (!result.ok) {
      setPayments([]);
      setPagination(null);
      setError(result.reason || result.message || "Could not load payments.");
      return;
    }

    setPayments(result.items);
    setPagination(result.pagination);
  }, [token, page]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleRetryPayment = useCallback(async (payment) => {
    if (!token || !payment.paymentSlug) return;

    setRetryingSlug(payment.paymentSlug);
    const result = await consumerPaymentsServiceApi.retryPayment(token, payment.paymentSlug, payment.booking);
    setRetryingSlug(null);

    const paymentUrl = extractPaymentRedirectUrl(result);
    if (paymentUrl) {
      window.location.assign(paymentUrl);
      return;
    }

    toast.error(result.reason || result.message || "Could not retry payment.");
  }, [token]);

  const filtered = useMemo(() => {
    let list = payments;
    if (filter === "paid") list = list.filter((p) => p.status === "paid");
    if (filter === "pending") list = list.filter((p) => p.status === "pending");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          (p.reference || "").toLowerCase().includes(q) ||
          (p.bookingCode || "").toLowerCase().includes(q) ||
          p.tourName.toLowerCase().includes(q),
      );
    }
    return list;
  }, [payments, filter, search]);

  const stats = useMemo(() => ({
    total: paginationMeta.totalItems || payments.length,
    paid: payments.filter((p) => p.status === "paid").length,
    pending: payments.filter((p) => p.status === "pending").length,
  }), [payments, paginationMeta.totalItems]);

  return (
    <div className="min-h-screen bg-brand-cream">
      <section className="border-b border-brand-green/15 bg-brand-green">
        <Container className="py-5 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-gold">Payment history</p>
              <h1 className="mt-0.5 text-xl font-bold text-white sm:text-2xl">My payments</h1>
            </motion.div>

            <Link
              to={ROUTES.myBookings}
              className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:self-auto"
            >
              My bookings
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.06 }}
            className="mt-4 flex flex-wrap gap-2"
          >
            {[
              { v: stats.total, l: "Total" },
              { v: stats.paid, l: "Paid" },
              { v: stats.pending, l: "Pending" },
            ].map((s) => (
              <div
                key={s.l}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm"
              >
                <span className="text-sm font-bold text-brand-gold">{s.v}</span>
                <span className="text-[11px] text-white/75">{s.l}</span>
              </div>
            ))}
          </motion.div>
        </Container>
      </section>

      <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={[
                    "rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
                    filter === f.id
                      ? "bg-brand-green text-white shadow-sm"
                      : "border border-brand-border/70 bg-white text-brand-muted hover:border-brand-green/30 hover:text-brand-green",
                  ].join(" ")}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" strokeWidth={2} aria-hidden />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reference, booking, tour…"
                className="h-10 w-full rounded-full border border-brand-border/70 bg-white pl-10 pr-4 text-sm outline-none focus:border-brand-green/50 focus:ring-2 focus:ring-brand-green/15"
              />
            </div>
          </div>

          <p className="mt-5 text-sm text-brand-muted">
            <span className="font-semibold text-brand-ink">{filtered.length}</span>
            {filtered.length === 1 ? " payment" : " payments"}
            {filter !== "all" && <> · {FILTERS.find((f) => f.id === filter)?.label}</>}
            {paginationMeta.totalItems > 0 && filter === "all" && !search.trim() ? (
              <> · {paginationMeta.rangeStart}–{paginationMeta.rangeEnd} of {paginationMeta.totalItems}</>
            ) : null}
          </p>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
              <button type="button" onClick={loadPayments} className="ml-3 font-semibold underline hover:no-underline">
                Try again
              </button>
            </div>
          ) : null}

          {loading ? (
            <div className="mt-16 flex flex-col items-center gap-3 text-brand-muted">
              <Loader2 className="h-8 w-8 animate-spin text-brand-green" strokeWidth={2} aria-hidden />
              <p className="text-sm">Loading payments…</p>
            </div>
          ) : null}

          {!loading && filtered.length > 0 ? (
            <>
              <div className="mt-6 hidden overflow-hidden rounded-[1.5rem] border border-brand-border/60 bg-white shadow-sm md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[880px] text-left">
                    <thead className="border-b border-brand-border/60 bg-brand-cream/60">
                      <tr>
                        {["Reference", "Tour", "Booking", "Amount", "Status", "Created", "Paid", "Actions"].map((heading, index) => (
                          <th
                            key={heading}
                            scope="col"
                            className={[
                              "px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted sm:px-5",
                              index === 5 ? "hidden lg:table-cell" : "",
                              index === 6 ? "hidden xl:table-cell" : "",
                              index === 7 ? "text-right" : "",
                            ].join(" ")}
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((payment) => (
                        <PaymentTableRow
                          key={payment.paymentSlug || payment.reference}
                          payment={payment}
                          onRetry={handleRetryPayment}
                          retryingSlug={retryingSlug}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 space-y-4 md:hidden">
                {filtered.map((payment) => (
                  <PaymentMobileCard
                    key={payment.paymentSlug || payment.reference}
                    payment={payment}
                    onRetry={handleRetryPayment}
                    retryingSlug={retryingSlug}
                  />
                ))}
              </div>
            </>
          ) : !loading ? (
            <div className="mt-12 flex flex-col items-center rounded-[1.75rem] border border-brand-border/60 bg-white px-8 py-16 text-center shadow-sm">
              <CreditCard className="h-12 w-12 text-brand-muted/40" strokeWidth={1.5} aria-hidden />
              <h2 className="mt-5 text-xl font-bold text-brand-ink">
                {payments.length === 0 ? "No payments yet" : "No matching payments"}
              </h2>
              <p className="mt-2 max-w-sm text-sm text-brand-muted">
                {payments.length === 0
                  ? "Online payments for your bookings will appear here once checkout is initiated."
                  : "Try adjusting your search or filter to find a payment."}
              </p>
              <Link to={ROUTES.myBookings} className="mt-6 text-sm font-semibold text-brand-green hover:underline">
                View my bookings
              </Link>
            </div>
          ) : null}

          {!loading && paginationMeta.totalPages > 1 ? (
            <nav aria-label="Payments pagination" className="mt-10 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-ink transition-all enabled:hover:border-brand-green/30 enabled:hover:text-brand-green disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-brand-muted">
                Page <span className="font-semibold text-brand-ink">{page}</span> of {paginationMeta.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= paginationMeta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-ink transition-all enabled:hover:border-brand-green/30 enabled:hover:text-brand-green disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          ) : null}
        </Container>
      </section>
    </div>
  );
}
