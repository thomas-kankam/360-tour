import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { motion } from "motion/react";
import { CalendarDays, Building2, Globe2, Loader2, Mail, MapPin, Pencil, Phone, Tags, Users } from "lucide-react";
import { toast } from "react-toastify";
import Container from "../../components/layout/Container";
import { ROUTES } from "../../constants/routes";
import { getWhatsAppUrl } from "../../config/env";
import consumerBookingsServiceApi from "../../apis/ConsumerBookingsServiceApi";
import consumerPaymentsServiceApi from "../../apis/ConsumerPaymentsServiceApi";
import { useAuth } from "../../hooks/useAuth";
import { formatBookingCurrency, canViewBookingReceipt, canEditBooking, resolveBookingCurrency } from "../../utils/bookingHelpers";
import { extractPaymentRedirectUrl } from "../../utils/paymentHelpers";
import { downloadBookingReceipt } from "../../utils/bookingReceipt";

const EASE = [0.16, 1, 0.3, 1];

const STATUS_CONFIG = {
  paid: { label: "Paid in full", className: "bg-brand-green/10 text-brand-green" },
  pay_onsite: { label: "Pay on site", className: "bg-brand-gold/15 text-brand-orange" },
  reserved: { label: "Pending payment", className: "bg-brand-orange/10 text-brand-orange" },
};

const GROUP_TYPE_LABELS = {
  university: "University / School",
  corporate: "Corporate",
  family: "Family & Friends",
  other: "Other organisation",
};

function formatGroupType(type) {
  if (!type) return "";
  return GROUP_TYPE_LABELS[type] || type.replace(/_/g, " ");
}

