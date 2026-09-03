import { useEffect, useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Star,
  Users,
  XCircle,
} from "lucide-react";
import publicListingsServiceApi from "../../apis/PublicListingsServiceApi";
import Container from "../../components/layout/Container";
import ImageLightbox from "../../components/misc/ImageLightbox";
import TourItineraryTimeline from "../../components/tours/TourItineraryTimeline";
import TourReviewsSection from "../../components/tours/TourReviewsSection";
import TourPriceDisplay from "../../components/tours/TourPriceDisplay";
import { ROUTES } from "../../constants/routes";
import { usePaymentRegion } from "../../hooks/usePaymentRegion";
import { isUnlimitedTourSlots } from "../../utils/operatorTourConstants";
import { formatTourDurationLabel, formatDepartureDateLabel, formatDepartureRangeLabel, resolveTourDurationDays } from "../../utils/operatorTourMapper";
import { buildListingsPayloadFromCountry } from "../../utils/publicListingsHelpers";
import { parseInclusionItemText } from "../../utils/inclusionItemText";
import { getWhatsAppUrl } from "../../config/env";
import { usePageSeo } from "../../components/seo/SeoContext";
import { buildTourProductJsonLd, resolveSeoForTour } from "../../config/seo";

const EASE = [0.22, 1, 0.36, 1];

function TourRatingBadge({ value, reviewCount, light = false }) {
  const hasRating = Number(value) > 0;
  const count = Number(reviewCount) || 0;
  const textClass = light ? "text-white/80 hover:text-white" : "text-brand-muted hover:text-brand-primary";

  return (
    <a href="#tour-reviews" className={`inline-flex items-center gap-1.5 text-sm transition-colors ${textClass}`}>
      <Star
        className={`h-4 w-4 ${hasRating ? "fill-brand-accent text-brand-accent" : ""} ${light ? "text-white/90" : "text-brand-border"}`}
        strokeWidth={1.5}
        aria-hidden
      />
      {hasRating ? (
        <>
          <span className={`font-bold ${light ? "text-white" : "text-brand-ink"}`}>{Number(value).toFixed(1)}</span>
          <span className={light ? "text-white/70" : ""}>
            ({count} review{count !== 1 ? "s" : ""})
          </span>
        </>
      ) : (
        <span>Traveler reviews</span>
      )}
    </a>
  );
}

function SpotsBar({ spotsLeft, totalSpots }) {
  const safeTotal = Math.max(Number(totalSpots) || 1, 1);
  const left = Math.max(Number(spotsLeft) || 0, 0);
  const filled = Math.round(((safeTotal - left) / safeTotal) * 100);
  const urgent = left > 0 && left <= 3;

  if (left <= 0) {
    return (
      <p className="mt-4 rounded-lg bg-brand-cream px-3 py-2 text-xs font-semibold text-brand-muted">
        Fully booked on the next departure, contact us to join the waitlist.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className={urgent ? "font-semibold text-red-600" : "font-medium text-brand-muted"}>
          {left} spot{left !== 1 ? "s" : ""} left
        </span>
        <span className="text-brand-muted">{safeTotal} seats on next departure</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-brand-border/60">
        <div
          className={["h-full rounded-full transition-all duration-500", urgent ? "bg-red-500" : "bg-brand-primary"].join(" ")}
          style={{ width: `${Math.min(Math.max(filled, 8), 100)}%` }}
        />
      </div>
    </div>
  );
}

function QuickStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-brand-border/50 bg-white px-4 py-3.5">
      <div className="flex items-center gap-2 text-brand-primary">
        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">{label}</span>
      </div>
      <p className="mt-1.5 text-sm font-bold text-brand-ink">{value}</p>
    </div>
  );
}

function parseFeatureText(text) {
  return parseInclusionItemText(text);
}

