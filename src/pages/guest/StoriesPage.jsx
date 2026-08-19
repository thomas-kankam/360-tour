import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import Container from "../../components/layout/Container";
import { ROUTES } from "../../constants/routes";
import { stories } from "../../data/storiesContent";

const EASE = [0.16, 1, 0.3, 1];
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.65, ease: EASE, delay },
});

const CATEGORIES = ["All", "Newsletter", "Heritage", "Safari", "Culture", "Adventure", "Corporate"];

const catColors = {
  Heritage: "bg-stone-100 text-stone-700",
  Safari:   "bg-amber-100 text-amber-700",
  Culture:  "bg-emerald-100 text-emerald-700",
  Adventure:"bg-sky-100 text-sky-700",
  Corporate:"bg-violet-100 text-violet-700",
  Newsletter: "bg-brand-orange/15 text-brand-orange",
};

function StoryCard({ story, index }) {
  return (
    <motion.article
      {...rise(Math.min(index * 0.07, 0.35))}
      className="group flex flex-col overflow-hidden rounded-[1.25rem] border border-brand-border/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <Link to={ROUTES.storyDetail(story.slug)} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 rounded-[1.25rem]">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={story.image}
            alt={story.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${catColors[story.category] ?? "bg-white/90 text-brand-ink"}`}>
            {story.category}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-2 text-[11px] text-brand-muted">
            <span className="font-semibold text-brand-green">{story.country}</span>
            <span>·</span>
            <span>{story.date}</span>
            <span>·</span>
            <span>{story.readTime}</span>
          </div>
          <h3 className="mt-2 text-sm font-bold leading-snug text-brand-ink transition-colors group-hover:text-brand-green line-clamp-2">
            {story.title}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-brand-muted line-clamp-3">{story.excerpt}</p>
          <div className="mt-4 flex items-center gap-2 border-t border-brand-border/40 pt-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-[11px] font-bold text-brand-green">
              {story.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
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
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const featured = stories.find((s) => s.featured);
  const regular = stories.filter((s) => !s.featured);

  const filtered = (() => {
    let list = regular;
    if (activeCategory !== "All") list = list.filter((s) => s.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) => s.title.toLowerCase().includes(q) || s.country.toLowerCase().includes(q) || s.category.toLowerCase().includes(q),
      );
    }
    return list;
  })();

  return (
    <div className="min-h-screen bg-white">

      {/* ── Header ── */}
      <div className="border-b border-brand-border/50 bg-white pb-6 pt-8">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">Cultural Immersion Newsletter</p>
              <h1 className="mt-1.5 text-2xl font-bold text-brand-ink sm:text-3xl">Stories from the field</h1>
              <p className="mt-1 text-sm text-brand-muted">Travel perspectives, cultural insights, and news from 360 Tours</p>
            </div>
            <div className="relative w-full max-w-xs sm:w-64">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search stories…"
                className="h-10 w-full rounded-full border border-brand-border/70 bg-white pl-9 pr-4 text-sm text-brand-ink placeholder:text-brand-muted/70 shadow-sm outline-none transition-all focus:border-brand-green/50 focus:ring-2 focus:ring-brand-green/20"
              />
            </div>
          </motion.div>
        </Container>
      </div>

      {/* ── Featured story ── */}
      {featured && (
        <div className="bg-brand-cream py-10">
          <Container>
            <motion.div {...rise()} className="overflow-hidden rounded-[1.75rem] border border-brand-border/60 bg-white shadow-[0_16px_48px_-20px_rgba(28,43,38,0.3)]">
              <Link to={ROUTES.storyDetail(featured.slug)} className="group grid lg:grid-cols-[1.4fr_1fr] focus:outline-none">
                <div className="relative aspect-[16/9] overflow-hidden lg:aspect-auto">
                  <img src={featured.image} alt={featured.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent lg:bg-gradient-to-t" />
                  <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${catColors[featured.category] ?? "bg-white/90 text-brand-ink"}`}>
                    {featured.category}
                  </span>
                  <span className="absolute left-4 top-4 mt-8 hidden rounded-full bg-brand-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-primary">
                    Featured
                  </span>
                  <div className="absolute bottom-4 left-4 lg:hidden">
                    <span className="rounded-full bg-brand-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-primary">Featured</span>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-8 lg:p-10">
                  <span className="inline-flex w-fit rounded-full bg-brand-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-primary">
                    Featured story
                  </span>
                  <div className="mt-4 flex items-center gap-2 text-xs text-brand-muted">
                    <span className="font-semibold text-brand-green">{featured.country}</span>
                    <span>·</span>
                    <span>{featured.date}</span>
                    <span>·</span>
                    <span>{featured.readTime}</span>
                  </div>
                  <h2 className="mt-3 text-xl font-bold leading-snug text-brand-ink transition-colors group-hover:text-brand-green sm:text-2xl">
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-brand-muted">{featured.excerpt}</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green/10 text-sm font-bold text-brand-green">
                      {featured.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-ink">{featured.author}</p>
                      <p className="text-xs text-brand-muted">{featured.authorRole}</p>
                    </div>
                    <span className="ml-auto flex items-center gap-1 text-sm font-semibold text-brand-green transition-all group-hover:gap-2">
                      Read story
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </Container>
        </div>
      )}

      {/* ── Category filter + grid ── */}
      <div className="py-10">
        <Container>
          {/* Filters */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCategory(c)}
                className={[
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200",
                  activeCategory === c
                    ? "bg-brand-green text-white shadow-sm"
                    : "border border-brand-border/70 bg-white text-brand-muted hover:border-brand-green/30 hover:text-brand-green",
                ].join(" ")}
              >
                {c}
              </button>
            ))}
            {(activeCategory !== "All" || search) && (
              <button
                type="button"
                onClick={() => { setActiveCategory("All"); setSearch(""); }}
                className="flex items-center gap-1 text-xs font-semibold text-brand-muted hover:text-brand-ink"
              >
                Clear
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>

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
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center"
              >
                <span className="text-5xl">📖</span>
                <p className="mt-4 font-semibold text-brand-ink">No stories found</p>
                <button type="button" onClick={() => { setActiveCategory("All"); setSearch(""); }} className="mt-4 text-sm font-semibold text-brand-green underline underline-offset-2">
                  View all stories
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </div>
    </div>
  );
}
