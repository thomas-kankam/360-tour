import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Building2, Car, Check, Compass, Route } from "lucide-react";
import Container from "../layout/Container";
import { images } from "../../config/images";
import { homeAboutTeaser } from "../../data/aboutContent";

const EASE = [0.16, 1, 0.3, 1];

const highlightIcons = {
  compass: Compass,
  building: Building2,
  car: Car,
  route: Route,
};

export default function HomeAbout() {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-brand-accent/10 blur-3xl"
      />

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease: EASE }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex rounded-full bg-brand-accent/25 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">
            {homeAboutTeaser.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-brand-primary sm:text-4xl">{homeAboutTeaser.title}</h2>
          <p className="mt-2 text-lg font-semibold text-brand-ink">{homeAboutTeaser.tagline}</p>
        </motion.div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl border-4 border-brand-accent/40 shadow-[0_20px_60px_-24px_rgba(21,67,96,0.28)]">
              <img
                src={images.tour_sites.volta}
                alt="Volta Region, Ghana"
                className="aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
              />
            </div>
            <div className="absolute -bottom-4 -right-3 rounded-2xl border border-brand-border/60 bg-white px-4 py-3 shadow-lg sm:-right-5">
              <p className="text-lg font-bold text-brand-primary">360°</p>
              <p className="text-xs text-brand-muted">Tours · Stay · Transport</p>
            </div>
          </motion.div>

          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
          >
            <p className="text-base leading-relaxed text-brand-muted">{homeAboutTeaser.summary}</p>
            <p className="mt-3 text-base leading-relaxed text-brand-muted">{homeAboutTeaser.extended}</p>

            {/* Service highlights — compact, links to about page for detail */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {homeAboutTeaser.highlights.map((item) => {
                const Icon = highlightIcons[item.icon] ?? Compass;
                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-brand-border/60 bg-brand-cream/40 px-4 py-3"
                  >
                    <Icon className="h-4 w-4 text-brand-primary" strokeWidth={2} aria-hidden />
                    <p className="mt-2 text-sm font-bold text-brand-ink">{item.label}</p>
                    <p className="mt-0.5 text-xs text-brand-muted">{item.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Top reasons — brief */}
            <ul className="mt-6 space-y-2">
              {homeAboutTeaser.whyHighlights.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-brand-ink">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-accent text-brand-primary">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={homeAboutTeaser.cta.to}
                className="group inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-dark"
              >
                {homeAboutTeaser.cta.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                to={homeAboutTeaser.secondaryCta.to}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-brand-primary/25 px-6 py-3 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-cream"
              >
                {homeAboutTeaser.secondaryCta.label}
              </Link>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
