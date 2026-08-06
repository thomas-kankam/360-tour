import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  CalendarCheck,
  Eye,
  Globe2,
  Loader2,
  Search,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import adminBookingsServiceApi from "../../apis/AdminBookingsServiceApi";
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
  formatAdminBookingDate,
  getAdminBookingStatusConfig,
  getAdminPaymentModeConfig,
  getAdminPaymentStatusConfig,
  summarizeAdminBookings,
} from "../../utils/adminBookingHelpers";
import { formatBookingCurrency } from "../../utils/bookingHelpers";

const EASE = [0.22, 1, 0.36, 1];

const STATUS_FILTERS = [
  { id: "all", label: "All statuses" },
  { id: "confirmed", label: "Confirmed" },
  { id: "pending", label: "Pending" },
  { id: "cancelled", label: "Cancelled" },
];

const PAYMENT_FILTERS = [
  { id: "all", label: "All payments" },
  { id: "paid", label: "Paid" },
  { id: "pending", label: "Unpaid" },
];

function ConfigBadge({ config }) {
  if (!config) return <span className="text-xs text-brand-muted">—</span>;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${config.className}`}>
      {config.label}
    </span>
  );
}

function TourThumb({ booking }) {
  const src = booking.tourImage || booking.tour?.image;

  return (
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-brand-cream ring-1 ring-black/8">
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-brand-muted">
          <Globe2 className="h-4 w-4 opacity-40" strokeWidth={1.5} aria-hidden />
        </div>
      )}
    </div>
  );
}

export default function AdminBookingsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
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
  } = useServerAdminPagination();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, setPage]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function loadBookings() {
      setLoading(true);
      const result = await adminBookingsServiceApi.listBookings(
        token,
        buildListQueryParams({
          page,
          per_page: pageSize,
          search: debouncedSearch,
          status: statusFilter !== "all" ? statusFilter : undefined,
          payment_status: paymentFilter !== "all" ? paymentFilter : undefined,
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

      setBookings((prev) => {
        if (
          prev.length === items.length &&
          prev.every((booking, index) => {
            const next = items[index];
            return next && (booking.bookingRef || booking.bookingCode) === (next.bookingRef || next.bookingCode);
          })
        ) {
          return prev;
        }
        return items;
      });
    }

    loadBookings();

    return () => {
      cancelled = true;
    };
  }, [token, page, pageSize, syncFromResponse, debouncedSearch, statusFilter, paymentFilter]);

  const pageSummary = useMemo(() => summarizeAdminBookings(bookings), [bookings]);

  const isEmpty = !loading && bookings.length === 0;
  const hasFilters = debouncedSearch || statusFilter !== "all" || paymentFilter !== "all";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">Reservation oversight</p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-brand-ink">Bookings</h1>
        <p className="mt-2 text-sm text-brand-muted">
          Platform booking audit — reservations, payment status, and operator fulfillment.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="rounded-2xl border border-black/8 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Total bookings</p>
          <p className="mt-1 text-2xl font-bold text-brand-ink">{totalItems || bookings.length}</p>
          <p className="mt-1 text-xs text-brand-muted">Across platform</p>
        </div>
        <div className="rounded-2xl border border-black/8 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Confirmed (page)</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{pageSummary.confirmed}</p>
          <p className="mt-1 text-xs text-brand-muted">On this page</p>
        </div>
        <div className="rounded-2xl border border-black/8 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Pending (page)</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{pageSummary.pending}</p>
          <p className="mt-1 text-xs text-brand-muted">Awaiting confirmation</p>
        </div>
        <div className="rounded-2xl border border-black/8 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Paid revenue GHS (page)</p>
          <p className="mt-1 text-2xl font-bold text-brand-green">{pageSummary.revenueLabels.GHS}</p>
          <p className="mt-1 text-xs text-brand-muted">{pageSummary.revenueCounts.GHS} paid on this page</p>
        </div>
        <div className="rounded-2xl border border-black/8 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Paid revenue USD (page)</p>
          <p className="mt-1 text-2xl font-bold text-sky-700">{pageSummary.revenueLabels.USD}</p>
          <p className="mt-1 text-xs text-brand-muted">{pageSummary.revenueCounts.USD} paid on this page</p>
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
                placeholder="Search booking code, tour, client, operator…"
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
              {PAYMENT_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => {
                    setPaymentFilter(filter.id);
                    setPage(1);
                  }}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    paymentFilter === filter.id
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
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600">
              <CalendarCheck className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="text-base font-bold text-brand-ink">No bookings found</p>
            <p className="max-w-sm text-sm text-brand-muted">
              {hasFilters
                ? "Try adjusting your search or filters."
                : "Booking records will appear here as travelers reserve tours."}
            </p>
          </div>
        ) : (
          <>
            <AdminTableMobile columns={1}>
              {bookings.map((booking, index) => {
                const bookingCode = booking.bookingRef || booking.bookingCode;
                const bookingStatus = getAdminBookingStatusConfig(booking);
                const paymentStatus = getAdminPaymentStatusConfig(booking);
                const paymentMode = getAdminPaymentModeConfig(booking);

                return (
                  <motion.div
                    key={bookingCode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: EASE, delay: index * 0.03 }}
                  >
                    <AdminMobileCard>
                      <AdminMobileCardHeader
                        title={booking.tourTitle || "Tour unavailable"}
                        subtitle={booking.travelerName || booking.clientName || "—"}
                        avatar={<TourThumb booking={booking} />}
                        trailing={
                          <div className="flex flex-wrap items-center gap-1">
                            <ConfigBadge config={bookingStatus} />
                            <ConfigBadge config={paymentStatus} />
                          </div>
                        }
                      />
                      <AdminMobileCardBody>
                        <AdminMobileCardRow
                          label="Booking code"
                          value={
                            <span className="font-mono text-xs font-bold text-brand-green">{bookingCode || "—"}</span>
                          }
                        />
                        <AdminMobileCardRow
                          label="Operator"
                          value={booking.operatorOrganization || booking.operatorName || "—"}
                        />
                        <AdminMobileCardRow
                          label="Departure"
                          value={booking.selectedDate || "—"}
                        />
                        <AdminMobileCardRow
                          label="Travelers"
                          value={`${booking.travelers || 1} · ${booking.bookingType === "group" ? "Group" : "Individual"}`}
                        />
                        <AdminMobileCardRow
                          label="Amount"
                          value={booking.amountLabel || formatBookingCurrency(booking.subtotal, booking.currency)}
                        />
                        <AdminMobileCardRow label="Payment" value={<ConfigBadge config={paymentMode} />} />
                        <AdminMobileCardRow label="Booked" value={formatAdminBookingDate(booking.savedAt)} />
                      </AdminMobileCardBody>
                      <AdminMobileCardActions>
                        <Link
                          to={ROUTES.admin.bookingDetail(bookingCode)}
                          className={`${adminIconBtnClass} ${adminIconBtnViewClass}`}
                          aria-label={`View booking ${bookingCode}`}
                        >
                          <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                        </Link>
                      </AdminMobileCardActions>
                    </AdminMobileCard>
                  </motion.div>
                );
              })}
            </AdminTableMobile>

            <AdminTableDesktop>
              <table className="w-full text-left">
                <thead className="border-b border-black/8 bg-brand-cream/50">
                  <tr>
                    {[
                      "Booking code",
                      "Tour",
                      "Client / traveler",
                      "Operator",
                      "Departure",
                      "Travelers",
                      "Amount",
                      "Status",
                      "Payment",
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
                  {bookings.map((booking) => {
                    const bookingCode = booking.bookingRef || booking.bookingCode;
                    const bookingStatus = getAdminBookingStatusConfig(booking);
                    const paymentStatus = getAdminPaymentStatusConfig(booking);
                    const paymentMode = getAdminPaymentModeConfig(booking);

                    return (
                      <tr
                        key={bookingCode}
                        className="border-b border-black/5 last:border-0 hover:bg-brand-cream/30"
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs font-bold text-brand-green">{bookingCode || "—"}</span>
                          <p className="mt-1 text-[10px] text-brand-muted">
                            {formatAdminBookingDate(booking.savedAt)}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex min-w-[11rem] items-center gap-3">
                            <TourThumb booking={booking} />
                            <div className="min-w-0">
                              <p className="line-clamp-1 font-semibold text-brand-ink">
                                {booking.tourTitle || "Tour unavailable"}
                              </p>
                              {booking.tour?.location ? (
                                <p className="line-clamp-1 text-xs text-brand-muted">{booking.tour.location}</p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="line-clamp-1 text-sm font-semibold text-brand-ink">
                            {booking.travelerName || booking.clientName || "—"}
                          </p>
                          <p className="line-clamp-1 text-xs text-brand-muted">
                            {booking.leadTraveler?.email || booking.client?.email || "—"}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="line-clamp-1 text-sm font-semibold text-brand-ink">
                            {booking.operatorOrganization || "—"}
                          </p>
                          <p className="line-clamp-1 text-xs text-brand-muted">{booking.operatorName || "—"}</p>
                        </td>
                        <td className="max-w-[10rem] whitespace-nowrap px-5 py-3.5">
                          <p className="truncate text-sm text-brand-ink" title={booking.selectedDate || undefined}>
                            {booking.selectedDate || "—"}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-brand-ink">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-brand-muted" strokeWidth={2} aria-hidden />
                            {booking.travelers || 1}
                          </span>
                          <p className="text-[10px] capitalize text-brand-muted">{booking.bookingType || "individual"}</p>
                        </td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-brand-ink">
                          {booking.amountLabel || formatBookingCurrency(booking.subtotal, booking.currency)}
                        </td>
                        <td className="px-5 py-3.5">
                          <ConfigBadge config={bookingStatus} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col gap-1">
                            <ConfigBadge config={paymentStatus} />
                            <ConfigBadge config={paymentMode} />
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <Link
                            to={ROUTES.admin.bookingDetail(bookingCode)}
                            className={`${adminIconBtnClass} ${adminIconBtnViewClass}`}
                            aria-label={`View booking ${bookingCode}`}
                          >
                            <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
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
