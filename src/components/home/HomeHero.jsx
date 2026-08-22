import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import Container from "../layout/Container";
import GalleryPicture from "./GalleryPicture";
import { getPopularDestinationImage, images } from "../../config/images";
import { heroContent } from "../../data/homeContent";
import { ROUTES } from "../../constants/routes";
import { COUNTRY_FILTER_OPTIONS } from "../../utils/publicListingsHelpers";

const HERO_DESTINATIONS = COUNTRY_FILTER_OPTIONS.filter((option) => option.id !== "all");
const EASE = [0.16, 1, 0.3, 1];

const destinationChips = [
  { id: "ghana", label: "Accra", imageKey: "accraCityTour" },
  { id: "ghana", label: "Cape Coast", imageKey: "capeCoastCastle" },
  { id: "ghana", label: "Volta Region", imageKey: "wliWaterfalls" },
];

const LEGACY_HERO_IMAGES = new Set(["/images/hero_img.png", "/images/home/hero.jpg"]);

const CARD_LAYOUT = [
  { baseRotate: -10, scrollRotate: 12, scrollY: -40, scrollX: -12, floatDelay: 0 },
  { baseRotate: 3, scrollRotate: -16, scrollY: -56, scrollX: 0, floatDelay: 0.35 },
  { baseRotate: 10, scrollRotate: 18, scrollY: -32, scrollX: 12, floatDelay: 0.7 },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};

const rise = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

function resolveHeroSources(cmsOverride) {
  const bg = cmsOverride?.backgroundImage?.trim();
  if (bg?.startsWith("data:")) return { webp: bg, png: bg };
  if (bg && !LEGACY_HERO_IMAGES.has(bg)) return { webp: bg, png: bg };
  return images.home.heroBanner;
}

function HeroParallaxCard({ dest, layout, index, scrollYProgress }) {
  const y = useTransform(scrollYProgress, [0, 1], [0, layout.scrollY]);
  const x = useTransform(scrollYProgress, [0, 1], [0, layout.scrollX]);
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [layout.baseRotate, layout.baseRotate + layout.scrollRotate * 0.45, layout.baseRotate + layout.scrollRotate],
  );
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94 - index * 0.02]);

  return (
    <motion.div
      style={{ y, x, rotate, scale, zIndex: 10 - index }}
      initial={{ opacity: 0, y: 24, rotate: layout.baseRotate - 10 }}
      animate={{ opacity: 1, y: 0, rotate: layout.baseRotate }}
      transition={{ duration: 0.85, ease: EASE, delay: 0.25 + index * 0.12 }}
      className="relative will-change-transform"
    >
      <motion.div
        animate={{ y: [0, -8, 0, 4, 0], rotate: [0, 2, -2, 1, 0] }}
        transition={{ duration: 5.5 + index * 0.8, repeat: Infinity, ease: "easeInOut", delay: layout.floatDelay }}
        className="relative h-36 w-[5.25rem] overflow-hidden rounded-2xl border-[3px] border-white/55 shadow-[0_20px_48px_-16px_rgba(0,0,0,0.55)] sm:h-40 sm:w-28 md:h-44 md:w-[7.25rem]"
      >
        <img
          src={getPopularDestinationImage(dest.imageKey)}
          alt={dest.label}
          className="h-full w-full object-cover"
          loading={index === 0 ? "eager" : "lazy"}
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/85 via-brand-primary/10 to-transparent" />
        <span className="absolute bottom-2 left-0 right-0 px-1 text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-white drop-shadow-md sm:text-[11px]">
          {dest.label}
        </span>
      </motion.div>
    </motion.div>
  );
}

