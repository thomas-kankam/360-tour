import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Loader2 } from "lucide-react";
import Container from "../../components/layout/Container";
import { ROUTES } from "../../constants/routes";
import { stories as staticStories } from "../../data/storiesContent";
import { usePageSeo } from "../../components/seo/SeoContext";
import { buildStoriesBlogJsonLd, buildStoriesItemListJsonLd } from "../../config/seo";
import publicContentServiceApi from "../../apis/PublicContentServiceApi";

const EASE = [0.16, 1, 0.3, 1];
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.65, ease: EASE, delay },
});

const DEFAULT_CATEGORIES = ["All", "Newsletter", "Heritage", "Safari", "Culture", "Adventure", "Corporate"];

const catColors = {
  Heritage: "bg-brand-sand/40 text-brand-primary",
  Safari: "bg-brand-accent/25 text-brand-charcoal",
  Culture: "bg-brand-primary/10 text-brand-primary",
  Adventure: "bg-sky-100 text-sky-800",
  Corporate: "bg-violet-100 text-violet-800",
  Newsletter: "bg-brand-red/10 text-brand-red",
};

function StoryCard({ story, index }) {
  const initials = (story.author || "360")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <motion.article
      {...rise(Math.min(index * 0.07, 0.35))}
      className="group flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-kente"
    >
      <Link
        to={ROUTES.storyDetail(story.slug)}
        className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-brand-cream">
          {story.image ? (
            <img
              src={story.image}
              alt={story.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/40 to-transparent" />
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${catColors[story.category] ?? "bg-white/90 text-brand-ink"}`}>
            {story.category}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-2 text-[11px] text-brand-muted">
            <span className="font-semibold text-brand-primary">{story.country}</span>
            <span>·</span>
            <span>{story.date}</span>
            <span>·</span>
            <span>{story.readTime}</span>
          </div>
          <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-brand-ink transition-colors group-hover:text-brand-primary">
            {story.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-brand-muted">{story.excerpt}</p>
          <div className="mt-4 flex items-center gap-2 border-t border-brand-border/40 pt-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-[11px] font-bold text-brand-primary">
              {initials}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-brand-ink">{story.author}</p>
              <p className="text-[10px] text-brand-muted">{story.authorRole}</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default function StoriesPage() {
  const [stories, setStories] = useState(staticStories);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await publicContentServiceApi.getStories();
      if (cancelled) return;
      if (result.ok && result.items.length > 0) {
        setStories(result.items);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const fromData = [...new Set(stories.map((s) => s.category).filter(Boolean))];
    const merged = ["All", ...DEFAULT_CATEGORIES.filter((c) => c !== "All"), ...fromData];
    return [...new Set(merged)];
  }, [stories]);

  const storiesJsonLd = useMemo(
    () => [buildStoriesBlogJsonLd(stories), buildStoriesItemListJsonLd(stories)],
    [stories],
  );
  usePageSeo(null, storiesJsonLd, "stories-index-json-ld");

  const filtered = useMemo(() => {
    let list = stories;
    if (activeCategory !== "All") list = list.filter((s) => s.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.country || "").toLowerCase().includes(q) ||
          (s.category || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [stories, activeCategory, search]);

  return (
    <div className="min-h-screen bg-brand-cream">
      <section className="border-b border-brand-border/50 bg-brand-secondary py-14 sm:py-16">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-accent">Stories & insights</p>
            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Stories from the field</h1>
            <p className="mt-3 text-sm text-white/75 sm:text-base">
              Travel perspectives, cultural insights, and news from 360 Tours Ghana
            </p>
          </motion.div>
        </Container>
      </section>

      <div className="py-10">
        <Container>
          <div className="mb-8 flex flex-col gap-4">
            <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActiveCategory(c)}
                  className={[
                    "shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200",
                    activeCategory === c
                      ? "bg-brand-primary text-white shadow-sm"
                      : "border border-brand-border/70 bg-white text-brand-muted hover:border-brand-primary/30 hover:text-brand-primary",
                  ].join(" ")}
                >
                  {c}
                </button>
              ))}
              {(activeCategory !== "All" || search) && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("All");
                    setSearch("");
                  }}
                  className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-muted hover:text-brand-ink"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="relative w-full sm:max-w-xs md:ml-auto md:w-64">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search stories…"
                className="h-10 w-full rounded-full border border-brand-border/70 bg-white px-4 text-sm text-brand-ink placeholder:text-brand-muted/70 shadow-sm outline-none transition-all focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/15"
              />
            </div>
          </div>

          {loading && stories.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-brand-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading stories…
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {filtered.length > 0 ? (
                <motion.div
                  key={`${activeCategory}-${search}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {filtered.map((story, i) => (
                    <StoryCard key={story.slug} story={story} index={i} />
                  ))}
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-16 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-brand-primary/40" aria-hidden />
                  <p className="mt-4 font-semibold text-brand-ink">No stories found</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("All");
                      setSearch("");
                    }}
                    className="mt-4 text-sm font-semibold text-brand-primary underline underline-offset-2"
                  >
                    View all stories
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </Container>
      </div>

      <section className="border-t border-brand-border/50 bg-white py-12">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-brand-border/60 bg-brand-cream/40 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">Plan the trip</p>
              <h2 className="mt-2 font-heading text-xl font-bold text-brand-ink sm:text-2xl">
                Match these stories with Ghana experiences & tours
              </h2>
              <p className="mt-2 text-sm text-brand-muted">
                Explore experience pillars, then book a package — internal links that help travelers and search engines
                connect tips to real itineraries.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={ROUTES.experiences} className="btn-primary inline-flex">
                View experiences
              </Link>
              <Link to={ROUTES.tours} className="btn-secondary inline-flex">
                Browse tours
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