function resolveTourDateRangeLabel(tour) {
  const departures = tour?.departureDates || [];
  const rangeDeparture = departures.find((departure) => departure.date && departure.endDate);

  if (rangeDeparture) {
    if (rangeDeparture.dateLabel && rangeDeparture.endDateLabel) {
      return `${rangeDeparture.dateLabel}, ${rangeDeparture.endDateLabel}`;
    }
    return formatDepartureRangeLabel(rangeDeparture.date, rangeDeparture.endDate);
  }

  const nextDeparture = departures.find((departure) => departure.date);
  if (!nextDeparture) return "";

  return nextDeparture.dateLabel || formatDepartureDateLabel(nextDeparture.date);
}

function TourDurationCard({ tour }) {
  const days = resolveTourDurationDays(tour);
  const dayWord = days === 1 ? "day" : "days";
  const durationLabel = tour.duration || formatTourDurationLabel(days);
  const dateRangeLabel = useMemo(() => resolveTourDateRangeLabel(tour), [tour]);

  return (
    <section className="overflow-hidden rounded-3xl border border-brand-border/50 bg-white shadow-sm">
      <div className="flex items-stretch">
        <div className="flex w-28 shrink-0 flex-col items-center justify-center bg-brand-primary/10 px-4 py-8 sm:w-36 sm:py-10">
          <CalendarDays className="mb-3 h-7 w-7 text-brand-primary sm:h-8 sm:w-8" strokeWidth={2} aria-hidden />
          <span className="font-heading text-4xl font-bold leading-none text-brand-primary sm:text-5xl">{days}</span>
          <span className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-primary/80">{dayWord}</span>
        </div>
        <div className="flex flex-1 flex-col justify-center px-6 py-6 sm:px-8 sm:py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">Trip duration</p>
          <p className="mt-2 font-heading text-2xl font-bold text-brand-ink sm:text-3xl">{durationLabel}</p>
          {dateRangeLabel ? (
            <p className="mt-3 text-base font-semibold text-brand-primary sm:text-lg">{dateRangeLabel}</p>
          ) : null}
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-brand-muted sm:text-base">
            {days
              ? `Full ${days}-${dayWord} experience from arrival through departure`
              : "Duration details coming soon"}
          </p>
        </div>
      </div>
    </section>
  );
}

function TourAboutSection({ tour }) {
  if (!tour.description) return null;

  return (
    <Section title="About this trip">
      <p className="max-w-3xl text-sm leading-relaxed text-brand-muted sm:text-[15px] sm:leading-7">
        {tour.description}
      </p>
    </Section>
  );
}

