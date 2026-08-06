import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import adminListingsServiceApi from "../../apis/AdminListingsServiceApi";
import ImageLightbox from "../../components/misc/ImageLightbox";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { formatListingDate, LISTING_STATUS_STYLES } from "../../utils/adminListingHelpers";
import { formatTourCategoryLabel } from "../../utils/operatorTourConstants";

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

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize ${LISTING_STATUS_STYLES[status] ?? "bg-brand-cream text-brand-muted"}`}
    >
      {status || "draft"}
    </span>
  );
}

export default function AdminListingDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const loadListing = useCallback(async () => {
    setLoading(true);
    const result = await adminListingsServiceApi.getListing(token, slug);
    setLoading(false);

    if (!result.ok || !result.listing) {
      toast.error(result.reason || result.message || "Listing not found.");
      navigate(ROUTES.admin.listings, { replace: true });
      return;
    }

    setListing(result.listing);
  }, [token, slug, navigate]);

  useEffect(() => {
    loadListing();
  }, [loadListing]);

  const galleryImages = useMemo(() => {
    if (!listing) return [];
    const urls = (listing.galleryImageUrls || []).filter(Boolean);
    if (listing.coverImageUrl && !urls.includes(listing.coverImageUrl)) {
      return [listing.coverImageUrl, ...urls];
    }
    return urls.length ? urls : listing.coverImageUrl ? [listing.coverImageUrl] : [];
  }, [listing]);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-black/8 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" strokeWidth={2} aria-hidden />
      </div>
    );
  }

  if (!listing) return null;

  const operator = listing.operator;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(ROUTES.admin.listings)}
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-muted hover:text-brand-ink"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        Back to listings
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-brand-ink text-white shadow-xl"
      >
        <div className="relative">
          {listing.coverImageUrl ? (
            <img src={listing.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-ink via-brand-ink/92 to-brand-ink/75" />

          <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={listing.status} />
                {listing.featured ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-primary">
                    <Sparkles className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                    Featured
                  </span>
                ) : null}
                {listing.badge ? (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                    {listing.badge}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-4 font-heading text-3xl font-bold sm:text-4xl">{listing.name}</h1>

              {listing.locationsLabel ? (
                <p className="mt-3 flex items-center gap-2 text-sm text-white/80">
                  <MapPin className="h-4 w-4 shrink-0 text-brand-gold" strokeWidth={2} aria-hidden />
                  {listing.locationsLabel}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/70">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-brand-gold" strokeWidth={2} aria-hidden />
                  {listing.durationLabel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-brand-gold" strokeWidth={2} aria-hidden />
                  {listing.groupSizeMax} slot{listing.groupSizeMax === 1 ? "" : "s"}
                </span>
                <span>{listing.country}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-right backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">From</p>
                <p className="text-2xl font-bold text-brand-gold">{listing.priceLabel}</p>
                <p className="mt-1 text-xs text-white/60">{listing.bookingCount ?? 0} bookings</p>
              </div>
              <Link
                to={ROUTES.tourDetail(listing.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                <ExternalLink className="h-4 w-4" strokeWidth={2} aria-hidden />
                Public preview
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {galleryImages.length ? (
            <Section title="Gallery" subtitle="Cover and feature images">
              <div className="flex gap-3 overflow-x-auto pb-1">
                {galleryImages.map((url, index) => {
                  const isCover = url === listing.coverImageUrl;
                  return (
                    <button
                      key={`${url}-${index}`}
                      type="button"
                      onClick={() => setLightboxIndex(index)}
                      className={[
                        "relative h-28 w-40 shrink-0 overflow-hidden rounded-xl shadow-sm transition-all hover:ring-2 hover:ring-brand-green/40",
                        isCover ? "border-2 border-brand-green/50" : "border border-brand-border/60",
                      ].join(" ")}
                      aria-label={isCover ? "View cover image" : `View gallery image ${index + 1}`}
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      {isCover ? (
                        <span className="absolute bottom-2 left-2 rounded-full bg-brand-green px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                          Cover
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </Section>
          ) : null}

          {listing.description ? (
            <Section title="Description">
              <p className="text-sm leading-relaxed text-brand-muted">{listing.description}</p>
            </Section>
          ) : null}

          {listing.highlights?.filter(Boolean).length ? (
            <Section title="Highlights">
              <ul className="grid gap-2 sm:grid-cols-2">
                {listing.highlights.filter(Boolean).map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-brand-ink">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {listing.departureDates?.filter((dep) => dep.date).length ? (
            <Section title="Departures" subtitle="Scheduled departure windows">
              <div className="space-y-3">
                {listing.departureDates
                  .filter((dep) => dep.date)
                  .map((dep) => (
                    <div
                      key={dep.date}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-border/50 bg-brand-cream/30 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-bold text-brand-ink">{dep.dateLabel || dep.date}</p>
                        <p className="text-xs text-brand-muted">{dep.label}</p>
                      </div>
                      <span className="text-sm font-semibold text-brand-green">
                        {dep.spotsLeft} / {dep.spotsTotal} left
                      </span>
                    </div>
                  ))}
              </div>
            </Section>
          ) : null}
        </div>

        <aside className="space-y-6">
          {operator ? (
            <section className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-muted">Operator</p>
              <div className="mt-4 flex items-start gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-brand-cream ring-1 ring-black/8">
                  {operator.profileImage ? (
                    <img src={operator.profileImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-brand-muted">
                      <Building2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-brand-ink">{operator.name}</p>
                  <p className="text-sm text-brand-muted">{operator.organization}</p>
                  {operator.isVerified ? (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                      Verified
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-brand-muted">
                {operator.email ? (
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                    {operator.email}
                  </p>
                ) : null}
                {operator.phoneNumber ? (
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                    {operator.phoneNumber}
                  </p>
                ) : null}
                {operator.location ? (
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                    <span>{operator.location}</span>
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}

          <Section title="Metadata">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Listing slug</dt>
                <dd className="max-w-[65%] truncate font-mono text-xs font-semibold text-brand-ink" title={listing.slug}>
                  {listing.slug}
                </dd>
              </div>
              <div>
                <dt className="text-brand-muted">Categories</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {(listing.categories || []).map((cat) => (
                    <span key={cat} className="rounded-full bg-brand-cream px-2.5 py-1 text-[11px] font-semibold text-brand-ink">
                      {formatTourCategoryLabel(cat)}
                    </span>
                  ))}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Bookings</dt>
                <dd className="font-semibold text-brand-ink">{listing.bookingCount ?? 0}</dd>
              </div>
              {listing.createdAt ? (
                <div className="flex items-center gap-2 text-brand-muted">
                  <Clock className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Created {formatListingDate(listing.createdAt)}
                </div>
              ) : null}
              {listing.updatedAt ? (
                <div className="flex items-center gap-2 text-brand-muted">
                  <Clock className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Updated {formatListingDate(listing.updatedAt)}
                </div>
              ) : null}
            </dl>
          </Section>

          <Section title="Booking settings">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Deposit</dt>
                <dd className="font-semibold text-brand-ink">{listing.bookingSettings?.depositPercent}%</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Online payment</dt>
                <dd className="font-semibold text-brand-ink">
                  {listing.bookingSettings?.onlinePaymentAllowed ? "Allowed" : "Off"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Pay on-site</dt>
                <dd className="font-semibold text-brand-ink">
                  {listing.bookingSettings?.payOnSiteAllowed ? "Allowed" : "Off"}
                </dd>
              </div>
            </dl>
          </Section>
        </aside>
      </div>

      <ImageLightbox
        open={lightboxIndex != null}
        images={galleryImages}
        index={lightboxIndex ?? 0}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
        alt={listing.name}
      />
    </div>
  );
}
