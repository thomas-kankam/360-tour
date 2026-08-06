import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CreditCard,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import adminPaymentsServiceApi from "../../apis/AdminPaymentsServiceApi";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import {
  formatAdminBookingDate,
  getAdminBookingStatusConfig,
  getAdminPaymentModeConfig,
} from "../../utils/adminBookingHelpers";
import { getAdminPaymentMethodConfig } from "../../utils/adminPaymentHelpers";
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
    <section className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-brand-muted">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function RelatedLink({ to, label }) {
  return (
    <Link to={to} className="inline-flex text-sm font-semibold text-brand-green hover:underline">
      {label}
    </Link>
  );
}

export default function AdminPaymentDetailPage() {
  const { paymentSlug } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPayment = useCallback(async () => {
    setLoading(true);
    const result = await adminPaymentsServiceApi.getPayment(token, paymentSlug);
    setLoading(false);

    if (!result.ok || !result.payment) {
      toast.error(result.reason || result.message || "Payment not found.");
      navigate(ROUTES.admin.payments, { replace: true });
      return;
    }

    setPayment(result.payment);
  }, [token, paymentSlug, navigate]);

  useEffect(() => {
    loadPayment();
  }, [loadPayment]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-black/8 bg-white py-24">
        <Loader2 className="h-7 w-7 animate-spin text-brand-green" aria-hidden />
      </div>
    );
  }

  if (!payment) return null;

  const booking = payment.booking;
  const traveler = booking?.leadTraveler || {};
  const travelerName = payment.travelerName || `${traveler.firstName || ""} ${traveler.lastName || ""}`.trim();
  const statusConfig = PAYMENT_STATUS_CONFIG[payment.status] ?? PAYMENT_STATUS_CONFIG.pending;
  const methodConfig = getAdminPaymentMethodConfig(payment);
  const clientSlug = booking?.client?.clientSlug || booking?.clientSlug;

  return (
    <div className="space-y-6">
      <Link
        to={ROUTES.admin.payments}
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted transition-colors hover:text-brand-ink"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        Back to payments
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="overflow-hidden rounded-2xl border border-black/8 bg-brand-ink text-white shadow-sm"
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
              <h1 className="mt-4 font-heading text-3xl font-bold">{payment.tourName}</h1>
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
              <dd>
                {payment.bookingCode ? (
                  <RelatedLink
                    to={ROUTES.admin.bookingDetail(payment.bookingCode)}
                    label={payment.bookingCode}
                  />
                ) : (
                  "—"
                )}
              </dd>
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
                  <dd className="font-semibold text-brand-ink">{booking.selectedDate || "—"}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 text-brand-orange" strokeWidth={2} aria-hidden />
                <div>
                  <dt className="text-brand-muted">Travelers</dt>
                  <dd className="font-semibold text-brand-ink">
                    {booking.travelers || 1}
                    <span className="text-brand-muted"> · {booking.bookingType === "group" ? "Group" : "Individual"}</span>
                  </dd>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge config={getAdminBookingStatusConfig(booking)} />
                <Badge config={getAdminPaymentModeConfig(booking)} />
              </div>
              <p className="text-xs text-brand-muted">
                Booked {formatAdminBookingDate(booking.savedAt)}
                {booking.updatedAt ? ` · Updated ${formatAdminBookingDate(booking.updatedAt)}` : ""}
              </p>
              {payment.bookingCode ? (
                <RelatedLink
                  to={ROUTES.admin.bookingDetail(payment.bookingCode)}
                  label="View full booking →"
                />
              ) : null}
            </dl>
          </DetailSection>
        ) : null}

        {booking?.client ? (
          <DetailSection title="Client">
            <p className="text-sm font-bold text-brand-ink">{booking.client.name || "—"}</p>
            <div className="mt-3 space-y-2 text-sm text-brand-muted">
              {booking.client.email ? (
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                  {booking.client.email}
                </p>
              ) : null}
              {booking.client.phoneNumber ? (
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                  {booking.client.phoneNumber}
                </p>
              ) : null}
              {booking.client.location ? (
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                  {booking.client.location}
                </p>
              ) : null}
            </div>
            {clientSlug ? (
              <div className="mt-4">
                <RelatedLink to={ROUTES.admin.clientDetail(clientSlug)} label="View client profile →" />
              </div>
            ) : null}
          </DetailSection>
        ) : null}

        {booking?.operator ? (
          <DetailSection title="Operator">
            <p className="text-sm font-bold text-brand-ink">{booking.operator.organization || booking.operator.name || "—"}</p>
            {booking.operator.name ? (
              <p className="mt-1 flex items-center gap-2 text-sm text-brand-muted">
                <User className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                {booking.operator.name}
              </p>
            ) : null}
            {booking.operator.email ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-brand-muted">
                <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                {booking.operator.email}
              </p>
            ) : null}
            {booking.operator.location ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-brand-muted">
                <Building2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                {booking.operator.location}
              </p>
            ) : null}
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
            <p className="text-sm font-bold text-brand-ink">{booking.tour.name || payment.tourName}</p>
            {booking.tour.location ? (
              <p className="mt-2 flex items-start gap-2 text-sm text-brand-muted">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" strokeWidth={2} aria-hidden />
                <span>{booking.tour.location}</span>
              </p>
            ) : null}
            {booking.tour.duration ? (
              <p className="mt-1 text-sm text-brand-muted">{booking.tour.duration}</p>
            ) : null}
            {booking.tour.slug ? (
              <div className="mt-4">
                <RelatedLink to={ROUTES.admin.listingDetail(booking.tour.slug)} label="View listing →" />
              </div>
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