function HeroDestinationDeck({ scrollYProgress, variant = "desktop" }) {
  if (variant === "mobile") {
    return (
      <div className="mt-4 flex justify-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
        {destinationChips.map((dest, index) => (
          <motion.div
            key={dest.label}
            initial={{ opacity: 0, y: 16, rotate: CARD_LAYOUT[index].baseRotate - 6 }}
            animate={{ opacity: 1, y: 0, rotate: CARD_LAYOUT[index].baseRotate * 0.6 }}
            transition={{ duration: 0.6, delay: 0.15 + index * 0.08, ease: EASE }}
            className="relative shrink-0"
            style={{ zIndex: 10 - index, marginLeft: index > 0 ? "-1.25rem" : 0 }}
          >
            <div className="relative h-28 w-[4.75rem] overflow-hidden rounded-xl border-2 border-brand-border/60 bg-white shadow-md">
              <img
                src={getPopularDestinationImage(dest.imageKey)}
                alt={dest.label}
                className="h-full w-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/80 to-transparent" />
              <span className="absolute bottom-1.5 left-0 right-0 text-center text-[9px] font-bold uppercase text-white">
                {dest.label}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute bottom-6 right-4 z-20 hidden lg:flex lg:bottom-8 lg:right-6 xl:bottom-10 xl:right-8"
      style={{ perspective: 1200 }}
    >
      <div className="flex items-end">
        {destinationChips.map((dest, index) => (
          <div key={dest.label} className={index > 0 ? "-ml-6 lg:-ml-7" : ""}>
            <HeroParallaxCard dest={dest} layout={CARD_LAYOUT[index]} index={index} scrollYProgress={scrollYProgress} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomeHero({ cmsOverride }) {
  const sectionRef = useRef(null);
  const hero = { ...heroContent, ...cmsOverride };
  const primaryCta = { label: cmsOverride?.primaryCtaLabel || heroContent.primaryCta.label, to: heroContent.primaryCta.to };
  const secondaryCta = { label: cmsOverride?.secondaryCtaLabel || heroContent.secondaryCta.label, to: heroContent.secondaryCta.to };
  const heroSources = useMemo(() => resolveHeroSources(cmsOverride), [cmsOverride]);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.1]);
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function handleSearch(e) {
    e.preventDefault();
    navigate(ROUTES.toursSearch({ country: location || undefined, date: date || undefined }));
  }

  return (
    <section ref={sectionRef} className="relative bg-brand-cream">
      <div className="relative h-[42vh] min-h-[280px] max-h-[480px] w-full overflow-hidden sm:h-[46vh] sm:min-h-[300px] lg:h-[52vh] lg:min-h-[360px] lg:max-h-[540px]">
        <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0 origin-center will-change-transform">
          <GalleryPicture
            sources={heroSources}
            alt="Travelers at Black Star Gate, Accra, 360 Tours Ghana"
            pictureClassName="absolute inset-0 block h-full w-full"
            className="h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/55 via-brand-primary/25 to-brand-primary/78" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/40 via-transparent to-brand-primary/10" />

        <HeroDestinationDeck scrollYProgress={scrollYProgress} variant="desktop" />

        <Container className="relative flex h-full flex-col justify-end pb-14 sm:pb-16 lg:pb-20">
          <div className="max-w-xl pr-4 lg:max-w-md xl:max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-accent/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">
              {hero.badge}
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-[1.08] tracking-tight text-white sm:mt-5 sm:text-4xl xl:text-5xl">
              {hero.title} <span className="text-brand-accent">{hero.titleHighlight}</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/85 lg:hidden">{hero.subtitle}</p>
          </div>
        </Container>
      </div>

      <Container className="relative z-10 -mt-8 sm:-mt-10 lg:-mt-12">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative overflow-hidden rounded-3xl border border-brand-border/60 bg-white shadow-[0_24px_64px_-24px_rgba(0,107,63,0.28)]"
        >
          <div className="px-6 py-7 sm:px-8 sm:py-8">
            <motion.div variants={rise} className="hidden max-w-2xl lg:block">
              <p className="text-sm leading-relaxed text-brand-muted">{hero.subtitle}</p>
            </motion.div>

            <motion.div variants={rise} className="lg:hidden">
              <HeroDestinationDeck scrollYProgress={scrollYProgress} variant="mobile" />
            </motion.div>

            <motion.div variants={rise} className="mt-4 flex flex-wrap gap-2 lg:mt-6">
              <span className="mr-1 self-center text-xs font-semibold uppercase tracking-wider text-brand-muted">Popular:</span>
              {destinationChips.map((dest) => (
                <button
                  key={dest.label}
                  type="button"
                  onClick={() => setLocation(dest.id)}
                  className={[
                    "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
                    location === dest.id
                      ? "border-brand-primary bg-brand-primary text-white shadow-sm"
                      : "border-brand-border bg-brand-cream text-brand-ink hover:border-brand-primary/30 hover:bg-brand-accent/20",
                  ].join(" ")}
                >
                  <img src={getPopularDestinationImage(dest.imageKey)} alt="" className="h-5 w-5 rounded-full object-cover" />
                  {dest.label}
                </button>
              ))}
            </motion.div>

            <motion.form variants={rise} onSubmit={handleSearch} className="mt-6 grid gap-3 rounded-2xl border border-brand-border/70 bg-brand-cream/50 p-3 sm:grid-cols-[1fr_1fr_auto] sm:gap-0 sm:p-2">
              <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 sm:rounded-none sm:py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <MapPin className="h-4 w-4" strokeWidth={2} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <label htmlFor="hero-location" className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Destination</label>
                  <select id="hero-location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full cursor-pointer appearance-none bg-transparent text-sm font-semibold text-brand-ink outline-none">
                    <option value="">Where to go?</option>
                    {HERO_DESTINATIONS.map((destination) => (
                      <option key={destination.id} value={destination.id}>{destination.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="hidden w-px bg-brand-border/70 sm:block" />
              <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 sm:rounded-none sm:py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <Calendar className="h-4 w-4" strokeWidth={2} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <label htmlFor="hero-date" className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Travel date</label>
                  <input id="hero-date" type="date" value={date} min={minDate} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent text-sm font-semibold text-brand-ink outline-none [color-scheme:light]" />
                </div>
              </div>
              <button type="submit" className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-accent px-6 py-3.5 text-sm font-bold text-brand-primary shadow-[0_8px_24px_-8px_rgba(255,219,88,0.9)] transition-all duration-200 hover:bg-brand-accent-dark sm:mx-1 sm:px-8">
                Find tours
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </button>
            </motion.form>

            <motion.div variants={rise} className="mt-5 hidden flex-wrap items-center gap-4 lg:flex">
              <Link to={primaryCta.to} className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-brand-primary transition-colors hover:text-brand-primary-dark">
                {primaryCta.label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <span className="h-4 w-px bg-brand-border" aria-hidden />
              <Link to={secondaryCta.to} className="cursor-pointer text-sm font-medium text-brand-muted transition-colors hover:text-brand-primary">{secondaryCta.label}</Link>
            </motion.div>
          </div>
        </motion.div>
        <div className="pb-12 sm:pb-14" aria-hidden />
      </Container>
    </section>
  );
}
