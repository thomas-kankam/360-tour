import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Luggage,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";
import PaymentReceiptModal from "../../components/payments/PaymentReceiptModal";
import { ROUTES } from "../../constants/routes";
import consumerPaymentsServiceApi from "../../apis/ConsumerPaymentsServiceApi";
import { formatPaymentDate, formatPaymentReferenceDisplay } from "../../utils/paymentHelpers";
import { mapVerifiedPaymentToReceipt, downloadPaymentReceiptPdf } from "../../utils/paymentReceipt";

const EASE = [0.22, 1, 0.36, 1];

const HEADER_PATTERN = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cg fill='none' transform='rotate(45 14 14)'%3E%3Crect width='14' height='14' fill='%23ffffff' fill-opacity='0.05'/%3E%3Crect x='14' y='14' width='14' height='14' fill='%23E3A020' fill-opacity='0.04'/%3E%3C/g%3E%3C/svg%3E\")",
  backgroundSize: "28px 28px",
};

function resolveBookingRef(searchParams) {
  return (
    searchParams.get("ref") ||
    searchParams.get("booking") ||
    searchParams.get("bookingCode") ||
    searchParams.get("reference") ||
    searchParams.get("trxref") ||
    ""
  ).trim();
}

function PaymentDetailItem({ label, value, mono = false, title }) {
  return (
    <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">{label}</p>
      <p
        className={`mt-1 text-sm font-bold text-white ${mono ? "font-mono" : ""}`}
        title={title || (typeof value === "string" ? value : undefined)}
      >
        {value}
      </p>
    </div>
  );
}

