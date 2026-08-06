import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  Banknote,
  CreditCard,
  Eye,
  Globe2,
  Loader2,
  Search,
  Wallet,
} from "lucide-react";
import { toast } from "react-toastify";
import adminPaymentsServiceApi from "../../apis/AdminPaymentsServiceApi";
import AdminPagination from "../../components/admin/AdminPagination";
import {
  AdminMobileCard,
  AdminMobileCardActions,
  AdminMobileCardBody,
  AdminMobileCardHeader,
  AdminMobileCardRow,
  AdminTableDesktop,
  AdminTableMobile,
  adminIconBtnClass,
  adminIconBtnViewClass,
} from "../../components/admin/AdminResponsiveTable";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue, useServerAdminPagination } from "../../hooks/useAdminPagination";
import { buildListQueryParams } from "../../utils/adminPaginationHelpers";
import {
  getAdminPaymentMethodConfig,
  summarizeAdminPayments,
} from "../../utils/adminPaymentHelpers";
import { formatPaymentDate, formatPaymentReferenceDisplay, PAYMENT_STATUS_CONFIG } from "../../utils/paymentHelpers";

const EASE = [0.22, 1, 0.36, 1];

const STATUS_FILTERS = [
  { id: "all", label: "All statuses" },
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
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${config.className}`}>
      {config.label}
    </span>
  );
}

function MethodBadge({ payment }) {
  const config = getAdminPaymentMethodConfig(payment);
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${config.className}`}>
      {config.label}
    </span>
  );
}

function PaymentReference({ reference, className = "" }) {
  const referenceLabel = formatPaymentReferenceDisplay(reference);
  const referenceTitle = reference?.trim() || undefined;

  return (
    <span className={`font-mono ${className}`} title={referenceTitle}>
      {referenceLabel}
    </span>
  );
}

function TourThumb({ payment }) {
  return (
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-brand-cream ring-1 ring-black/8">
      {payment.tourImage ? (
        <img src={payment.tourImage} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-brand-muted">
          <Globe2 className="h-4 w-4 opacity-40" strokeWidth={1.5} aria-hidden />
        </div>
      )}
    </div>
  );
}