export default function MyBookingDetailPage() {
  const { bookingCode } = useParams();
  const { token } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const loadBooking = useCallback(async () => {
    if (!token || !bookingCode) return;

    setLoading(true);
    setError("");

    const result = await consumerBookingsServiceApi.getBooking(token, bookingCode);
    setLoading(false);

    if (!result.ok || !result.booking) {
      setBooking(null);
      setError(result.reason || result.message || "Booking not found.");
      return;
    }

    setBooking(result.booking);
  }, [token, bookingCode]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  async function handleCompletePayment() {
    if (!booking || !token) return;

    const bookingCode = booking.bookingCode || booking.bookingRef;
    setPaying(true);

    const result = await consumerPaymentsServiceApi.retryPaymentForBooking(token, bookingCode, { booking });
    setPaying(false);

    const paymentUrl = extractPaymentRedirectUrl(result);
    if (paymentUrl) {
      window.location.assign(paymentUrl);
      return;
    }

    toast.error(result.reason || result.message || "Could not start payment.");
  }

  async function handleDownloadReceipt() {
    if (!booking) return;

    setDownloading(true);
    const ok = await downloadBookingReceipt(booking, { token });
    setDownloading(false);

    if (!ok) {
      toast.error("Could not generate PDF receipt. Please try again.");
      return;
    }

    toast.success("Receipt downloaded.");
  }

  if (!bookingCode) {
    return <Navigate to={ROUTES.myBookings} replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-brand-cream">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" strokeWidth={2} aria-hidden />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <Container className="py-16 text-center">
        <p className="text-brand-muted">{error || "Booking not found."}</p>
        <Link to={ROUTES.myBookings} className="mt-4 inline-block text-sm font-semibold text-brand-green hover:underline">
          Back to my bookings
        </Link>
      </Container>
    );
  }

  const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.reserved;
  const amountLabel = formatBookingCurrency(
    booking.amount ?? booking.subtotal,
    resolveBookingCurrency(booking),
  );
  const canPayOnline = booking.paymentMode === "online" && booking.status === "reserved";
  const canViewReceipt = canViewBookingReceipt(booking);
  const canEdit = canEditBooking(booking);
  const tourImage = booking.tour?.image;
  const detailCode = booking.bookingCode || booking.bookingRef;
  const isGroup = booking.bookingType === "group";
  const group = booking.groupDetails;
  const travelerCount = Number(booking.travelers) || 1;

  return (
    <div className="min-h-screen bg-brand-cream pb-16 pt-8">
      <Container className="max-w-3xl">
        <Link to={ROUTES.myBookings} className="text-sm font-semibold text-brand-muted hover:text-brand-green">
          ← Back to my bookings
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="mt-6 overflow-hidden rounded-[1.75rem] border border-brand-border/60 bg-white shadow-sm"
        >
          <div className="border-b border-brand-border/40 bg-gradient-to-b from-brand-cream/80 to-white px-4 py-4 sm:px-8 sm:py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold sm:px-3 sm:text-xs ${status.className}`}>
                  {status.label}
                </span>
                {isGroup ? (
                  <span className="rounded-full bg-brand-orange/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-orange">
                    Group
                  </span>
                ) : (
                  <span className="rounded-full bg-brand-green/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-green">
                    Individual
                  </span>
                )}
              </div>
              <p className="shrink-0 font-mono text-[10px] font-bold text-brand-green sm:text-xs">
                {booking.bookingCode || booking.bookingRef}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:mt-5 sm:flex-row sm:items-start">
              <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl ring-1 ring-brand-border/60 sm:h-20 sm:w-20">
                {tourImage ? (
                  <img src={tourImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-brand-cream text-brand-muted">
                    <Globe2 className="h-8 w-8 opacity-40 sm:h-6 sm:w-6" strokeWidth={1.5} aria-hidden />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold leading-snug text-brand-ink sm:text-2xl">{booking.tour.name}</h1>
                <p className="mt-1.5 flex items-start gap-1.5 text-sm text-brand-muted">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                  <span className="leading-snug">{booking.tour.location}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-8">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-2.5">
                <CalendarDays className="mt-0.5 h-4 w-4 text-brand-green" strokeWidth={2} aria-hidden />
                <div>
                  <dt className="text-xs text-brand-muted">Departure</dt>
                  <dd className="font-semibold text-brand-ink">{booking.selectedDate}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Users className="mt-0.5 h-4 w-4 text-brand-green" strokeWidth={2} aria-hidden />
                <div>
                  <dt className="text-xs text-brand-muted">Travelers</dt>
                  <dd className="font-semibold text-brand-ink">
                    {travelerCount} {travelerCount === 1 ? "person" : "people"}
                  </dd>
                </div>
              </div>
              <div>
                <dt className="text-xs text-brand-muted">Payment</dt>
                <dd className="font-semibold text-brand-ink">
                  {booking.paymentMode === "online" ? "Pay online" : "Pay on site"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-brand-muted">Total</dt>
                <dd className="font-bold text-brand-green">{amountLabel}</dd>
              </div>
            </dl>

            {isGroup && group ? (
              <div className="mt-6 rounded-xl border border-brand-border/50 bg-brand-cream/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Group details</p>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  {group.groupName ? (
                    <div className="flex items-start gap-2">
                      <Users className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                      <div>
                        <dt className="text-xs text-brand-muted">Group name</dt>
                        <dd className="text-sm font-semibold text-brand-ink">{group.groupName}</dd>
                      </div>
                    </div>
                  ) : null}
                  {group.groupType ? (
                    <div className="flex items-start gap-2">
                      <Tags className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                      <div>
                        <dt className="text-xs text-brand-muted">Group type</dt>
                        <dd className="text-sm font-semibold text-brand-ink">{formatGroupType(group.groupType)}</dd>
                      </div>
                    </div>
                  ) : null}
                  {group.organization ? (
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                      <div>
                        <dt className="text-xs text-brand-muted">Organisation</dt>
                        <dd className="text-sm font-semibold text-brand-ink">{group.organization}</dd>
                      </div>
                    </div>
                  ) : null}
                </dl>
              </div>
            ) : null}

            {booking.leadTraveler ? (
              <div className="mt-6 rounded-xl border border-brand-border/50 bg-brand-cream/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Lead traveler</p>
                <p className="mt-1 font-semibold text-brand-ink">
                  {booking.leadTraveler.firstName} {booking.leadTraveler.lastName}
                </p>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  {booking.leadTraveler.email ? (
                    <div className="flex items-start gap-2">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                      <div className="min-w-0">
                        <dt className="text-xs text-brand-muted">Email</dt>
                        <dd className="break-all text-sm font-medium text-brand-ink">{booking.leadTraveler.email}</dd>
                      </div>
                    </div>
                  ) : null}
                  {booking.leadTraveler.phone ? (
                    <div className="flex items-start gap-2">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                      <div className="min-w-0">
                        <dt className="text-xs text-brand-muted">Phone</dt>
                        <dd className="text-sm font-medium text-brand-ink">
                          <a href={`tel:${booking.leadTraveler.phone}`} className="hover:text-brand-green">
                            {booking.leadTraveler.phone}
                          </a>
                        </dd>
                      </div>
                    </div>
                  ) : null}
                  {booking.leadTraveler.nationality ? (
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                      <div>
                        <dt className="text-xs text-brand-muted">Nationality</dt>
                        <dd className="text-sm font-medium text-brand-ink">{booking.leadTraveler.nationality}</dd>
                      </div>
                    </div>
                  ) : null}
                </dl>
              </div>
            ) : null}

            {booking.specialRequests || booking.dietaryNeeds ? (
              <div className="mt-6 space-y-3 rounded-xl border border-brand-border/50 bg-brand-cream/40 p-4 text-sm">
                {booking.specialRequests ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Special requests</p>
                    <p className="mt-1 text-brand-ink">{booking.specialRequests}</p>
                  </div>
                ) : null}
                {booking.dietaryNeeds ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Dietary needs</p>
                    <p className="mt-1 text-brand-ink">{booking.dietaryNeeds}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2">
              {canEdit ? (
                <Link
                  to={ROUTES.myBookingEdit(detailCode)}
                  className="inline-flex items-center gap-2 rounded-xl border border-brand-orange/30 bg-brand-orange/5 px-5 py-2.5 text-sm font-semibold text-brand-orange hover:border-brand-orange/50 hover:bg-brand-orange/10"
                >
                  <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Edit booking
                </Link>
              ) : null}
              {canPayOnline ? (
                <button
                  type="button"
                  onClick={handleCompletePayment}
                  disabled={paying}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-semibold text-brand-primary hover:bg-brand-accent-dark disabled:opacity-60"
                >
                  {paying ? "Starting checkout…" : "Complete payment"}
                </button>
              ) : null}
              {canViewReceipt ? (
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  disabled={downloading}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-green-dark disabled:opacity-60"
                >
                  {downloading ? "Preparing PDF…" : "Download receipt"}
                </button>
              ) : null}
              <Link
                to={ROUTES.myPayments}
                className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-5 py-2.5 text-sm font-semibold text-brand-ink hover:border-brand-green/30"
              >
                View payments
              </Link>
              <a
                href={getWhatsAppUrl(`Hi AfriQuest, I need help with booking ${booking.bookingCode || booking.bookingRef}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-5 py-2.5 text-sm font-semibold text-brand-muted hover:text-brand-green"
              >
                Get support
              </a>
            </div>
          </div>
        </motion.article>
      </Container>
    </div>
  );
}
