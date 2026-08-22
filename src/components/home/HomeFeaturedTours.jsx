import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Loader2 } from "lucide-react";
import Container from "../layout/Container";
import ScrollReveal, { ScrollStagger, ScrollStaggerItem } from "../motion/ScrollReveal";
import TourPriceDisplay from "../tours/TourPriceDisplay";
import { ROUTES } from "../../constants/routes";
import { toursPageSection } from "../../data/homeContent";
import { useRandomListings } from "../../hooks/useRandomListings";
import { EASE_OUT } from "../../utils/motionPresets";
/** Home shows the four latest listings; the rest live behind "View all tours". */
const FEATURED_LIMIT = 4;

const SECTION_DEFAULTS = {
  eyebrow: "Featured journeys",
  title: "Start with these four",
  subtitle: toursPageSection.subtitle,
  viewAllLabel: "View all tours",
};

function TourCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-brand-border/70 bg-white shadow-sm">
      <div className="aspect-[4/3] animate-pulse bg-brand-cream" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-brand-cream" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-brand-cream" />
      </div>
    </article>
  );
}

function FeaturedTourCard({ tour, index }) {
  return (
    <ScrollStaggerItem>
      <motion.article
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-border/70 bg-white shadow-[0_10px_36px_-20px_rgba(23,19,14,0.22)] hover:shadow-[0_22px_52px_-18px_rgba(23,19,14,0.32)]"
      >
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-cream">
        {tour.image ? (
          <img
            src={tour.image}
            alt={tour.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-brand-muted">Photo coming soon</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/75 via-transparent to-transparent" />
        {tour.isCustom ? (
          <span className="absolute left-3 top-3 rounded-full bg-brand-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-charcoal">
            Tailor-made
          </span>
        ) : index === 0 ? (
          <span className="absolute left-3 top-3 rounded-full bg-brand-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-charcoal">
            Top pick
          </span>
        ) : null}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/75">
            {tour.regionLabels?.[0] || tour.country}
          </p>
          <h3 className="mt-0.5 line-clamp-2 text-base font-bold leading-snug text-white">{tour.name}</h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-brand-muted">
          {tour.duration ? <span>{tour.duration}</span> : null}
          {tour.departDate ? (
            <>
              <span aria-hidden>·</span>
              <span>{tour.departDate}</span>
            </>
          ) : null}
        </div>
        <div className="mt-3 flex items-end justify-between gap-2 border-t border-brand-border/50 pt-3">
          <TourPriceDisplay tour={tour} variant="inline" />
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary">
            View
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </div>

      <Link to={ROUTES.tourDetail(tour.slug)} className="absolute inset-0 z-10 rounded-2xl" aria-label={`View ${tour.name}`} />
      </motion.article>
    </ScrollStaggerItem>
  );
}

export default function HomeFeaturedTours({ cmsOverride }) {
  const section = { ...SECTION_DEFAULTS, ...cmsOverride };
  const { data: tours = [], isLoading, isError, refetch } = useRandomListings();
  const featured = tours.slice(0, FEATURED_LIMIT);

  return (
    <section className="relative overflow-hidden bg-brand-cream py-14 sm:py-16 lg:py-20">
      <Container className="relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <ScrollReveal variant="up" className="max-w-xl">
            <p className="eyebrow">{section.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-bold text-brand-ink sm:text-3xl">{section.title}</h2>
            <div className="kente-rule mt-3" aria-hidden />
            <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-base">{section.subtitle}</p>
          </ScrollReveal>
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
            {Array.from({ length: FEATURED_LIMIT }, (_, i) => (
              <TourCardSkeleton key={`sk-${i}`} />
            ))}
          </div>
        ) : null}

        {!isLoading && isError ? (
          <div className="mt-8 rounded-2xl border border-brand-orange/30 bg-white px-6 py-10 text-center">
            <p className="text-sm text-brand-muted">Could not load tours right now.</p>
            <button type="button" onClick={() => refetch()} className="btn-secondary mt-4 px-5 py-2 text-sm">
              Try again
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && featured.length > 0 ? (
          <>
          <ScrollStagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((tour, index) => (
              <FeaturedTourCard key={tour.slug} tour={tour} index={index} />
            ))}
          </ScrollStagger>
        <ScrollReveal variant="scale" delay={0.08} className="mt-10 flex justify-center">
          <Link to={ROUTES.tours} className="btn-primary inline-flex items-center gap-2 px-8 py-3.5">
            {section.viewAllLabel}
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ArrowRight className="h-4 w-4" aria-hidden />}
          </Link>
        </ScrollReveal>
          </>
        ) : null}

        {!isLoading && !isError && featured.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-brand-border/70 bg-white px-6 py-12 text-center">
            <p className="text-sm text-brand-muted">No tours listed yet, browse all listings when they are published.</p>
            <Link to={ROUTES.tours} className="btn-primary mt-4 inline-flex px-6 py-2.5 text-sm">
              {section.viewAllLabel}
            </Link>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
