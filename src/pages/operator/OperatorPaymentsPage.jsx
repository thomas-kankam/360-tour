import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Banknote,
  CreditCard,
  ExternalLink,
  Globe2,
  Loader2,
  Plus,
  Search,
  Wallet,
} from "lucide-react";
import operatorPaymentsServiceApi from "../../apis/OperatorPaymentsServiceApi";
import AdminPagination from "../../components/admin/AdminPagination";
import RecordOnsitePaymentModal from "../../components/operator/RecordOnsitePaymentModal";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useServerAdminPagination } from "../../hooks/useAdminPagination";
import { buildListQueryParams } from "../../utils/adminPaginationHelpers";
import {
  getOperatorPaymentMethodConfig,
  summarizeOperatorPayments,
} from "../../utils/operatorPaymentHelpers";
import {
  formatPaymentDate,
  formatPaymentReferenceDisplay,
  PAYMENT_STATUS_CONFIG,
} from "../../utils/paymentHelpers";

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
];

const METHOD_FILTERS = [
  { id: "all", label: "All methods" },
  { id: "online", label: "Online" },
  { id: "onsite", label: "On site" },
];

function PaymentStatusBadge({ status }) {
  const config = PAYMENT_STATUS_CONFIG[status] ?? PAYMENT_STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${config.className}`}>
      {config.label}
    </span>
  );
}

function MethodBadge({ payment }) {
  const config = getOperatorPaymentMethodConfig(payment);
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${config.className}`}>
      {config.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, hint, accent = "green" }) {
  const accents = {
    green: "bg-brand-primary/10 text-brand-primary",
    gold: "bg-brand-accent/25 text-brand-primary",
    orange: "bg-brand-accent/20 text-brand-primary",
    blue: "bg-sky-50 text-sky-700",
  };

  return (
    <div className="rounded-2xl border border-brand-border/60 bg-white p-4 shadow-sm">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accents[accent]}`}>
        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
      </div>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">{label}</p>
      <p className="mt-1 text-xl font-bold text-brand-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-brand-muted">{hint}</p> : null}
    </div>
  );
}

function PaymentRow({ payment }) {
  const referenceLabel = formatPaymentReferenceDisplay(payment.reference);
  const referenceTitle = payment.reference?.trim() || undefined;

  return (
    <tr className="border-b border-brand-border/40 transition-colors last:border-0 hover:bg-brand-cream/40">
      <td className="w-[7.5rem] max-w-[7.5rem] px-4 py-3.5">
        <p
          className="truncate font-mono text-xs font-bold text-brand-primary"
          title={referenceTitle}
        >
          {referenceLabel}
        </p>
        <p className="mt-0.5 truncate font-mono text-[10px] text-brand-muted" title={payment.bookingCode}>
          {payment.bookingCode}
        </p>
      </td>
      <td className="px-4 py-3.5">
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
          <div className="min-w-0">
            <p className="line-clamp-1 text-sm font-semibold text-brand-ink">{payment.tourName}</p>
            <p className="line-clamp-1 text-xs text-brand-muted">{payment.travelerName || "—"}</p>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-sm font-bold text-brand-ink">{payment.amountLabel}</td>
      <td className="whitespace-nowrap px-4 py-3.5">
        <PaymentStatusBadge status={payment.status} />
      </td>
      <td className="whitespace-nowrap px-4 py-3.5">
        <MethodBadge payment={payment} />
      </td>
      <td className="hidden whitespace-nowrap px-4 py-3.5 text-sm text-brand-muted lg:table-cell">
        {formatPaymentDate(payment.paidAt || payment.createdAt)}
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-right">
        <Link
          to={ROUTES.operator.paymentDetail(payment.paymentSlug)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:text-brand-primary-dark"
        >
          View
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </Link>
      </td>
    </tr>
  );
}

function PaymentMobileCard({ payment }) {
  return (
    <article className="rounded-2xl border border-brand-border/60 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-brand-cream ring-1 ring-brand-border/50">
            {payment.tourImage ? (
              <img src={payment.tourImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-brand-muted">
                <Globe2 className="h-5 w-5 opacity-40" strokeWidth={1.5} aria-hidden />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-bold text-brand-ink">{payment.tourName}</p>
            <p className="mt-0.5 font-mono text-[10px] font-bold text-brand-primary">{payment.bookingCode}</p>
            <p className="mt-1 text-xs text-brand-muted">{payment.travelerName}</p>
          </div>
        </div>
        <p className="shrink-0 text-sm font-bold text-brand-ink">{payment.amountLabel}</p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <PaymentStatusBadge status={payment.status} />
        <MethodBadge payment={payment} />
        <span className="text-xs text-brand-muted">{formatPaymentDate(payment.paidAt || payment.createdAt)}</span>
      </div>
      <Link
        to={ROUTES.operator.paymentDetail(payment.paymentSlug)}
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary"
      >
        View payment details
        <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      </Link>
    </article>
  );
}

export default function OperatorPaymentsPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [recordOpen, setRecordOpen] = useState(false);

  const {
    page,
    setPage,
    syncFromResponse,
    totalItems,
    totalPages,
    rangeStart,
    rangeEnd,
  } = useServerAdminPagination({ pageSize: 15, resetKey: `${search}-${statusFilter}-${methodFilter}` });

  const loadPayments = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    const result = await operatorPaymentsServiceApi.listPayments(
      token,
      buildListQueryParams({ page, per_page: 15 }),
    );

    setLoading(false);

    if (!result.ok) {
      setPayments([]);
      setError(result.reason || result.message || "Could not load payments.");
      return;
    }

    const sync = syncFromResponse({ items: result.items, pagination: result.pagination }, page);
    setPayments(sync.items);
  }, [token, page, syncFromResponse]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const filteredPayments = useMemo(() => {
    let list = payments;

    if (statusFilter !== "all") {
      list = list.filter((payment) => payment.status === statusFilter);
    }

    if (methodFilter !== "all") {
      list = list.filter((payment) => payment.paymentMethod === methodFilter);
    }

    const query = search.trim().toLowerCase();
    if (!query) return list;

    return list.filter(
      (payment) =>
        payment.bookingCode?.toLowerCase().includes(query) ||
        payment.reference?.toLowerCase().includes(query) ||
        payment.tourName?.toLowerCase().includes(query) ||
        payment.travelerName?.toLowerCase().includes(query),
    );
  }, [payments, statusFilter, methodFilter, search]);

  const summary = useMemo(() => summarizeOperatorPayments(filteredPayments), [filteredPayments]);

  function handleRecorded(payment) {
    loadPayments();
    if (payment?.paymentSlug) {
      navigate(ROUTES.operator.paymentDetail(payment.paymentSlug));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">Finance</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-brand-ink sm:text-3xl">Payments</h1>
          <p className="mt-1 text-sm text-brand-muted">Track online checkout and record on-site collections.</p>
        </div>
        <button
          type="button"
          onClick={() => setRecordOpen(true)}
          className="btn-primary inline-flex items-center justify-center gap-2 self-start"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          Record on-site payment
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Collected GHS"
          value={summary.paidTotalLabels.GHS}
          hint={`${summary.paidCounts.GHS} paid on this page`}
          accent="green"
        />
        <StatCard
          icon={Globe2}
          label="Collected USD"
          value={summary.paidTotalLabels.USD}
          hint={`${summary.paidCounts.USD} paid on this page`}
          accent="blue"
        />
        <StatCard
          icon={CreditCard}
          label="Pending"
          value={summary.pendingCount}
          hint="Awaiting online checkout"
          accent="orange"
        />
        <StatCard
          icon={Banknote}
          label="On-site"
          value={summary.onsiteCount}
          hint="Cash / on-site collections"
          accent="gold"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-brand-border/60 bg-white shadow-sm">
        <div className="border-b border-brand-border/40 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" strokeWidth={2} aria-hidden />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search booking code, reference, tour, traveler…"
                className="w-full rounded-xl border border-brand-border/70 bg-brand-cream/30 py-2.5 pl-10 pr-3 text-sm outline-none transition-shadow focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setStatusFilter(filter.id)}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    statusFilter === filter.id
                      ? "bg-brand-ink text-white"
                      : "bg-brand-cream text-brand-muted hover:text-brand-ink",
                  ].join(" ")}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {METHOD_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setMethodFilter(filter.id)}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  methodFilter === filter.id
                    ? "bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/25"
                    : "bg-white text-brand-muted ring-1 ring-brand-border/60 hover:text-brand-ink",
                ].join(" ")}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" strokeWidth={2} aria-hidden />
          </div>
        ) : error ? (
          <div className="px-5 py-12 text-center text-sm text-brand-muted">{error}</div>
        ) : filteredPayments.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <CreditCard className="mx-auto h-10 w-10 text-brand-muted/40" strokeWidth={1.5} aria-hidden />
            <p className="mt-3 text-sm font-semibold text-brand-ink">No payments match your filters</p>
            <p className="mt-1 text-sm text-brand-muted">Online payments appear here automatically after checkout.</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[880px] text-left">
                <thead className="border-b border-brand-border/40 bg-brand-cream/40 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Tour / traveler</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="hidden px-4 py-3 lg:table-cell">Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <PaymentRow key={payment.paymentSlug} payment={payment} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {filteredPayments.map((payment) => (
                <PaymentMobileCard key={payment.paymentSlug} payment={payment} />
              ))}
            </div>
          </>
        )}

        {!loading && !error && totalItems > 0 ? (
          <div className="border-t border-brand-border/40 px-4 py-3 sm:px-5">
            <AdminPagination
              page={page}
              totalPages={totalPages}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              totalItems={totalItems}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </section>

      <RecordOnsitePaymentModal
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        onRecorded={handleRecorded}
      />
    </div>
  );
}
