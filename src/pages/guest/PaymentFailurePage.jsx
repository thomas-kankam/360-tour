import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { AlertCircle, Compass, CreditCard, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { ROUTES } from "../../constants/routes";
import consumerPaymentsServiceApi from "../../apis/ConsumerPaymentsServiceApi";
import { useAuth } from "../../hooks/useAuth";
import { extractPaymentRedirectUrl } from "../../utils/paymentHelpers";

const EASE = [0.22, 1, 0.36, 1];

export default function PaymentFailurePage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const bookingRef =
    searchParams.get("ref") ||
    searchParams.get("booking") ||
    searchParams.get("bookingCode") ||
    "";
  const paymentSlug = searchParams.get("payment") || searchParams.get("paymentSlug") || "";
  const reason = searchParams.get("reason") || searchParams.get("message") || "";

  const [retrying, setRetrying] = useState(false);

  async function handleRetryPayment() {
    if (!token) return;

    if (!bookingRef && !paymentSlug) {
      toast.error("Missing payment or booking reference.");
      return;
    }

    setRetrying(true);

    const result = await consumerPaymentsServiceApi.retryPaymentForBooking(token, bookingRef || undefined, {
      paymentSlug: paymentSlug || undefined,
    });

    setRetrying(false);

    const paymentUrl = extractPaymentRedirectUrl(result);
    if (paymentUrl) {
      window.location.assign(paymentUrl);
      return;
    }

    toast.error(result.reason || result.message || "Could not retry payment.");
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-brand-cream/60 to-white px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-brand-border/60 bg-white shadow-[0_20px_60px_-24px_rgba(28,43,38,0.22)]"
      >
        <div className="border-b border-brand-border/40 bg-gradient-to-r from-red-600 to-red-700 px-6 py-8 text-center text-white sm:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20">
            <AlertCircle className="h-7 w-7 text-white" strokeWidth={2} aria-hidden />
          </div>
          <p role="heading" aria-level={1} className="mt-4 font-heading text-xl font-bold text-white sm:text-2xl">
            Payment was unsuccessful
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/80">
            {reason || "Your payment could not be processed. Your booking is still reserved — you can try again."}
          </p>
        </div>

        <div className="space-y-5 p-6 sm:p-7">
            {bookingRef ? (
              <div className="rounded-2xl border border-brand-border/50 bg-brand-cream/40 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">Booking reference</p>
                <p className="mt-1 font-mono text-lg font-bold text-brand-green">{bookingRef}</p>
                <Link
                  to={ROUTES.myBookingDetail(bookingRef)}
                  className="mt-3 inline-flex text-sm font-semibold text-brand-green hover:text-brand-green-dark"
                >
                  View booking details →
                </Link>
              </div>
            ) : null}

            <div className="flex flex-col gap-3">
              {token && (paymentSlug || bookingRef) ? (
                <button
                  type="button"
                  onClick={handleRetryPayment}
                  disabled={retrying}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent py-3.5 text-sm font-semibold text-brand-primary shadow-[0_8px_24px_-8px_rgba(255,219,88,0.55)] transition-all hover:bg-brand-accent-dark disabled:opacity-60"
                >
                  <RefreshCw className="h-4 w-4" strokeWidth={2} aria-hidden />
                  {retrying ? "Redirecting…" : "Try payment again"}
                </button>
              ) : null}
              <Link
                to={ROUTES.myBookings}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-border bg-white py-3.5 text-sm font-semibold text-brand-ink transition-all hover:border-brand-green/30 hover:bg-brand-cream"
              >
                <CreditCard className="h-4 w-4" strokeWidth={2} aria-hidden />
                My bookings
              </Link>
            </div>

            <Link
              to={ROUTES.tours}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-green/25 bg-brand-green/5 py-3 text-sm font-semibold text-brand-green transition-all hover:bg-brand-green/10"
            >
              <Compass className="h-4 w-4" strokeWidth={2} aria-hidden />
              Browse other tours
            </Link>
          </div>
        </motion.div>
    </div>
  );
}
