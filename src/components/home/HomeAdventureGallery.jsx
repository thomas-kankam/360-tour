import { useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Camera, Expand } from "lucide-react";
import Container from "../layout/Container";
import GalleryPicture from "./GalleryPicture";
import ScrollReveal, { ScrollStagger, ScrollStaggerItem } from "../motion/ScrollReveal";
import ImageLightbox from "../misc/ImageLightbox";
import { ROUTES } from "../../constants/routes";
import { resolveCmsGalleryItems } from "../../utils/landingCmsItems";

const SECTION_DEFAULTS = {
  eyebrow: "From the road",
  title: "Places we have already taken travellers",
  subtitle:
    "Real stops from real departures — castles on the coast, waterfalls in the Volta hills, palaces in Kumasi, and savanna at sunrise.",
  ctaLabel: "Browse tours",
};

const SPANS = [
  "sm:col-span-2 sm:row-span-2",
  "",
  "",
  "sm:row-span-2",
  "",
  "sm:col-span-2",
  "",
  "",
];

export default function HomeAdventureGallery({ cmsOverride }) {
  const section = useMemo(() => ({ ...SECTION_DEFAULTS, ...cmsOverride }), [cmsOverride]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const galleryItems = useMemo(() => resolveCmsGalleryItems(section), [section]);
  const tiles = useMemo(() => galleryItems.slice(0, SPANS.length), [galleryItems]);
  const lightboxImages = useMemo(() => galleryItems.map((item) => item.sources.webp), [galleryItems]);

  return (
    <section className="relative overflow-hidden bg-brand-secondary py-16 sm:py-20 lg:py-24">
      <div aria-hidden className="kente-weave absolute inset-x-0 top-0 h-1.5" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-16 h-80 w-80 rounded-full bg-brand-primary/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-brand-accent/10 blur-3xl"
      />

      <Container className="relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <ScrollReveal variant="up" className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-accent/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-accent ring-1 ring-brand-accent/30">
              <Camera className="h-3.5 w-3.5" aria-hidden />
              {section.eyebrow}
            </span>
            <h2 className="mt-4 font-heading text-3xl font-bold text-white sm:text-4xl">{section.title}</h2>
            <div className="kente-rule mt-4" aria-hidden />
            <p className="mt-4 text-base leading-relaxed text-white/70">{section.subtitle}</p>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={0.1} className="shrink-0">
            <Link
              to={ROUTES.tours}
              className="group inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-brand-accent/50 hover:bg-white/15"
            >
              {section.ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </ScrollReveal>
        </div>

        <ScrollStagger className="mt-10 grid auto-rows-[150px] grid-cols-2 gap-2.5 sm:auto-rows-[170px] sm:grid-cols-4 sm:gap-3 lg:auto-rows-[190px]">
          {tiles.map((item, index) => (
            <ScrollStaggerItem key={item.id} className={SPANS[index]}>
              <button
                type="button"
                onClick={() => setLightboxIndex(index)}
                aria-label={`View photo of ${item.caption}`}
                className="group relative h-full w-full overflow-hidden rounded-2xl ring-1 ring-white/10 transition-all duration-500 hover:ring-brand-accent/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
              >
                <GalleryPicture
                  sources={item.sources}
                  alt={item.caption}
                  pictureClassName="block h-full w-full"
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                  loading={index < 2 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />

                <span className="absolute right-2.5 top-2.5 flex h-8 w-8 translate-y-1 items-center justify-center rounded-full bg-brand-accent text-brand-charcoal opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <Expand className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                </span>

                <span className="absolute inset-x-3 bottom-3 text-left">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-brand-accent">
                    Ghana
                  </span>
                  <span className="mt-0.5 block text-sm font-bold leading-snug text-white">{item.caption}</span>
                </span>
              </button>
            </ScrollStaggerItem>
          ))}
        </ScrollStagger>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-center text-xs text-white/50"
        >
          {tiles.length} stops photographed on past departures — tap any frame to open the full gallery.
        </motion.p>
      </Container>

      <ImageLightbox
        open={lightboxIndex >= 0}
        images={lightboxImages}
        index={Math.max(lightboxIndex, 0)}
        alt={tiles[Math.max(lightboxIndex, 0)]?.caption || ""}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(-1)}
      />
    </section>
  );
}
