import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, MessageCircle, Quote, Star } from "lucide-react";
import Container from "../layout/Container";
import { images } from "../../config/images";
import { testimonials, testimonialsSection } from "../../data/homeContent";

const EASE = [0.16, 1, 0.3, 1];
const TOTAL = testimonials.length;

function getTestimonialImage(item) {
  return images.destinations?.popular?.[item.imageKey] ?? images.home.testimonial;
}

function wrapIndex(index) {
  return ((index % TOTAL) + TOTAL) % TOTAL;
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

function StarRating({ rating, size = "sm" }) {
  const value = Math.round(parseFloat(rating));
  const iconClass = size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${iconClass} ${i < value ? "fill-brand-accent text-brand-accent" : "fill-brand-border text-brand-border"}`}
          strokeWidth={0}
          aria-hidden
        />
      ))}
    </span>
  );
}

function StoryListItem({ item, index, isActive, onSelect, total }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onSelect(index)}
      className={[
        "group relative flex w-full cursor-pointer gap-3.5 border-b border-brand-border/50 py-4 pl-5 pr-4 text-left transition-all duration-300 last:border-0",
        isActive ? "bg-white shadow-[inset_0_0_0_1px_rgba(255,219,88,0.35)]" : "hover:bg-white/70",
      ].join(" ")}
    >
      <span
        className={[
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
          isActive ? "bg-brand-primary text-white" : "bg-brand-accent/30 text-brand-primary group-hover:bg-brand-accent/50",
        ].join(" ")}
      >
        {item.initials}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span
            className={[
              "truncate text-sm font-bold transition-colors",
              isActive ? "text-brand-primary" : "text-brand-ink group-hover:text-brand-primary",
            ].join(" ")}
          >
            {item.name}
          </span>
          <span className="shrink-0 font-mono text-[10px] font-bold tabular-nums text-brand-muted/70">
            {String(index + 1).padStart(2, "0")}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-[11px] font-semibold uppercase tracking-wide text-brand-accent-dark">
          {item.tour}
        </span>
        <span className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-brand-muted">
          &ldquo;{item.quote}&rdquo;
        </span>
      </span>
      {isActive && (
        <motion.span
          layoutId="story-active-bar"
          className="absolute bottom-0 left-0 top-0 w-1 bg-brand-accent"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <span className="sr-only">
        {isActive ? "Currently showing" : "Show"} story from {item.name}, {index + 1} of {total}
      </span>
    </button>
  );
}

function SpotlightNavButton({ direction, onClick, label }) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      className={[
        "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-brand-border/60 bg-white text-brand-primary shadow-sm transition-all duration-200",
        "hover:border-brand-accent hover:bg-brand-accent active:scale-95",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden />
    </button>
  );
}

function StorySpotlight({ item, activeIndex, onPrev, onNext, onTouchStart, onTouchEnd }) {
  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="relative touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] lg:items-start lg:gap-8">
        {/* Quote block */}
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-1 -top-2 select-none font-serif text-[5.5rem] leading-none text-brand-accent/25 sm:text-[7rem]"
          >
            &ldquo;
          </div>
          <blockquote className="relative pt-6 text-lg font-medium leading-relaxed text-brand-ink sm:text-xl sm:leading-relaxed lg:pt-8 lg:text-2xl lg:leading-snug">
            {item.quote}
          </blockquote>

          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-brand-border/50 pt-6">
            <div className="min-w-0">
              <p className="font-bold text-brand-primary">{item.name}</p>
              <p className="text-sm text-brand-muted">{item.role}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-accent/30 px-3 py-1 text-xs font-bold text-brand-primary">
              <Star className="h-3.5 w-3.5 fill-brand-primary text-brand-primary" strokeWidth={0} aria-hidden />
              {item.rating}
            </span>
          </div>
        </div>

        {/* Popular place banner */}
        <div className="relative mx-auto w-full max-w-[320px] lg:mx-0 lg:max-w-none">
          <div className="absolute -inset-2 rounded-[1.35rem] bg-gradient-to-br from-brand-accent/50 via-brand-accent/15 to-brand-primary/10 sm:-inset-3" aria-hidden />
          <div className="relative overflow-hidden rounded-2xl border border-brand-border/40 bg-white shadow-[0_16px_48px_-20px_rgba(21,67,96,0.35)]">
            <img
              src={getTestimonialImage(item)}
              alt={item.tour}
              className="block h-auto w-full"
            />
          </div>
          <div className="absolute -bottom-3 -right-2 rounded-xl border border-brand-border/60 bg-white px-3 py-2 shadow-md">
            <StarRating rating={item.rating} size="lg" />
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-brand-muted">Verified guest</p>
          </div>
        </div>
      </div>

      {/* In-spotlight navigation */}
      <div className="mt-8 flex items-center justify-between gap-4 border-t border-brand-border/40 pt-6">
        <div className="flex items-center gap-2">
          <SpotlightNavButton direction="prev" onClick={onPrev} label="Previous story" />
          <SpotlightNavButton direction="next" onClick={onNext} label="Next story" />
        </div>
        <span className="text-xs font-bold tabular-nums text-brand-muted">
          {String(activeIndex + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
        </span>
        <span className="hidden rounded-full bg-brand-primary/8 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-primary sm:inline-block">
          {item.tour}
        </span>
      </div>
    </motion.div>
  );
}

export default function HomeTestimonial() {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);
  const touchStartX = useRef(null);
  const active = testimonials[activeIndex];

  const selectStory = useCallback((index) => {
    const next = wrapIndex(index);
    setActiveIndex(next);
    requestAnimationFrame(() => scrollListItemIntoView(listRef.current, next));
  }, []);

  const goPrev = useCallback(() => selectStory(activeIndex - 1), [activeIndex, selectStory]);
  const goNext = useCallback(() => selectStory(activeIndex + 1), [activeIndex, selectStory]);

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

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div aria-hidden className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-brand-accent/10 blur-3xl" />

      <Container className="relative">
        {/* Header — same pattern as About / Features / Destinations */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-accent/25 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">
            <MessageCircle className="h-3.5 w-3.5" aria-hidden />
            {testimonialsSection.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-brand-primary sm:text-4xl">{testimonialsSection.title}</h2>
          <p className="mt-3 text-base leading-relaxed text-brand-muted">{testimonialsSection.subtitle}</p>
        </motion.div>

        {/* Unified explorer panel — sibling to Popular Destinations */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.75, ease: EASE, delay: 0.08 }}
          className="mt-12 overflow-hidden rounded-3xl border border-brand-border/50 shadow-[0_32px_100px_-32px_rgba(21,67,96,0.22)] lg:mt-14"
        >
          <div className="grid lg:grid-cols-[minmax(280px,340px)_1fr]">
            {/* Left — story index */}
            <div className="flex flex-col border-b border-brand-border/50 bg-brand-cream lg:border-b-0 lg:border-r">
              <div className="border-b border-brand-border/50 px-5 py-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">
                  Guest voices
                </p>
                <p className="mt-1 text-sm text-brand-muted">{TOTAL} stories from real travelers</p>

                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-brand-border/50 bg-white px-4 py-3">
                  <StarRating rating={testimonialsSection.rating} size="lg" />
                  <div>
                    <p className="text-sm font-bold text-brand-primary">{testimonialsSection.rating} average</p>
                    <p className="text-[11px] text-brand-muted">{testimonialsSection.reviews}</p>
                  </div>
                </div>
              </div>

              <div
                ref={listRef}
                className="max-h-[320px] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:thin] lg:max-h-[420px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-brand-primary/15"
              >
                {testimonials.map((item, index) => (
                  <StoryListItem
                    key={item.id}
                    item={item}
                    index={index}
                    total={TOTAL}
                    isActive={index === activeIndex}
                    onSelect={selectStory}
                  />
                ))}
              </div>
            </div>

            {/* Right — spotlight stage */}
            <div className="relative flex flex-col bg-[#f4f7fa]">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.35]"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='1' fill='%23154360' fill-opacity='0.08'/%3E%3C/svg%3E\")",
                  backgroundSize: "32px 32px",
                }}
              />

              <div className="relative flex flex-1 flex-col p-5 sm:p-8 lg:p-10">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-muted">
                      Featured story
                    </span>
                    <AnimatePresence mode="wait">
                      <motion.h3
                        key={active.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="mt-1 flex items-center gap-2 text-xl font-bold text-brand-primary sm:text-2xl"
                      >
                        <Quote className="h-5 w-5 shrink-0 text-brand-accent" strokeWidth={2} aria-hidden />
                        {active.name}
                      </motion.h3>
                    </AnimatePresence>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-accent/35 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-primary lg:hidden">
                    {active.tour}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <StorySpotlight
                    item={active}
                    activeIndex={activeIndex}
                    onPrev={goPrev}
                    onNext={goNext}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  />
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile story pills */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {testimonials.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectStory(index)}
              className={[
                "shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
                index === activeIndex
                  ? "border-brand-primary bg-brand-primary text-white"
                  : "border-brand-border bg-brand-cream text-brand-muted",
              ].join(" ")}
            >
              {item.name}
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
