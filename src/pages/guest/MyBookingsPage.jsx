import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import Container from "../../components/layout/Container";
import { ROUTES } from "../../constants/routes";
import { getWhatsAppUrl } from "../../config/env";
import consumerPaymentsServiceApi from "../../apis/ConsumerPaymentsServiceApi";
import { useAuth } from "../../hooks/useAuth";
import { useClientBookings } from "../../hooks/useClientBookings";
import { downloadBookingReceipt } from "../../utils/bookingReceipt";
import { formatBookingCurrency, canViewBookingReceipt, canEditBooking, resolveBookingCurrency } from "../../utils/bookingHelpers";
import { extractPaymentRedirectUrl } from "../../utils/paymentHelpers";
import { isUpcoming } from "../../utils/bookingStorage";
import { mapServerPagination } from "../../utils/adminPaginationHelpers";

const EASE = [0.16, 1, 0.3, 1];
const EMPTY_BOOKINGS = [];

const FILTERS = [
  { id: "all", label: "All bookings" },
  { id: "upcoming", label: "Upcoming" },
  { id: "paid", label: "Paid" },
  { id: "reserved", label: "Pending payment" },
];

const STATUS_CONFIG = {
  paid: { label: "Paid in full", className: "bg-brand-green/10 text-brand-green ring-brand-green/20" },
  deposit_paid: { label: "Deposit paid", className: "bg-emerald-100 text-emerald-700 ring-emerald-200" },
  pay_onsite: { label: "Pay on site", className: "bg-brand-gold/15 text-brand-orange ring-brand-gold/30" },
  reserved: { label: "Pending payment", className: "bg-brand-orange/10 text-brand-orange ring-brand-orange/20" },
};

function formatSavedDate(iso) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

