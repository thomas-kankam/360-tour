import { Link } from "react-router";
import { motion } from "motion/react";
import Container from "../layout/Container";
import TourPriceDisplay from "../tours/TourPriceDisplay";
import { ROUTES } from "../../constants/routes";
import { featuredTours } from "../../data/homeContent";

const EASE = [0.16, 1, 0.3, 1];

const countryAccent = {
  Ghana: "from-brand-gold/20 to-brand-green/10",
  Kenya: "from-brand-orange/20 to-brand-green/10",
  "South Africa": "from-brand-green/20 to-brand-gold/10",
};

function TourCard({ tour, index }) {
  const accent = countryAccent[tour.country] ?? "from-brand-green/15 to-brand-cream";

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, ease: EASE, delay: index * 0.1 }}
      className={[
        "group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-brand-border/70 bg-white shadow-[0_12px_40px_-24px_rgba(28,43,38,0.35)] ring-1 ring-white/80 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-20px_rgba(28,43,38,0.28)]",
        index === 1 ? "lg:-mt-3" : "",
      ].join(" ")}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={tour.image}
          alt={tour.name}
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-brand-ink/10 to-transparent" />

        {index === 0 && (
          <span className="absolute left-4 top-4 rounded-full border border-brand-primary/10 bg-brand-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-primary shadow-md backdrop-blur-sm">
            Most popular
          </span>
        )}

        <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/20 px-2.5 py-1 text-xs font-bold text-white shadow-md backdrop-blur-md">
            <span className="text-brand-gold">★</span> {tour.rating}
          </span>
          <span className="rounded-full border border-white/40 bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
            {tour.duration}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
            {tour.country}
          </span>
        </div>
      </div>

      <div className={`relative flex flex-1 flex-col bg-gradient-to-br ${accent} p-6`}>
        <h3 className="text-xl font-bold text-brand-ink transition-colors group-hover:text-brand-green">
          {tour.name}
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-brand-muted">
          {tour.description}
        </p>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-brand-border/60 pt-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
              Starting from
            </p>
            <TourPriceDisplay tour={tour} variant="featured" amountOnly />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-brand-primary shadow-[0_8px_20px_-8px_rgba(255,219,88,0.65)] transition-all duration-300 group-hover:bg-brand-accent-dark group-hover:gap-2.5">
            View tour
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>

      <Link
        to={ROUTES.tourDetail(tour.slug)}
        className="absolute inset-0 z-10 rounded-[1.75rem]"
        aria-label={`View ${tour.name}`}
      />
    </motion.article>
  );
}

export default function HomeFeaturedTours() {
  return (
    <section className="relative overflow-hidden bg-brand-cream py-16 sm:py-20 lg:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cg fill='none' transform='rotate(45 14 14)'%3E%3Crect width='14' height='14' fill='%232D5A47' fill-opacity='0.03'/%3E%3Crect x='14' y='14' width='14' height='14' fill='%23E3A020' fill-opacity='0.025'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-brand-green/5 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brand-orange/5 blur-3xl"
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
            Flagship programs
          </p>
          <h2 className="mt-3 text-3xl font-bold text-brand-ink sm:text-4xl">
            2025 signature tours
          </h2>
          <p className="mt-4 text-base leading-relaxed text-brand-muted">
            Curated journeys across Ghana, Kenya, and South Africa — designed for cultural depth
            and seamless coordination.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-7">
          {featuredTours.map((tour, index) => (
            <TourCard key={tour.slug} tour={tour} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5"
        >
          <Link to={ROUTES.tours} className="btn-primary px-8 py-3.5 shadow-[0_10px_24px_-10px_rgba(45,90,71,0.5)]">
            View all tours
          </Link>
          <Link to={ROUTES.contact} className="btn-secondary px-8 py-3.5">
            Request a custom quote
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
