import { Link } from "react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Car,
  Headphones,
  Heart,
  Route,
  Shield,
  Users,
} from "lucide-react";
import Container from "../../components/layout/Container";
import { images } from "../../config/images";
import { company, whyUsPage } from "../../data/aboutContent";
import { getWhatsAppUrl } from "../../config/env";

const EASE = [0.16, 1, 0.3, 1];

const reasonIcons = {
  users: Users,
  car: Car,
  route: Route,
  badge: BadgeCheck,
  shield: Shield,
  calendar: Calendar,
  headphones: Headphones,
  heart: Heart,
};

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.65, ease: EASE, delay },
});

export default function WhyUsPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-primary py-20 sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url(${images.home.hero})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div aria-hidden className="absolute inset-0 bg-brand-primary/88" />
        <div aria-hidden className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-brand-accent/15 blur-3xl" />

        <Container className="relative text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="inline-flex rounded-full bg-brand-accent px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-primary"
          >
            {whyUsPage.eyebrow}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.08 }}
            className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl"
          >
            {whyUsPage.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.14 }}
            className="mx-auto mt-4 max-w-xl text-base text-white/75"
          >
            {whyUsPage.subtitle}
          </motion.p>
        </Container>
      </section>

      {/* Intro + image */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div {...rise()}>
              <p className="text-base leading-relaxed text-brand-muted">{whyUsPage.intro}</p>
              <p className="mt-4 text-base leading-relaxed text-brand-muted">
                {company.motto} — that is the promise behind every tour, transfer, and reservation we handle.
              </p>
            </motion.div>
            <motion.div {...rise(0.1)} className="overflow-hidden rounded-3xl shadow-[0_20px_60px_-24px_rgba(21,67,96,0.28)]">
              <img
                src={images.tour_sites.arts_and_craft}
                alt="Authentic Ghana travel experience"
                className="aspect-[4/3] w-full object-cover"
              />
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Reasons grid */}
      <section className="bg-brand-cream py-16 sm:py-20">
        <Container>
          <motion.div {...rise()} className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-brand-primary sm:text-4xl">The 360 Tours Difference</h2>
            <p className="mt-3 text-base text-brand-muted">
              Eight reasons travelers, families, and organizations choose us for their Ghana adventures.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyUsPage.reasons.map((reason, i) => {
              const Icon = reasonIcons[reason.icon] ?? Users;
              return (
                <motion.div
                  key={reason.title}
                  {...rise(i * 0.05)}
                  className="group rounded-2xl border border-brand-border/60 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-primary/20 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-accent/30 text-brand-primary transition-colors group-hover:bg-brand-accent/50">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-brand-ink">{reason.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-brand-muted">{reason.description}</p>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Experience types */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <motion.div {...rise()} className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-accent-dark">What we curate</p>
            <h2 className="mt-3 text-2xl font-bold text-brand-primary sm:text-3xl">Experiences for Every Traveler</h2>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whyUsPage.experienceTypes.map((type, i) => (
              <motion.div
                key={type.label}
                {...rise(i * 0.06)}
                className="rounded-2xl border-l-4 border-brand-accent bg-brand-cream/40 px-5 py-4"
              >
                <h3 className="text-sm font-bold text-brand-primary">{type.label}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-brand-muted">{type.desc}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-brand-primary py-16 sm:py-20">
        <Container className="text-center">
          <motion.div {...rise()}>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{whyUsPage.cta.title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/75">{whyUsPage.cta.subtitle}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to={whyUsPage.cta.primary.to}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-accent px-7 py-3.5 text-sm font-bold text-brand-primary transition-colors hover:bg-brand-accent-dark"
              >
                {whyUsPage.cta.primary.label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to={whyUsPage.cta.secondary.to}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {whyUsPage.cta.secondary.label}
              </Link>
            </div>
            <a
              href={getWhatsAppUrl("Hello 360 Tours, I'd like to learn more about your travel services.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block cursor-pointer text-sm font-medium text-brand-accent hover:underline"
            >
              Chat with us on WhatsApp
            </a>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
