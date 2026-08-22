import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Compass, MapPin } from "lucide-react";
import Container from "../layout/Container";
import ScrollReveal from "../motion/ScrollReveal";
import { getPopularDestinationSources } from "../../config/images";
import { popularDestinationsSection } from "../../data/homeContent";
import { resolveCmsDestinationItems, resolveCmsItemImage } from "../../utils/landingCmsItems";
import { ROUTES } from "../../constants/routes";

const EASE = [0.16, 1, 0.3, 1];

const SECTION_DEFAULTS = {
  eyebrow: popularDestinationsSection.eyebrow,
  title: popularDestinationsSection.title,
  subtitle: popularDestinationsSection.subtitle,
  ctaLabel: "View all tours",
  bookLabel: "Book this experience",
};

function getDestinationSources(destination) {
  return resolveCmsItemImage(destination) ?? getPopularDestinationSources(destination.imageKey) ?? { webp: destination.fallback, png: destination.fallback };
}

function scrollListItemIntoView(container, index) {
  if (!container) return;
  const item = container.children[index];
  if (!item) return;
  const itemTop = item.offsetTop;
  const itemBottom = itemTop + item.offsetHeight;
  const viewTop = container.scrollTop;
  const viewBottom = viewTop + container.clientHeight;

  if (itemTop < viewTop) {
    container.scrollTo({ top: itemTop, behavior: "smooth" });
  } else if (itemBottom > viewBottom) {
    container.scrollTo({ top: itemBottom - container.clientHeight, behavior: "smooth" });
  }
}

function SpotlightNavButton({ direction, onClick, disabled, label }) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={[
        "absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/80 bg-white/95 text-brand-primary shadow-[0_8px_24px_-8px_rgba(0,107,63,0.45)] backdrop-blur-sm transition-all duration-200 sm:h-12 sm:w-12",
        direction === "prev" ? "left-2 sm:left-3" : "right-2 sm:right-3",
        disabled
          ? "pointer-events-none opacity-30"
          : "hover:border-brand-accent hover:bg-brand-accent hover:text-brand-primary hover:shadow-lg active:scale-95",
      ].join(" ")}
    >
      <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} aria-hidden />
    </button>
  );
}

function DestinationSpotlight({ destination, onPrev, onNext, canGoPrev, canGoNext, onTouchStart, onTouchEnd, priority = false }) {
  const [failed, setFailed] = useState(false);
  const sources = getDestinationSources(destination);

  return (
    <motion.div
      key={destination.id}
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -8 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="relative w-full touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <SpotlightNavButton
        direction="prev"
        onClick={onPrev}
        disabled={!canGoPrev}
        label={`Previous destination${canGoPrev ? "" : ", unavailable"}`}
      />
      <SpotlightNavButton
        direction="next"
        onClick={onNext}
        disabled={!canGoNext}
        label={`Next destination${canGoNext ? "" : ", unavailable"}`}
      />
      {/* Decorative frame */}
      <div className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-brand-accent/40 via-brand-accent/10 to-brand-primary/10 sm:-inset-4" aria-hidden />
      <div className="relative overflow-hidden rounded-2xl border border-brand-border/40 bg-white shadow-[0_32px_80px_-24px_rgba(0,107,63,0.35)] sm:rounded-3xl">
        {failed ? (
          <div className="flex min-h-[220px] items-center justify-center bg-brand-cream sm:min-h-[320px]">
            <MapPin className="h-12 w-12 text-brand-primary/40" aria-hidden />
          </div>
        ) : (
          <picture>
            {!/^https?:\/\//i.test(String(sources.webp || "")) && sources.webp !== sources.png ? (
              <source srcSet={sources.webp} type="image/webp" />
            ) : null}
            <img
              src={sources.png}
              alt={destination.name}
              width={1280}
              height={800}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
              className="block aspect-[16/10] h-auto w-full object-cover"
              onError={() => setFailed(true)}
              draggable={false}
            />
          </picture>
        )}
      </div>
      {/* Corner accent */}
      <div className="absolute -bottom-2 -right-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accent shadow-lg sm:h-16 sm:w-16">
        <Compass className="h-7 w-7 text-brand-primary" strokeWidth={1.75} aria-hidden />
      </div>
    </motion.div>
  );
}

function DestinationListItem({ destination, index, isActive, onSelect, total }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onSelect(index)}
      className={[
        "group relative flex w-full cursor-pointer items-start gap-4 border-b border-white/10 py-4 pl-5 pr-4 text-left transition-all duration-300 last:border-0",
        isActive ? "bg-white/10" : "hover:bg-white/5",
      ].join(" ")}
    >
      <span
        className={[
          "mt-0.5 font-mono text-xs font-bold tabular-nums transition-colors",
          isActive ? "text-brand-accent" : "text-white/35 group-hover:text-white/55",
        ].join(" ")}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={[
            "block text-sm font-semibold leading-snug transition-colors sm:text-base",
            isActive ? "text-white" : "text-white/65 group-hover:text-white/85",
          ].join(" ")}
        >
          {destination.name}
        </span>
        <span className="mt-0.5 block text-[11px] text-white/40">{destination.region}</span>
      </span>
      {isActive && (
        <motion.span
          layoutId="dest-active-bar"
          className="absolute bottom-0 left-0 top-0 w-1 bg-brand-accent"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <span className="sr-only">
        {isActive ? "Currently showing" : "Show"} {destination.name}, {index + 1} of {total}
      </span>
    </button>
  );
}

