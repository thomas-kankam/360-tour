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

export default function HomeAbout({ cmsOverride }) {
  const content = { ...homeAboutTeaser, ...cmsOverride };
  const aboutImage = content.image || images.tour_sites.volta;

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-brand-accent/10 blur-3xl"
      />

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease: EASE }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex rounded-full bg-brand-accent/25 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">
            {content.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-brand-primary sm:text-4xl">{content.title}</h2>
          <p className="mt-2 text-lg font-semibold text-brand-ink">{content.tagline}</p>
        </motion.div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl border-4 border-brand-accent/40 shadow-[0_20px_60px_-24px_rgba(21,67,96,0.28)]">
              <img
                src={aboutImage}
                alt="360 Tours destination"
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.02] lg:aspect-[5/4]"
              />
            </div>
            <div className="absolute -bottom-4 -right-3 rounded-2xl border border-brand-border/60 bg-white px-4 py-3 shadow-lg sm:-right-5">
              <p className="text-lg font-bold text-brand-primary">360</p>
              <p className="text-xs text-brand-muted">Tours · Stay · Transport</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
          >
            <p className="text-base leading-relaxed text-brand-muted">{content.summary}</p>
            <p className="mt-3 text-base leading-relaxed text-brand-muted">{content.extended}</p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {content.highlights.map((item, index) => {
                const Icon = highlightIcons[item.icon] ?? Compass;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.06, ease: EASE }}
                    className="rounded-xl border border-brand-border/60 bg-brand-cream/40 px-4 py-3 transition-colors hover:border-brand-primary/20 hover:bg-brand-cream/70"
                  >
                    <Icon className="h-4 w-4 text-brand-primary" strokeWidth={2} aria-hidden />
                    <p className="mt-2 text-sm font-bold text-brand-ink">{item.label}</p>
                    <p className="mt-0.5 text-xs text-brand-muted">{item.description}</p>
                  </motion.div>
                );
              })}
            </div>

            <ul className="mt-6 space-y-2">
              {content.whyHighlights.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-brand-ink">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-accent text-brand-primary">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={content.cta.to}
                className="group inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-dark"
              >
                {content.cta.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                to={content.secondaryCta.to}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-brand-primary/25 px-6 py-3 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-cream"
              >
                {content.secondaryCta.label}
              </Link>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
