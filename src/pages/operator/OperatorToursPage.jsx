import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { toast } from "react-toastify";
import {
  CalendarDays,
  ChevronRight,
  Globe2,
  Loader2,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import operatorToursServiceApi from "../../apis/OperatorToursServiceApi";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";
import AdminPagination from "../../components/admin/AdminPagination";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue, useServerAdminPagination } from "../../hooks/useAdminPagination";
import { buildListQueryParams } from "../../utils/adminPaginationHelpers";
import { buildLocationsLabel } from "../../utils/operatorTourMapper";
import { formatTourSlotsLabel, isCustomTourType, TOUR_TYPE } from "../../utils/operatorTourConstants";

/** Admin lands on a short "latest listings" view; the full paginated catalog is one click away. */
const LATEST_LIMIT = 4;

const TYPE_FILTERS = [
  { id: "all", label: "All types" },
  { id: TOUR_TYPE.REGULAR, label: "Regular" },
  { id: TOUR_TYPE.CUSTOM, label: "Customized" },
];

const EASE = [0.22, 1, 0.36, 1];

function statusPill(status) {
  const map = {
    published: "bg-brand-green/10 text-brand-green ring-brand-green/20",
    draft: "bg-brand-gold/15 text-brand-ink ring-brand-gold/25",
    archived: "bg-brand-muted/10 text-brand-muted ring-brand-border",
  };
  return map[status] || map.draft;
}

