import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import Container from "../../components/layout/Container";
import { ROUTES } from "../../constants/routes";
import { images } from "../../config/images";
import { getWhatsAppUrl } from "../../config/env";

const EASE = [0.16, 1, 0.3, 1];
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.65, ease: EASE, delay },
});

const EXPERIENCES = [
  {
    id: "safari",
    label: "Wildlife Safaris",
    icon: "🦁",
    tagline: "Witness Africa's Big Five up close",
    description:
      "Game drives at dawn through Maasai Mara and Kruger National Park, guided by expert naturalists who bring the bush to life. Every sighting is part of a deeper story about Africa's ecosystems.",
    highlights: ["Maasai Mara game drives", "Kruger Big Five tours", "Amboseli elephant herds", "Expert naturalist guides"],
    countries: ["Kenya", "South Africa"],
    image: images.home.kenya,
    accent: "from-amber-900/80",
    badge: "bg-amber-500/20 text-amber-200",
    badgeText: "Most requested",
  },
  {
    id: "heritage",
    label: "Heritage & History",
    icon: "🏛️",
    tagline: "Walk the corridors of African history",
    description:
      "From the slave dungeons of Cape Coast Castle to the Ashanti Manhyia Palace and Soweto's Apartheid Museum — these are journeys that transform understanding. History felt, not just heard.",
    highlights: ["Cape Coast Castle", "Manhyia Palace, Kumasi", "Apartheid Museum, Joburg", "Elmina & Elmina Castle"],
    countries: ["Ghana", "South Africa"],
    image: images.home.destinations.ghana,
    accent: "from-stone-900/80",
    badge: "bg-stone-400/20 text-stone-200",
    badgeText: "Deep immersion",
  },
  {
    id: "cultural",
    label: "Cultural Immersion",
    icon: "🎭",
    tagline: "Live it, don't just observe it",
    description:
      "Kente weaving workshops in Bonwire, Maasai beadwork and ceremonies, Cape Town's Bo-Kaap neighbourhood walking tours. Our cultural experiences are participatory, not performative.",
    highlights: ["Kente weaving, Bonwire", "Maasai village stays", "Ghanaian drumming sessions", "Cape Malay cooking class"],
    countries: ["Ghana", "Kenya", "South Africa"],
    image: images.home.ghana,
    accent: "from-emerald-900/80",
    badge: "bg-emerald-400/20 text-emerald-200",
    badgeText: "All countries",
  },
  {
    id: "adventure",
    label: "Adventure Travel",
    icon: "🏔️",
    tagline: "Push your limits across Africa's terrain",
    description:
      "Hike Table Mountain at sunrise, navigate the Volta gorge, or trek the highlands of Kenya. Adventure here means natural awe, not manufactured thrills.",
    highlights: ["Table Mountain hike", "Volta Region trekking", "Mount Kenya foothills", "Garden Route coastal walks"],
    countries: ["Ghana", "Kenya", "South Africa"],
    image: images.home.southAfrica,
    accent: "from-sky-900/80",
    badge: "bg-sky-400/20 text-sky-200",
    badgeText: "Active travel",
  },
  {
    id: "beach",
    label: "Beach Getaways",
    icon: "🌊",
    tagline: "Where the Indian Ocean meets culture",
    description:
      "Diani Beach, Mombasa's Old Town, and the Garden Route coastline — AfriQuest pairs beach relaxation with authentic local encounters so every day feels earned.",
    highlights: ["Diani Beach, Kenya", "Mombasa Old Town", "Knysna Lagoon, SA", "Labadi Beach, Accra"],
    countries: ["Kenya", "South Africa", "Ghana"],
    image: images.home.destinations.kenya,
    accent: "from-cyan-900/80",
    badge: "bg-cyan-400/20 text-cyan-200",
    badgeText: "Relaxation",
  },
  {
    id: "university",
    label: "University Programs",
    icon: "🎓",
    tagline: "Study Africa, not just visit it",
    description:
      "Structured academic itineraries built around your institution's curriculum — history, anthropology, public health, business, and development. We handle logistics; you focus on learning.",
    highlights: ["Curriculum-aligned itineraries", "Faculty co-design", "Guest lectures by locals", "Safe group logistics"],
    countries: ["Ghana", "Kenya", "South Africa"],
    image: images.home.destinations.southAfrica,
    accent: "from-violet-900/80",
    badge: "bg-violet-400/20 text-violet-200",
    badgeText: "Academic travel",
  },
  {
    id: "corporate",
    label: "Corporate Retreats",
    icon: "💼",
    tagline: "Team building with real purpose",
    description:
      "Leadership retreats that combine team development with meaningful cultural exchange. We design programmes that challenge, inspire, and bond teams through shared African experience.",
    highlights: ["Team leadership workshops", "Community impact days", "Cultural exchange modules", "Flexible group sizing"],
    countries: ["Ghana", "Kenya", "South Africa"],
    image: images.home.hero,
    accent: "from-slate-900/80",
    badge: "bg-slate-400/20 text-slate-200",
    badgeText: "Groups welcome",
  },
  {
    id: "community",
    label: "Community Impact",
    icon: "🤝",
    tagline: "Travel that gives back",
    description:
      "Volunteer programmes, school visits, and community development partnerships that ensure your group leaves a positive footprint. Travel with conscience, not just curiosity.",
    highlights: ["School & orphanage visits", "Local artisan markets", "Community farming days", "Impact reporting included"],
    countries: ["Ghana", "Kenya"],
    image: images.home.testimonial,
    accent: "from-rose-900/80",
    badge: "bg-rose-400/20 text-rose-200",
    badgeText: "Purpose-led",
  },
];

