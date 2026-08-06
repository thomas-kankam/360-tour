import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import operatorPaymentsServiceApi from "../../apis/OperatorPaymentsServiceApi";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import {
  formatOperatorBookingDate,
  getOperatorBookingStatusConfig,
  getOperatorPaymentModeConfig,
} from "../../utils/operatorBookingHelpers";
import { getOperatorPaymentMethodConfig } from "../../utils/operatorPaymentHelpers";
import { formatPaymentDate, PAYMENT_STATUS_CONFIG } from "../../utils/paymentHelpers";

const EASE = [0.22, 1, 0.36, 1];

function Badge({ config }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${config.className}`}>
      {config.label}
    </span>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-brand-muted">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function OperatorPaymentDetailPage() {
  const { paymentSlug } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token || !paymentSlug) return undefined;

    let active = true;

    async function load() {
      setLoading(true);
      const result = await operatorPaymentsServiceApi.getPayment(token, paymentSlug);
      if (!active) return;

      setLoading(false);

      if (!result.ok || !result.payment) {
        setNotFound(true);
        return;
      }

      setPayment(result.payment);
    }

    load();
    return () => {
      active = false;
    };
  }, [token, paymentSlug]);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-brand-border/60 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" strokeWidth={2} aria-hidden />
      </div>
    );
  }

  if (notFound || !payment) {
    return (
      <div className="rounded-2xl border border-brand-border bg-white p-10 text-center">
        <p className="font-semibold text-brand-ink">Payment not found</p>
        <Link to={ROUTES.operator.payments} className="mt-4 inline-block text-sm font-semibold text-brand-green hover:underline">
          Back to payments
        </Link>
      </div>
    );
  }

  const booking = payment.booking;
  const traveler = booking?.leadTraveler || {};
  const travelerName = payment.travelerName || `${traveler.firstName || ""} ${traveler.lastName || ""}`.trim();
  const statusConfig = PAYMENT_STATUS_CONFIG[payment.status] ?? PAYMENT_STATUS_CONFIG.pending;
  const methodConfig = getOperatorPaymentMethodConfig(payment);

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(ROUTES.operator.payments)}
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-muted hover:text-brand-ink"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        Back to payments
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="overflow-hidden rounded-[1.75rem] border border-brand-border/60 bg-brand-ink text-white shadow-xl"
      >
        <div className="relative">
          {payment.tourImage ? (
            <img src={payment.tourImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-ink via-brand-ink/92 to-brand-ink/75" />

          <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ${statusConfig.className}`}>
                  {statusConfig.label}
                </span>
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ${methodConfig.className}`}>
                  {methodConfig.label}
                </span>
              </div>
              <h1 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">{payment.tourName}</h1>
              {travelerName ? (
                <p className="mt-2 text-sm text-white/75">Lead traveler · {travelerName}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/70">
                <span className="font-mono text-xs font-bold text-brand-gold">{payment.bookingCode}</span>
                {payment.reference ? (
                  <span className="font-mono text-xs text-white/60">Ref {payment.reference}</span>
                ) : null}
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-right backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Amount</p>
              <p className="text-3xl font-bold text-brand-gold">{payment.amountLabel}</p>
              <p className="mt-1 text-xs text-white/60">
                {payment.status === "paid" ? formatPaymentDate(payment.paidAt) : "Not paid yet"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-2">
        <DetailSection title="Payment details">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-brand-muted">Payment ID</dt>
              <dd className="max-w-[65%] truncate font-mono text-xs font-semibold text-brand-ink" title={payment.paymentSlug}>
                {payment.paymentSlug}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brand-muted">Booking code</dt>
              <dd className="font-mono text-xs font-bold text-brand-green">{payment.bookingCode}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brand-muted">Gateway reference</dt>
              <dd className="font-mono text-xs font-semibold text-brand-ink">{payment.reference || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brand-muted">Created</dt>
              <dd className="font-semibold text-brand-ink">{formatPaymentDate(payment.createdAt)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brand-muted">Paid at</dt>
              <dd className="font-semibold text-brand-ink">{formatPaymentDate(payment.paidAt)}</dd>
            </div>
            {payment.paymentUrl && payment.status === "pending" ? (
              <div className="pt-2">
                <a
                  href={payment.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:underline"
                >
                  <CreditCard className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Open checkout link
                </a>
              </div>
            ) : null}
          </dl>
        </DetailSection>

        {booking ? (
          <DetailSection title="Booking snapshot">
            <dl className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 text-brand-orange" strokeWidth={2} aria-hidden />
                <div>
                  <dt className="text-brand-muted">Departure</dt>
                  <dd className="font-semibold text-brand-ink">{booking.selectedDate}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 text-brand-orange" strokeWidth={2} aria-hidden />
                <div>
                  <dt className="text-brand-muted">Travelers</dt>
                  <dd className="font-semibold text-brand-ink">
                    {booking.travelers}
                    <span className="text-brand-muted"> · {booking.bookingType === "group" ? "Group" : "Individual"}</span>
                  </dd>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge config={getOperatorBookingStatusConfig(booking)} />
                <Badge config={getOperatorPaymentModeConfig(booking)} />
              </div>
              <p className="text-xs text-brand-muted">
                Booked {formatOperatorBookingDate(booking.savedAt)}
                {booking.updatedAt ? ` · Updated ${formatOperatorBookingDate(booking.updatedAt)}` : ""}
              </p>
            </dl>
          </DetailSection>
        ) : null}

        {travelerName || traveler.email || traveler.phone ? (
          <DetailSection title="Lead traveler">
            <p className="text-sm font-bold text-brand-ink">{travelerName || "—"}</p>
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
          </DetailSection>
        ) : null}

        {booking?.tour ? (
          <DetailSection title="Tour listing">
            <p className="text-sm font-bold text-brand-ink">{booking.tour.name}</p>
            {booking.tour.location ? (
              <p className="mt-2 flex items-start gap-2 text-sm text-brand-muted">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" strokeWidth={2} aria-hidden />
                <span>{booking.tour.location}</span>
              </p>
            ) : null}
            <p className="mt-1 text-sm text-brand-muted">{booking.tour.duration}</p>
            {booking.tour.slug ? (
              <Link
                to={ROUTES.operator.tourDetail(booking.tour.slug)}
                className="mt-4 inline-flex text-sm font-semibold text-brand-green hover:underline"
              >
                Open listing →
              </Link>
            ) : null}
          </DetailSection>
        ) : null}

        {booking?.specialRequests || booking?.dietaryNeeds ? (
          <DetailSection title="Notes">
            {booking.specialRequests ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Special requests</p>
                <p className="mt-1 text-sm text-brand-ink">{booking.specialRequests}</p>
              </div>
            ) : null}
            {booking.dietaryNeeds ? (
              <div className={booking.specialRequests ? "mt-4" : ""}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Dietary / accessibility</p>
                <p className="mt-1 text-sm text-brand-ink">{booking.dietaryNeeds}</p>
              </div>
            ) : null}
          </DetailSection>
        ) : null}
      </div>
    </div>
  );
}