function TourCard({ tour, index, onDeleteRequest }) {
  const routeLabel = buildLocationsLabel(tour.locations);
  const isCustom = isCustomTourType(tour.tourType);
  const nextDeparture = tour.departureDates?.find((d) => d.date)?.dateLabel;
  const detailPath = tour.slug ? ROUTES.operator.tourDetail(tour.slug) : null;

  const card = (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: EASE }}
      className="group overflow-hidden rounded-xl border border-brand-border/60 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-brand-cream">
        {tour.coverImageUrl ? (
          <img
            src={tour.coverImageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-muted">
            <Globe2 className="h-8 w-8 opacity-30" strokeWidth={1.5} aria-hidden />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-transparent to-transparent" />
        <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ring-1 ${statusPill(tour.status)}`}>
          {tour.status}
        </span>
        {isCustom ? (
          <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-brand-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-charcoal shadow-sm">
            <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
            Customized
          </span>
        ) : null}
        {tour.regionLabels?.length ? (
          <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-primary">
            {tour.regionLabels[0]}
          </span>
        ) : null}
      </div>

      <div className="p-3.5">
        <h2 className="line-clamp-2 font-heading text-sm font-bold leading-snug text-brand-ink">{tour.name || "Untitled listing"}</h2>

        {routeLabel ? (
          <p className="mt-1.5 flex items-start gap-1 text-[11px] text-brand-muted">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
            <span className="line-clamp-1">{routeLabel}</span>
          </p>
        ) : null}

        <div className="mt-2.5 flex flex-wrap gap-2 text-[10px] font-medium text-brand-muted">
          <span className="inline-flex items-center gap-0.5">
            <CalendarDays className="h-3 w-3" strokeWidth={2} aria-hidden />
            {tour.durationLabel || `${tour.durationDays} days`}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Users className="h-3 w-3" strokeWidth={2} aria-hidden />
            {formatTourSlotsLabel(tour.groupSizeMax)}
          </span>
          {tour.rating > 0 ? (
            <span className="inline-flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-brand-gold text-brand-gold" strokeWidth={0} aria-hidden />
              {Number(tour.rating).toFixed(1)}
            </span>
          ) : null}
        </div>

        <div className="mt-2.5 flex items-end justify-between gap-2 border-t border-brand-border/50 pt-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-brand-green">{tour.priceLabel || `$${tour.priceAmount}`}</p>
            {isCustom ? (
              <p className="truncate text-[10px] text-brand-muted">Dates on request</p>
            ) : nextDeparture ? (
              <p className="truncate text-[10px] text-brand-muted">Next: {nextDeparture}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteRequest(tour);
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-brand-muted transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label={`Delete ${tour.name || "listing"}`}
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </button>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-brand-green transition-colors group-hover:text-brand-green-dark">
              View details
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );

  if (!detailPath) return card;

  return (
    <Link to={detailPath} className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40">
      {card}
    </Link>
  );
}

export default function OperatorToursPage() {
  const { token } = useAuth();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebouncedValue(search);
  const { page, setPage, syncFromResponse, totalItems, totalPages, rangeStart, rangeEnd } = useServerAdminPagination({
    resetKey: `${debouncedSearch}|${typeFilter}`,
  });

  const loadTours = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    const params = buildListQueryParams({ page, per_page: 15, search: debouncedSearch });
    if (typeFilter !== "all") params.tour_type = typeFilter;
    const result = await operatorToursServiceApi.listTours(token, params);
    setLoading(false);

    if (!result.ok) {
      setTours([]);
      return;
    }

    const sync = syncFromResponse({ items: result.items, pagination: result.pagination }, page);
    setTours(sync.items);
  }, [token, page, debouncedSearch, typeFilter, syncFromResponse]);

  useEffect(() => {
    loadTours();
  }, [loadTours]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return tours;
    return tours.filter((t) => t.status === statusFilter);
  }, [tours, statusFilter]);

  /** Search, pagination, or an explicit "view all" all mean the operator wants the full catalog. */
  const expanded = showAll || Boolean(debouncedSearch.trim()) || page > 1;
  const visible = expanded ? filtered : filtered.slice(0, LATEST_LIMIT);
  const hiddenCount = Math.max((totalItems || filtered.length) - visible.length, 0);

  const publishedCount = useMemo(() => tours.filter((t) => t.status === "published").length, [tours]);

  async function handleDelete() {
    if (!token || !deleteTarget?.slug) return;

    setDeleting(true);
    const result = await operatorToursServiceApi.deleteTour(token, deleteTarget.slug);
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    toast.success(result.reason || "Tour deleted.");
    setDeleteTarget(null);
    loadTours();
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-brand-border/60 bg-gradient-to-br from-brand-ink via-[#243832] to-brand-green p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">Your catalog</p>
            <h1 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">Tour listings</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
              Create rich multi-city experiences, publish to 360 Tours, and manage departures from one place.
            </p>
          </div>
          <Link to={ROUTES.operator.tourNew} className="btn-primary inline-flex items-center gap-2 bg-white text-brand-ink hover:bg-brand-cream">
            <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            New listing
          </Link>
        </div>

        <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Total listings", value: totalItems || tours.length },
            { label: "On this page", value: tours.length },
            { label: "Published", value: publishedCount },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-brand-border/60 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" strokeWidth={2} aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings…"
            className="w-full rounded-xl border-2 border-brand-border bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-brand-ink outline-none transition-all focus:border-brand-green focus:ring-2 focus:ring-brand-green/15"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTypeFilter(f.id)}
              aria-pressed={typeFilter === f.id}
              className={[
                "rounded-full px-4 py-2 text-xs font-semibold transition-all",
                typeFilter === f.id
                  ? "bg-brand-accent text-brand-charcoal shadow-sm"
                  : "bg-brand-cream text-brand-muted ring-1 ring-brand-border hover:text-brand-ink",
              ].join(" ")}
            >
              {f.label}
            </button>
          ))}
          <span className="hidden w-px self-stretch bg-brand-border/70 sm:block" aria-hidden />
          {["all", "published", "draft", "archived"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              aria-pressed={statusFilter === f}
              className={[
                "rounded-full px-4 py-2 text-xs font-semibold capitalize transition-all",
                statusFilter === f ? "bg-brand-green text-white shadow-sm" : "bg-brand-cream text-brand-muted ring-1 ring-brand-border hover:text-brand-ink",
              ].join(" ")}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-brand-border/60 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-brand-green" strokeWidth={2} aria-hidden />
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-border bg-white px-6 py-16 text-center">
          <Globe2 className="mx-auto h-12 w-12 text-brand-muted/40" strokeWidth={1.5} aria-hidden />
          <p className="mt-4 text-lg font-semibold text-brand-ink">No listings yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-brand-muted">
            Build your first multi-city tour — add cities in order, set departures, and publish when you are ready.
          </p>
          <Link to={ROUTES.operator.tourNew} className="btn-primary mt-6 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            Create your first listing
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-brand-ink">
                {expanded ? "All listings" : "Latest listings"}
              </h2>
              <p className="mt-0.5 text-xs text-brand-muted">
                {expanded
                  ? `Showing ${visible.length} of ${totalItems || visible.length}`
                  : `The ${visible.length} most recent listings`}
              </p>
            </div>
            {expanded ? (
              !debouncedSearch.trim() && page === 1 ? (
                <button
                  type="button"
                  onClick={() => setShowAll(false)}
                  className="inline-flex items-center gap-1 rounded-full border border-brand-border bg-white px-4 py-2 text-xs font-semibold text-brand-ink transition-colors hover:border-brand-green/40 hover:text-brand-green"
                >
                  Show latest only
                </button>
              ) : null
            ) : hiddenCount > 0 ? (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="inline-flex items-center gap-1 rounded-full bg-brand-green px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-green-dark"
              >
                View all {totalItems || filtered.length} listings
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((tour, index) => (
              <TourCard
                key={tour.slug || tour.name}
                tour={tour}
                index={index}
                onDeleteRequest={setDeleteTarget}
              />
            ))}
          </div>

          {expanded ? (
            <AdminPagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}

      <AdminConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete tour listing?"
        itemLabel={deleteTarget?.name}
        message="This will permanently remove the listing, its departures, and gallery images. This action cannot be undone."
        confirmLabel="Delete listing"
        loading={deleting}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
