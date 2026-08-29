import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Pencil,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import operatorToursServiceApi from "../../apis/OperatorToursServiceApi";
import { AUDIENCE_SCOPE_OPTIONS } from "../../constants/tourAudience";
import { formatTourCategoryLabel, formatDepartureAvailability, formatTourSlotsLabel, getTourTypeLabel } from "../../utils/operatorTourConstants";
import { buildTourPriceDisplay, stripTourPriceFromPrefix } from "../../utils/tourPricing";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";
import ImageLightbox from "../../components/misc/ImageLightbox";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { buildLocationsLabel, resolveTourDurationDays } from "../../utils/operatorTourMapper";

const EASE = [0.22, 1, 0.36, 1];

function Section({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="font-heading text-lg font-bold text-brand-ink">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-brand-muted">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function statusClass(status) {
  const map = {
    published: "bg-brand-primary/10 text-brand-primary",
    draft: "bg-brand-gold/15 text-brand-ink",
    archived: "bg-brand-muted/10 text-brand-muted",
  };
  return map[status] || map.draft;
}

function OperatorTourPriceCard({ tour, variant = "hero" }) {
  const display = buildTourPriceDisplay(tour);
  const audienceOption = AUDIENCE_SCOPE_OPTIONS.find((option) => option.id === display.audienceScope);
  const primaryAmount = stripTourPriceFromPrefix(display.primaryLabel);
  const secondaryAmount = display.secondaryLabel
    ? stripTourPriceFromPrefix(display.secondaryLabel)
    : null;

  if (variant === "sidebar") {
    return (
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-brand-muted">Audience</dt>
          <dd className="text-right font-semibold text-brand-ink">{audienceOption?.label || "—"}</dd>
        </div>
        {primaryAmount ? (
          <div className="flex justify-between gap-4">
            <dt className="text-brand-muted">
              {display.isDual ? "Local price (GHS)" : display.audienceScope === "foreign" ? "Price (USD)" : "Price (GHS)"}
            </dt>
            <dd className="font-semibold text-brand-primary">{primaryAmount}</dd>
          </div>
        ) : null}
        {secondaryAmount ? (
          <div className="flex justify-between gap-4">
            <dt className="text-brand-muted">International price (USD)</dt>
            <dd className="font-semibold text-brand-primary">{secondaryAmount}</dd>
          </div>
        ) : null}
        {audienceOption?.description ? (
          <p className="rounded-xl border border-brand-border/50 bg-brand-cream/40 px-3 py-2.5 text-xs leading-relaxed text-brand-muted">
            {audienceOption.description}
          </p>
        ) : null}
      </dl>
    );
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-right backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Price</p>
      {primaryAmount ? (
        <p className="text-2xl font-bold text-brand-gold">{primaryAmount}</p>
      ) : (
        <p className="text-2xl font-bold text-brand-gold">—</p>
      )}
      {secondaryAmount ? (
        <p className="mt-1 text-sm font-semibold text-white/85">{secondaryAmount}</p>
      ) : null}
      {display.isDual ? (
        <p className="mt-0.5 text-[10px] text-white/50">International travelers</p>
      ) : null}
      {audienceOption ? (
        <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-white/45">
          {audienceOption.label}
        </p>
      ) : null}
    </div>
  );
}

function DurationDisplay({ tour, variant = "hero" }) {
  const days = resolveTourDurationDays(tour);
  const dayWord = days === 1 ? "day" : "days";
  const durationLabel = days ? `${days} ${dayWord}` : "Duration not set";

  if (variant === "metadata") {
    return (
      <div className="mt-3 flex items-center gap-3 rounded-xl border border-brand-orange/20 bg-gradient-to-r from-brand-orange/10 to-brand-cream/40 px-4 py-3.5">
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-orange/12 ring-1 ring-brand-orange/20">
          <span className="font-heading text-xl font-bold leading-none text-brand-primary">{days ?? "—"}</span>
          <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-brand-primary/80">{dayWord}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-brand-ink">{durationLabel}</p>
          <p className="mt-0.5 text-xs text-brand-muted">
            {days ? `Full ${days}-${dayWord} experience` : "Set duration when editing this listing"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-gold/25 bg-gradient-to-br from-brand-gold/20 via-white/10 to-transparent shadow-sm backdrop-blur-sm">
      <div className="flex items-stretch">
        <div className="flex w-24 shrink-0 flex-col items-center justify-center bg-brand-gold/15 px-3 py-5 ring-1 ring-inset ring-brand-gold/20">
          <CalendarDays className="mb-2 h-5 w-5 text-brand-gold" strokeWidth={2} aria-hidden />
          <span className="font-heading text-3xl font-bold leading-none text-brand-gold">{days ?? "—"}</span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">{dayWord}</span>
        </div>
        <div className="flex flex-1 flex-col justify-center px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">Trip duration</p>
          <p className="mt-1 text-lg font-bold text-white">{durationLabel}</p>
          <p className="mt-1 text-xs leading-relaxed text-white/65">
            {days
              ? `${days} ${dayWord} from arrival through departure`
              : "Add duration details when editing this listing"}
          </p>
        </div>
      </div>
    </div>
  );
}

function HeroMetaItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
        <Icon className="h-4 w-4 text-brand-gold" strokeWidth={2} aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">{label}</p>
        <p className="truncate font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function InclusionList({ items, variant = "included" }) {
  const isIncluded = variant === "included";

  if (!items?.length) {
    return <p className="text-sm text-brand-muted">Nothing listed yet.</p>;
  }

  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li
          key={item}
          className={[
            "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
            isIncluded
              ? "border-brand-primary/15 bg-white text-brand-ink shadow-sm"
              : "border-brand-border/60 bg-brand-cream/30 text-brand-muted",
          ].join(" ")}
        >
          {isIncluded ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" strokeWidth={2} aria-hidden />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange/70" strokeWidth={2} aria-hidden />
          )}
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function OperatorTourDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    if (!token || !slug) return undefined;

    let active = true;
    async function load() {
      setLoading(true);
      const result = await operatorToursServiceApi.getTour(token, slug);
      if (!active) return;
      setLoading(false);

      if (!result.ok || !result.tour) {
        setNotFound(true);
        return;
      }
      setTour(result.tour);
    }

    load();
    return () => {
      active = false;
    };
  }, [token, slug]);

  const galleryImages = useMemo(() => {
    const urls = (tour?.galleryImageUrls || []).filter(Boolean);
    if (tour?.coverImageUrl && !urls.includes(tour.coverImageUrl)) {
      return [tour.coverImageUrl, ...urls];
    }
    if (urls.length) return urls;
    return tour?.coverImageUrl ? [tour.coverImageUrl] : [];
  }, [tour?.coverImageUrl, tour?.galleryImageUrls]);

  async function handleDelete() {
    if (!token || !slug) return;

    setDeleting(true);
    const result = await operatorToursServiceApi.deleteTour(token, slug);
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    toast.success(result.reason || "Tour deleted.");
    setDeleteOpen(false);
    navigate(ROUTES.operator.tours, { replace: true });
  }

  async function handleStatusChange(nextStatus) {
    if (!token || !slug || !tour || tour.status === nextStatus || statusUpdating) return;

    setStatusUpdating(true);
    const result = await operatorToursServiceApi.updateTourStatus(token, slug, nextStatus);
    setStatusUpdating(false);

    if (!result.ok || !result.tour) {
      toast.error(result.reason || result.message || "Could not update listing status.");
      return;
    }

    setTour(result.tour);
    toast.success(
      nextStatus === "published"
        ? "Listing published — it can now appear on the public tours page."
        : `Listing marked as ${nextStatus}.`,
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-brand-border/60 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" strokeWidth={2} aria-hidden />
      </div>
    );
  }

  if (notFound || !tour) {
    return (
      <div className="rounded-2xl border border-brand-border bg-white p-10 text-center">
        <p className="font-semibold text-brand-ink">Listing not found</p>
        <Link to={ROUTES.operator.tours} className="btn-primary mt-4 inline-flex">Back to listings</Link>
      </div>
    );
  }

  const routeLabel = buildLocationsLabel(tour.locations);
  const hasItinerary = (tour.itinerary || []).some((day) => day.title?.trim() || day.description?.trim());

  return (
    <div className="space-y-6">
      <Link to={ROUTES.operator.tours} className="inline-flex items-center gap-2 text-sm font-medium text-brand-muted hover:text-brand-ink">
        <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        Back to listings
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="relative overflow-hidden rounded-[1.75rem] border border-brand-border/60 bg-brand-ink text-white shadow-xl"
      >
        <div className="absolute inset-0">
          {tour.coverImageUrl ? (
            <img src={tour.coverImageUrl} alt="" className="h-full w-full object-cover opacity-40" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-ink via-brand-ink/90 to-brand-ink/60" />
        </div>

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusClass(tour.status)}`}>
                {tour.status}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-charcoal">
                {getTourTypeLabel(tour.tourType)}
              </span>
              {(tour.regionLabels || []).map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm"
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">Listing status</span>
              {["draft", "published", "archived"].map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={statusUpdating}
                  onClick={() => handleStatusChange(option)}
                  aria-pressed={tour.status === option}
                  className={[
                    "rounded-full px-3 py-1.5 text-[11px] font-bold capitalize transition-all",
                    tour.status === option
                      ? "bg-brand-accent text-brand-charcoal shadow-sm"
                      : "border border-white/20 bg-white/10 text-white hover:bg-white/15",
                    statusUpdating ? "opacity-60" : "",
                  ].join(" ")}
                >
                  {option}
                </button>
              ))}
              {statusUpdating ? (
                <span className="inline-flex items-center gap-1 text-xs text-white/70">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  Updating…
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 font-heading text-3xl font-bold sm:text-4xl">{tour.name}</h1>

            {routeLabel ? (
              <p className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-white/80">
                <MapPin className="h-4 w-4 shrink-0 text-brand-gold" strokeWidth={2} aria-hidden />
                {tour.locations.map((city, index) => (
                  <span key={`${city}-${index}`} className="inline-flex items-center gap-1.5">
                    {index > 0 ? <ChevronRight className="h-3.5 w-3.5 text-white/40" strokeWidth={2} aria-hidden /> : null}
                    <span className="font-medium">{city}</span>
                  </span>
                ))}
              </p>
            ) : null}

            <div className="mt-5 space-y-3">
              <DurationDisplay tour={tour} />
              <div className="grid gap-3 sm:grid-cols-2">
                <HeroMetaItem icon={Users} label="Capacity" value={formatTourSlotsLabel(tour.groupSizeMax)} />
                <HeroMetaItem icon={MapPin} label="Country" value={tour.country} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <OperatorTourPriceCard tour={tour} />
            <div className="flex flex-wrap gap-2">
              <Link to={ROUTES.operator.tourEdit(tour.slug)} className="btn-secondary inline-flex items-center gap-2 bg-white/10 text-white ring-white/20 hover:bg-white/20">
                <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden />
                Edit
              </Link>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-2.5 text-sm font-semibold text-red-100 transition-colors hover:bg-red-500/25"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
                Delete
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {galleryImages.length ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">Photo gallery</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {galleryImages.map((url, index) => {
              const isCover = url === tour.coverImageUrl;
              return (
                <button
                  key={`${url}-${index}`}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className={[
                    "group relative h-28 w-40 shrink-0 cursor-zoom-in overflow-hidden rounded-xl shadow-sm transition-all hover:ring-2 hover:ring-brand-primary/40",
                    isCover
                      ? "border-2 border-brand-primary/50 ring-1 ring-brand-primary/20"
                      : "border border-brand-border/60",
                  ].join(" ")}
                  aria-label={isCover ? "View cover image full size" : `View gallery image ${index + 1} full size`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  {isCover ? (
                    <span className="absolute bottom-2 left-2 rounded-full bg-brand-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                      Cover
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="About this tour" subtitle="What travelers will experience">
            <p className="text-sm leading-relaxed text-brand-muted">{tour.description || "No description yet."}</p>
            {tour.highlights?.length ? (
              <ul className="mt-5 grid grid-cols-1 gap-2.5">
                {tour.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 rounded-xl border border-brand-border/50 bg-brand-cream/30 px-4 py-3 text-sm text-brand-ink">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" strokeWidth={2} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </Section>

          {hasItinerary ? (
          <Section title="Itinerary" subtitle="Day-by-day plan">
            <div className="space-y-4">
              {tour.itinerary.map((day) => (
                <div key={`${day.day}-${day.title}`} className="flex gap-4 rounded-xl border border-brand-border/50 bg-brand-cream/40 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-sm font-bold text-brand-primary">
                    {day.day}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-ink">{day.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-brand-muted">{day.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 to-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <CheckCircle2 className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-brand-ink">Included</h2>
                  <p className="text-xs text-brand-muted">What travelers receive</p>
                </div>
              </div>
              <InclusionList items={tour.included} variant="included" />
            </section>
            <section className="rounded-2xl border border-brand-border/70 bg-gradient-to-br from-brand-cream/80 to-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-accent/20 text-brand-primary">
                  <XCircle className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-brand-ink">Not included</h2>
                  <p className="text-xs text-brand-muted">Costs travelers should plan for</p>
                </div>
              </div>
              <InclusionList items={tour.notIncluded} variant="excluded" />
            </section>
          </div>
        </div>

        <div className="space-y-6">
          <Section title="Departures" subtitle="Scheduled dates & availability">
            <div className="space-y-3">
              {(tour.departureDates || []).map((dep) => (
                <div key={dep.date} className="rounded-xl border border-brand-border/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-brand-ink">{dep.dateLabel || dep.date}</p>
                      <p className="mt-0.5 text-xs text-brand-muted">{dep.label}</p>
                    </div>
                    <span className="rounded-full bg-brand-primary/10 px-2.5 py-1 text-[11px] font-bold text-brand-primary">
                      {formatDepartureAvailability(dep.spotsLeft, dep.spotsTotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Pricing" subtitle="How this listing is priced for buyers">
            <OperatorTourPriceCard tour={tour} variant="sidebar" />
          </Section>

          <Section title="Booking settings">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Deposit</dt>
                <dd className="font-semibold text-brand-ink">{tour.bookingSettings?.depositPercent}%</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Online payment</dt>
                <dd className="font-semibold text-brand-ink">{tour.bookingSettings?.onlinePaymentAllowed ? "Allowed" : "Off"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Pay on-site</dt>
                <dd className="font-semibold text-brand-ink">{tour.bookingSettings?.payOnSiteAllowed ? "Allowed" : "Off"}</dd>
              </div>
            </dl>
          </Section>

          <Section title="Metadata" subtitle="Listing classification and record info">
            <dl className="divide-y divide-brand-border/50">
              <div className="py-4 first:pt-0">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-muted">Categories</dt>
                <dd className="mt-3 flex flex-col gap-2">
                  {(tour.categories || []).length ? (
                    (tour.categories || []).map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex w-fit rounded-full bg-brand-cream px-3 py-1.5 text-xs font-semibold capitalize text-brand-ink ring-1 ring-brand-border/60"
                      >
                        {formatTourCategoryLabel(cat)}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-brand-muted">No categories</span>
                  )}
                </dd>
              </div>
              <div className="py-4">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-muted">Status</dt>
                <dd className="mt-3 flex flex-wrap gap-2">
                  {["draft", "published", "archived"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      disabled={statusUpdating || tour.status === option}
                      onClick={() => handleStatusChange(option)}
                      className={[
                        "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition-colors disabled:cursor-not-allowed",
                        tour.status === option ? statusClass(option) : "bg-brand-cream text-brand-muted ring-1 ring-brand-border hover:text-brand-ink disabled:opacity-50",
                      ].join(" ")}
                    >
                      {option}
                    </button>
                  ))}
                </dd>
              </div>
              <div className="py-4">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-muted">Country</dt>
                <dd className="mt-2 text-sm font-semibold text-brand-ink">{tour.country}</dd>
              </div>
              <div className="py-4">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-muted">Duration</dt>
                <dd>
                  <DurationDisplay tour={tour} variant="metadata" />
                </dd>
              </div>
              {tour.createdAt ? (
                <div className="py-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-muted">Created</dt>
                  <dd className="mt-2 flex items-center gap-2 text-sm font-semibold text-brand-ink">
                    <Clock className="h-4 w-4 text-brand-muted" strokeWidth={2} aria-hidden />
                    {new Date(tour.createdAt).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </dd>
                </div>
              ) : null}
            </dl>
          </Section>
        </div>
      </div>

      <AdminConfirmModal
        open={deleteOpen}
        title="Delete tour listing?"
        itemLabel={tour.name}
        message="This will permanently remove the listing, its departures, and gallery images. This action cannot be undone."
        confirmLabel="Delete listing"
        loading={deleting}
        onClose={() => !deleting && setDeleteOpen(false)}
        onConfirm={handleDelete}
      />

      <ImageLightbox
        open={lightboxIndex != null}
        images={galleryImages}
        index={lightboxIndex ?? 0}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
        alt={tour.name}
      />
    </div>
  );
}
