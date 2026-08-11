import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Calendar, MapPin, Star } from "lucide-react";
import Container from "../layout/Container";
import { images } from "../../config/images";
import { heroContent, stats } from "../../data/homeContent";
import { ROUTES } from "../../constants/routes";
import { COUNTRY_FILTER_OPTIONS } from "../../utils/publicListingsHelpers";

const HERO_DESTINATIONS = COUNTRY_FILTER_OPTIONS.filter((option) => option.id !== "all");

const EASE = [0.16, 1, 0.3, 1];

const destinationChips = [
  { id: "ghana", label: "Accra", image: images.tour_sites.arts_and_craft },
  { id: "ghana", label: "Cape Coast", image: images.home.ghana },
  { id: "ghana", label: "Volta Region", image: images.tour_sites.volta },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};

const rise = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

export default function HomeHero({ cmsOverride }) {
  const hero = { ...heroContent, ...cmsOverride };
  const primaryCta = { label: cmsOverride?.primaryCtaLabel || heroContent.primaryCta.label, to: heroContent.primaryCta.to };
  const secondaryCta = { label: cmsOverride?.secondaryCtaLabel || heroContent.secondaryCta.label, to: heroContent.secondaryCta.to };
  const heroImage = cmsOverride?.backgroundImage || images.home.hero_img;
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const navigate = useNavigate();

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function handleSearch(e) {
    e.preventDefault();
    navigate(
      ROUTES.toursSearch({
        country: location || undefined,
        date: date || undefined,
      }),
    );
  }

  function selectDestination(id) {
    setLocation(id);
  }

  return (
    <section className="relative bg-brand-cream">
      {/* ── Cinematic image band ── */}
      <div className="relative h-[52vh] min-h-[340px] max-h-[560px] w-full overflow-hidden sm:h-[58vh] lg:h-[62vh]">
        <motion.img
          initial={{ scale: 1.04 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: EASE }}
          src={heroImage}
          alt="Discover Africa with 360 Tours and Investment Limited"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/70 via-brand-primary/40 to-brand-primary/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/60 via-transparent to-brand-primary/20" />

        {/* Decorative rings */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-brand-accent/20" aria-hidden />
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/10" aria-hidden />

        {/* Top headline overlay — desktop only */}
        <Container className="relative flex h-full flex-col justify-end pb-28 lg:pb-36">
          <div className="hidden max-w-2xl lg:block">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-accent/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">
              {hero.badge}
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-white xl:text-5xl">
              {hero.title}{" "}
              <span className="text-brand-accent">{hero.titleHighlight}</span>
            </h1>
          </div>
        </Container>

        {/* Side destination strip — desktop */}
        <div className="pointer-events-none absolute bottom-8 right-6 hidden gap-3 lg:flex xl:right-12">
          {destinationChips.map((dest) => (
            <div
              key={dest.label}
              className="relative h-28 w-20 overflow-hidden rounded-2xl border-2 border-white/30 shadow-xl"
            >
              <img src={dest.image} alt={dest.label} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/80 to-transparent" />
              <span className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-bold uppercase tracking-wide text-white">
                {dest.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Overlapping content card ── */}
      <Container className="relative z-10 -mt-12 sm:-mt-14 lg:-mt-16">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="overflow-hidden rounded-3xl border border-brand-border/60 bg-white shadow-[0_24px_64px_-24px_rgba(21,67,96,0.28)]"
        >
          {/* Mobile headline — shown when desktop overlay is hidden */}
          <div className="border-b border-brand-border/40 bg-gradient-to-br from-brand-primary to-brand-primary-dark px-6 py-7 sm:px-8 lg:hidden">
            <motion.span
              variants={rise}
              className="inline-flex items-center gap-2 rounded-full bg-brand-accent px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-primary"
            >
              {hero.badge}
            </motion.span>
            <motion.h1
              variants={rise}
              className="mt-4 text-[2rem] font-bold leading-tight tracking-tight text-white sm:text-[2.35rem]"
            >
              {hero.title}{" "}
              <span className="text-brand-accent">{hero.titleHighlight}</span>
            </motion.h1>
            <motion.p variants={rise} className="mt-3 text-sm leading-relaxed text-white/80">
              {hero.subtitle}
            </motion.p>
            <motion.p variants={rise} className="mt-2 text-xs font-semibold text-brand-accent">
              {hero.tagline}
            </motion.p>
          </div>

          <div className="px-6 py-7 sm:px-8 sm:py-8">
            {/* Desktop subtitle */}
            <motion.div variants={rise} className="hidden max-w-2xl lg:block">
              <p className="text-base leading-relaxed text-brand-muted">{hero.subtitle}</p>
              <p className="mt-2 text-sm font-semibold text-brand-primary">{hero.tagline}</p>
            </motion.div>

            {/* Destination quick-picks */}
            <motion.div variants={rise} className="mt-0 flex flex-wrap gap-2 lg:mt-6">
              <span className="mr-1 self-center text-xs font-semibold uppercase tracking-wider text-brand-muted">
                Popular:
              </span>
              {destinationChips.map((dest, i) => (
                <button
                  key={dest.label}
                  type="button"
                  onClick={() => selectDestination(dest.id)}
                  className={[
                    "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
                    location === dest.id
                      ? "border-brand-primary bg-brand-primary text-white shadow-sm"
                      : "border-brand-border bg-brand-cream text-brand-ink hover:border-brand-primary/30 hover:bg-brand-accent/20",
                  ].join(" ")}
                >
                  <img src={dest.image} alt="" className="h-5 w-5 rounded-full object-cover" />
                  {dest.label}
                </button>
              ))}
            </motion.div>

            {/* Search bar */}
            <motion.form
              variants={rise}
              onSubmit={handleSearch}
              className="mt-6 grid gap-3 rounded-2xl border border-brand-border/70 bg-brand-cream/50 p-3 sm:grid-cols-[1fr_1fr_auto] sm:gap-0 sm:p-2"
            >
              <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 sm:rounded-none sm:py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <MapPin className="h-4 w-4" strokeWidth={2} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <label htmlFor="hero-location" className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                    Destination
                  </label>
                  <select
                    id="hero-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full cursor-pointer appearance-none bg-transparent text-sm font-semibold text-brand-ink outline-none"
                  >
                    <option value="">Where to go?</option>
                    {HERO_DESTINATIONS.map((destination) => (
                      <option key={destination.id} value={destination.id}>
                        {destination.label}
                      </option>
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
                  <label htmlFor="hero-date" className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                    Travel date
                  </label>
                  <input
                    id="hero-date"
                    type="date"
                    value={date}
                    min={minDate}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-brand-ink outline-none [color-scheme:light]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-accent px-6 py-3.5 text-sm font-bold text-brand-primary shadow-[0_8px_24px_-8px_rgba(255,219,88,0.9)] transition-all duration-200 hover:bg-brand-accent-dark sm:mx-1 sm:px-8"
              >
                Find tours
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </button>
            </motion.form>

            {/* Secondary CTAs — desktop */}
            <motion.div variants={rise} className="mt-5 hidden flex-wrap items-center gap-4 lg:flex">
              <Link
                to={primaryCta.to}
                className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-brand-primary transition-colors hover:text-brand-primary-dark"
              >
                {primaryCta.label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <span className="h-4 w-px bg-brand-border" aria-hidden />
              <Link
                to={secondaryCta.to}
                className="cursor-pointer text-sm font-medium text-brand-muted transition-colors hover:text-brand-primary"
              >
                {secondaryCta.label}
              </Link>
            </motion.div>
          </div>

          {/* Stats strip */}
          <motion.div
            variants={rise}
            className="grid grid-cols-2 divide-x divide-brand-primary/10 border-t border-brand-border/40 bg-gradient-to-r from-brand-accent/15 via-brand-accent/25 to-brand-accent/15 sm:grid-cols-4"
          >
            {stats.slice(0, 4).map((stat) => (
              <div key={stat.label} className="px-5 py-5 text-center sm:py-6">
                <p className="text-2xl font-bold text-brand-primary sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-brand-muted">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Social proof row below card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 pb-14 sm:pb-16 lg:justify-start lg:gap-10"
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {[images.home.ghana, images.home.kenya, images.home.southAfrica].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm"
                />
              ))}
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-brand-primary text-[10px] font-bold text-white shadow-sm">
                5k+
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-brand-accent text-brand-accent" aria-hidden />
                ))}
                <span className="ml-1 text-sm font-bold text-brand-ink">4.9</span>
              </div>
              <p className="text-xs text-brand-muted">Trusted by 5,000+ travelers</p>
            </div>
          </div>

          <div className="hidden h-8 w-px bg-brand-border/70 sm:block" aria-hidden />

          <p className="max-w-xs text-center text-sm text-brand-muted lg:text-left">
            Tours, accommodation, and transport — everything you need under one roof.
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
