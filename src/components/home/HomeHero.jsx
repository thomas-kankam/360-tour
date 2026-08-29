import { useMemo, useRef } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import Container from "../layout/Container";
import GalleryPicture from "./GalleryPicture";
import { images } from "../../config/images";
import { heroContent } from "../../data/homeContent";
import { resolvePublicMediaUrl } from "../../utils/mediaUrl";

const EASE = [0.16, 1, 0.3, 1];
const LEGACY_HERO_IMAGES = new Set(["/images/hero_img.png", "/images/home/hero.jpg"]);

function resolveHeroSources(cmsOverride) {
  const bg = cmsOverride?.backgroundImage?.trim();
  if (bg?.startsWith("data:")) return { webp: bg, png: bg };
  if (bg && !LEGACY_HERO_IMAGES.has(bg)) {
    const resolved = resolvePublicMediaUrl(bg);
    return { webp: resolved, png: resolved };
  }
  return images.home.heroBanner;
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
          <GalleryPicture
            sources={heroSources}
            alt="Ghana landscape — 360 Tours Ghana"
            pictureClassName="absolute inset-0 block h-full w-full"
            className="h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-brand-secondary/70 via-brand-secondary/35 to-brand-charcoal/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-charcoal/50 via-transparent to-transparent" />

        <Container className="relative flex min-h-[72vh] flex-col justify-center py-20 sm:min-h-[78vh] lg:min-h-[82vh] lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: EASE }}
            className="max-w-2xl"
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
