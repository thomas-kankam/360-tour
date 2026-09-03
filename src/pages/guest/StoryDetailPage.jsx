import { Link, useParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { BookOpen, Loader2 } from "lucide-react";
import Container from "../../components/layout/Container";
import { ROUTES } from "../../constants/routes";
import { getStoryBySlug, stories as staticStories } from "../../data/storiesContent";
import { usePageSeo } from "../../components/seo/SeoContext";
import { buildStoryArticleJsonLd, resolveSeoForStory } from "../../config/seo";
import publicContentServiceApi from "../../apis/PublicContentServiceApi";

const EASE = [0.16, 1, 0.3, 1];

const catColors = {
  Heritage: "bg-stone-100 text-stone-700",
  Safari: "bg-amber-100 text-amber-700",
  Culture: "bg-emerald-100 text-emerald-700",
  Adventure: "bg-sky-100 text-sky-700",
  Corporate: "bg-violet-100 text-violet-700",
  Newsletter: "bg-brand-orange/15 text-brand-orange",
};

function ArticleBody({ blocks }) {
  return (
    <div className="space-y-6">
      {(blocks || []).map((block, i) => {
        if (block.type === "lead") {
          return (
            <p key={i} className="text-lg font-medium leading-relaxed text-brand-ink sm:text-xl">
              {block.text}
            </p>
          );
        }
        if (block.type === "heading") {
          return (
            <h2 key={i} className="pt-2 text-xl font-bold text-brand-ink sm:text-2xl">
              {block.text}
            </h2>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote
              key={i}
              className="border-l-4 border-brand-orange py-1 pl-5 text-base italic leading-relaxed text-brand-ink sm:text-lg"
            >
              &ldquo;{block.text}&rdquo;
            </blockquote>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="space-y-2 rounded-xl border border-brand-border/60 bg-brand-cream/50 p-5">
              {(block.items || []).map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-brand-ink sm:text-base">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-base leading-relaxed text-brand-muted">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

function authorInitials(author) {
  return (author || "360")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}

export default function StoryDetailPage() {
  const { slug } = useParams();
  const [story, setStory] = useState(() => getStoryBySlug(slug));
  const [related, setRelated] = useState(() =>
    staticStories.filter((s) => s.slug !== slug && s.category === getStoryBySlug(slug)?.category).slice(0, 3),
  );
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      const fallback = getStoryBySlug(slug);
      if (fallback) {
        setStory(fallback);
        setRelated(
          staticStories.filter((s) => s.slug !== fallback.slug && s.category === fallback.category).slice(0, 3),
        );
      }

      const result = await publicContentServiceApi.getStory(slug);
      if (cancelled) return;

      if (result.ok && result.story) {
        setStory(result.story);
        setRelated(result.related?.length ? result.related : []);
        setNotFound(false);
      } else if (!fallback) {
        setStory(null);
        setRelated([]);
        setNotFound(true);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const storySeo = useMemo(() => (story ? resolveSeoForStory(story) : null), [story]);
  const storyJsonLd = useMemo(() => (story ? buildStoryArticleJsonLd(story) : null), [story]);
  usePageSeo(storySeo, storyJsonLd, "story-article-json-ld");

  if (loading && !story) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 bg-white text-sm text-brand-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading story…
      </div>
    );
  }

  if (!story || notFound) {
    return (
      <div className="min-h-[50vh] bg-white py-20 text-center">
        <Container>
          <BookOpen className="mx-auto h-12 w-12 text-brand-primary/40" aria-hidden />
          <h1 className="mt-4 text-2xl font-bold text-brand-ink">Story not found</h1>
          <p className="mt-2 text-brand-muted">This story may have moved or no longer exists.</p>
          <Link
            to={ROUTES.stories}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline"
          >
            ← Back to all stories
          </Link>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[40vh] min-h-[280px] max-h-[480px] overflow-hidden sm:h-[45vh]">
        {story.image ? (
          <img src={story.image} alt={story.title} fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-brand-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-brand-ink/30 to-brand-ink/20" />
        <Container className="absolute inset-x-0 bottom-0 pb-8 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <Link
              to={ROUTES.stories}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 transition-colors hover:text-white"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              All stories
            </Link>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${catColors[story.category] ?? "bg-white/90 text-brand-ink"}`}>
              {story.category}
            </span>
            <h1 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
              {story.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/75">
              <span className="font-semibold text-brand-gold">{story.country}</span>
              <span aria-hidden>·</span>
              <span>{story.date}</span>
              <span aria-hidden>·</span>
              <span>{story.readTime}</span>
            </div>
          </motion.div>
        </Container>
      </div>

      <Container className="py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="mb-8 flex items-center gap-3 border-b border-brand-border/50 pb-6 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-bold text-brand-primary">
                {authorInitials(story.author)}
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-ink">{story.author}</p>
                <p className="text-xs text-brand-muted">{story.authorRole}</p>
              </div>
            </div>

            <motion.article
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
            >
              <ArticleBody blocks={story.body} />
            </motion.article>

            {story.category === "Newsletter" && (
              <div className="mt-10 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-6 sm:p-8 lg:hidden">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-orange">Join the movement</p>
                <p className="mt-2 text-base leading-relaxed text-brand-ink">
                  Become part of the 360 Tours community, explore our cultural travel series, and plan your journey today.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to={ROUTES.tours}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-dark"
                  >
                    View 2025 tours
                  </Link>
                  <Link
                    to={ROUTES.contact}
                    className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-white px-5 py-2.5 text-sm font-semibold text-brand-primary transition-colors hover:border-brand-primary/30"
                  >
                    Contact us
                  </Link>
                </div>
              </div>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-bold text-brand-primary">
                    {authorInitials(story.author)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-ink">{story.author}</p>
                    <p className="text-xs text-brand-muted">{story.authorRole}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 border-t border-brand-border/40 pt-4 text-xs text-brand-muted">
                  <p><span className="font-semibold text-brand-ink">Country:</span> {story.country}</p>
                  <p><span className="font-semibold text-brand-ink">Published:</span> {story.date}</p>
                  <p><span className="font-semibold text-brand-ink">Read time:</span> {story.readTime}</p>
                </div>
              </div>

              {story.category === "Newsletter" && (
                <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-orange">Join the movement</p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-ink">
                    Explore our 2025 Cultural Travel Series and plan your journey today.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link
                      to={ROUTES.tours}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-dark"
                    >
                      View 2025 tours
                    </Link>
                    <Link
                      to={ROUTES.contact}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm font-semibold text-brand-primary transition-colors hover:border-brand-primary/30"
                    >
                      Contact us
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-16 border-t border-brand-border/50 pt-12">
            <h2 className="text-lg font-bold text-brand-ink">More in {story.category}</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {related.map((s) => (
                <Link
                  key={s.slug}
                  to={ROUTES.storyDetail(s.slug)}
                  className="group overflow-hidden rounded-xl border border-brand-border/60 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-brand-cream">
                    {s.image ? (
                      <img src={s.image} alt={s.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-brand-primary">{s.country}</p>
                    <h3 className="mt-1 text-sm font-bold leading-snug text-brand-ink line-clamp-2 group-hover:text-brand-primary">
                      {s.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
