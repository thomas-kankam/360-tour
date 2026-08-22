import { Link } from "react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  Check,
  Layers,
  Map,
  Route,
} from "lucide-react";
import Container from "../layout/Container";
import { images } from "../../config/images";
import { aboutPage } from "../../data/aboutContent";
import { stats, whyUsSection } from "../../data/homeContent";

const EASE = [0.16, 1, 0.3, 1];

const pillarIcons = {
  map: Map,
  layers: Layers,
  route: Route,
  sparkles: Route,
};

function PillarCard({ pillar, index }) {
  const Icon = pillarIcons[pillar.icon] ?? Map;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: EASE, delay: index * 0.08 }}
      className="group relative overflow-hidden rounded-2xl border border-brand-border/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/20 hover:shadow-[0_16px_40px_-16px_rgba(0,107,63,0.2)]"
    >
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent/30 text-brand-primary transition-colors group-hover:bg-brand-accent/50">
        <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
      </span>
      <h3 className="mt-5 text-lg font-bold text-brand-primary">{pillar.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-brand-muted">{pillar.description}</p>
    </motion.div>
  );
}

export default function HomeFeatures({ cmsOverride }) {
  const section = { ...whyUsSection, ...cmsOverride };
  const sideImage = section.sideImage || images.home.hero_two;
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div aria-hidden className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-brand-accent/10 blur-3xl" />

      <Container className="relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex rounded-full bg-brand-accent/25 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">
            {section.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-brand-primary sm:text-4xl">
            {section.title}{" "}
            <span className="text-brand-accent-dark">with {section.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-brand-muted">{section.subtitle}</p>
        </motion.div>

        {/* Bento layout */}
        <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:gap-6">
          {/* Image panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative overflow-hidden rounded-3xl lg:col-span-5 lg:row-span-2"
          >
            <img
              src={sideImage}
              alt="Travel experience with 360 Tours"
              className="h-full min-h-[280px] w-full object-cover lg:min-h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/90 via-brand-primary/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="text-sm font-medium text-brand-accent">Explore. Experience. Remember.</p>
              <p className="mt-2 text-xl font-bold leading-snug text-white sm:text-2xl">
                Safe, comfortable &amp; memorable journeys across Ghana
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {stats.slice(0, 2).map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-sm">
                    <p className="text-lg font-bold text-brand-accent">{stat.value}</p>
                    <p className="text-[10px] text-white/70">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Three pillars */}
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-1">
            {section.pillars.map((pillar, index) => (
              <PillarCard key={pillar.title} pillar={pillar} index={index} />
            ))}
          </div>
        </div>

        {/* Quick wins strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease: EASE, delay: 0.1 }}
          className="mt-8 rounded-2xl border border-brand-border/60 bg-brand-cream/50 p-6 sm:p-8"
        >
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-brand-muted">
            What travelers love about us
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {aboutPage.whyTravelWithUs.slice(0, 4).map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-brand-ink">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-accent text-brand-primary">
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
          className="mt-8 text-center"
        >
          <Link
            to={section.cta.to}
            className="group inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-primary px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-dark"
          >
            {section.cta.label}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