function BookingCard({ booking, index, onCompletePayment, onDownloadReceipt, payingRef, downloadingRef }) {
  const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.reserved;
  const upcoming = isUpcoming(booking);
  const image = booking.tour?.image;
  const slug = booking.tour?.slug;
  const detailCode = booking.bookingCode || booking.bookingRef;
  const amountLabel = formatBookingCurrency(
    booking.amount ?? booking.subtotal,
    resolveBookingCurrency(booking),
  );
  const paymentNote =
    booking.paymentMode === "online"
      ? booking.status === "paid"
        ? " paid online"
        : " due online"
      : " due on site";
  const canPayOnline = booking.paymentMode === "online" && booking.status === "reserved";
  const isPaying = payingRef === detailCode;
  const isDownloading = downloadingRef === detailCode;
  const canViewReceipt = canViewBookingReceipt(booking);
  const canEdit = canEditBooking(booking);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE, delay: Math.min(index * 0.06, 0.3) }}
      className="overflow-hidden rounded-[1.5rem] border border-brand-border/60 bg-white shadow-[0_10px_36px_-20px_rgba(28,43,38,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_44px_-18px_rgba(28,43,38,0.28)]"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image strip */}
        <div className="relative aspect-[16/9] shrink-0 overflow-hidden sm:aspect-auto sm:w-52 md:w-60">
          {image ? (
            <img src={image} alt={booking.tour.name} className="h-full w-full object-cover sm:min-h-[200px]" />
          ) : (
            <div className="flex h-full min-h-[160px] items-center justify-center bg-brand-cream text-4xl sm:min-h-[200px]">🌍</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent sm:bg-gradient-to-r" />
          {!upcoming && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-muted">
              Past
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4 sm:p-6">
          <div className="flex items-start justify-between gap-2">
            <p className="font-mono text-[11px] font-bold text-brand-green sm:text-xs">{booking.bookingRef}</p>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 sm:px-3 sm:text-[11px] ${status.className}`}>
              {status.label}
            </span>
          </div>
          <h2 className="mt-2 text-base font-bold leading-snug text-brand-ink sm:mt-1 sm:text-lg">{booking.tour.name}</h2>
          <p className="mt-1 text-sm leading-snug text-brand-muted">{booking.tour.location}</p>

          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">Departure</p>
              <p className="mt-0.5 font-semibold text-brand-ink">{booking.selectedDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">Travelers</p>
              <p className="mt-0.5 font-semibold text-brand-ink">{booking.travelers}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">Duration</p>
              <p className="mt-0.5 font-semibold text-brand-ink">{booking.tour.duration}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">Booked</p>
              <p className="mt-0.5 font-semibold text-brand-ink">{formatSavedDate(booking.savedAt ?? booking.issuedAt)}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-brand-border/40 pt-4">
            <span className="text-sm font-bold text-brand-ink">
              {amountLabel}
              <span className="ml-1 text-xs font-normal text-brand-muted">{paymentNote}</span>
            </span>
            {booking.bookingType === "group" ? (
              <span className="rounded-full bg-brand-cream px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                Group
              </span>
            ) : null}
          </div>

          {booking.paymentMode === "onsite" && canViewReceipt ? (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-brand-gold/10 px-3 py-2.5">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[11px] leading-relaxed text-brand-muted">
                Present your receipt at the premises upon arrival.
              </p>
            </div>
          ) : null}

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            {canPayOnline ? (
              <button
                type="button"
                onClick={() => onCompletePayment(booking)}
                disabled={isPaying}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-accent px-4 py-2 text-xs font-semibold text-brand-primary shadow-sm transition-all hover:bg-brand-accent-dark disabled:opacity-60"
              >
                {isPaying ? "Starting checkout…" : "Complete payment"}
              </button>
            ) : null}
            {canEdit && detailCode ? (
              <Link
                to={ROUTES.myBookingEdit(detailCode)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-orange/30 bg-brand-orange/5 px-4 py-2 text-xs font-semibold text-brand-orange transition-all hover:border-brand-orange/50 hover:bg-brand-orange/10"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Edit booking
              </Link>
            ) : null}
            {detailCode ? (
              <Link
                to={ROUTES.myBookingDetail(detailCode)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-4 py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-green/30 hover:text-brand-green"
              >
                View details
              </Link>
            ) : null}
            {canViewReceipt ? (
              <button
                type="button"
                onClick={() => onDownloadReceipt(booking)}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-green px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-green-dark disabled:opacity-60"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {isDownloading ? "Preparing PDF…" : "Download receipt"}
              </button>
            ) : null}
            {slug && (
              <Link
                to={ROUTES.tourDetail(slug)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-4 py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-green/30 hover:text-brand-green"
              >
                View tour
              </Link>
            )}
            <a
              href={getWhatsAppUrl(`Hi AfriQuest, I need help with booking ${booking.bookingRef}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-4 py-2 text-xs font-semibold text-brand-muted transition-all hover:border-brand-green/30 hover:text-brand-green"
            >
              Get support
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function MyBookingsPage() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const welcomeRef = searchParams.get("booked");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showWelcome, setShowWelcome] = useState(Boolean(welcomeRef));
  const [payingRef, setPayingRef] = useState(null);
  const [downloadingRef, setDownloadingRef] = useState(null);

  const {
    data,
    isFetching,
    error: bookingsError,
    refetch,
  } = useClientBookings(token, { page, per_page: 15 });

  const bookings = data?.items ?? EMPTY_BOOKINGS;
  const pagination = data?.pagination ?? null;
  const loading = isFetching;
  const error = bookingsError?.message ?? "";

  const paginationMeta = useMemo(
    () => mapServerPagination(pagination, { page }),
    [pagination, page],
  );

  const handleDownloadReceipt = useCallback(async (booking) => {
    const bookingCode = booking.bookingCode || booking.bookingRef;
    setDownloadingRef(bookingCode);

    const ok = await downloadBookingReceipt(booking, { token });
    setDownloadingRef(null);

    if (!ok) {
      toast.error("Could not generate PDF receipt. Please try again.");
      return;
    }

    toast.success("Receipt downloaded.");
  }, [token]);

  const handleCompletePayment = useCallback(async (booking) => {
    if (!token) return;

    const bookingCode = booking.bookingCode || booking.bookingRef;
    setPayingRef(bookingCode);

    const result = await consumerPaymentsServiceApi.retryPaymentForBooking(token, bookingCode, { booking });
    setPayingRef(null);

    const paymentUrl = extractPaymentRedirectUrl(result);
    if (paymentUrl) {
      window.location.assign(paymentUrl);
      return;
    }

    toast.error(result.reason || result.message || "Could not start payment.");
  }, [token]);

  useEffect(() => {
    if (!welcomeRef) return undefined;
    const timer = window.setTimeout(() => {
      setShowWelcome(false);
      setSearchParams({}, { replace: true });
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [welcomeRef, setSearchParams]);

  const stats = useMemo(() => ({
    total: paginationMeta.totalItems || bookings.length,
    upcoming: bookings.filter(isUpcoming).length,
    paid: bookings.filter((b) => b.status === "paid" || b.status === "deposit_paid").length,
    pending: bookings.filter((b) => b.status === "reserved" || b.status === "pay_onsite").length,
  }), [bookings, paginationMeta.totalItems]);

  const filtered = useMemo(() => {
    let list = bookings;
    if (filter === "upcoming") list = list.filter(isUpcoming);
    if (filter === "paid") list = list.filter((b) => b.status === "paid" || b.status === "deposit_paid");
    if (filter === "reserved") list = list.filter((b) => b.status === "reserved" || b.status === "pay_onsite");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.bookingRef.toLowerCase().includes(q) ||
          (b.bookingCode || "").toLowerCase().includes(q) ||
          b.tour.name.toLowerCase().includes(q) ||
          b.tour.country.toLowerCase().includes(q) ||
          b.selectedDate.toLowerCase().includes(q),
      );
    }
    return list;
  }, [bookings, filter, search]);

  return (
    <div className="min-h-screen bg-brand-cream">

      {/* Header */}
      <section className="border-b border-brand-green/15 bg-brand-green">
        <Container className="py-5 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-gold">Your trips</p>
              <h1 className="mt-0.5 text-xl font-bold text-white sm:text-2xl">My bookings</h1>
            </motion.div>

            <Link
              to={ROUTES.myPayments}
              className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:self-auto"
            >
              Payment history →
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
              { v: stats.upcoming, l: "Upcoming" },
              { v: stats.paid, l: "Confirmed" },
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

      {/* List */}
      <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Container>
          <AnimatePresence>
            {showWelcome && welcomeRef && (() => {
              const welcomeBooking = bookings.find(
                (b) =>
                  b.bookingRef === welcomeRef ||
                  b.bookingSlug === welcomeRef ||
                  b.bookingCode === welcomeRef,
              );
              const welcomeHasReceipt = canViewBookingReceipt(welcomeBooking);

              return (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-6 flex flex-col gap-3 rounded-2xl border border-brand-green/30 bg-brand-green/5 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green/15 text-brand-green">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <p className="font-bold text-brand-ink">Booking confirmed!</p>
                    <p className="mt-0.5 text-sm text-brand-muted">
                      Reference <span className="font-mono font-semibold text-brand-green">{welcomeRef}</span>
                      {welcomeHasReceipt
                        ? " — your receipt is ready. Present it on arrival."
                        : " — complete payment to download your receipt."}
                    </p>
                  </div>
                </div>
                {welcomeHasReceipt ? (
                  <button
                    type="button"
                    onClick={() => welcomeBooking && handleDownloadReceipt(welcomeBooking)}
                    disabled={downloadingRef === welcomeRef}
                    className="shrink-0 rounded-xl bg-brand-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-green-dark disabled:opacity-60"
                  >
                    {downloadingRef === welcomeRef ? "Preparing PDF…" : "Download receipt again"}
                  </button>
                ) : null}
              </motion.div>
              );
            })()}
          </AnimatePresence>

          {/* Toolbar */}
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
            <div className="relative w-full sm:w-64">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ref, tour, country…"
                className="h-10 w-full rounded-full border border-brand-border/70 bg-white pl-9 pr-4 text-sm outline-none focus:border-brand-green/50 focus:ring-2 focus:ring-brand-green/15"
              />
            </div>
          </div>

          <p className="mt-5 text-sm text-brand-muted">
            <span className="font-semibold text-brand-ink">{filtered.length}</span>
            {filtered.length === 1 ? " booking" : " bookings"}
            {filter !== "all" && <> · {FILTERS.find((f) => f.id === filter)?.label}</>}
            {paginationMeta.totalItems > 0 && filter === "all" && !search.trim() ? (
              <> · {paginationMeta.rangeStart}–{paginationMeta.rangeEnd} of {paginationMeta.totalItems}</>
            ) : null}
          </p>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
              <button
                type="button"
                onClick={() => refetch()}
                className="ml-3 font-semibold underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          ) : null}

          {loading ? (
            <div className="mt-16 flex flex-col items-center justify-center gap-3 text-brand-muted">
              <Loader2 className="h-8 w-8 animate-spin text-brand-green" strokeWidth={2} aria-hidden />
              <p className="text-sm">Loading your bookings…</p>
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            {!loading && filtered.length > 0 ? (
              <motion.div
                key={`${filter}-${search}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 space-y-5"
              >
                {filtered.map((booking, i) => (
                  <BookingCard
                    key={booking.bookingCode || booking.bookingRef}
                    booking={booking}
                    index={i}
                    onCompletePayment={handleCompletePayment}
                    onDownloadReceipt={handleDownloadReceipt}
                    payingRef={payingRef}
                    downloadingRef={downloadingRef}
                  />
                ))}
              </motion.div>
            ) : !loading ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-12 flex flex-col items-center rounded-[1.75rem] border border-brand-border/60 bg-white px-8 py-16 text-center shadow-sm"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/10 text-3xl">🧳</div>
                <h2 className="mt-5 text-xl font-bold text-brand-ink">
                  {bookings.length === 0 ? "No bookings yet" : "No matching bookings"}
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-brand-muted">
                  {bookings.length === 0
                    ? "When you book a tour, it will appear here with your receipt and departure details."
                    : "No bookings match your current filter. Try adjusting your search or filter."}
                </p>
                <Link
                  to={ROUTES.tours}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-green px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-green-dark"
                >
                  Browse tours
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </Link>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {!loading && paginationMeta.totalPages > 1 ? (
            <nav aria-label="Bookings pagination" className="mt-10 flex items-center justify-center gap-3">
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