function TourIncludedSection({ items }) {
  const features = useMemo(() => {
    return (items || []).filter(Boolean).map((text) => parseFeatureText(text));
  }, [items]);

  if (!features.length) return null;

  return (
    <Section
      title="What's included in your price"
      subtitle="These items are part of your booking, no extra charge for what's listed here."
    >
      <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
        {features.map((feature, index) => {
          const hasDetail = Boolean(feature.description);

          return (
            <div key={`${feature.title}-${index}`} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-accent/25">
                <CheckCircle2 className="h-6 w-6 text-brand-primary" strokeWidth={2} aria-hidden />
              </div>
              <div className="min-w-0">
                {hasDetail ? (
                  <>
                    <p className="text-sm font-bold leading-snug text-brand-ink">{feature.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-brand-muted">{feature.description}</p>
                  </>
                ) : (
                  <p className="text-sm leading-relaxed text-brand-ink">{feature.title}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <section className="rounded-3xl border border-brand-border/50 bg-white p-5 shadow-sm sm:p-6 md:p-8">
      <div className="mb-6">
        <h2 className="font-heading text-xl font-bold text-brand-ink">{title}</h2>
        {subtitle ? <p className="mt-1.5 text-sm text-brand-muted">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function TourGalleryCollage({ images, badge, alt, onImageClick, departDay, departMonth }) {
  const galleryImages = (images || []).filter(Boolean);
  const mainImage = galleryImages[0] || "";
  const sideImages = Array.from({ length: 4 }, (_, index) => galleryImages[index + 1] || "");

  if (!mainImage) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-brand-border bg-brand-cream text-sm text-brand-muted lg:min-h-[460px]">
        Photos coming soon
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white p-1.5 shadow-[0_20px_50px_-24px_rgba(0,107,63,0.35)] ring-1 ring-brand-border/40">
      <div className="grid gap-1.5 lg:grid-cols-[1.15fr_1fr]">
        <button
          type="button"
          onClick={() => onImageClick(0)}
          className="group relative min-h-[240px] overflow-hidden rounded-2xl sm:min-h-[320px] lg:min-h-[460px]"
          aria-label="View main tour photo"
        >
          <img
            src={mainImage}
            alt={alt}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-primary/30 via-transparent to-transparent" />

          {departDay && departMonth ? (
            <div className="absolute left-3 top-3 overflow-hidden rounded-xl border border-white/40 bg-white/20 shadow-lg backdrop-blur-md sm:left-4 sm:top-4">
              <div className="flex flex-col items-center px-3 py-2 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/85">{departMonth}</span>
                <span className="text-2xl font-bold leading-none text-white">{departDay}</span>
              </div>
            </div>
          ) : null}

          {badge ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-brand-accent px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-charcoal shadow-md sm:bottom-4 sm:left-4 sm:text-[11px]">
              {badge}
            </span>
          ) : null}
        </button>

        <div className="grid min-h-[180px] grid-cols-2 grid-rows-2 gap-1.5 sm:min-h-[240px] lg:min-h-[460px]">
          {sideImages.map((url, index) => {
            const galleryIndex = index + 1;
            if (!url) {
              return (
                <div
                  key={`gallery-empty-${index}`}
                  className="rounded-2xl bg-brand-cream/80"
                  aria-hidden
                />
              );
            }

            return (
              <button
                key={`${url}-${index}`}
                type="button"
                onClick={() => onImageClick(galleryIndex)}
                className="group relative overflow-hidden rounded-2xl"
                aria-label={`View tour photo ${galleryIndex + 1}`}
              >
                <img
                  src={url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BookingCard({ tour, paymentRegion }) {
  const isUnlimited = isUnlimitedTourSlots(tour.spotsLeft);
  const isFilling = !isUnlimited && tour.spotsLeft <= 3 && tour.spotsLeft > 0;
  const bookPath = ROUTES.tourBook(tour.slug);
  const showSpotsBar = !isUnlimited && tour.totalSpots;

  return (
    <div className="overflow-hidden rounded-3xl border border-brand-border/50 bg-white shadow-[0_16px_40px_-24px_rgba(0,107,63,0.2)]">
      <div className="border-b border-brand-border/40 bg-gradient-to-br from-brand-cream/60 to-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">From</p>
            <TourPriceDisplay tour={tour} variant="detail" amountOnly paymentRegion={paymentRegion} />
            <p className="text-xs text-brand-muted">per person</p>
            {tour.depositPercent ? (
              <p className="mt-1 text-[11px] font-medium text-brand-primary">
                {tour.depositPercent}% deposit to secure your spot
              </p>
            ) : null}
          </div>
          <TourRatingBadge value={tour.rating} reviewCount={tour.reviews} />
        </div>

        {showSpotsBar ? (
          <SpotsBar spotsLeft={tour.spotsLeft} totalSpots={tour.totalSpots} />
        ) : isFilling ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            Only {tour.spotsLeft} spots left on next departure
          </div>
        ) : null}
      </div>

      <div className="space-y-3 p-6 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-brand-muted">
            <Clock className="h-4 w-4 text-brand-primary" strokeWidth={2} aria-hidden />
            Duration
          </span>
          <span className="font-semibold text-brand-ink">{tour.duration}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-brand-muted">
            <Users className="h-4 w-4 text-brand-primary" strokeWidth={2} aria-hidden />
            Group size
          </span>
          <span className="font-semibold text-brand-ink">{tour.groupSize}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-brand-muted">
            <CalendarDays className="h-4 w-4 text-brand-primary" strokeWidth={2} aria-hidden />
            Next departure
          </span>
          <span className="text-right font-semibold text-brand-ink">{tour.nextDate}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-brand-muted">
            <MapPin className="h-4 w-4 text-brand-primary" strokeWidth={2} aria-hidden />
            Country
          </span>
          <span className="font-semibold text-brand-ink">{tour.country}</span>
        </div>
      </div>

      <div className="space-y-3 border-t border-brand-border/40 p-6">
        <Link
          to={bookPath}
          className="btn-primary flex w-full items-center justify-center gap-2 py-3.5 text-sm font-semibold"
        >
          Book now
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        </Link>
        <a
          href={getWhatsAppUrl(`Hello 360 Tours, I'm interested in ${tour.name}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-border bg-white py-3 text-sm font-semibold text-brand-primary transition-all hover:border-brand-primary/30 hover:bg-brand-cream"
        >
          Ask a question
        </a>
        <p className="text-center text-[11px] text-brand-muted">Free cancellation up to 30 days before departure</p>
      </div>
    </div>
  );
}

export default function TourDetailPage() {
  const { slug } = useParams();
  const { region } = usePaymentRegion();
  const paymentRegion = region?.paymentRegion ?? null;
  const [tour, setTour] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    if (!slug) return undefined;

    let active = true;

    async function loadTour() {
      setLoading(true);
      setNotFound(false);

      const result = await publicListingsServiceApi.getListing(slug);
      if (!active) return;

      if (!result.ok || !result.tour) {
        setLoading(false);
        setTour(null);
        setRelated([]);
        setNotFound(true);
        return;
      }

      setTour(result.tour);
      setLoading(false);

      const relatedResult = await publicListingsServiceApi.listListings(
        buildListingsPayloadFromCountry(result.tour.country),
        { page: 1, per_page: 6 },
      );

      if (!active) return;

      setRelated(
        (relatedResult.items || [])
          .filter((item) => item.slug !== slug)
          .slice(0, 3),
      );
    }

    loadTour();
    return () => {
      active = false;
    };
  }, [slug]);

  const gallery = useMemo(() => {
    const urls = (tour?.gallery || []).filter(Boolean);
    const cover = tour?.image;
    if (!cover) return urls;
    if (urls.includes(cover)) return urls;
    return [cover, ...urls];
  }, [tour]);

  const tourSeo = useMemo(() => (tour ? resolveSeoForTour(tour) : null), [tour]);
  const tourJsonLd = useMemo(() => (tour ? buildTourProductJsonLd(tour) : null), [tour]);
  usePageSeo(tourSeo, tourJsonLd, "tour-product-json-ld");

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center bg-brand-cream/40">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" strokeWidth={2} aria-hidden />
      </div>
    );
  }

  if (notFound || !tour) return <Navigate to={ROUTES.tours} replace />;

  return (
    <div className="page-bottom-bar-offset bg-brand-cream/30 lg:pb-16">
      <div className="border-b border-brand-border/40 bg-white/90 py-3 backdrop-blur-sm">
        <Container>
          <nav className="flex items-center gap-2 text-xs text-brand-muted">
            <Link to={ROUTES.home} className="transition-colors hover:text-brand-primary">Home</Link>
            <span>/</span>
            <Link to={ROUTES.tours} className="transition-colors hover:text-brand-primary">Tours</Link>
            <span>/</span>
            <span className="truncate font-medium text-brand-ink">{tour.name}</span>
          </nav>
        </Container>
      </div>

      <section className="py-6 sm:py-8">
        <Container className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <TourGalleryCollage
              images={gallery}
              alt={tour.name}
              onImageClick={setLightboxIndex}
              departDay={tour.departDay}
              departMonth={tour.departMonth}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.05 }}
            className="rounded-3xl border border-brand-border/50 bg-white p-5 shadow-sm sm:p-6 md:p-8"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                {tour.country ? (
                  <span className="inline-flex rounded-full bg-brand-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-primary">
                    {tour.country}
                  </span>
                ) : null}

                <h1 className="mt-4 font-heading text-3xl font-bold text-brand-ink sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                  {tour.name}
                </h1>

                {tour.location ? (
                  <p className="mt-3 flex items-start gap-1.5 text-sm text-brand-muted">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" strokeWidth={2} aria-hidden />
                    <span>
                      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Popular stops</span>
                      <span className="mt-0.5 block font-medium text-brand-ink">{tour.location}</span>
                    </span>
                  </p>
                ) : null}

                <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-brand-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-brand-primary" strokeWidth={2} aria-hidden />
                    {tour.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-brand-primary" strokeWidth={2} aria-hidden />
                    {tour.groupSize}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-brand-primary" strokeWidth={2} aria-hidden />
                    Departs {tour.nextDate}
                  </span>
                  <TourRatingBadge value={tour.rating} reviewCount={tour.reviews} />
                </div>
              </div>

              <div className="shrink-0 rounded-2xl border border-brand-primary/15 bg-gradient-to-br from-brand-cream/80 to-white px-5 py-4 sm:text-right lg:min-w-[180px]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">From</p>
                <TourPriceDisplay
                  tour={tour}
                  variant="detailCompact"
                  amountOnly
                  paymentRegion={paymentRegion}
                  className="text-right"
                />
                <p className="text-xs text-brand-muted">per person</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <QuickStat icon={Clock} label="Duration" value={tour.duration || "TBC"} />
              <QuickStat icon={Users} label="Group size" value={tour.groupSize || "Flexible"} />
              <QuickStat icon={CalendarDays} label="Next departure" value={tour.nextDate || "Contact us"} />
              <QuickStat
                icon={MapPin}
                label="Destination"
                value={tour.location || tour.country || "Ghana"}
              />
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <TourDurationCard tour={tour} />

              <TourAboutSection tour={tour} />

              <TourIncludedSection items={tour.included} />

              {tour.notIncluded.length > 0 ? (
                <Section title="Not included">
                  <ul className="space-y-2">
                    {tour.notIncluded.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-brand-muted">
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-muted/60" strokeWidth={2} aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Section>
              ) : null}

              <TourItineraryTimeline itinerary={tour.itinerary} />

              <TourReviewsSection tourSlug={tour.slug} tourTitle={tour.name} />
            </div>

            <div className="space-y-6">
              <div className="lg:sticky sticky-below-nav">
                <BookingCard tour={tour} paymentRegion={paymentRegion} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-brand-border/40 bg-white py-10 sm:py-14">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">More to explore</p>
                <h2 className="mt-2 font-heading text-2xl font-bold text-brand-ink">You might also like</h2>
              </div>
              <Link
                to={ROUTES.tours}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary transition-colors hover:text-brand-primary/80"
              >
                View all tours
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              </Link>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => (
                <Link
                  key={t.slug}
                  to={ROUTES.tourDetail(t.slug)}
                  className="group overflow-hidden rounded-2xl border border-brand-border/50 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-primary/25 hover:shadow-[0_16px_40px_-20px_rgba(0,107,63,0.25)]"
                >
                  <div className="relative aspect-[5/4] overflow-hidden">
                    <img
                      src={t.image}
                      alt={t.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/75 via-brand-primary/15 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-brand-accent">{t.country}</p>
                      <p className="mt-1 line-clamp-2 text-sm font-bold text-white">{t.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <p className="text-xs text-brand-muted">
                      {t.duration}
                    </p>
                    <TourPriceDisplay tour={t} variant="inline" layout="inline" paymentRegion={paymentRegion} />
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <div className="safe-area-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-brand-border/60 bg-white/95 px-4 pt-3 shadow-[0_-8px_24px_-8px_rgba(0,107,63,0.12)] backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs text-brand-muted">From</p>
            <TourPriceDisplay tour={tour} variant="inline" amountOnly paymentRegion={paymentRegion} />
            <span className="text-xs font-normal text-brand-muted"> /person</span>
          </div>
          <Link
            to={ROUTES.tourBook(tour.slug)}
            className="btn-primary flex shrink-0 items-center justify-center gap-1.5 px-4 py-3 text-center text-xs font-semibold leading-snug sm:min-w-[140px] sm:px-5 sm:text-sm"
          >
            Book now
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
      </div>

      <ImageLightbox
        open={lightboxIndex != null}
        images={gallery}
        index={lightboxIndex ?? 0}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
        alt={tour.name}
      />
    </div>
  );
}
