import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Building2,
  Car,
  Check,
  ChevronDown,
  Compass,
  Landmark,
  MapPinned,
  Mail,
  MapPin,
  Mountain,
  Plane,
  Route,
  User,
  Users,
  Waves,
} from "lucide-react";
import Container from "../../components/layout/Container";
import { images } from "../../config/images";
import { aboutPage, aboutPageHero, company } from "../../data/aboutContent";
import { getWhatsAppUrl } from "../../config/env";

const EASE = [0.16, 1, 0.3, 1];

const serviceIcons = {
  compass: Compass,
  building: Building2,
  plane: Plane,
  car: Car,
  users: Users,
  user: User,
  landmark: Landmark,
  mountain: Mountain,
  waves: Waves,
  route: Route,
};

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.65, ease: EASE, delay },
});

function FaqItem({ faq, index }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div {...rise(index * 0.04)} className="border-b border-brand-border/60 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-sm font-semibold text-brand-ink sm:text-base">{faq.question}</span>
        <ChevronDown
          className={["h-5 w-5 shrink-0 text-brand-primary transition-transform duration-200", open ? "rotate-180" : ""].join(" ")}
          aria-hidden
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-brand-muted">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const heroServiceIcons = {
  compass: Compass,
  building: Building2,
  car: Car,
};

