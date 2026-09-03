import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, ArrowRight, Compass } from "lucide-react";
import Container from "../../components/layout/Container";
import TourListingCard from "../../components/tours/TourListingCard";
import { toursPageSection } from "../../data/homeContent";
import { mapServerPagination } from "../../utils/adminPaginationHelpers";
import { LISTING_SORT_OPTIONS } from "../../utils/publicListingsHelpers";
import { usePublicListings } from "../../hooks/usePublicListings";
import { usePageSeo } from "../../components/seo/SeoContext";
import { buildToursItemListJsonLd } from "../../config/seo";

const EASE = [0.16, 1, 0.3, 1];
const PER_PAGE = 10;
const LEGACY_FILTER_PARAMS = ["region", "type", "country", "date"];

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LISTING_SORT_OPTIONS.find((option) => option.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-full border border-brand-border/70 bg-white px-3 py-1.5 text-xs font-semibold text-brand-ink shadow-sm transition-all hover:border-brand-primary/25"
      >
        <svg className="h-3.5 w-3.5 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M10 12h4" />
        </svg>
        {current?.label}
        <svg className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-brand-border/60 bg-white shadow-xl"
          >
            {LISTING_SORT_OPTIONS.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full flex-col items-start px-4 py-2.5 text-left transition-colors hover:bg-brand-cream ${option.value === value ? "bg-brand-accent/15" : ""}`}
                >
                  <span className={`text-xs ${option.value === value ? "font-bold text-brand-primary" : "font-semibold text-brand-ink"}`}>
                    {option.label}
                  </span>
                  <span className="mt-0.5 text-[10px] text-brand-muted">{option.description}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function ToursPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const hasLegacyFilters = LEGACY_FILTER_PARAMS.some((key) => searchParams.has(key));
    if (!hasLegacyFilters) return;
    const next = new URLSearchParams(searchParams);
    LEGACY_FILTER_PARAMS.forEach((key) => next.delete(key));
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching, isError, error } = usePublicListings({
    page,
    perPage: PER_PAGE,
    sort,
    search: debouncedSearch,
  });

  const tours = data?.items ?? [];
  const paginationMeta = mapServerPagination(data?.pagination, { page });
  const listJsonLd = useMemo(() => buildToursItemListJsonLd(tours), [tours]);
  usePageSeo(null, listJsonLd, "tours-list-json-ld");

  const handleSortChange = useCallback((value) => {
    setPage(1);
    setSort(value);
  }, []);

  const showLoading = isLoading && !data;

  return (
    <div className="min-h-screen max-w-full overflow-x-clip bg-brand-cream">
      <section className="border-b border-brand-border/50 bg-white">
        <Container className="py-8 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-accent/25 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">
              <Compass className="h-3.5 w-3.5" aria-hidden />
              {toursPageSection.eyebrow}
            </span>
            <h1 className="mt-4 text-3xl font-bold text-brand-primary sm:text-4xl">{toursPageSection.title}</h1>
            <p className="mt-3 text-base leading-relaxed text-brand-muted">{toursPageSection.subtitle}</p>
          </motion.div>
        </Container>
      </section>

      <div className="sticky sticky-below-nav z-40 border-b border-brand-border/50 bg-white/95 backdrop-blur-xl">
        <Container className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex shrink-0 items-center gap-2">
            <h2 className="text-base font-bold text-brand-primary sm:text-lg">All tours</h2>
            <span className="rounded-md bg-brand-accent/35 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-brand-primary">
              {showLoading ? "…" : paginationMeta.totalItems || tours.length}
            </span>
            {isFetching && !showLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-primary/60" aria-hidden />
            ) : null}
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-3 md:max-w-xl md:justify-end">
            <div className="relative min-w-0 flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tours by name or destination…"
              aria-label="Search tours"
              className="h-9 w-full rounded-full border border-brand-border/70 bg-white pl-8 pr-8 text-sm text-brand-ink placeholder:text-brand-muted/70 outline-none transition-all focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-accent/30"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-ink"
              >
                ×
              </button>
            ) : null}
          </div>

          <SortDropdown value={sort} onChange={handleSortChange} />
          </div>
        </Container>
      </div>

      <div className="pb-16 pt-6">
        <Container>
          {isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              {error?.message || "Could not load tours."}
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            {showLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[280px] items-center justify-center"
              >
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" strokeWidth={2} aria-hidden />
              </motion.div>
            ) : tours.length > 0 ? (
              <motion.div
                key={`grid-${page}-${sort}-${debouncedSearch}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
              >
                {tours.map((tour, index) => (
                  <TourListingCard key={tour.slug} tour={tour} index={index} eagerImage={index < 4} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <p className="text-lg font-semibold text-brand-ink">No tours found</p>
                <p className="mt-1.5 text-sm text-brand-muted">
                  {debouncedSearch ? "Try a different search term." : "Check back soon for new departures."}
                </p>
                {debouncedSearch ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-5 rounded-xl border border-brand-border bg-white px-6 py-2.5 text-sm font-semibold text-brand-primary shadow-sm transition-all hover:bg-brand-accent/10"
                  >
                    Clear search
                  </button>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>

          {!showLoading && paginationMeta.totalPages > 1 ? (
            <nav aria-label="Tour listings pagination" className="mt-10 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-xl border border-brand-border px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-cream disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-brand-muted">
                Page <span className="font-semibold text-brand-ink">{page}</span> of {paginationMeta.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= paginationMeta.totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-xl border border-brand-border px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-cream disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          ) : null}

          {tours.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE }}
              className="relative mt-16 overflow-hidden rounded-3xl border border-brand-border/50 bg-white shadow-[0_24px_64px_-32px_rgba(0,107,63,0.18)]"
            >
              <div className="grid items-center gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1fr_auto] lg:gap-10">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">
                    {toursPageSection.customCta.title}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-brand-primary sm:text-3xl">
                    Custom Ghana itineraries
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-muted sm:text-base">
                    {toursPageSection.customCta.subtitle}
                  </p>
                </div>
                <Link
                  to={toursPageSection.customCta.to}
                  className="btn-primary inline-flex shrink-0 items-center gap-2 px-7 py-3.5"
                >
                  {toursPageSection.customCta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </motion.div>
          ) : null}
        </Container>
      </div>
    </div>
  );
}