function TourSummaryPanel({ receipt }) {
  const travelerName = `${receipt.leadTraveler?.firstName || ""} ${receipt.leadTraveler?.lastName || ""}`.trim();

  return (
    <div className="flex h-full min-h-[320px] flex-col bg-white">
      {receipt.tour.image ? (
        <div className="relative h-44 shrink-0 overflow-hidden sm:h-52 lg:h-56">
          <img src={receipt.tour.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-brand-ink/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-gold">Your tour</p>
            <p className="mt-1 font-heading text-xl font-bold leading-snug text-white sm:text-2xl">
              {receipt.tour.name}
            </p>
          </div>
        </div>
      ) : (
        <div className="border-b border-brand-border/40 bg-gradient-to-br from-brand-cream/80 to-white px-5 py-6 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-muted">Your tour</p>
          <p className="mt-1 font-heading text-xl font-bold text-brand-ink sm:text-2xl">{receipt.tour.name}</p>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6 lg:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">Trip details</p>

        <dl className="mt-4 space-y-4">
          {receipt.tour.location ? (
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
                <MapPin className="h-4 w-4" strokeWidth={2} aria-hidden />
              </span>
              <div>
                <dt className="text-xs text-brand-muted">Destination</dt>
                <dd className="font-semibold text-brand-ink">{receipt.tour.location}</dd>
              </div>
            </div>
          ) : null}

          {receipt.tour.duration ? (
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                <Clock className="h-4 w-4" strokeWidth={2} aria-hidden />
              </span>
              <div>
                <dt className="text-xs text-brand-muted">Duration</dt>
                <dd className="font-semibold text-brand-ink">{receipt.tour.duration}</dd>
              </div>
            </div>
          ) : null}

          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-orange">
              <CalendarDays className="h-4 w-4" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <dt className="text-xs text-brand-muted">Departure date</dt>
              <dd className="font-semibold text-brand-ink">{receipt.selectedDate}</dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
              <Users className="h-4 w-4" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <dt className="text-xs text-brand-muted">Travelers</dt>
              <dd className="font-semibold text-brand-ink">
                {receipt.travelers} {receipt.travelers === 1 ? "person" : "people"}
                {receipt.bookingType === "group" ? " · Group booking" : ""}
              </dd>
            </div>
          </div>

          {travelerName ? (
            <div className="rounded-xl border border-brand-border/50 bg-brand-cream/40 px-4 py-3">
              <dt className="text-xs text-brand-muted">Lead traveler</dt>
              <dd className="mt-0.5 font-semibold text-brand-ink">{travelerName}</dd>
              {receipt.leadTraveler?.email ? (
                <dd className="mt-0.5 text-sm text-brand-muted">{receipt.leadTraveler.email}</dd>
              ) : null}
            </div>
          ) : null}
        </dl>
      </div>
    </div>
  );
}

function StatusIcon({ phase, isSuccess }) {
  if (phase === "loading") {
    return (
      <motion.div
        key="loading"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20"
      >
        <Loader2 className="h-7 w-7 animate-spin text-brand-gold" strokeWidth={2} aria-hidden />
      </motion.div>
    );
  }

  if (isSuccess) {
    return (
      <motion.div
        key="success"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20"
      >
        <CheckCircle2 className="h-7 w-7 text-brand-gold" strokeWidth={2} aria-hidden />
      </motion.div>
    );
  }

  return (
    <motion.div
      key="error"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20"
    >
      <AlertCircle className="h-7 w-7 text-brand-orange" strokeWidth={2} aria-hidden />
    </motion.div>
  );
}

function CompactStatusCard({ phase, isSuccess, bookingRef, errorMessage, children }) {
  const headerClass = isSuccess
    ? "bg-gradient-to-br from-brand-green via-brand-green to-brand-green-dark"
    : phase === "loading"
      ? "bg-gradient-to-br from-brand-ink/90 to-brand-green-dark"
      : "bg-gradient-to-br from-brand-ink to-brand-ink/90";

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-brand-cream/60 to-white px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-brand-border/60 bg-white shadow-[0_20px_60px_-24px_rgba(28,43,38,0.22)]"
      >
        <div className={`relative px-6 py-8 text-center text-white sm:px-8 ${headerClass}`}>
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-25" style={HEADER_PATTERN} />
          <div className="relative mx-auto max-w-sm">
            <AnimatePresence mode="wait">
              <div className="flex justify-center">
                <StatusIcon phase={phase} isSuccess={isSuccess} />
              </div>
            </AnimatePresence>

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
              {phase === "loading" ? "Verifying payment" : isSuccess ? "Payment verified" : "Verification issue"}
            </p>
            <p role="heading" aria-level={1} className="mt-2 font-heading text-xl font-bold text-white sm:text-2xl">
              {phase === "loading"
                ? "Confirming your payment…"
                : isSuccess
                  ? "Thank you, you're all set!"
                  : phase === "missing"
                    ? "Missing booking reference"
                    : "Payment could not be verified"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              {phase === "loading"
                ? "We're confirming your payment for this booking."
                : isSuccess
                  ? "Your payment is confirmed and your booking is secured."
                  : errorMessage ||
                    (phase === "missing"
                      ? "Return from checkout with your booking reference in the URL (e.g. ?ref=AFQ_123456)."
                      : "If you believe this is an error, contact support with your booking reference.")}
            </p>
            {bookingRef ? (
              <p className="mt-4 font-mono text-xs text-white/60">{bookingRef}</p>
            ) : null}
          </div>
        </div>
        {children ? <div className="space-y-5 p-6 sm:p-7">{children}</div> : null}
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const bookingRef = useMemo(() => resolveBookingRef(searchParams), [searchParams]);

  const [phase, setPhase] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    let active = true;

    async function verify() {
      if (!bookingRef) {
        setPhase("missing");
        return;
      }

      setPhase("loading");
      setErrorMessage("");

      const result = await consumerPaymentsServiceApi.verifyPayment(bookingRef);
      if (!active) return;

      if (!result.ok) {
        setPhase("error");
        setErrorMessage(result.reason || result.message || "Could not verify this payment.");
        return;
      }

      if (!result.verified || result.data?.status !== "paid") {
        setPhase("failed");
        setErrorMessage(result.reason || "Payment was not completed or could not be confirmed.");
        return;
      }

      setReceipt(mapVerifiedPaymentToReceipt(result.data));
      setPhase("success");
    }

    verify();
    return () => {
      active = false;
    };
  }, [bookingRef]);

  async function handleDownloadReceipt() {
    if (!receipt) {
      return false;
    }
    return downloadPaymentReceiptPdf(receipt);
  }

  const isSuccess = phase === "success" && receipt;
  const paymentRefDisplay = formatPaymentReferenceDisplay(receipt?.paymentReference || "", {
    maxLength: 18,
    head: 10,
    tail: 5,
  });

  if (phase === "loading") {
    return <CompactStatusCard phase={phase} isSuccess={false} bookingRef={bookingRef} errorMessage={errorMessage} />;
  }

  if (!isSuccess) {
    return (
      <CompactStatusCard phase={phase} isSuccess={false} bookingRef={bookingRef} errorMessage={errorMessage}>
        <AnimatePresence mode="wait">
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {phase === "failed" && bookingRef ? (
              <Link
                to={ROUTES.paymentFailure(bookingRef)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent py-3.5 text-sm font-semibold text-brand-primary transition-all hover:bg-brand-accent-dark"
              >
                Try payment again
              </Link>
            ) : null}
            <Link
              to={ROUTES.tours}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-border bg-white py-3.5 text-sm font-semibold text-brand-ink transition-all hover:border-brand-green/30 hover:bg-brand-cream"
            >
              <Compass className="h-4 w-4" strokeWidth={2} aria-hidden />
              Explore tours
            </Link>
            <Link
              to={ROUTES.myBookings}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent py-3.5 text-sm font-semibold text-brand-primary transition-all hover:bg-brand-accent-dark"
            >
              <Luggage className="h-4 w-4" strokeWidth={2} aria-hidden />
              My bookings
            </Link>
          </motion.div>
        </AnimatePresence>
      </CompactStatusCard>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-brand-cream/60 to-white px-4 py-8 sm:px-6 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="mx-auto w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-brand-border/60 bg-white shadow-[0_24px_64px_-28px_rgba(28,43,38,0.24)]"
      >
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="relative flex flex-col bg-gradient-to-br from-brand-green via-brand-green to-brand-green-dark px-6 py-8 text-white sm:px-8 sm:py-10 lg:min-h-[560px]">
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-25" style={HEADER_PATTERN} />

            <div className="relative flex flex-1 flex-col">
              <AnimatePresence mode="wait">
                <StatusIcon phase={phase} isSuccess={isSuccess} />
              </AnimatePresence>

              <p className="relative mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold/90">
                Payment verified
              </p>
              <p role="heading" aria-level={1} className="relative mt-2 font-heading text-2xl font-bold text-white sm:text-3xl">
                Thank you, you&apos;re all set!
              </p>
              <p className="relative mt-3 max-w-md text-sm leading-relaxed text-white/80">
                Your payment is confirmed and your booking is secured. View your receipt anytime.
              </p>

              <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
                <PaymentDetailItem label="Amount paid" value={receipt.amountLabel} />
                <PaymentDetailItem
                  label="Paid at"
                  value={formatPaymentDate(receipt.paidAt)}
                />
                <PaymentDetailItem
                  label="Booking reference"
                  value={receipt.bookingRef}
                  mono
                />
                <PaymentDetailItem
                  label="Payment reference"
                  value={paymentRefDisplay}
                  mono
                  title={receipt.paymentReference}
                />
              </div>

              <div className="relative mt-auto space-y-3 pt-8">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-semibold text-brand-green shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25)] transition-all hover:bg-brand-cream"
                >
                  <FileText className="h-4 w-4" strokeWidth={2} aria-hidden />
                  View receipt
                </button>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    to={ROUTES.myBookings}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-accent py-3.5 text-sm font-semibold text-brand-primary shadow-[0_8px_24px_-8px_rgba(255,219,88,0.55)] transition-all hover:bg-brand-accent-dark"
                  >
                    <Luggage className="h-4 w-4" strokeWidth={2} aria-hidden />
                    My bookings
                  </Link>
                  <Link
                    to={ROUTES.tours}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/15"
                  >
                    <Compass className="h-4 w-4" strokeWidth={2} aria-hidden />
                    Explore tours
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.1 }}
            className="border-t border-brand-border/40 lg:border-l lg:border-t-0"
          >
            <TourSummaryPanel receipt={receipt} />
          </motion.div>
        </div>
      </motion.div>

      <PaymentReceiptModal
        open={showReceiptModal}
        receipt={receipt}
        onClose={() => setShowReceiptModal(false)}
        onDownload={handleDownloadReceipt}
      />
    </div>
  );
}