export default function AboutPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero, editorial split layout */}
      <section className="relative overflow-hidden bg-white pb-14 pt-10 sm:pb-16 sm:pt-12 lg:pb-20 lg:pt-16">
        <div aria-hidden className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand-accent/10 blur-3xl" />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-brand-primary/[0.04] blur-3xl"
        />

        <Container className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <span className="inline-flex rounded-full bg-brand-accent/25 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">
                {aboutPageHero.eyebrow}
              </span>
              <h1 className="mt-5 text-4xl font-bold text-brand-primary sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                {aboutPageHero.title}
              </h1>
              <p className="mt-4 text-xl font-semibold leading-snug sm:text-2xl">
                <span className="text-brand-primary">{aboutPageHero.titleLine}</span>{" "}
                <span className="text-brand-accent-dark">{aboutPageHero.titleHighlight}</span>
              </p>
              <p className="mt-2 text-sm font-semibold text-brand-muted">{company.subtitle}</p>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-muted">
                {aboutPageHero.description}
              </p>
              <p className="mt-4 text-sm font-semibold text-brand-primary">{aboutPageHero.tagline}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {aboutPageHero.services.map((service) => {
                  const Icon = heroServiceIcons[service.icon] ?? Compass;
                  return (
                    <div
                      key={service.label}
                      className="rounded-2xl border border-brand-border/60 bg-brand-cream/50 px-4 py-3.5"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-accent/35 text-brand-primary">
                        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                      </span>
                      <p className="mt-2.5 text-xs font-bold text-brand-primary sm:text-sm">{service.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-brand-border/50 pt-6 text-sm">
                <span className="inline-flex items-center gap-2 text-brand-muted">
                  <MapPin className="h-4 w-4 shrink-0 text-brand-primary" aria-hidden />
                  {company.location}
                </span>
                <a
                  href={`mailto:${company.email}`}
                  className="inline-flex items-center gap-2 text-brand-muted transition-colors hover:text-brand-primary"
                >
                  <Mail className="h-4 w-4 shrink-0 text-brand-primary" aria-hidden />
                  {company.email}
                </a>
                <span className="inline-flex items-center gap-2 font-medium text-brand-primary">
                  {company.motto}
                </span>
              </div>
            </motion.div>

            {/* Photo collage */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
              className="relative mx-auto w-full max-w-md lg:max-w-none"
            >
              <div
                aria-hidden
                className="absolute -right-4 top-8 z-0 select-none text-[7rem] font-bold leading-none text-brand-primary/[0.04] sm:text-[9rem]"
              >
                360
              </div>

              <div className="relative z-10 overflow-hidden rounded-3xl border-4 border-brand-accent/40 shadow-[0_24px_64px_-28px_rgba(0,107,63,0.3)]">
                <img
                  src={images.home.hero_img}
                  alt="Travel experiences with 360 Tours"
                  className="aspect-[5/4] w-full object-cover"
                />
              </div>

              <div className="absolute -bottom-5 -left-4 z-20 w-[42%] overflow-hidden rounded-2xl border-4 border-white shadow-xl sm:-left-8 sm:w-[38%]">
                <img
                  src={images.tour_sites.manhyia_palace}
                  alt="Ghana cultural heritage"
                  className="aspect-square w-full object-cover"
                />
              </div>

              <div className="absolute -right-2 top-4 z-20 rounded-2xl border border-brand-border/60 bg-white px-4 py-3 shadow-lg sm:-right-4">
                <p className="text-lg font-bold text-brand-primary">360</p>
                <p className="text-[11px] font-semibold text-brand-muted">Tours · Stay · Transport</p>
              </div>

              <div className="absolute bottom-8 right-0 z-20 hidden rounded-full bg-brand-primary px-4 py-2 text-xs font-bold text-white shadow-lg sm:block">
                {company.location}
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Our story */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div {...rise()}>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-accent-dark">Our Story</p>
              <h2 className="mt-3 text-3xl font-bold text-brand-primary sm:text-4xl">Who We Are</h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-brand-muted">
                <p>{aboutPage.intro}</p>
                <p>{aboutPage.story}</p>
                <p>{aboutPage.journey}</p>
                <p>{aboutPage.commitment}</p>
              </div>
            </motion.div>

            <motion.div {...rise(0.1)} className="relative">
              <img
                src={images.tour_sites.manhyia_palace}
                alt="Cultural heritage in Ghana"
                className="aspect-[4/3] w-full rounded-3xl object-cover shadow-[0_20px_60px_-24px_rgba(0,107,63,0.3)]"
              />
              <div className="absolute -bottom-5 -left-4 rounded-2xl border border-brand-border/60 bg-white px-5 py-4 shadow-lg">
                <p className="text-sm font-bold text-brand-primary">{company.location}</p>
                <p className="mt-1 text-xs text-brand-muted">{company.motto}</p>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Mission / Vision / Values */}
      <section className="bg-brand-cream py-16 sm:py-20">
        <Container>
          <motion.div
            {...rise()}
            className="overflow-hidden rounded-3xl bg-brand-primary text-white"
          >
            <div className="grid lg:grid-cols-3">
              <div className="border-b border-white/10 p-8 lg:border-b-0 lg:border-r">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-accent">{aboutPage.mission.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/85">{aboutPage.mission.text}</p>
              </div>
              <div className="border-b border-white/10 p-8 lg:border-b-0 lg:border-r">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-accent">{aboutPage.vision.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/85">{aboutPage.vision.text}</p>
              </div>
              <div className="p-8">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-accent">Our Values</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {aboutPage.values.map((value) => (
                    <li
                      key={value}
                      className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/15"
                    >
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Tour services */}
      <section id="services" className="bg-white py-16 sm:py-20">
        <Container>
          <motion.div {...rise()} className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-accent-dark">Our Services</p>
            <h2 className="mt-3 text-3xl font-bold text-brand-primary sm:text-4xl">Guided Tours &amp; Experiences</h2>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aboutPage.tourServices.map((service, i) => {
              const Icon = serviceIcons[service.icon] ?? Compass;
              return (
                <motion.div
                  key={service.label}
                  {...rise(i * 0.05)}
                  className="rounded-2xl border border-brand-border/60 p-5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-accent/30 text-brand-primary">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-brand-ink">{service.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">{service.description}</p>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Support services */}
      <section className="bg-brand-cream py-16 sm:py-20">
        <Container>
          <motion.div {...rise()} className="mb-10">
            <h2 className="text-2xl font-bold text-brand-primary sm:text-3xl">Accommodation, Transport &amp; Planning</h2>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            {aboutPage.supportServices.map((service, i) => {
              const Icon = serviceIcons[service.icon] ?? Compass;
              return (
                <motion.div
                  key={service.label}
                  {...rise(i * 0.06)}
                  className="rounded-2xl border border-brand-border/60 bg-white p-6"
                >
                  <div className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-brand-ink">{service.label}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-brand-muted">{service.description}</p>
                    </div>
                  </div>
                  {service.details && (
                    <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                      {service.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-2 text-xs text-brand-muted">
                          <Check className="h-3 w-3 shrink-0 text-brand-primary" strokeWidth={3} aria-hidden />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Popular destinations */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <motion.div {...rise()} className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-accent-dark">Tour Packages</p>
              <h2 className="mt-3 text-3xl font-bold text-brand-primary">Popular Destinations</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-brand-muted">
              <MapPinned className="h-4 w-4 text-brand-primary" aria-hidden />
              Across Ghana &amp; beyond
            </div>
          </motion.div>

          <motion.div {...rise(0.08)} className="mt-8 flex flex-wrap gap-2.5">
            {aboutPage.popularDestinations.map((destination) => (
              <span
                key={destination}
                className="rounded-full border border-brand-border/70 bg-brand-cream/60 px-4 py-2 text-sm font-medium text-brand-ink"
              >
                {destination}
              </span>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Why choose us */}
      <section className="bg-brand-cream py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div {...rise()}>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-accent-dark">Why choose us</p>
              <h2 className="mt-3 text-3xl font-bold text-brand-primary">Why Travel With Us?</h2>
              <p className="mt-4 text-base text-brand-muted">
                We combine local expertise with professional service to deliver safe, authentic, and unforgettable journeys.
              </p>
            </motion.div>

            <motion.ul {...rise(0.08)} className="grid gap-3 sm:grid-cols-2">
              {aboutPage.whyTravelWithUs.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-xl bg-white px-4 py-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-accent text-brand-primary">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                  </span>
                  <span className="text-sm leading-snug text-brand-ink">{item}</span>
                </li>
              ))}
            </motion.ul>
          </div>
        </Container>
      </section>

      {/* FAQs */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <motion.div {...rise()} className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-accent-dark">FAQs</p>
            <h2 className="mt-3 text-3xl font-bold text-brand-primary">Common Questions</h2>
          </motion.div>

          <motion.div {...rise(0.08)} className="mx-auto mt-10 max-w-3xl rounded-2xl border border-brand-border/60 px-6 sm:px-8">
            {aboutPage.faqs.map((faq, i) => (
              <FaqItem key={faq.question} faq={faq} index={i} />
            ))}
          </motion.div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-brand-primary py-16 sm:py-20">
        <Container className="text-center">
          <motion.div {...rise()}>
            <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">{aboutPage.cta.title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80">{aboutPage.cta.subtitle}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to={aboutPage.cta.primary.to}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-accent px-7 py-3.5 text-sm font-bold text-brand-primary transition-colors hover:bg-brand-accent-dark"
              >
                {aboutPage.cta.primary.label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to={aboutPage.cta.secondary.to}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {aboutPage.cta.secondary.label}
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/60">
              {company.email} · {company.location}
            </p>
            <a
              href={getWhatsAppUrl("Hello 360 Tours, I'd like to plan a trip to Ghana.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block cursor-pointer text-sm font-medium text-brand-accent hover:underline"
            >
              Chat with us on WhatsApp
            </a>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
