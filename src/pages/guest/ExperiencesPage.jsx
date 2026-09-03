import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, BookOpen, CheckCircle2, Loader2, MapPin } from "lucide-react";
import Container from "../../components/layout/Container";
import { GuestIcon } from "../../utils/guestIcons";
import { ROUTES } from "../../constants/routes";
import { getWhatsAppUrl } from "../../config/env";
import { usePageSeo } from "../../components/seo/SeoContext";
import { stories as staticStories } from "../../data/storiesContent";
import {
  EXPERIENCES as staticExperiences,
  buildExperiencesFaqJsonLd,
  buildExperiencesItemListJsonLd,
  experiencesPageSeo,
} from "../../data/experiencesContent";
import publicContentServiceApi from "../../apis/PublicContentServiceApi";

const EASE = [0.16, 1, 0.3, 1];
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.65, ease: EASE, delay },
});

const WHATSAPP_MESSAGE = "Hi 360 Tours, I'd like to plan a Ghana experience.";

function toGuestExperience(item) {
  return {
    ...item,
    id: item.key || item.slug || String(item.id),
    highlights: Array.isArray(item.highlights) ? item.highlights : [],
    regions: Array.isArray(item.regions) ? item.regions : [],
    relatedStorySlugs: Array.isArray(item.relatedStorySlugs) ? item.relatedStorySlugs : [],
  };
}

