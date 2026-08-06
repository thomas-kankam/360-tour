import { motion } from "motion/react";
import Container from "../layout/Container";
import { partners } from "../../data/homeContent";

const EASE = [0.16, 1, 0.3, 1];

const partnerIcons = {
  Universities: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </svg>
  ),
  "Corporate retreats": (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  ),
  "Cultural exchanges": (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  "Community impact": (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  "Group travel": (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

const stats = [
  { value: "50+", label: "Partner orgs" },
  { value: "3", label: "Countries served" },
  { value: "5k+", label: "Travelers served" },
];

function PartnerPill({ label }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-brand-border/70 bg-white/90 px-5 py-2.5 text-sm font-semibold text-brand-green shadow-sm ring-1 ring-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-green/25 hover:shadow-md">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
        {partnerIcons[label]}
      </span>
      {label}
    </span>
  );
}

export default function HomePartners() {
  const marqueeItems = [...partners, ...partners];

  return (
    <section className="relative overflow-hidden border-y border-brand-border bg-white py-14 sm:py-16">
      {/* Subtle background texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='2' cy='2' r='1' fill='%232D5A47' fill-opacity='0.06'/%3E%3C/svg%3E\")",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent"
      />

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-orange">
            Who we serve
          </p>
          <h2 className="mt-3 text-2xl font-bold text-brand-ink sm:text-3xl">
            Trusted by travelers, institutions &amp; organizations
          </h2>
          <p className="mt-3 text-base text-brand-muted">
            Serving individuals, universities, and organizations with curated journeys across
            Ghana, Kenya, and South Africa.
          </p>
        </motion.div>

        {/* Infinite marquee */}
        <div className="relative mt-10 sm:mt-12">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-24" />

          <div className="overflow-hidden">
            <div className="flex w-max animate-marquee gap-4 hover:[animation-play-state:paused] sm:gap-5">
              {marqueeItems.map((label, i) => (
                <PartnerPill key={`${label}-${i}`} label={label} />
              ))}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
          className="mt-12 grid grid-cols-3 gap-4 border-t border-brand-border/70 pt-10 sm:gap-8"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-brand-green sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-brand-muted sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
