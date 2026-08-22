import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, ArrowRight, Calendar, Clock, Compass, MapPin, Star, Users } from "lucide-react";
import { GuestIcon, resolveTourFallbackIcon } from "../../utils/guestIcons";
import publicListingsServiceApi from "../../apis/PublicListingsServiceApi";
import Container from "../../components/layout/Container";
import TourPriceDisplay from "../../components/tours/TourPriceDisplay";
import { toursPageSection } from "../../data/homeContent";
import { ROUTES } from "../../constants/routes";
import { mapServerPagination } from "../../utils/adminPaginationHelpers";
import {
  buildListingsPayload,
  COUNTRY_FILTER_OPTIONS,
  formatDepartureDateLabel,
  getPackageLineLabel,
  LISTING_SORT_OPTIONS,
  PACKAGE_FILTER_OPTIONS,
  resolveCountryFilterFromParams,
  resolvePackageFilterFromParams,
  tourHasDepartureOnDate,
  tourMatchesPackageLine,
} from "../../utils/publicListingsHelpers";

const EASE = [0.16, 1, 0.3, 1];

function StarRating({ value, reviews, tourSlug }) {
  const hasRating = Number(value) > 0;
  const count = Number(reviews) || 0;
  const reviewsHref = tourSlug ? `${ROUTES.tourDetail(tourSlug)}#tour-reviews` : "#tour-reviews";

  if (hasRating) {
    return (
      <Link
        to={reviewsHref}
        className="inline-flex items-center gap-1 rounded-full bg-brand-cream/90 px-2 py-0.5 transition-colors hover:bg-brand-accent/25"
      >
        <Star className="h-3 w-3 fill-brand-accent text-brand-accent" strokeWidth={0} aria-hidden />
        <span className="text-[11px] font-bold text-brand-ink">{Number(value).toFixed(1)}</span>
        {count > 0 ? <span className="text-[10px] text-brand-muted">({count})</span> : null}
      </Link>
    );
  }

  return (
    <Link
      to={reviewsHref}
      className="inline-flex items-center gap-1 rounded-full border border-brand-border/60 bg-white px-2 py-0.5 text-[10px] font-semibold text-brand-muted transition-colors hover:border-brand-primary/30 hover:text-brand-primary"
    >
      <Star className="h-3 w-3 text-brand-border" strokeWidth={1.5} aria-hidden />
      Reviews
    </Link>
  );
}

function SpotsBar({ spotsLeft, totalSpots }) {
  const safeTotal = Math.max(Number(totalSpots) || 1, 1);
  const left = Math.max(Number(spotsLeft) || 0, 0);
  const filled = Math.round(((safeTotal - left) / safeTotal) * 100);
  const urgent = left > 0 && left <= 3;

  if (left <= 0) {
    return (
      <p className="mt-3 text-[11px] font-semibold text-brand-muted">Fully booked, join the waitlist on the tour page</p>
    );
  }

  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className={urgent ? "font-semibold text-red-600" : "text-brand-muted"}>
          {left} spot{left !== 1 ? "s" : ""} left
        </span>
        <span className="text-brand-muted">{safeTotal} seats</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-brand-border/60">
        <div
          className={["h-full rounded-full transition-all duration-500", urgent ? "bg-red-500" : "bg-brand-primary"].join(" ")}
          style={{ width: `${Math.min(Math.max(filled, 8), 100)}%` }}
        />
      </div>
    </div>
  );
}