function ExperienceCard({ experience, stories, index, expanded, onToggle }) {
  const storyLinks = (experience.relatedStorySlugs || [])
    .map((slug) => stories.find((s) => s.slug === slug))
    .filter(Boolean);
  const categoryStories = stories
    .filter((s) => s.category === experience.storyCategory)
    .slice(0, 2);
  const relatedStories = storyLinks.length ? storyLinks : categoryStories;

  return (
    <motion.article
      {...rise(Math.min(index * 0.06, 0.3))}
      id={experience.id}
      className="scroll-mt-28 overflow-hidden rounded-3xl border border-brand-border/60 bg-white shadow-sm"
    >
      <div className="grid lg:grid-cols-[1.05fr_1fr]">
        <button
          type="button"
          onClick={onToggle}
          className="relative min-h-[220px] overflow-hidden text-left lg:min-h-full"
          aria-expanded={expanded}
        >
          {experience.image ? (
            <img
              src={experience.image}
              alt={`${experience.label} — Ghana travel experience with 360 Tours`}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="absolute inset-0 bg-brand-secondary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/80 via-brand-charcoal/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            {experience.badgeText ? (
              <span className="inline-flex rounded-full bg-brand-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-charcoal">
                {experience.badgeText}
              </span>
            ) : null}
            <h2 className="mt-3 font-heading text-2xl font-bold text-white sm:text-3xl">{experience.label}</h2>
            <p className="mt-1.5 text-sm text-white/85">{experience.tagline}</p>
          </div>
        </button>

        <div className="flex flex-col p-5 sm:p-6 lg:p-7">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
              <GuestIcon name={experience.iconKey} className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">Ghana experience</p>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">{experience.description}</p>
            </div>
          </div>

          {experience.highlights.length ? (
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {experience.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-brand-ink">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" strokeWidth={2} aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          ) : null}

          {experience.regions.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {experience.regions.map((region) => (
                <span
                  key={region}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-cream px-2.5 py-1 text-[11px] font-semibold text-brand-muted"
                >
                  <MapPin className="h-3 w-3 text-brand-accent" aria-hidden />
                  {region}
                </span>
              ))}
            </div>
          ) : null}

          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-5 rounded-2xl border border-brand-border/50 bg-brand-cream/50 p-4">
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-primary">
                    <BookOpen className="h-3.5 w-3.5" aria-hidden />
                    Related stories
                  </p>
                  {relatedStories.length ? (
                    <ul className="mt-3 space-y-2">
                      {relatedStories.map((story) => (
                        <li key={story.slug}>
                          <Link
                            to={ROUTES.storyDetail(story.slug)}
                            className="text-sm font-semibold text-brand-ink hover:text-brand-primary"
                          >
                            {story.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-brand-muted">
                      Browse all{" "}
                      <Link to={ROUTES.stories} className="font-semibold text-brand-primary hover:underline">
                        Ghana travel stories
                      </Link>{" "}
                      for tips that pair with this experience.
                    </p>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to={ROUTES.tours}
              className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm"
            >
              Browse matching tours
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={onToggle}
              className="rounded-xl border border-brand-border/70 px-4 py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-cream"
            >
              {expanded ? "Hide stories" : "Read related stories"}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState(() => staticExperiences.map(toGuestExperience));
  const [stories, setStories] = useState(staticStories);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(staticExperiences[0]?.id || "");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [expResult, storyResult] = await Promise.all([
        publicContentServiceApi.getExperiences(),
        publicContentServiceApi.getStories(),
      ]);
      if (cancelled) return;

      if (expResult.ok && expResult.items.length > 0) {
        const mapped = expResult.items.map(toGuestExperience);
        setExperiences(mapped);
        setOpenId((current) => (mapped.some((item) => item.id === current) ? current : mapped[0]?.id || ""));
      }

      if (storyResult.ok && storyResult.items.length > 0) {
        setStories(storyResult.items);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const seoOverride = useMemo(
    () => ({
      title: experiencesPageSeo.title,
      description: experiencesPageSeo.description,
      keywords: experiencesPageSeo.keywords,
    }),
    [],
  );
  const jsonLd = useMemo(
    () => [buildExperiencesItemListJsonLd(experiences), buildExperiencesFaqJsonLd()],
    [experiences],
  );

  usePageSeo(seoOverride, jsonLd, "experiences-json-ld");

  return (
    <div className="min-h-screen bg-brand-cream">
      <section className="relative overflow-hidden border-b border-brand-border/40 bg-brand-secondary">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(242,183,5,0.2),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(0,107,63,0.35),transparent_35%)]" />
        <Container className="relative py-14 sm:py-18 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="max-w-3xl"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-accent">Ghana experiences</p>
            <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-tight text-white sm:text-5xl">
              Travel experiences across{" "}
              <span className="text-brand-accent">Ghana</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
              Heritage castles, Accra culture, Volta adventures, beach escapes, university programs, and custom
              itineraries — planned by 360 Tours with stays and transport when you need them.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={ROUTES.tours} className="btn-accent inline-flex items-center gap-2 px-6 py-3">
                View all Ghana tours
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to={ROUTES.stories}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20"
              >
                Read travel stories
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <div className="mb-8 max-w-2xl">
            <h2 className="font-heading text-2xl font-bold text-brand-ink sm:text-3xl">Choose how you want to experience Ghana</h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted sm:text-base">
              Each experience below maps to real tour packages and field stories — so you can research, compare, and
              book with confidence.
            </p>
          </div>

          {loading && experiences.length === 0 ? (
            <div className="flex items-center gap-2 rounded-2xl border border-brand-border/60 bg-white px-4 py-10 text-sm text-brand-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading experiences…
            </div>
          ) : (
            <div className="space-y-6">
              {experiences.map((experience, index) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  stories={stories}
                  index={index}
                  expanded={openId === experience.id}
                  onToggle={() => setOpenId((current) => (current === experience.id ? "" : experience.id))}
                />
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="border-t border-brand-border/50 bg-white py-12 sm:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">Stories & SEO hub</p>
              <h2 className="mt-2 font-heading text-2xl font-bold text-brand-ink sm:text-3xl">
                Pair every experience with on-the-ground stories
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-muted sm:text-base">
                Our Stories journal covers Cape Coast heritage, Accra culture, adventure tips, and traveler notes —
                internal links that help guests (and search engines) understand Ghana travel with 360 Tours.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={ROUTES.stories} className="btn-primary inline-flex items-center gap-2">
                  Explore stories
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link to={ROUTES.contact} className="btn-secondary inline-flex items-center gap-2">
                  Request a custom quote
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-brand-primary/20 bg-gradient-to-br from-brand-primary to-brand-charcoal p-6 text-white shadow-lg sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-accent">Need a human guide?</p>
              <p className="mt-3 text-lg font-bold leading-snug">Tell us your dates, group size, and interests.</p>
              <p className="mt-2 text-sm text-white/75">
                We’ll shape a Ghana itinerary with the right mix of heritage, nature, and downtime.
              </p>
              <a
                href={getWhatsAppUrl(WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-bold text-brand-charcoal hover:brightness-105"
              >
                Chat on WhatsApp
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
