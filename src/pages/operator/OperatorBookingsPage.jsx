import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Search,
  Users,
  X,
} from "lucide-react";
import operatorBookingsServiceApi from "../../apis/OperatorBookingsServiceApi";
import AdminPagination from "../../components/admin/AdminPagination";
import RecordOnsitePaymentModal from "../../components/operator/RecordOnsitePaymentModal";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useServerAdminPagination } from "../../hooks/useAdminPagination";
import { buildListQueryParams } from "../../utils/adminPaginationHelpers";
import {
  canRecordOnsitePayment,
  formatOperatorBookingDate,
  getOperatorBookingStatusConfig,
  getOperatorPaymentStatusConfig,
  getOperatorPaymentModeConfig,
  normalizeBookingCodeInput,
} from "../../utils/operatorBookingHelpers";

const EASE = [0.22, 1, 0.36, 1];

function StatusBadge({ config }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${config.className}`}>
      {config.label}
    </span>
  );
}

function BookingLookupResult({ booking, onClear, onRecordPayment }) {
  const bookingStatus = getOperatorBookingStatusConfig(booking);
  const paymentStatus = getOperatorPaymentStatusConfig(booking);
  const paymentMode = getOperatorPaymentModeConfig(booking);
  const showRecordPayment = canRecordOnsitePayment(booking);
  const traveler = booking.leadTraveler || {};
  const travelerName = `${traveler.firstName || ""} ${traveler.lastName || ""}`.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="overflow-hidden rounded-2xl border border-brand-green/25 bg-white shadow-[0_16px_48px_-20px_rgba(45,90,71,0.28)]"
    >
      <div className="relative">
        {booking.tour?.image ? (
          <div className="relative h-40 overflow-hidden sm:h-44">
            <img src={booking.tour.image} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-brand-ink/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-xs font-bold text-brand-gold">{booking.bookingRef}</p>
                <h3 className="mt-1 text-xl font-bold text-white">{booking.tour.name}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge config={paymentStatus} />
                <StatusBadge config={paymentMode} />
              </div>
            </div>
          </div>
        ) : (
          <div className="border-b border-brand-border/40 bg-brand-green/5 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs font-bold text-brand-green">{booking.bookingRef}</p>
                <h3 className="mt-1 text-lg font-bold text-brand-ink">{booking.tour?.name}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge config={paymentStatus} />
                <StatusBadge config={paymentMode} />
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          aria-label="Clear lookup"
        >
          <X className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <div className="rounded-xl border border-brand-border/50 bg-brand-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Departure</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-bold text-brand-ink">
            <CalendarDays className="h-4 w-4 text-brand-orange" strokeWidth={2} aria-hidden />
            {booking.selectedDate}
          </p>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-brand-muted">Travelers</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-bold text-brand-ink">
            <Users className="h-4 w-4 text-brand-orange" strokeWidth={2} aria-hidden />
            {booking.travelers}
            <span className="text-xs font-normal text-brand-muted">
              · {booking.bookingType === "group" ? "Group booking" : "Individual"}
            </span>
          </p>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-brand-muted">Amount</p>
          <p className="mt-1 text-lg font-bold text-brand-green">{booking.amountLabel}</p>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-brand-muted">Booking status</p>
          <StatusBadge config={bookingStatus} />
        </div>

        <div className="rounded-xl border border-brand-border/50 bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Lead traveler</p>
          <p className="mt-1 text-sm font-bold text-brand-ink">{travelerName || "—"}</p>
          <div className="mt-3 space-y-2 text-sm text-brand-muted">
            {traveler.email ? (
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                {traveler.email}
              </p>
            ) : null}
            {traveler.phone ? (
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                {traveler.phone}
              </p>
            ) : null}
            {traveler.nationality ? (
              <p className="flex items-center gap-2">
                <Globe2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                {traveler.nationality}
              </p>
            ) : null}
          </div>
        </div>

        {booking.bookingType === "group" && booking.groupDetails ? (
          <div className="rounded-xl border border-brand-border/50 bg-white p-4 sm:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Group details</p>
            <p className="mt-1 text-sm font-bold text-brand-ink">{booking.groupDetails.groupName}</p>
            <p className="mt-1 text-sm text-brand-muted">
              {booking.groupTypeLabel || booking.groupDetails.groupType}
              {booking.groupDetails.organization ? ` · ${booking.groupDetails.organization}` : ""}
            </p>
          </div>
        ) : null}

        {booking.tour?.location ? (
          <div className="flex items-start gap-2 text-sm sm:col-span-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" strokeWidth={2} aria-hidden />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Tour route</p>
              <p className="font-semibold text-brand-ink">{booking.tour.location}</p>
              <p className="text-brand-muted">{booking.tour.duration}</p>
            </div>
          </div>
        ) : null}

        {booking.specialRequests || booking.dietaryNeeds ? (
          <div className="rounded-xl border border-brand-border/50 bg-brand-cream/30 p-4 sm:col-span-2">
            {booking.specialRequests ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Special requests</p>
                <p className="mt-1 text-sm text-brand-ink">{booking.specialRequests}</p>
              </div>
            ) : null}
            {booking.dietaryNeeds ? (
              <div className={booking.specialRequests ? "mt-3" : ""}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Dietary / accessibility</p>
                <p className="mt-1 text-sm text-brand-ink">{booking.dietaryNeeds}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        <p className="text-xs text-brand-muted sm:col-span-2">
          Booked {formatOperatorBookingDate(booking.savedAt)}
          {booking.updatedAt ? ` · Updated ${formatOperatorBookingDate(booking.updatedAt)}` : ""}
        </p>

        {showRecordPayment ? (
          <div className="rounded-xl border border-brand-gold/30 bg-brand-gold/10 p-4 sm:col-span-2">
            <p className="text-sm font-semibold text-brand-ink">Payment due on site</p>
            <p className="mt-1 text-sm text-brand-muted">
              This booking is verified. Record the amount collected to mark it as paid.
            </p>
            <button
              type="button"
              onClick={onRecordPayment}
              className="btn-primary mt-4 inline-flex items-center gap-2"
            >
              <Banknote className="h-4 w-4" strokeWidth={2} aria-hidden />
              Record payment
            </button>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

function BookingListRow({ booking }) {
  const paymentStatus = getOperatorPaymentStatusConfig(booking);
  const paymentMode = getOperatorPaymentModeConfig(booking);
  const traveler = booking.leadTraveler || {};

  return (
    <tr className="border-b border-brand-border/40 transition-colors last:border-0 hover:bg-brand-cream/40">
      <td className="whitespace-nowrap px-4 py-3.5">
        <p className="font-mono text-xs font-bold text-brand-green">{booking.bookingRef}</p>
      </td>
      <td className="px-4 py-3.5">
        <p className="line-clamp-1 text-sm font-semibold text-brand-ink">{booking.tour?.name}</p>
        <p className="line-clamp-1 text-xs text-brand-muted">{traveler.firstName} {traveler.lastName}</p>
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-sm font-semibold text-brand-ink">{booking.selectedDate}</td>
      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-brand-ink">{booking.travelers}</td>
      <td className="whitespace-nowrap px-4 py-3.5">
        <StatusBadge config={paymentStatus} />
      </td>
      <td className="whitespace-nowrap px-4 py-3.5">
        <StatusBadge config={paymentMode} />
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-sm font-bold text-brand-ink">{booking.amountLabel}</td>
      <td className="whitespace-nowrap px-4 py-3.5">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("operator:lookup-booking", { detail: booking.bookingRef }))}
          className="text-xs font-semibold text-brand-green hover:text-brand-green-dark"
        >
          Verify →
        </button>
      </td>
    </tr>
  );
}

export default function OperatorBookingsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [lookupCode, setLookupCode] = useState("");
  const [lookupBooking, setLookupBooking] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);

  const {
    page,
    setPage,
    syncFromResponse,
    totalItems,
    totalPages,
    rangeStart,
    rangeEnd,
  } = useServerAdminPagination({ pageSize: 15 });

  const loadBookings = useCallback(async () => {
    if (!token) return;

    setListLoading(true);
    setListError("");

    const result = await operatorBookingsServiceApi.listBookings(
      token,
      buildListQueryParams({ page, per_page: 15 }),
    );

    setListLoading(false);

    if (!result.ok) {
      setBookings([]);
      setListError(result.reason || result.message || "Could not load bookings.");
      return;
    }

    const sync = syncFromResponse({ items: result.items, pagination: result.pagination }, page);
    setBookings(sync.items);
  }, [token, page, syncFromResponse]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const runLookup = useCallback(async (code) => {
    const normalized = normalizeBookingCodeInput(code);
    if (!token || !normalized) {
      setLookupError("Enter a booking reference (e.g. AFQ_NMSV21).");
      setLookupBooking(null);
      return;
    }

    setLookupLoading(true);
    setLookupError("");
    setLookupBooking(null);

    const result = await operatorBookingsServiceApi.getBooking(token, normalized);
    setLookupLoading(false);

    if (!result.ok || !result.booking) {
      setLookupError(result.reason || result.message || "No booking found for that reference.");
      return;
    }

    setLookupBooking(result.booking);
    setLookupCode(normalized);
  }, [token]);

  useEffect(() => {
    function onLookupEvent(event) {
      const code = event.detail;
      if (code) {
        setLookupCode(code);
        runLookup(code);
      }
    }

    window.addEventListener("operator:lookup-booking", onLookupEvent);
    return () => window.removeEventListener("operator:lookup-booking", onLookupEvent);
  }, [runLookup]);

  function handleLookupSubmit(event) {
    event.preventDefault();
    runLookup(lookupCode);
  }

  function clearLookup() {
    setLookupCode("");
    setLookupBooking(null);
    setLookupError("");
    setRecordPaymentOpen(false);
  }

  async function handlePaymentRecorded() {
    if (lookupBooking?.bookingRef) {
      await runLookup(lookupBooking.bookingRef);
    }
    loadBookings();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">Reservations</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-brand-ink sm:text-3xl">Bookings</h1>
          <p className="mt-1 text-sm text-brand-muted">Verify receipts on arrival or browse all reservations.</p>
        </div>
        <Link to={ROUTES.operator.tours} className="text-sm font-semibold text-brand-green hover:text-brand-green-dark">
          Manage listings →
        </Link>
      </div>

      <section className="overflow-hidden rounded-2xl border border-brand-border/60 bg-white shadow-sm">
        <div className="border-b border-brand-border/40 bg-gradient-to-r from-brand-green/8 via-brand-cream/50 to-brand-gold/10 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green text-white shadow-sm">
              <Receipt className="h-5 w-5" strokeWidth={2} aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-ink">Receipt check-in</h2>
              <p className="mt-0.5 text-sm text-brand-muted">
                Customer presents their receipt — enter the booking code to pull live details.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleLookupSubmit} className="border-b border-brand-border/40 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" strokeWidth={2} aria-hidden />
              <input
                type="text"
                value={lookupCode}
                onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
                placeholder="AFQ_NMSV21"
                autoComplete="off"
                spellCheck={false}
                className="h-12 w-full rounded-xl border-2 border-brand-border bg-white pl-11 pr-4 font-mono text-base font-bold tracking-wide text-brand-ink outline-none transition-all placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:tracking-normal focus:border-brand-green focus:ring-2 focus:ring-brand-green/15"
              />
            </div>
            <button
              type="submit"
              disabled={lookupLoading || !lookupCode.trim()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-green px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-green-dark disabled:opacity-60"
            >
              {lookupLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden />
              ) : (
                <CheckCircle2 className="h-4 w-4" strokeWidth={2} aria-hidden />
              )}
              Verify booking
            </button>
          </div>
        </form>

        <div className="p-5 sm:p-6">
          <AnimatePresence mode="wait">
            {lookupLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 py-10 text-brand-muted"
              >
                <Loader2 className="h-5 w-5 animate-spin text-brand-green" strokeWidth={2} aria-hidden />
                Fetching booking…
              </motion.div>
            ) : lookupBooking ? (
              <BookingLookupResult
                key={lookupBooking.bookingRef}
                booking={lookupBooking}
                onClear={clearLookup}
                onRecordPayment={() => setRecordPaymentOpen(true)}
              />
            ) : lookupError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {lookupError}
              </motion.div>
            ) : (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-6 text-center text-sm text-brand-muted"
              >
                Enter a code from the customer&apos;s receipt or email confirmation.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </section>

      <RecordOnsitePaymentModal
        open={recordPaymentOpen}
        onClose={() => setRecordPaymentOpen(false)}
        onRecorded={handlePaymentRecorded}
        initialBookingCode={lookupBooking?.bookingRef}
        initialAmount={lookupBooking?.subtotal}
        currency={lookupBooking?.currency}
        lockBookingCode
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-brand-ink">
            <ClipboardList className="h-4 w-4 text-brand-green" strokeWidth={2} aria-hidden />
            All reservations
            {!listLoading && totalItems ? (
              <span className="rounded-full bg-brand-cream px-2 py-0.5 text-xs font-bold text-brand-muted">
                {totalItems}
              </span>
            ) : null}
          </h2>
        </div>

        {listError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{listError}</div>
        ) : null}

        {listLoading ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-brand-border/60 bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-brand-green" strokeWidth={2} aria-hidden />
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-border/70 bg-white px-6 py-14 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-brand-muted/40" strokeWidth={1.5} aria-hidden />
            <p className="mt-4 font-semibold text-brand-ink">No bookings yet</p>
            <p className="mt-1 text-sm text-brand-muted">Reservations for your tours will appear here.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-brand-border/60 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-brand-border/50 bg-brand-cream/50 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Tour / traveler</th>
                    <th className="px-4 py-3">Departure</th>
                    <th className="px-4 py-3">Pax</th>
                    <th className="px-4 py-3">Payment status</th>
                    <th className="px-4 py-3">Payment mode</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <BookingListRow key={booking.bookingRef} booking={booking} />
                  ))}
                </tbody>
              </table>
            </div>

            <AdminPagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              onPageChange={setPage}
              className="border-0 border-t border-brand-border/50 shadow-none"
            />
          </div>
        )}
      </section>
    </div>
  );
}
