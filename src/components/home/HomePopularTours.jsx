import { Link } from "react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Loader2 } from "lucide-react";
import Container from "../layout/Container";
import ScrollReveal, { ScrollStagger, ScrollStaggerItem } from "../motion/ScrollReveal";
import TourPriceDisplay from "../tours/TourPriceDisplay";
import { ROUTES } from "../../constants/routes";
import { toursPageSection } from "../../data/homeContent";
import { usePopularListings } from "../../hooks/usePopularListings";
import { EASE_OUT } from "../../utils/motionPresets";

const POPULAR_LIMIT = 3;

const SECTION_DEFAULTS = {
  eyebrow: "Discover tours",
  title: "Popular tours",
  subtitle: "Hand-picked journeys across Ghana — heritage, adventure, and coastal escapes.",
  viewAllLabel: "View all tours",
};

function TourCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
      <div className="aspect-[4/3] animate-pulse bg-brand-cream" />
      <div className="h-12 animate-pulse bg-brand-accent/30" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-full animate-pulse rounded bg-brand-cream" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-brand-cream" />
      </div>
    </article>
  );
}

function PopularTourCard({ tour }) {
  const [imgError, setImgError] = useState(false);

  return (
    <ScrollStaggerItem>
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-border bg-white shadow-[0_8px_32px_-16px_rgba(17,17,17,0.15)]"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-brand-cream">
          {tour.image && !imgError ? (
            <img
              src={tour.image}
              alt={tour.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-brand-sand/30 text-sm text-brand-muted">
              {tour.name}
            </div>
          )}
          {tour.isCustom ? (
            <span className="absolute left-3 top-3 rounded-md bg-brand-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-charcoal">
              Tailor-made
            </span>
          ) : null}
        </div>

        <div className="bg-brand-accent px-4 py-3">
          <h3 className="line-clamp-2 text-sm font-bold uppercase tracking-wide text-brand-charcoal sm:text-base">
            {tour.name}
          </h3>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-brand-muted">
            {tour.description || tour.regionLabels?.join(", ") || tour.country}
          </p>
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-brand-border/60 pt-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Pricing</p>
              <TourPriceDisplay tour={tour} variant="inline" />
            </div>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-white">
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </div>
        </div>

        <Link to={ROUTES.tourDetail(tour.slug)} className="absolute inset-0 z-10 rounded-2xl" aria-label={`View ${tour.name}`} />
      </motion.article>
    </ScrollStaggerItem>
  );
}

export default function HomePopularTours({ cmsOverride }) {
  const section = { ...SECTION_DEFAULTS, ...cmsOverride };
  const { data: tours = [], isLoading, isError, refetch } = usePopularListings();
  const popular = tours.slice(0, POPULAR_LIMIT);

  return (
    <section className="bg-brand-cream py-14 sm:py-16 lg:py-20">
      <Container>
        <ScrollReveal variant="up" className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">{section.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold text-brand-primary sm:text-4xl">{section.title}</h2>
          <div className="kente-rule mx-auto mt-3" aria-hidden />
          <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-base">{section.subtitle || toursPageSection.subtitle}</p>
        </ScrollReveal>

        {isLoading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: POPULAR_LIMIT }, (_, i) => (
              <TourCardSkeleton key={`sk-${i}`} />
            ))}
          </div>
        ) : null}

        {!isLoading && isError ? (
          <div className="mt-10 rounded-2xl border border-brand-red/20 bg-white px-6 py-10 text-center">
            <p className="text-sm text-brand-muted">Could not load tours right now.</p>
            <button type="button" onClick={() => refetch()} className="btn-secondary mt-4 px-5 py-2 text-sm">
              Try again
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && popular.length > 0 ? (
          <>
            <ScrollStagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {popular.map((tour) => (
                <PopularTourCard key={tour.slug} tour={tour} />
              ))}
            </ScrollStagger>
            <ScrollReveal variant="scale" delay={0.08} className="mt-10 flex justify-center">
              <Link to={ROUTES.tours} className="btn-accent inline-flex items-center gap-2 px-8 py-3.5">
                {section.viewAllLabel}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </ScrollReveal>
          </>
        ) : null}

        {!isLoading && !isError && popular.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-brand-border bg-white px-6 py-12 text-center">
            <p className="text-sm text-brand-muted">No tours listed yet.</p>
            <Link to={ROUTES.tours} className="btn-accent mt-4 inline-flex px-6 py-2.5 text-sm">
              {section.viewAllLabel}
            </Link>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
