import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import Container from "../layout/Container";
import GalleryPicture from "./GalleryPicture";
import ScrollReveal from "../motion/ScrollReveal";
import { ROUTES } from "../../constants/routes";
import { ghanaRegions, operatingSection } from "../../data/homeContent";

const EASE = [0.16, 1, 0.3, 1];

const SECTION_DEFAULTS = {
  eyebrow: operatingSection.eyebrow,
  title: operatingSection.title,
  subtitle: operatingSection.subtitle,
  ctaLabel: operatingSection.cta.label,
  footerNote: "Ghana is our home base, with curated experiences across Africa.",
};

function regionTourLink(region) {
  if (region.packageId) {
    return ROUTES.toursSearch({ country: "ghana", package: region.packageId });
  }
  return ROUTES.toursSearch({ country: "ghana" });
}

function RegionListItem({ region, index, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      className={[
        "group flex w-full cursor-pointer items-center gap-4 rounded-2xl border p-3 text-left transition-all duration-300 sm:p-4",
        isActive
          ? "border-brand-accent/60 bg-white shadow-[0_8px_32px_-12px_rgba(21,67,96,0.2)]"
          : "border-transparent bg-white/40 hover:border-brand-primary/15 hover:bg-white/70",
      ].join(" ")}
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl sm:h-16 sm:w-16">
        <GalleryPicture
          imageKey={region.imageKey}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {isActive && (
          <div className="absolute inset-0 ring-2 ring-brand-accent ring-offset-1" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">{region.region}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-brand-ink sm:text-base">{region.name}</p>
        <p className="mt-0.5 truncate text-xs text-brand-muted">{region.tagline}</p>
      </div>
      <span
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300",
          isActive ? "bg-brand-primary text-white" : "bg-brand-cream text-brand-muted group-hover:bg-brand-accent/30 group-hover:text-brand-primary",
        ].join(" ")}
      >
        <ArrowUpRight className="h-4 w-4" aria-hidden />
      </span>
    </button>
  );
}

function MobileRegionCard({ region, index, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      className={[
        "relative w-[260px] shrink-0 snap-center overflow-hidden rounded-2xl border text-left transition-all duration-300",
        isActive ? "border-brand-accent shadow-lg" : "border-brand-border/60",
      ].join(" ")}
    >
      <div className="relative h-36">
        <GalleryPicture
          imageKey={region.imageKey}
          alt={region.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/90 via-brand-primary/30 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-brand-accent/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-primary">
          {region.region}
        </span>
        <p className="absolute bottom-3 left-3 text-lg font-bold text-white">{region.name}</p>
      </div>
    </button>
  );
}

export default function HomeHubs({ cmsOverride }) {
  const section = { ...SECTION_DEFAULTS, ...cmsOverride };
  const [activeIndex, setActiveIndex] = useState(0);
  const active = ghanaRegions[activeIndex];

  return (
    <section className="relative overflow-hidden bg-brand-primary py-16 sm:py-20 lg:py-24">
      <div aria-hidden className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand-accent/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='1.5' fill='white'/%3E%3C/svg%3E\")",
          backgroundSize: "40px 40px",
        }}
      />

      <Container className="relative">
        <ScrollReveal variant="up" className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-accent/25 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {section.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            {section.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/70">{section.subtitle}</p>
        </ScrollReveal>

        <div className="mt-10 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
          {ghanaRegions.map((region, index) => (
            <MobileRegionCard
              key={region.id}
              region={region}
              index={index}
              isActive={index === activeIndex}
              onSelect={setActiveIndex}
            />
          ))}
        </div>

        <ScrollReveal variant="scale" delay={0.08}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.75, ease: EASE, delay: 0.1 }}
          className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.4)] backdrop-blur-sm lg:mt-12"
        >
          <div className="grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
            <div className="relative min-h-[320px] sm:min-h-[400px] lg:min-h-[480px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="absolute inset-0"
                >
                  <GalleryPicture
                    imageKey={active.imageKey}
                    alt={active.name}
                    pictureClassName="block h-full w-full"
                    className="h-full w-full object-cover"
                    loading={activeIndex === 0 ? "eager" : "lazy"}
                    fetchPriority={activeIndex === 0 ? "high" : "auto"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-primary via-brand-primary/40 to-brand-primary/10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-primary/30 lg:to-brand-primary/60" />
                </motion.div>
              </AnimatePresence>

              <div className="relative flex h-full flex-col justify-end p-6 sm:p-8 lg:p-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <span className="inline-flex rounded-full bg-brand-accent px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-primary">
                      {active.region}
                    </span>
                    <h3 className="mt-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{active.name}</h3>
                    <p className="mt-1 text-base font-medium text-brand-accent">{active.tagline}</p>
                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">{active.desc}</p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {active.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/20"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={regionTourLink(active)}
                      className="group mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-accent px-6 py-3 text-sm font-bold text-brand-primary transition-colors hover:bg-brand-accent-dark"
                    >
                      Explore {active.name}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </motion.div>
                </AnimatePresence>

                <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md sm:right-8 sm:top-8">
                  <span className="text-lg font-bold text-brand-accent">{String(activeIndex + 1).padStart(2, "0")}</span>
                  <span className="text-xs text-white/50">/ {String(ghanaRegions.length).padStart(2, "0")}</span>
                </div>
              </div>
            </div>

            <div className="hidden flex-col gap-2 border-l border-white/10 bg-brand-cream/95 p-4 lg:flex">
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-muted">
                Select a region
              </p>
              {ghanaRegions.map((region, index) => (
                <RegionListItem
                  key={region.id}
                  region={region}
                  index={index}
                  isActive={index === activeIndex}
                  onSelect={setActiveIndex}
                />
              ))}
            </div>
          </div>
        </motion.div>
        </ScrollReveal>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row"
        >
          <p className="text-center text-sm text-white/60 sm:text-left">
            <span className="font-semibold text-brand-accent">{ghanaRegions.length} regions</span>
            {" "}
            {section.footerNote}
          </p>
          <Link
            to={operatingSection.cta.to}
            className="group inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-brand-accent/40 hover:bg-white/15"
          >
            {section.ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
