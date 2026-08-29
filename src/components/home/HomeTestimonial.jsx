import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import Container from "../layout/Container";
import ScrollReveal from "../motion/ScrollReveal";
import { images, getPopularDestinationImage } from "../../config/images";
import { testimonialsSection } from "../../data/homeContent";
import { resolveCmsTestimonialItems } from "../../utils/landingCmsItems";

const EASE = [0.16, 1, 0.3, 1];
const AUTOPLAY_MS = 8000;

function getTestimonialImage(item) {
  return item.imageSrc || getPopularDestinationImage(item.imageKey) || images.home.testimonial;
}

function StarRating({ rating }) {
  const value = Math.round(parseFloat(rating));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < value ? "fill-brand-accent text-brand-accent" : "fill-brand-border text-brand-border"}`}
          strokeWidth={0}
          aria-hidden
        />
      ))}
    </span>
  );
}

export default function HomeTestimonial({ cmsOverride }) {
  const sectionMeta = useMemo(() => ({ ...testimonialsSection, ...cmsOverride }), [cmsOverride]);
  const stories = useMemo(() => resolveCmsTestimonialItems(sectionMeta), [sectionMeta]);
  const total = stories.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);
  const active = stories[activeIndex] || stories[0];

  const goPrev = useCallback(() => {
    if (total < 2) return;
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    if (total < 2) return;
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  useEffect(() => {
    if (paused || total < 2) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setTimeout(goNext, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [paused, goNext, activeIndex, total]);

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

  if (!total || !active) return null;

  return (
    <section className="bg-brand-cream py-14 sm:py-16 lg:py-20">
      <Container>
        <ScrollReveal variant="up" className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">{sectionMeta.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold text-brand-primary sm:text-4xl">{sectionMeta.title}</h2>
          <div className="kente-rule mx-auto mt-3" aria-hidden />
          <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-base">{sectionMeta.subtitle}</p>
          <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-brand-border bg-white px-4 py-2">
            <StarRating rating={sectionMeta.rating} />
            <span className="text-sm font-semibold text-brand-primary">{sectionMeta.rating}</span>
            <span className="text-xs text-brand-muted">{sectionMeta.reviews}</span>
          </div>
        </ScrollReveal>

        <div
          className="relative mx-auto mt-10 max-w-4xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.article
              key={active.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="overflow-hidden rounded-3xl border border-brand-border bg-white shadow-kente"
            >
              <div className="grid md:grid-cols-[1fr_280px]">
                <div className="p-6 sm:p-8 md:p-10">
                  <Quote className="h-8 w-8 text-brand-accent" strokeWidth={2} aria-hidden />
                  <blockquote className="mt-4 text-lg font-medium leading-relaxed text-brand-ink sm:text-xl">
                    &ldquo;{active.quote}&rdquo;
                  </blockquote>
                  <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-brand-border/60 pt-6">
                    <div>
                      <p className="font-bold text-brand-primary">{active.name}</p>
                      <p className="text-sm text-brand-muted">{active.role}</p>
                    </div>
                    <span className="rounded-full bg-brand-accent/25 px-3 py-1 text-xs font-bold text-brand-primary">
                      {active.tour}
                    </span>
                  </div>
                </div>
                <div className="relative hidden min-h-[220px] md:block">
                  <img
                    src={getTestimonialImage(active)}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent" />
                </div>
              </div>
            </motion.article>
          </AnimatePresence>

          {total > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button type="button" onClick={goPrev} aria-label="Previous testimonial" className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border bg-white text-brand-primary hover:bg-brand-accent/20">
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <div className="flex gap-2" role="tablist" aria-label="Testimonials">
                {stories.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={index === activeIndex}
                    aria-label={`Show review from ${item.name}`}
                    onClick={() => setActiveIndex(index)}
                    className={[
                      "h-2.5 rounded-full transition-all",
                      index === activeIndex ? "w-8 bg-brand-primary" : "w-2.5 bg-brand-primary/25 hover:bg-brand-primary/45",
                    ].join(" ")}
                  />
                ))}
              </div>
              <button type="button" onClick={goNext} aria-label="Next testimonial" className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border bg-white text-brand-primary hover:bg-brand-accent/20">
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