function TourCard({ tour, index }) {
  const [imgError, setImgError] = useState(false);
  const isFilling = tour.spotsLeft <= 3 && tour.spotsLeft > 0;
  const previewText = tour.highlight || tour.descriptionSnippet;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.4, ease: EASE, delay: Math.min(index * 0.04, 0.28) }}
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-brand-border/50 bg-white shadow-sm transition-all duration-300 hover:border-brand-primary/25 hover:shadow-[0_16px_40px_-20px_rgba(21,67,96,0.25)]"
    >
      <Link
        to={ROUTES.tourDetail(tour.slug)}
        aria-label={`View ${tour.name}`}
        className="flex min-w-0 flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[5/4] overflow-hidden bg-brand-border/30">
          {!imgError && tour.image ? (
            <img
              src={tour.image}
              alt={tour.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-cream text-brand-primary/50">
              <GuestIcon name={resolveTourFallbackIcon(tour.categories)} className="h-10 w-10" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/85 via-brand-primary/25 to-brand-primary/10" />

          {tour.departDay && tour.departMonth ? (
            <div className="absolute left-3 top-3 overflow-hidden rounded-xl border border-white/40 bg-white/20 shadow-lg backdrop-blur-md">
              <div className="flex flex-col items-center px-3 py-2 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/85">
                  {tour.departMonth}
                </span>
                <span className="text-2xl font-bold leading-none text-white">{tour.departDay}</span>
              </div>
            </div>
          ) : null}

          <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
            {tour.featured ? (
              <span className="rounded-full bg-brand-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-primary shadow-md">
                Featured
              </span>
            ) : null}
            {tour.badge ? (
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${tour.badgeColor ?? "bg-white/90 text-brand-ink"}`}>
                {tour.badge}
              </span>
            ) : null}
            {isFilling ? (
              <span className="flex items-center gap-1 rounded-full bg-red-500/95 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                Filling fast
              </span>
            ) : null}
          </div>

          <div className="absolute bottom-14 right-3">
            <StarRating value={tour.rating} reviews={tour.reviews} tourSlug={tour.slug} />
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            {tour.packageLineLabel ? (
              <span className="inline-flex rounded-full bg-brand-accent/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-primary">
                {tour.packageLineLabel}
              </span>
            ) : (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/75">{tour.country}</p>
            )}
            <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-white">{tour.name}</h3>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          {tour.location ? (
            <p className="flex items-center gap-1.5 text-xs text-brand-muted">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-primary" aria-hidden />
              <span className="line-clamp-1">{tour.location}</span>
            </p>
          ) : null}

          {tour.categoryLabels?.length ? (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {tour.categoryLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-brand-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-primary"
                >
                  {label}
                </span>
              ))}
            </div>
          ) : null}

          {previewText ? (
            <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-brand-muted">{previewText}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-muted">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-brand-primary" aria-hidden />
              {tour.nextDate}
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-brand-border sm:inline-block" aria-hidden />
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-brand-primary" aria-hidden />
              {tour.duration}
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-brand-border sm:inline-block" aria-hidden />
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-brand-primary" aria-hidden />
              {tour.groupSize}
            </span>
          </div>

          <SpotsBar spotsLeft={tour.spotsLeft} totalSpots={tour.totalSpots} />

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-brand-border/50 pt-4">
            <TourPriceDisplay tour={tour} variant="card" perPerson primaryClassName="text-brand-primary" />
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-primary transition-all group-hover:gap-1.5">
              View tour
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

function FilterChip({ option, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(option.id)}
      className={[
        "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all duration-200",
        active
          ? "border-brand-primary bg-brand-primary text-white shadow-sm"
          : "border-brand-border/70 bg-white text-brand-muted hover:border-brand-accent hover:bg-brand-accent/15 hover:text-brand-primary",
      ].join(" ")}
    >
      <GuestIcon name={option.iconKey || "globe"} className="h-3.5 w-3.5 shrink-0" />
      <span className="whitespace-nowrap">{option.label}</span>
    </button>
  );
}

function SortDropdown({ value, onChange, compact = false }) {
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
        className={[
          "flex items-center gap-1.5 rounded-full border border-brand-border/70 bg-white font-semibold text-brand-ink shadow-sm transition-all hover:border-brand-primary/25 hover:shadow-md",
          compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-xs",
        ].join(" ")}
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
            className="absolute right-0 top-full z-30 mt-2 max-w-[min(100vw-2rem,220px)] overflow-hidden rounded-xl border border-brand-border/60 bg-white shadow-xl"
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

function describeActiveFilters(countryFilter, sort, departureDate, packageFilter) {
  const parts = [];
  const country = COUNTRY_FILTER_OPTIONS.find((option) => option.id === countryFilter);
  if (country?.apiCountry) parts.push(country.label);

  if (packageFilter) {
    parts.push(getPackageLineLabel(packageFilter));
  }

  if (departureDate) {
    parts.push(`Departs ${formatDepartureDateLabel(departureDate)}`);
  }

  const sortOption = LISTING_SORT_OPTIONS.find((option) => option.value === sort);
  if (sort !== "default" && sortOption) parts.push(sortOption.label);

  return parts.length ? parts.join(" · ") : "All published tours";
}

function buildToursSearchParams({ country, date, package: packageId }) {
  const params = new URLSearchParams();
  if (country && country !== "all") params.set("country", country);
  if (packageId) params.set("package", packageId);
  if (date) params.set("date", date);
  return params;
}

export default function ToursPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const countryParam = searchParams.get("country");
  const packageParam = searchParams.get("package");
  const dateParam = searchParams.get("date") || "";
  const [activeFilter, setActiveFilter] = useState(() => {
    const resolvedPackage = resolvePackageFilterFromParams(packageParam);
    if (resolvedPackage && !countryParam) return "ghana";
    return resolveCountryFilterFromParams(countryParam);
  });
  const [activePackage, setActivePackage] = useState(() => resolvePackageFilterFromParams(packageParam));
  const [activeDate, setActiveDate] = useState(dateParam);
  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [tours, setTours] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterScrolled, setFilterScrolled] = useState(false);
  const [navOffset, setNavOffset] = useState(64);
  const filterRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const packageScrollContainerRef = useRef(null);

  const showPackageFilters = activeFilter === "ghana" || activeFilter === "all";

  const paginationMeta = useMemo(
    () => mapServerPagination(pagination, { page }),
    [pagination, page],
  );

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError("");

    const payload = buildListingsPayload({
      countryFilter: activePackage ? "ghana" : activeFilter,
      sort,
      departureDate: activeDate,
      packageFilter: activePackage,
    });
    const result = await publicListingsServiceApi.listListings(payload, { page, per_page: 15 });

    setLoading(false);

    if (!result.ok) {
      setTours([]);
      setPagination(null);
      setError(result.reason || result.message || "Could not load tours.");
      return;
    }

    setTours(result.items);
    setPagination(result.pagination);
  }, [activeFilter, activePackage, sort, page, activeDate]);

  useEffect(() => {
    const resolvedPackage = resolvePackageFilterFromParams(packageParam);
    setActivePackage(resolvedPackage);
    if (resolvedPackage && !countryParam) {
      setActiveFilter("ghana");
      return;
    }
    setActiveFilter(resolveCountryFilterFromParams(countryParam));
  }, [countryParam, packageParam]);

  useEffect(() => {
    setActiveDate(dateParam);
    setPage(1);
  }, [dateParam]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  useLayoutEffect(() => {
    const header = document.querySelector("header");
    if (!header) return undefined;

    const updateNavOffset = () => {
      setNavOffset(header.getBoundingClientRect().height);
    };

    updateNavOffset();

    const observer = new ResizeObserver(updateNavOffset);
    observer.observe(header);
    window.addEventListener("scroll", updateNavOffset, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateNavOffset);
    };
  }, []);

  useEffect(() => {
    function onScroll() {
      if (!filterRef.current) return;
      const rect = filterRef.current.getBoundingClientRect();
      setFilterScrolled(rect.top <= navOffset + 1);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [navOffset]);

  const visibleTours = useMemo(() => {
    let list = tours;

    if (activePackage) {
      list = list.filter((tour) => tourMatchesPackageLine(tour, activePackage));
    }

    if (activeDate) {
      list = list.filter((tour) => tourHasDepartureOnDate(tour, activeDate));
    }

    if (!search.trim()) return list;

    const query = search.toLowerCase();
    return list.filter(
      (tour) =>
        tour.name.toLowerCase().includes(query) ||
        tour.location.toLowerCase().includes(query) ||
        tour.country.toLowerCase().includes(query) ||
        tour.categories.some((category) => category.includes(query)),
    );
  }, [tours, search, activeDate, activePackage]);

  const applySearchParams = useCallback(({ country, date, package: packageId }) => {
    const params = buildToursSearchParams({ country, date, package: packageId });
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const handleFilter = useCallback((id) => {
    setPage(1);
    setActiveFilter(id);
    const keepPackage = id === "ghana" || id === "all";
    const nextPackage = keepPackage ? activePackage : "";
    if (!keepPackage) {
      setActivePackage("");
    }
    applySearchParams({
      country: id === "all" ? undefined : id,
      date: activeDate || undefined,
      package: nextPackage || undefined,
    });
    if (scrollContainerRef.current) {
      const button = scrollContainerRef.current.querySelector(`[data-country="${id}"]`);
      button?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }, [applySearchParams, activeDate, activePackage]);

  const handlePackageFilter = useCallback((packageId) => {
    setPage(1);
    const nextPackage = activePackage === packageId ? "" : packageId;
    setActivePackage(nextPackage);
    const nextCountry = nextPackage
      ? "ghana"
      : activeFilter === "all"
        ? undefined
        : activeFilter;
    if (nextPackage && activeFilter === "all") {
      setActiveFilter("ghana");
    }
    applySearchParams({
      country: nextCountry,
      date: activeDate || undefined,
      package: nextPackage || undefined,
    });
    if (packageScrollContainerRef.current) {
      const button = packageScrollContainerRef.current.querySelector(`[data-package="${packageId}"]`);
      button?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }, [activePackage, activeFilter, activeDate, applySearchParams]);

  function handleSortChange(value) {
    setPage(1);
    setSort(value);
  }

  function clearAll() {
    setPage(1);
    setActiveFilter("all");
    setActivePackage("");
    setActiveDate("");
    setSort("default");
    setSearch("");
    setSearchParams({}, { replace: true });
  }

  function clearDateFilter() {
    setPage(1);
    setActiveDate("");
    applySearchParams({
      country: activeFilter === "all" ? undefined : activeFilter,
      date: undefined,
      package: activePackage || undefined,
    });
  }

  function clearPackageFilter() {
    setPage(1);
    setActivePackage("");
    applySearchParams({
      country: activeFilter === "all" ? undefined : activeFilter,
      date: activeDate || undefined,
      package: undefined,
    });
  }

  const hasActiveFilters =
    activeFilter !== "all" ||
    Boolean(activePackage) ||
    sort !== "default" ||
    search.trim() !== "" ||
    Boolean(activeDate);

  return (
    <div className="min-h-screen max-w-full overflow-x-clip bg-brand-cream">
      {/* Page intro */}
      <section className="border-b border-brand-border/50 bg-white">
        <Container className="py-8 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-accent/25 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">
                <Compass className="h-3.5 w-3.5" aria-hidden />
                {toursPageSection.eyebrow}
              </span>
              <h1 className="mt-4 text-3xl font-bold text-brand-primary sm:text-4xl">{toursPageSection.title}</h1>
              <p className="mt-3 text-base leading-relaxed text-brand-muted">{toursPageSection.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {toursPageSection.highlights.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-border/60 bg-brand-cream/60 px-3.5 py-1.5 text-xs font-semibold text-brand-primary"
                >
                  <MapPin className="h-3 w-3" aria-hidden />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      <div
        ref={filterRef}
        style={{ top: navOffset }}
        className={[
          "sticky z-40 w-full max-w-full overflow-x-hidden border-b transition-all duration-300",
          filterScrolled
            ? "border-brand-border/60 bg-white/95 shadow-[0_4px_20px_-8px_rgba(21,67,96,0.12)] backdrop-blur-xl"
            : "border-brand-border/40 bg-white/90",
        ].join(" ")}
      >
        <div
          aria-hidden
          className="h-0.5 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='1' fill='%23154360' fill-opacity='0.06'/%3E%3C/svg%3E\")",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-full">
          <Container className="py-2.5 sm:py-3">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="flex flex-wrap items-center gap-x-3 gap-y-2"
            >
              <div className="flex shrink-0 items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-brand-primary sm:text-xl">Browse tours</h2>
                <span className="rounded-md bg-brand-accent/35 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-brand-primary">
                  {loading ? "…" : paginationMeta.totalItems || tours.length}
                </span>
              </div>

              <div className="relative min-w-0 w-full basis-full sm:basis-auto sm:flex-1 sm:max-w-xs lg:max-w-sm">
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
                  placeholder="Search tours…"
                  className="h-8 w-full rounded-full border border-brand-border/70 bg-white pl-8 pr-8 text-sm text-brand-ink placeholder:text-brand-muted/70 outline-none transition-all focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-accent/30"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-ink"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                ) : null}
              </div>

              <div className="shrink-0">
                <SortDropdown value={sort} onChange={handleSortChange} compact />
              </div>
            </motion.div>

            <div className="mt-2 flex w-full max-w-full min-w-0 items-center gap-2 overflow-hidden border-t border-brand-border/35 pt-2">
              <div
                ref={scrollContainerRef}
                className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {COUNTRY_FILTER_OPTIONS.map((option) => (
                  <div key={option.id} data-country={option.id}>
                    <FilterChip
                      option={option}
                      active={activeFilter === option.id}
                      onClick={handleFilter}
                    />
                  </div>
                ))}
              </div>

              {showPackageFilters ? (
                <>
                  <span className="h-3.5 w-px shrink-0 bg-brand-border/60" aria-hidden />
                  <div
                    ref={packageScrollContainerRef}
                    className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {PACKAGE_FILTER_OPTIONS.map((option) => (
                      <div key={option.id} data-package={option.id}>
                        <FilterChip
                          option={option}
                          active={activePackage === option.id}
                          onClick={handlePackageFilter}
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            <AnimatePresence>
              {hasActiveFilters ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 border-t border-brand-border/35 pt-2">
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                      {loading ? "…" : visibleTours.length}
                      {!search.trim() && paginationMeta.totalItems ? ` of ${paginationMeta.totalItems}` : ""}
                      tour{visibleTours.length === 1 ? "" : "s"}
                    </span>
                    <span className="shrink-0 text-brand-border">·</span>
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-brand-primary">
                      {describeActiveFilters(activeFilter, sort, activeDate, activePackage)}
                    </span>
                    {search.trim() ? (
                      <>
                        <span className="text-brand-border">·</span>
                        <span className="text-xs text-brand-muted">
                          &ldquo;<span className="font-medium text-brand-ink">{search}</span>&rdquo;
                        </span>
                      </>
                    ) : null}
                    {activeDate ? (
                      <button
                        type="button"
                        onClick={clearDateFilter}
                        className="rounded-full bg-brand-accent/25 px-2 py-0.5 text-[10px] font-semibold text-brand-primary hover:bg-brand-accent/40"
                      >
                        Clear date ×
                      </button>
                    ) : null}
                    {activePackage ? (
                      <button
                        type="button"
                        onClick={clearPackageFilter}
                        className="rounded-full bg-brand-accent/25 px-2 py-0.5 text-[10px] font-semibold text-brand-primary hover:bg-brand-accent/40"
                      >
                        Clear package ×
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={clearAll}
                      className="ml-auto shrink-0 text-[10px] font-semibold text-brand-muted underline-offset-2 hover:text-brand-ink hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </Container>
        </div>
      </div>

      <div className="pb-16 pt-6">
        <Container>
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[280px] items-center justify-center"
              >
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" strokeWidth={2} aria-hidden />
              </motion.div>
            ) : visibleTours.length > 0 ? (
              <motion.div
                key={`grid-${activeFilter}-${sort}-${page}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {visibleTours.map((tour, index) => (
                  <TourCard key={tour.slug} tour={tour} index={index} />
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
                <GuestIcon name="globe" className="h-12 w-12 text-brand-primary/40" />
                <p className="mt-4 text-lg font-semibold text-brand-ink">No tours found</p>
                <p className="mt-1.5 text-sm text-brand-muted">
                  {activeDate
                    ? "Try another departure date, country, or reset your filters."
                    : "Try another country or reset the sort filters."}
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-5 rounded-xl border border-brand-border bg-white px-6 py-2.5 text-sm font-semibold text-brand-primary shadow-sm transition-all hover:border-brand-primary/30 hover:bg-brand-accent/10"
                >
                  View all tours
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!loading && paginationMeta.totalPages > 1 ? (
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

          {visibleTours.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE }}
              className="relative mt-16 overflow-hidden rounded-3xl border border-brand-border/50 bg-white shadow-[0_24px_64px_-32px_rgba(21,67,96,0.18)]"
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