export default function HomeDestinations({ cmsOverride }) {
  const section = { ...SECTION_DEFAULTS, ...cmsOverride };
  const destinations = resolveCmsDestinationItems(section);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);
  const touchStartX = useRef(null);
  const active = destinations[activeIndex];
  const progress = ((activeIndex + 1) / destinations.length) * 100;
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < destinations.length - 1;

  const selectDestination = useCallback((index) => {
    const next = Math.max(0, Math.min(index, destinations.length - 1));
    setActiveIndex(next);
    requestAnimationFrame(() => scrollListItemIntoView(listRef.current, next));
  }, [destinations.length]);

  const goPrev = useCallback(() => {
    if (canGoPrev) selectDestination(activeIndex - 1);
  }, [activeIndex, canGoPrev, selectDestination]);

  const goNext = useCallback(() => {
    if (canGoNext) selectDestination(activeIndex + 1);
  }, [activeIndex, canGoNext, selectDestination]);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (touchStartX.current === null) return;
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 48) {
        if (diff > 0) goNext();
        else goPrev();
      }
      touchStartX.current = null;
    },
    [goNext, goPrev],
  );

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        selectDestination(activeIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        selectDestination(activeIndex - 1);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, selectDestination]);

  return (
    <section className="relative overflow-hidden bg-brand-cream py-16 sm:py-20 lg:py-24">
      <Container>
        {/* Header */}
        <ScrollReveal variant="up" className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-accent/30 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {section.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-brand-primary sm:text-4xl">
            {section.title}
          </h2>
          <p className="mt-3 text-base text-brand-muted">{section.subtitle}</p>
        </ScrollReveal>

        {/* Explorer panel */}
        <ScrollReveal variant="scale" delay={0.08} className="mt-12 overflow-hidden rounded-3xl border border-brand-border/50 shadow-[0_32px_100px_-32px_rgba(0,107,63,0.28)] lg:mt-14">
          <div className="grid lg:grid-cols-[minmax(260px,340px)_1fr]">
            {/* Left, destination index */}
            <div className="relative flex flex-col bg-brand-primary">
              <div className="border-b border-white/10 px-5 py-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-accent">
                  Pick a destination
                </p>
                <p className="mt-1 text-sm text-white/55">
                  {destinations.length} places across Ghana
                </p>
                {/* Progress track */}
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-brand-accent"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: EASE }}
                  />
                </div>
              </div>

              <div
                ref={listRef}
                className="max-h-[280px] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:thin] lg:max-h-[520px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20"
              >
                {destinations.map((destination, index) => (
                  <DestinationListItem
                    key={destination.id}
                    destination={destination}
                    index={index}
                    total={destinations.length}
                    isActive={index === activeIndex}
                    onSelect={selectDestination}
                  />
                ))}
              </div>

              <div className="mt-auto border-t border-white/10 p-5">
                <Link
                  to={popularDestinationsSection.cta.to}
                  className="group inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-brand-accent transition-colors hover:text-brand-accent-light"
                >
                  {section.ctaLabel}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </div>
            </div>

            {/* Right, spotlight stage */}
            <div className="adinkra-field relative flex flex-col bg-brand-cream">

              <div className="relative flex flex-1 flex-col p-5 sm:p-8 lg:p-10">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-muted">
                      Now viewing
                    </span>
                    <AnimatePresence mode="wait">
                      <motion.h3
                        key={active.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="mt-1 text-xl font-bold text-brand-primary sm:text-2xl"
                      >
                        {active.name}
                      </motion.h3>
                    </AnimatePresence>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-primary">
                    {String(activeIndex + 1).padStart(2, "0")}/{destinations.length}
                  </span>
                </div>

                <div className="flex flex-1 items-center justify-center">
                  <AnimatePresence mode="wait">
                    <DestinationSpotlight
                      destination={active}
                      onPrev={goPrev}
                      onNext={goNext}
                      canGoPrev={canGoPrev}
                      canGoNext={canGoNext}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                      priority={activeIndex === 0}
                    />
                  </AnimatePresence>
                </div>

                {/* Dot navigation */}
                <div
                  className="mt-5 flex items-center justify-center gap-1.5"
                  role="tablist"
                  aria-label="Destination navigation"
                >
                  {destinations.map((destination, index) => (
                    <button
                      key={destination.id}
                      type="button"
                      role="tab"
                      aria-selected={index === activeIndex}
                      aria-label={`Go to ${destination.name}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectDestination(index)}
                      className={[
                        "cursor-pointer rounded-full transition-all duration-300",
                        index === activeIndex
                          ? "h-2.5 w-7 bg-brand-primary"
                          : "h-2 w-2 bg-brand-primary/20 hover:bg-brand-primary/45",
                      ].join(" ")}
                    />
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 border-t border-brand-border/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-sm text-sm text-brand-muted">
                    Use the arrows, dots, index list, or swipe to browse destinations in{" "}
                    <span className="font-semibold text-brand-ink">{active.region}</span>.
                  </p>
                  <Link
                    to={ROUTES.toursSearch({ country: "ghana" })}
                    className="group inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-dark"
                  >
                    {section.bookLabel}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Mobile quick strip, horizontal destination chips */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {destinations.map((destination, index) => (
            <button
              key={destination.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectDestination(index)}
              className={[
                "shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
                index === activeIndex
                  ? "border-brand-primary bg-brand-primary text-white"
                  : "border-brand-border bg-white text-brand-muted",
              ].join(" ")}
            >
              {destination.name}
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
