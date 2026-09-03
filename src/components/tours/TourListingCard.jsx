import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Calendar, Clock, MapPin, Star, Users } from "lucide-react";
import { GuestIcon, resolveTourFallbackIcon } from "../../utils/guestIcons";
import TourPriceDisplay from "./TourPriceDisplay";
import { ROUTES } from "../../constants/routes";

const EASE = [0.16, 1, 0.3, 1];

function StarRating({ value, reviews }) {
  const hasRating = Number(value) > 0;
  const count = Number(reviews) || 0;

  if (!hasRating) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-brand-ink shadow-sm">
      <Star className="h-3 w-3 fill-brand-accent text-brand-accent" strokeWidth={0} aria-hidden />
      {Number(value).toFixed(1)}
      {count > 0 ? <span className="font-medium text-brand-muted">({count})</span> : null}
    </span>
  );
}

export default function TourListingCard({ tour, index = 0, eagerImage = false }) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const previewText = tour.highlight || tour.descriptionSnippet;
  const highlights = (tour.highlights || []).filter(Boolean).slice(0, 3);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE, delay: Math.min(index * 0.04, 0.24) }}
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false);
      }}
    >
      <Link
        to={ROUTES.tourDetail(tour.slug)}
        aria-label={`View ${tour.name}`}
        className="relative flex min-h-[380px] flex-col overflow-hidden rounded-2xl border border-brand-border/50 bg-white shadow-sm transition-all duration-300 hover:border-brand-primary/30 hover:shadow-[0_20px_48px_-24px_rgba(0,107,63,0.28)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-brand-border/30">
          {!imgError && tour.image ? (
            <img
              src={tour.image}
              alt={tour.name}
              loading={eagerImage ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={eagerImage ? "high" : "auto"}
              width={640}
              height={480}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-cream text-brand-primary/50">
              <GuestIcon name={resolveTourFallbackIcon(tour.categories)} className="h-10 w-10" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/90 via-brand-primary/20 to-transparent" />

          {tour.isCustom ? (
            <span className="absolute left-3 top-3 rounded-full bg-brand-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-charcoal shadow-md">
              Tailor-made
            </span>
          ) : (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-primary shadow-md">
              Scheduled
            </span>
          )}

          <div className="absolute right-3 top-3">
            <StarRating value={tour.rating} reviews={tour.reviews} />
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            {tour.country ? (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/75">{tour.country}</p>
            ) : null}
            <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-snug text-white">{tour.name}</h3>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          {tour.location ? (
            <p className="flex items-center gap-1.5 text-xs text-brand-muted">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-primary" aria-hidden />
              <span className="line-clamp-1">{tour.location}</span>
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-muted">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-brand-primary" aria-hidden />
              {tour.nextDate}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-brand-primary" aria-hidden />
              {tour.duration}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-brand-primary" aria-hidden />
              {tour.groupSize}
            </span>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-brand-border/50 pt-3">
            <TourPriceDisplay tour={tour} variant="card" perPerson primaryClassName="text-brand-primary" />
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-primary">
              View tour
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </div>
        </div>

        {/* Desktop hover sneak-peek panel */}
        <AnimatePresence>
          {hovered ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden border-t border-white/20 bg-brand-primary/95 p-4 backdrop-blur-sm sm:block"
              aria-hidden
            >
              {previewText ? (
                <p className="line-clamp-3 text-xs leading-relaxed text-white/90">{previewText}</p>
              ) : null}
              {highlights.length ? (
                <ul className="mt-2 space-y-1">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-[11px] text-white/85">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-accent" aria-hidden />
                      <span className="line-clamp-1">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-accent">
                Open full itinerary
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Link>
    </motion.article>
  );
}
