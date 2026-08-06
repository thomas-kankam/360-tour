import { useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { CalendarDays, CheckCircle2, Compass, Download, Luggage, Users } from "lucide-react";
import { toast } from "react-toastify";
import Container from "../../components/layout/Container";
import { ROUTES } from "../../constants/routes";
import { formatBookingCurrency, canViewBookingReceipt } from "../../utils/bookingHelpers";
import { downloadBookingReceipt } from "../../utils/bookingReceipt";
import { getBookingByRef, getBookingStatus } from "../../utils/bookingStorage";

const EASE = [0.22, 1, 0.36, 1];

function getSuccessCopy({ isPaidOnline, isOnsiteReservation, isOnlinePending }) {
  if (isPaidOnline) {
    return {
      eyebrow: "Payment confirmed",
      title: "You're all set!",
      description: "Your payment was received and your booking is confirmed. A receipt has been sent to your email.",
      accent: "text-brand-green",
      iconWrap: "bg-brand-green/10 text-brand-green",
    };
  }

  if (isOnsiteReservation) {
    return {
      eyebrow: "Reservation confirmed",
      title: "Your spots are held",
      description: "Your reservation is confirmed. Download your receipt and present it at check-in or our office.",
      accent: "text-brand-green",
      iconWrap: "bg-brand-green/10 text-brand-green",
    };
  }

  if (isOnlinePending) {
    return {
      eyebrow: "Booking submitted",
      title: "Complete payment to confirm",
      description: "Your booking is reserved. Complete checkout on the payment page, or check your email for payment instructions.",
      accent: "text-brand-orange",
      iconWrap: "bg-brand-orange/10 text-brand-orange",
    };
  }

  return {
    eyebrow: "Reservation confirmed",
    title: "Your spots are held",
    description: "We've sent a confirmation to your email. You can view the full booking in My bookings.",
    accent: "text-brand-green",
    iconWrap: "bg-brand-green/10 text-brand-green",
  };
}

export default function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const [downloading, setDownloading] = useState(false);
  const bookingRef = searchParams.get("ref") || searchParams.get("booking") || "";
  const paymentMode = searchParams.get("payment") || "onsite";

  const booking = useMemo(() => getBookingByRef(bookingRef), [bookingRef]);

  if (!bookingRef) {
    return <Navigate to={ROUTES.tours} replace />;
  }

  const isOnline = paymentMode === "online";
  const tourName = booking?.tour?.name || "Your tour";
  const amountLabel = booking
    ? formatBookingCurrency(booking.subtotal, booking.currency)
    : null;

  const bookingStatus = booking ? (booking.status || getBookingStatus(booking)) : null;
  const isPaidOnline = bookingStatus === "paid" || bookingStatus === "deposit_paid";
  const isOnsiteReservation = bookingStatus === "pay_onsite" || paymentMode === "onsite";
  const isOnlinePending = isOnline && bookingStatus === "reserved";
  const canViewReceipt = canViewBookingReceipt(booking);
  const copy = getSuccessCopy({ isPaidOnline, isOnsiteReservation, isOnlinePending });

  async function handleDownloadReceipt() {
    if (!booking) return;

    setDownloading(true);
    const ok = await downloadBookingReceipt(booking);
    setDownloading(false);

    if (!ok) {
      toast.error("Could not generate PDF receipt. Please try again.");
      return;
    }

    toast.success("Receipt downloaded.");
  }

  return (
    <div className="min-h-[70vh] bg-brand-cream pb-16 pt-8 sm:pt-10">
      <Container className="max-w-2xl">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="overflow-hidden rounded-[1.5rem] border border-brand-border/60 bg-white shadow-[0_12px_40px_-20px_rgba(28,43,38,0.18)]"
        >
          <div className="border-b border-brand-border/40 bg-gradient-to-r from-brand-cream/80 to-white px-5 py-5 sm:px-7">
            <div className="flex items-start gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${copy.iconWrap}`}>
                <CheckCircle2 className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${copy.accent}`}>
                  {copy.eyebrow}
                </p>
                <h1 className="mt-0.5 text-xl font-bold leading-snug text-brand-ink sm:text-2xl">
                  {copy.title}
                </h1>
                <p className="mt-1.5 text-sm leading-relaxed text-brand-muted">
                  {copy.description}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-7">
            <div className="rounded-xl border border-brand-border/50 bg-brand-cream/30 p-4 sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-muted">Booking reference</p>
              <p className="mt-1 font-mono text-base font-bold text-brand-green sm:text-lg">{bookingRef}</p>

              {booking ? (
                <dl className="mt-4 grid gap-3 border-t border-brand-border/40 pt-4 text-sm sm:grid-cols-2">
                  <div className="flex items-start gap-2.5">
                    <Compass className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                    <div>
                      <dt className="text-xs text-brand-muted">Tour</dt>
                      <dd className="font-semibold text-brand-ink">{tourName}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                    <div>
                      <dt className="text-xs text-brand-muted">Departure</dt>
                      <dd className="font-semibold text-brand-ink">{booking.selectedDate}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Users className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                    <div>
                      <dt className="text-xs text-brand-muted">Travelers</dt>
                      <dd className="font-semibold text-brand-ink">{booking.travelers}</dd>
                    </div>
                  </div>
                  {amountLabel ? (
                    <div>
                      <dt className="text-xs text-brand-muted">Total</dt>
                      <dd className="font-bold text-brand-green">{amountLabel}</dd>
                    </div>
                  ) : null}
                </dl>
              ) : (
                <p className="mt-3 text-sm text-brand-muted">
                  Confirmation details were sent to your email. You can view the full booking in My bookings.
                </p>
              )}
            </div>

            {!isPaidOnline && isOnlinePending ? (
              <Link
                to={ROUTES.myBookings}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent py-3 text-sm font-semibold text-brand-primary shadow-sm transition-all hover:bg-brand-accent-dark"
              >
                Complete payment in My bookings
              </Link>
            ) : null}

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Link
                to={ROUTES.tours}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-border bg-white py-3 text-sm font-semibold text-brand-ink transition-all hover:border-brand-green/30 hover:bg-brand-cream"
              >
                <Compass className="h-4 w-4" strokeWidth={2} aria-hidden />
                Explore tours
              </Link>
              <Link
                to={ROUTES.myBookings}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-green py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-green-dark"
              >
                <Luggage className="h-4 w-4" strokeWidth={2} aria-hidden />
                My bookings
              </Link>
            </div>

            {booking && canViewReceipt ? (
              <button
                type="button"
                onClick={handleDownloadReceipt}
                disabled={downloading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-green/25 bg-brand-green/5 py-3 text-sm font-semibold text-brand-green transition-all hover:bg-brand-green/10 disabled:opacity-60"
              >
                <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
                {downloading ? "Preparing PDF…" : "Download receipt"}
              </button>
            ) : null}
          </div>
        </motion.article>
      </Container>
    </div>
  );
}
