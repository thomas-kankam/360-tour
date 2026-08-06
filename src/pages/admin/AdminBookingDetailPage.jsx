import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import adminBookingsServiceApi from "../../apis/AdminBookingsServiceApi";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import {
  formatAdminBookingDate,
  getAdminBookingStatusConfig,
  getAdminPaymentModeConfig,
  getAdminPaymentStatusConfig,
} from "../../utils/adminBookingHelpers";

const EASE = [0.22, 1, 0.36, 1];

function Section({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="font-heading text-lg font-bold text-brand-ink">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-brand-muted">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Badge({ config }) {
  if (!config) return null;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${config.className}`}>
      {config.label}
    </span>
  );
}

function PartyCard({ title, party, type = "client" }) {
  if (!party) {
    return (
      <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-lg font-bold text-brand-ink">{title}</h2>
        <p className="mt-4 text-sm text-brand-muted">No {type} profile linked.</p>
      </section>
    );
  }

  const Icon = type === "operator" ? Building2 : User;

  return (
    <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-lg font-bold text-brand-ink">{title}</h2>

      <div className="mt-5 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-cream ring-1 ring-black/8">
          {party.profileImage ? (
            <img src={party.profileImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon className="h-6 w-6 text-brand-muted" strokeWidth={1.75} aria-hidden />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-brand-ink">{party.name}</p>
          {type === "operator" && party.organization ? (
            <p className="mt-0.5 text-sm text-brand-muted">{party.organization}</p>
          ) : null}
          {party.isVerified ? (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} aria-hidden />
              Verified
            </span>
          ) : null}
        </div>
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        {party.email ? (
          <div className="flex items-start gap-2">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-muted" strokeWidth={2} aria-hidden />
            <dd>
              <a href={`mailto:${party.email}`} className="font-medium text-brand-ink hover:text-brand-green">
                {party.email}
              </a>
            </dd>
          </div>
        ) : null}
        {party.phoneNumber ? (
          <div className="flex items-start gap-2">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-muted" strokeWidth={2} aria-hidden />
            <dd className="font-medium text-brand-ink">{party.phoneNumber}</dd>
          </div>
        ) : null}
        {party.location ? (
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-muted" strokeWidth={2} aria-hidden />
            <dd className="text-brand-muted">{party.location}</dd>
          </div>
        ) : null}
      </dl>

      {type === "client" && party.clientSlug ? (
        <p className="mt-4 font-mono text-[10px] text-brand-muted">{party.clientSlug}</p>
      ) : null}
      {type === "operator" && party.operatorSlug ? (
        <p className="mt-4 font-mono text-[10px] text-brand-muted">{party.operatorSlug}</p>
      ) : null}
    </section>
  );
}

export default function AdminBookingDetailPage() {
  const { bookingCode } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !bookingCode) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function loadBooking() {
      setLoading(true);
      const result = await adminBookingsServiceApi.getBooking(token, bookingCode);

      if (cancelled) return;

      setLoading(false);

      if (!result.ok || !result.booking) {
        toast.error(result.reason || result.message || "Booking not found.");
        navigate(ROUTES.admin.bookings, { replace: true });
        return;
      }

      setBooking(result.booking);
    }

    loadBooking();

    return () => {
      cancelled = true;
    };
  }, [token, bookingCode, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-black/8 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" strokeWidth={2} aria-hidden />
      </div>
    );
  }

  if (!booking) return null;

  const displayCode = booking.bookingRef || booking.bookingCode;
  const traveler = booking.leadTraveler || {};
  const travelerName = booking.travelerName || `${traveler.firstName || ""} ${traveler.lastName || ""}`.trim();
  const bookingStatus = getAdminBookingStatusConfig(booking);
  const paymentStatus = getAdminPaymentStatusConfig(booking);
  const paymentMode = getAdminPaymentModeConfig(booking);
  const tour = booking.tour;
  const group = booking.groupDetails;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(ROUTES.admin.bookings)}
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-muted hover:text-brand-ink"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        Back to bookings
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-brand-ink text-white shadow-xl"
      >
        <div className="relative">
          {booking.tourImage || tour?.image ? (
            <img
              src={booking.tourImage || tour?.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-ink via-brand-ink/92 to-brand-ink/75" />

          <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge config={bookingStatus} />
                <Badge config={paymentStatus} />
                <Badge config={paymentMode} />
                {booking.bookingType === "group" ? (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                    Group booking
                  </span>
                ) : null}
              </div>

              <h1 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">
                {booking.tourTitle || tour?.name || "Booking audit"}
              </h1>

              {travelerName ? (
                <p className="mt-2 text-sm text-white/75">Lead traveler · {travelerName}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/70">
                <span className="font-mono text-sm font-bold text-brand-gold">{displayCode}</span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-brand-gold" strokeWidth={2} aria-hidden />
                  {booking.selectedDate || "—"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-brand-gold" strokeWidth={2} aria-hidden />
                  {booking.travelers || 1} traveler{booking.travelers === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-right backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Total amount</p>
              <p className="text-3xl font-bold text-brand-gold">{booking.amountLabel}</p>
              <p className="mt-1 text-xs text-white/60">
                Booked {formatAdminBookingDate(booking.savedAt)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {tour ? (
            <Section title="Tour" subtitle={tour.slug ? "Linked listing" : undefined}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {tour.image ? (
                  <div className="h-24 w-32 shrink-0 overflow-hidden rounded-xl ring-1 ring-black/8">
                    <img src={tour.image} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-xl bg-brand-cream ring-1 ring-black/8">
                    <Globe2 className="h-8 w-8 text-brand-muted opacity-40" strokeWidth={1.5} aria-hidden />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-xl font-bold text-brand-ink">{tour.name}</p>
                  {tour.location ? (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-brand-muted">
                      <MapPin className="h-4 w-4 shrink-0 text-brand-orange" strokeWidth={2} aria-hidden />
                      {tour.location}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-brand-muted">
                    {tour.duration ? <span>{tour.duration}</span> : null}
                    {tour.priceLabel ? <span className="font-semibold text-brand-green">{tour.priceLabel}</span> : null}
                  </div>
                  {tour.slug ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        to={ROUTES.admin.listingDetail(tour.slug)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-green hover:underline"
                      >
                        Admin listing
                      </Link>
                      <Link
                        to={ROUTES.tourDetail(tour.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-muted hover:text-brand-ink"
                      >
                        <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                        Public preview
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
            </Section>
          ) : (
            <Section title="Tour" subtitle="Listing unavailable">
              <p className="text-sm text-brand-muted">
                This booking references tour slug{" "}
                <span className="font-mono text-xs font-semibold text-brand-ink">{booking.tourSlug || "—"}</span>
                , but the tour record is missing or unpublished.
              </p>
            </Section>
          )}

          <Section title="Lead traveler" subtitle="Primary contact for this reservation">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">Name</dt>
                <dd className="mt-1 text-sm font-semibold text-brand-ink">{travelerName || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">Email</dt>
                <dd className="mt-1 text-sm font-medium text-brand-ink">
                  {traveler.email ? (
                    <a href={`mailto:${traveler.email}`} className="hover:text-brand-green">{traveler.email}</a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">Phone</dt>
                <dd className="mt-1 text-sm font-semibold text-brand-ink">{traveler.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">Nationality</dt>
                <dd className="mt-1 text-sm font-semibold text-brand-ink">{traveler.nationality || "—"}</dd>
              </div>
            </dl>
          </Section>

          {group ? (
            <Section title="Group details" subtitle="Organization and group metadata">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">Group name</dt>
                  <dd className="mt-1 text-sm font-semibold text-brand-ink">{group.groupName || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">Group type</dt>
                  <dd className="mt-1 text-sm font-semibold capitalize text-brand-ink">
                    {booking.groupTypeLabel || group.groupType || "—"}
                  </dd>
                </div>
                {group.organization ? (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">Organization</dt>
                    <dd className="mt-1 text-sm font-semibold text-brand-ink">{group.organization}</dd>
                  </div>
                ) : null}
              </dl>
            </Section>
          ) : null}

          {booking.additionalTravelers?.length ? (
            <Section title="Additional travelers" subtitle={`${booking.additionalTravelers.length} companion(s)`}>
              <ul className="divide-y divide-black/5">
                {booking.additionalTravelers.map((person, index) => (
                  <li key={index} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                    <span className="font-semibold text-brand-ink">
                      {person.firstName} {person.lastName}
                    </span>
                    <span className="text-brand-muted">{person.nationality || person.email || "—"}</span>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {(booking.specialRequests || booking.dietaryNeeds) ? (
            <Section title="Requests & notes">
              <div className="space-y-4 text-sm">
                {booking.specialRequests ? (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">Special requests</p>
                    <p className="mt-2 leading-relaxed text-brand-ink">{booking.specialRequests}</p>
                  </div>
                ) : null}
                {booking.dietaryNeeds ? (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">Dietary needs</p>
                    <p className="mt-2 leading-relaxed text-brand-ink">{booking.dietaryNeeds}</p>
                  </div>
                ) : null}
              </div>
            </Section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <Section title="Payment & status">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Amount</dt>
                <dd className="font-bold text-brand-ink">{booking.amountLabel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Currency</dt>
                <dd className="font-semibold text-brand-ink">{booking.currency || "GHS"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Payment status</dt>
                <dd><Badge config={paymentStatus} /></dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Payment mode</dt>
                <dd><Badge config={paymentMode} /></dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Booking status</dt>
                <dd><Badge config={bookingStatus} /></dd>
              </div>
              {booking.paymentUrl && paymentStatus?.label === "Pending" ? (
                <div className="pt-2">
                  <a
                    href={booking.paymentUrl}
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
          </Section>

          <Section title="Timeline">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">Created</dt>
                <dd className="mt-1 font-semibold text-brand-ink">{formatAdminBookingDate(booking.savedAt)}</dd>
              </div>
              {booking.updatedAt ? (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">Last updated</dt>
                  <dd className="mt-1 font-semibold text-brand-ink">{formatAdminBookingDate(booking.updatedAt)}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">Booked by</dt>
                <dd className="mt-1 font-semibold capitalize text-brand-ink">{booking.bookedByType || "—"}</dd>
              </div>
            </dl>
          </Section>

          <PartyCard title="Client account" party={booking.client} type="client" />
          <PartyCard title="Tour operator" party={booking.operator} type="operator" />
        </aside>
      </div>
    </div>
  );
}