const COUNTRY_FILTERS = ["All", "Ghana", "Kenya", "South Africa"];

function KentePattern() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cg fill='none' transform='rotate(45 14 14)'%3E%3Crect width='14' height='14' fill='%232D5A47' fill-opacity='0.04'/%3E%3Crect x='14' y='14' width='14' height='14' fill='%23E3A020' fill-opacity='0.025'/%3E%3C/g%3E%3C/svg%3E\")", backgroundSize: "28px 28px" }} />
  );
}

function ExperienceCard({ exp, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      {...rise(Math.min(index * 0.07, 0.35))}
      className="group relative overflow-hidden rounded-[1.5rem] border border-brand-border/60 bg-white shadow-[0_12px_40px_-20px_rgba(28,43,38,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_-18px_rgba(28,43,38,0.3)]"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={exp.image}
          alt={exp.label}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${exp.accent} via-transparent to-transparent`} />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm border border-white/10 ${exp.badge}`}>
          {exp.badgeText}
        </span>
        <div className="absolute bottom-3 left-4">
          <span className="text-2xl">{exp.icon}</span>
          <p className="mt-1 text-lg font-bold text-white">{exp.label}</p>
          <p className="text-xs text-white/80">{exp.tagline}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {exp.countries.map((c) => (
            <span key={c} className="rounded-full bg-brand-green/8 px-2.5 py-0.5 text-[11px] font-semibold text-brand-green">
              {c}
            </span>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-brand-muted">{exp.description}</p>

        {/* Expandable highlights */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="mt-3 overflow-hidden space-y-1.5"
            >
              {exp.highlights.map((h) => (
                <li key={h} className="flex items-center gap-2 text-xs text-brand-ink">
                  <svg className="h-3.5 w-3.5 shrink-0 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {h}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="text-xs font-semibold text-brand-green underline-offset-2 hover:underline"
          >
            {expanded ? "Show less" : "See highlights"}
          </button>
          <Link
            to={ROUTES.tours}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-green px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-green/90"
          >
            View tours
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function ExperiencesPage() {
  const [country, setCountry] = useState("All");

  const filtered = country === "All"
    ? EXPERIENCES
    : EXPERIENCES.filter((e) => e.countries.includes(country));

  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-[420px] overflow-hidden pb-14 pt-14 sm:min-h-[460px] sm:pt-16">
        {/* Background image */}
        <img
          src={images.home.hero}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Green overlay */}
        <div aria-hidden className="absolute inset-0 bg-[#2D5A47]/88" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-[#234839]/75 via-[#2D5A47]/55 to-[#2D5A47]/40"
        />

        <KentePattern />
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-brand-orange/10 blur-3xl" />

        <Container className="relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-gold backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
              What we offer
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-[3.25rem]">
              Every kind of African journey,<br className="hidden sm:block" />
              <span className="text-brand-gold"> done right</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              From big-five safaris to university study tours — we specialize in eight distinct experience types, all delivered with the same depth of cultural knowledge and logistical precision.
            </p>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10"
          >
            {[
              { v: "8", l: "Experience types" },
              { v: "3", l: "Countries" },
              { v: "5,000+", l: "Travelers hosted" },
              { v: "10+", l: "Years delivering" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="text-2xl font-bold text-brand-gold">{s.v}</p>
                <p className="text-xs text-white/70">{s.l}</p>
              </div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* ── Filter + Grid ── */}
      <section className="bg-brand-cream py-14 sm:py-18">
        <Container>
          {/* Country filter */}
          <motion.div {...rise()} className="mb-10 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-brand-muted">Filter by country:</span>
            {COUNTRY_FILTERS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCountry(c)}
                className={[
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200",
                  country === c
                    ? "bg-brand-green text-white shadow-sm"
                    : "border border-brand-border/70 bg-white text-brand-muted hover:border-brand-green/30 hover:text-brand-green",
                ].join(" ")}
              >
                {c}
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={country}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filtered.map((exp, i) => (
                <ExperienceCard key={exp.id} exp={exp} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </Container>
      </section>

      {/* ── How it works ── */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='2' cy='2' r='1' fill='%232D5A47' fill-opacity='0.07'/%3E%3C/svg%3E\")", backgroundSize: "24px 24px" }} />

        <Container className="relative">
          <motion.div {...rise()} className="mx-auto max-w-xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-orange">How it works</p>
            <h2 className="mt-3 text-3xl font-bold text-brand-ink sm:text-4xl">From inquiry to departure</h2>
          </motion.div>

          <div className="relative mt-12 grid gap-8 sm:grid-cols-4">
            <div aria-hidden className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-6 hidden h-px bg-gradient-to-r from-transparent via-brand-border to-transparent sm:block" />
            {[
              { n: "01", icon: "💬", t: "Tell us your vision", d: "Share your group size, dates, interests, and budget via our quick inquiry form or WhatsApp." },
              { n: "02", icon: "📋", t: "We design your itinerary", d: "Our team crafts a bespoke day-by-day plan with accommodation, transport, and experiences." },
              { n: "03", icon: "✅", t: "Review & confirm", d: "We refine the plan together until every detail is exactly right, then lock in your booking." },
              { n: "04", icon: "✈️", t: "Travel with confidence", d: "Arrive knowing every detail is handled. Our on-ground team supports you throughout." },
            ].map((step, i) => (
              <motion.div key={step.n} {...rise(i * 0.1)} className="relative flex flex-col items-center text-center">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-border bg-white shadow-sm">
                  <span className="text-xl">{step.icon}</span>
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-green text-[9px] font-bold text-white">{step.n}</span>
                </div>
                <h3 className="mt-4 text-sm font-bold text-brand-ink">{step.t}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-brand-muted">{step.d}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-brand-green py-14">
        <KentePattern />
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-gold/15 blur-3xl" />
        <Container className="relative text-center">
          <motion.div {...rise()}>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Not sure which experience is right for you?</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/80">
              Chat with our team — we&apos;ll match you to the perfect journey in minutes.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to={ROUTES.contact} className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-semibold text-brand-green shadow-lg hover:bg-brand-cream">
                Get in touch
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
              <a href={getWhatsAppUrl("Hello AfriQuest, I'd like help choosing an experience.")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-7 py-3 text-sm font-semibold text-brand-primary shadow-lg hover:bg-brand-accent-dark">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Chat on WhatsApp
              </a>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
