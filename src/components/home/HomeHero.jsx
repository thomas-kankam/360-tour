import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Container from "../layout/Container";
import GalleryPicture from "./GalleryPicture";
import { images } from "../../config/images";
import { heroContent } from "../../data/homeContent";
import { resolvePublicMediaUrl } from "../../utils/mediaUrl";
import { HERO_SLIDESHOW_MAX } from "../../utils/landingCmsStorage";

const EASE = [0.16, 1, 0.3, 1];
const LEGACY_HERO_IMAGES = new Set(["/images/hero_img.png", "/images/home/hero.jpg"]);
const SLIDE_INTERVAL_MS = 6000;

function resolveHeroSources(cmsOverride) {
  const bg = cmsOverride?.backgroundImage?.trim();
  if (bg?.startsWith("data:")) return { webp: bg, png: bg };
  if (bg && !LEGACY_HERO_IMAGES.has(bg)) {
    const resolved = resolvePublicMediaUrl(bg);
    return { webp: resolved, png: resolved };
  }
  return images.home.heroBanner;
}

function resolveSlideshowUrls(cmsOverride) {
  const slides = (cmsOverride?.slideshowImages || [])
    .map((url) => resolvePublicMediaUrl(url))
    .filter(Boolean)
    .slice(0, HERO_SLIDESHOW_MAX);
  if (slides.length) return slides;

  const fallback = cmsOverride?.backgroundImage?.trim();
  if (fallback && !LEGACY_HERO_IMAGES.has(fallback)) {
    return [resolvePublicMediaUrl(fallback)];
  }

  return [resolvePublicMediaUrl(images.home.heroBanner.webp)];
}

function HeroSlideshow({ slides, activeSlide, onChange }) {
  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="sync">
        <motion.img
          key={slides[activeSlide]}
          src={slides[activeSlide]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: EASE }}
          draggable={false}
        />
      </AnimatePresence>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => onChange((activeSlide - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/50 sm:left-5"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2.25} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onChange((activeSlide + 1) % slides.length)}
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/50 sm:right-5"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" strokeWidth={2.25} aria-hidden />
          </button>

          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2" aria-hidden>
            {slides.map((slide, index) => (
              <span
                key={slide}
                className={[
                  "h-1.5 rounded-full transition-all duration-300",
                  index === activeSlide ? "w-6 bg-white" : "w-1.5 bg-white/45",
                ].join(" ")}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function HeroBackgroundMedia({ cmsOverride, heroSources }) {
  const mediaType = cmsOverride?.mediaType || "image";
  const videoUrl = resolvePublicMediaUrl(cmsOverride?.backgroundVideo || "");
  const slides = useMemo(() => resolveSlideshowUrls(cmsOverride), [cmsOverride]);
  const [activeSlide, setActiveSlide] = useState(0);
  const intervalRef = useRef(null);

  const startAutoAdvance = useCallback(() => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (mediaType !== "slideshow" || slides.length <= 1) return;

    intervalRef.current = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
  }, [mediaType, slides.length]);

  useEffect(() => {
    setActiveSlide(0);
    startAutoAdvance();
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [mediaType, slides, startAutoAdvance]);

  function goToSlide(nextIndex) {
    setActiveSlide(nextIndex);
    startAutoAdvance();
  }

  if (mediaType === "video" && videoUrl) {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={videoUrl}
        poster={heroSources.webp}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        controls={false}
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        aria-hidden
      />
    );
  }

  if (mediaType === "slideshow" && slides.length) {
    return <HeroSlideshow slides={slides} activeSlide={activeSlide} onChange={goToSlide} />;
  }

  return (
    <GalleryPicture
      sources={heroSources}
      alt="Ghana landscape — 360 Tours Ghana"
      pictureClassName="absolute inset-0 block h-full w-full"
      className="h-full w-full object-cover"
      loading="eager"
      fetchPriority="high"
    />
  );
}

export default function HomeHero({ cmsOverride }) {
  const sectionRef = useRef(null);
  const hero = { ...heroContent, ...cmsOverride };
  const primaryCta = {
    label: cmsOverride?.primaryCtaLabel || heroContent.primaryCta.label,
    to: heroContent.primaryCta.to,
  };
  const secondaryCta = {
    label: cmsOverride?.secondaryCtaLabel || heroContent.secondaryCta.label,
    to: heroContent.secondaryCta.to,
  };
  const heroSources = useMemo(() => resolveHeroSources(cmsOverride), [cmsOverride]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.08]);

  return (
    <section ref={sectionRef} className="relative bg-brand-secondary">
      <div className="relative min-h-[72vh] w-full overflow-hidden sm:min-h-[78vh] lg:min-h-[82vh]">
        <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0 origin-center will-change-transform">
          <HeroBackgroundMedia cmsOverride={cmsOverride} heroSources={heroSources} />
        </motion.div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-secondary/70 via-brand-secondary/35 to-brand-charcoal/85" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-charcoal/50 via-transparent to-transparent" />

        <Container className="relative flex min-h-[72vh] flex-col justify-center py-20 pointer-events-none sm:min-h-[78vh] lg:min-h-[82vh] lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: EASE }}
            className="pointer-events-auto max-w-2xl"
          >
            <span className="inline-flex items-center rounded-full bg-brand-accent px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-charcoal">
              {hero.badge}
            </span>

            <h1 className="mt-5 font-display text-4xl font-bold uppercase leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {hero.title}
              {hero.titleHighlight ? (
                <>
                  {" "}
                  <span className="text-brand-accent">{hero.titleHighlight}</span>
                </>
              ) : null}
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/90 sm:text-lg">
              {hero.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to={primaryCta.to} className="btn-accent gap-2 px-8 py-3.5 text-base">
                {primaryCta.label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to={secondaryCta.to}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                {secondaryCta.label}
              </Link>
            </div>
          </motion.div>
        </Container>

        <div aria-hidden className="kente-weave absolute inset-x-0 bottom-0 h-1" />
      </div>
    </section>
  );
}
