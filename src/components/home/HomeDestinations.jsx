import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, MapPin } from "lucide-react";
import Container from "../layout/Container";
import ScrollReveal, { ScrollStagger, ScrollStaggerItem } from "../motion/ScrollReveal";
import { getPopularDestinationSources } from "../../config/images";
import { popularDestinationsSection } from "../../data/homeContent";
import { resolveCmsDestinationItems, resolveCmsItemImage } from "../../utils/landingCmsItems";
import { ROUTES } from "../../constants/routes";

const GRID_LIMIT = 6;

const SECTION_DEFAULTS = {
  eyebrow: popularDestinationsSection.eyebrow,
  title: popularDestinationsSection.title,
  subtitle: popularDestinationsSection.subtitle,
  ctaLabel: "View all destinations",
  bookLabel: "Book this experience",
};

function getDestinationSources(destination) {
  return (
    resolveCmsItemImage(destination) ??
    getPopularDestinationSources(destination.imageKey) ?? {
      webp: destination.fallback,
      png: destination.fallback,
    }
  );
}

function DestinationCard({ destination, priority = false }) {
  const [failed, setFailed] = useState(false);
  const sources = getDestinationSources(destination);

  return (
    <ScrollStaggerItem>
      <article className="group relative overflow-hidden rounded-2xl border border-brand-border bg-white shadow-[0_8px_32px_-16px_rgba(17,17,17,0.12)] transition-shadow hover:shadow-kente">
        <div className="relative aspect-[4/3] overflow-hidden bg-brand-sand/30">
          {failed ? (
            <div className="flex h-full items-center justify-center">
              <MapPin className="h-10 w-10 text-brand-primary/40" aria-hidden />
            </div>
          ) : (
            <picture>
              {!/^https?:\/\//i.test(String(sources.webp || "")) && sources.webp !== sources.png ? (
                <source srcSet={sources.webp} type="image/webp" />
              ) : null}
              <img
                src={sources.png}
                alt={destination.name}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setFailed(true)}
              />
            </picture>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/70 via-transparent to-transparent" />
          <span className="absolute bottom-3 left-3 rounded-md bg-brand-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-charcoal">
            {destination.region}
          </span>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-bold text-brand-primary">{destination.name}</h3>
          <Link
            to={ROUTES.toursSearch({ country: "ghana" })}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary transition-colors hover:text-brand-primary-dark"
          >
            Explore tours
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </article>
    </ScrollStaggerItem>
  );
}

export default function HomeDestinations({ cmsOverride }) {
  const section = { ...SECTION_DEFAULTS, ...cmsOverride };
  const destinations = resolveCmsDestinationItems(section).slice(0, GRID_LIMIT);

  return (
    <section className="bg-white py-14 sm:py-16 lg:py-20">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <ScrollReveal variant="up" className="max-w-xl">
            <p className="eyebrow">{section.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold text-brand-primary sm:text-4xl">{section.title}</h2>
            <div className="kente-rule mt-3" aria-hidden />
            <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-base">{section.subtitle}</p>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={0.06}>
            <Link to={ROUTES.tours} className="btn-secondary shrink-0 gap-2">
              {section.ctaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </ScrollReveal>
        </div>

        <ScrollStagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination, index) => (
            <DestinationCard key={destination.id} destination={destination} priority={index < 3} />
          ))}
        </ScrollStagger>
      </Container>
    </section>
  );
}