export default function AdminPaymentsPage() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const debouncedSearch = useDebouncedValue(search);
  const {
    page,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    rangeStart,
    rangeEnd,
    syncFromResponse,
  } = useServerAdminPagination({
    resetKey: `${debouncedSearch}-${statusFilter}-${methodFilter}`,
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function loadPayments() {
      setLoading(true);
      const result = await adminPaymentsServiceApi.listPayments(
        token,
        buildListQueryParams({
          page,
          per_page: pageSize,
          search: debouncedSearch,
          status: statusFilter !== "all" ? statusFilter : undefined,
          payment_method: methodFilter !== "all" ? methodFilter : undefined,
        }),
      );

      if (cancelled) return;

      setLoading(false);

      if (!result.ok) {
        toast.error(result.reason || result.message);
        return;
      }

      const { items, shouldRefetch } = syncFromResponse(
        { items: result.items, pagination: result.pagination },
        page,
      );

      if (cancelled || shouldRefetch) return;

      setPayments(items);
    }

    loadPayments();

    return () => {
      cancelled = true;
    };
  }, [token, page, pageSize, syncFromResponse, debouncedSearch, statusFilter, methodFilter]);

  const pageSummary = useMemo(() => summarizeAdminPayments(payments), [payments]);
  const isEmpty = !loading && payments.length === 0;
  const hasFilters = debouncedSearch || statusFilter !== "all" || methodFilter !== "all";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">Finance oversight</p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-brand-ink">Payments</h1>
        <p className="mt-2 text-sm text-brand-muted">
          Platform payment audit — online checkout, on-site collections, and booking reconciliation.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-black/8 bg-white px-4 py-4 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
            <Wallet className="h-4 w-4" strokeWidth={2} aria-hidden />
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Collected GHS (page)</p>
          <p className="mt-1 text-2xl font-bold text-brand-ink">{pageSummary.paidTotalLabels.GHS}</p>
          <p className="mt-1 text-xs text-brand-muted">{pageSummary.paidCounts.GHS} paid on this page</p>
        </div>
        <div className="rounded-2xl border border-black/8 bg-white px-4 py-4 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <Globe2 className="h-4 w-4" strokeWidth={2} aria-hidden />
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Collected USD (page)</p>
          <p className="mt-1 text-2xl font-bold text-brand-ink">{pageSummary.paidTotalLabels.USD}</p>
          <p className="mt-1 text-xs text-brand-muted">{pageSummary.paidCounts.USD} paid on this page</p>
        </div>
        <div className="rounded-2xl border border-black/8 bg-white px-4 py-4 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-accent/20 text-brand-primary">
            <CreditCard className="h-4 w-4" strokeWidth={2} aria-hidden />
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Pending (page)</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{pageSummary.pendingCount}</p>
          <p className="mt-1 text-xs text-brand-muted">Awaiting checkout</p>
        </div>
        <div className="rounded-2xl border border-black/8 bg-white px-4 py-4 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-accent/25 text-brand-primary">
            <Banknote className="h-4 w-4" strokeWidth={2} aria-hidden />
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">On-site (page)</p>
          <p className="mt-1 text-2xl font-bold text-brand-ink">{pageSummary.onsiteCount}</p>
          <p className="mt-1 text-xs text-brand-muted">Cash / on-site collections</p>
        </div>
      </div>

      <div className="rounded-2xl border border-black/8 bg-white shadow-sm">
        <div className="border-b border-black/8 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3">
            <div className="relative max-w-md flex-1">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted"
                strokeWidth={2}
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search booking code, reference, tour, client, operator…"
                className="w-full rounded-xl border border-brand-border/70 bg-brand-cream/30 py-2.5 pl-10 pr-3 text-sm outline-none transition-shadow focus:border-brand-green focus:ring-2 focus:ring-brand-green/15"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(filter.id);
                    setPage(1);
                  }}
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
              <span className="mx-1 hidden h-6 w-px bg-black/10 sm:block" aria-hidden />
              {METHOD_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => {
                    setMethodFilter(filter.id);
                    setPage(1);
                  }}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    methodFilter === filter.id
                      ? "bg-brand-green text-white"
                      : "bg-brand-cream text-brand-muted hover:text-brand-ink",
                  ].join(" ")}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-green" strokeWidth={2} aria-hidden />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
              <CreditCard className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="text-base font-bold text-brand-ink">No payments found</p>
            <p className="max-w-sm text-sm text-brand-muted">
              {hasFilters
                ? "Try adjusting your search or filters."
                : "Payment records will appear here as travelers complete checkout."}
            </p>
          </div>
        ) : (
          <>
            <AdminTableMobile columns={1}>
              {payments.map((payment, index) => (
                <motion.div
                  key={payment.paymentSlug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE, delay: index * 0.03 }}
                >
                  <AdminMobileCard>
                    <AdminMobileCardHeader
                      title={payment.tourName}
                      subtitle={payment.travelerName || payment.clientName || "—"}
                      avatar={<TourThumb payment={payment} />}
                      trailing={
                        <div className="flex flex-wrap items-center gap-1">
                          <PaymentStatusBadge status={payment.status} />
                          <MethodBadge payment={payment} />
                        </div>
                      }
                    />
                    <AdminMobileCardBody>
                      <AdminMobileCardRow
                        label="Booking code"
                        value={
                          <span className="font-mono text-xs font-bold text-brand-green">{payment.bookingCode || "—"}</span>
                        }
                      />
                      <AdminMobileCardRow
                        label="Reference"
                        value={payment.reference ? (
                          <PaymentReference reference={payment.reference} className="text-xs" />
                        ) : (
                          "—"
                        )}
                      />
                      <AdminMobileCardRow label="Amount" value={payment.amountLabel} />
                      <AdminMobileCardRow label="Operator" value={payment.operatorName || "—"} />
                      <AdminMobileCardRow
                        label="Date"
                        value={formatPaymentDate(payment.paidAt || payment.createdAt)}
                      />
                    </AdminMobileCardBody>
                    <AdminMobileCardActions>
                      <Link
                        to={ROUTES.admin.paymentDetail(payment.paymentSlug)}
                        className={`${adminIconBtnClass} ${adminIconBtnViewClass}`}
                        aria-label={`View payment ${payment.bookingCode}`}
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                      </Link>
                    </AdminMobileCardActions>
                  </AdminMobileCard>
                </motion.div>
              ))}
            </AdminTableMobile>

            <AdminTableDesktop>
              <table className="w-full text-left">
                <thead className="border-b border-black/8 bg-brand-cream/50">
                  <tr>
                    {[
                      "Reference / booking",
                      "Tour / traveler",
                      "Client / operator",
                      "Amount",
                      "Status",
                      "Method / date",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.paymentSlug}
                      className="border-b border-black/5 last:border-0 hover:bg-brand-cream/30"
                    >
                      <td className="w-[7.5rem] max-w-[7.5rem] px-5 py-3.5">
                        <p className="truncate font-mono text-xs font-bold text-brand-green">{payment.bookingCode || "—"}</p>
                        <p className="mt-1 truncate font-mono text-[10px] text-brand-muted">
                          {payment.reference ? (
                            <PaymentReference reference={payment.reference} />
                          ) : (
                            "No reference"
                          )}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex min-w-[11rem] items-center gap-3">
                          <TourThumb payment={payment} />
                          <div className="min-w-0">
                            <p className="line-clamp-1 font-semibold text-brand-ink">{payment.tourName}</p>
                            <p className="line-clamp-1 text-xs text-brand-muted">{payment.travelerName || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="line-clamp-1 text-sm font-semibold text-brand-ink">{payment.clientName || "—"}</p>
                        <p className="line-clamp-1 text-xs text-brand-muted">{payment.operatorName || "—"}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-brand-ink">{payment.amountLabel}</td>
                      <td className="px-5 py-3.5">
                        <PaymentStatusBadge status={payment.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <MethodBadge payment={payment} />
                          <span className="text-sm text-brand-muted">
                            {formatPaymentDate(payment.paidAt || payment.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          to={ROUTES.admin.paymentDetail(payment.paymentSlug)}
                          className={`${adminIconBtnClass} ${adminIconBtnViewClass}`}
                          aria-label={`View payment ${payment.bookingCode}`}
                        >
                          <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableDesktop>
          </>
        )}

        {!loading && totalItems > 0 ? (
          <div className="border-t border-black/8 px-4 py-3 sm:px-5">
            <AdminPagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
