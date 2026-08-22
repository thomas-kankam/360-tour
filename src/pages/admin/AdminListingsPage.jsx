import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Eye, Globe2, Loader2, Map, Search } from "lucide-react";
import { toast } from "react-toastify";
import adminListingsServiceApi from "../../apis/AdminListingsServiceApi";
import AdminPagination from "../../components/admin/AdminPagination";
import {
  AdminMobileCard,
  AdminMobileCardActions,
  AdminMobileCardBody,
  AdminMobileCardHeader,
  AdminMobileCardRow,
  AdminTableDesktop,
  AdminTableMobile,
  adminIconBtnClass,
  adminIconBtnViewClass,
} from "../../components/admin/AdminResponsiveTable";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue, useServerAdminPagination } from "../../hooks/useAdminPagination";
import { buildListQueryParams } from "../../utils/adminPaginationHelpers";
import { formatListingDate, LISTING_STATUS_STYLES } from "../../utils/adminListingHelpers";
import { formatTourSlotsLabel, getTourTypeLabel, isCustomTourType, isUnlimitedTourSlots } from "../../utils/operatorTourConstants";

const EASE = [0.22, 1, 0.36, 1];

const STATUS_FILTERS = [
  { id: "all", label: "All statuses" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Draft" },
  { id: "archived", label: "Archived" },
];

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${LISTING_STATUS_STYLES[status] ?? "bg-brand-cream text-brand-muted"}`}
    >
      {status || "draft"}
    </span>
  );
}

function ListingThumb({ listing }) {
  const src = listing.coverImageUrl || listing.coverImage?.uri;

  return (
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-brand-cream ring-1 ring-black/8">
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-brand-muted">
          <Globe2 className="h-4 w-4 opacity-40" strokeWidth={1.5} aria-hidden />
        </div>
      )}
    </div>
  );
}

function getListingSlots(listing) {
  return listing.groupSizeMax ?? listing.totalSlots;
}

function ListingSlotsDisplay({ slots }) {
  if (isUnlimitedTourSlots(slots)) {
    return (
      <span className="inline-flex rounded-full bg-brand-green/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-green ring-1 ring-brand-green/20">
        Unlimited
      </span>
    );
  }

  return <span className="text-sm text-brand-ink">{formatTourSlotsLabel(slots)}</span>;
}

export default function AdminListingsPage() {
  const { token } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearch = useDebouncedValue(search);
  const pagination = useServerAdminPagination({ resetKey: `${debouncedSearch}-${statusFilter}` });

  const loadListings = useCallback(async () => {
    setLoading(true);
    const result = await adminListingsServiceApi.listListings(
      token,
      buildListQueryParams({
        page: pagination.page,
        per_page: pagination.pageSize,
        search: debouncedSearch,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }),
    );
    setLoading(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    const { items, shouldRefetch } = pagination.syncFromResponse(
      { items: result.items, pagination: result.pagination },
      pagination.page,
    );
    if (shouldRefetch) return;

    setListings(items);
  }, [token, pagination, debouncedSearch, statusFilter]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const summary = useMemo(() => {
    const published = listings.filter((item) => item.status === "published").length;
    const custom = listings.filter((item) => isCustomTourType(item.tourType)).length;
    const bookings = listings.reduce((sum, item) => sum + (Number(item.bookingCount) || 0), 0);
    return { published, custom, bookings };
  }, [listings]);

  const isEmpty = !loading && listings.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">Listing management</p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-brand-ink">Tour listings</h1>
        <p className="mt-2 text-sm text-brand-muted">
          Review operator listings, capacity, and booking activity across the platform.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-black/8 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">On this page</p>
          <p className="mt-1 text-2xl font-bold text-brand-ink">{pagination.totalItems || listings.length}</p>
          <p className="mt-1 text-xs text-brand-muted">Total listings</p>
        </div>
        <div className="rounded-2xl border border-black/8 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Published</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{summary.published}</p>
          <p className="mt-1 text-xs text-brand-muted">{summary.custom} customized</p>
        </div>
        <div className="rounded-2xl border border-black/8 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Bookings (page)</p>
          <p className="mt-1 text-2xl font-bold text-brand-ink">{summary.bookings}</p>
          <p className="mt-1 text-xs text-brand-muted">Across visible listings</p>
        </div>
      </div>

      <div className="rounded-2xl border border-black/8 bg-white shadow-sm">
        <div className="border-b border-black/8 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" strokeWidth={2} aria-hidden />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tour, operator, location…"
                className="w-full rounded-xl border border-brand-border/70 bg-brand-cream/30 py-2.5 pl-10 pr-3 text-sm outline-none transition-shadow focus:border-brand-green focus:ring-2 focus:ring-brand-green/15"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setStatusFilter(filter.id)}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    statusFilter === filter.id
                      ? "bg-brand-ink text-white"
                      : "bg-brand-cream text-brand-muted hover:text-brand-ink",
                  ].join(" ")}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-green" strokeWidth={2} aria-hidden />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Map className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="text-base font-bold text-brand-ink">No listings found</p>
            <p className="max-w-sm text-sm text-brand-muted">
              {debouncedSearch || statusFilter !== "all"
                ? "Try adjusting your search or status filter."
                : "Operator tour listings will appear here once published."}
            </p>
          </div>
        ) : (
          <>
            <AdminTableMobile columns={1}>
              {listings.map((listing, index) => (
                <motion.div
                  key={listing.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE, delay: index * 0.03 }}
                >
                  <AdminMobileCard>
                    <AdminMobileCardHeader
                      title={listing.name}
                      subtitle={listing.operatorOrganization || listing.operatorName}
                      avatar={<ListingThumb listing={listing} />}
                      trailing={
                        <div className="flex flex-wrap items-center gap-1.5">
                          <StatusBadge status={listing.status} />
                          <span className="rounded-full bg-brand-accent/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-primary">
                            {getTourTypeLabel(listing.tourType)}
                          </span>
                        </div>
                      }
                    />
                    <AdminMobileCardBody>
                      <AdminMobileCardRow label="Route" value={listing.locationsLabel} />
                      <AdminMobileCardRow label="Price" value={listing.priceLabel} />
                      <AdminMobileCardRow
                        label="Capacity"
                        value={<ListingSlotsDisplay slots={getListingSlots(listing)} />}
                      />
                      <AdminMobileCardRow label="Bookings" value={listing.bookingCount ?? 0} />
                      <AdminMobileCardRow label="Updated" value={formatListingDate(listing.updatedAt)} />
                    </AdminMobileCardBody>
                    <AdminMobileCardActions>
                      <Link
                        to={ROUTES.admin.listingDetail(listing.slug)}
                        className={`${adminIconBtnClass} ${adminIconBtnViewClass}`}
                        aria-label={`View ${listing.name}`}
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                      </Link>
                    </AdminMobileCardActions>
                  </AdminMobileCard>
                </motion.div>
              ))}
            </AdminTableMobile>

            <AdminTableDesktop>
              <table className="w-full text-left">
                <thead className="border-b border-black/8 bg-brand-cream/50">
                  <tr>
                    {["Tour", "Operator", "Route", "Price", "Slots", "Bookings", "Status", "Actions"].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.slug} className="border-b border-black/5 last:border-0 hover:bg-brand-cream/30">
                      <td className="px-5 py-3.5">
                        <div className="flex min-w-[12rem] items-center gap-3">
                          <ListingThumb listing={listing} />
                          <div className="min-w-0">
                            <p className="line-clamp-1 font-semibold text-brand-ink">{listing.name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <span className="rounded-full bg-brand-accent/25 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-primary">
                                {getTourTypeLabel(listing.tourType)}
                              </span>
                              <span className="text-[10px] text-brand-muted">{listing.durationLabel}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="line-clamp-1 text-sm font-semibold text-brand-ink">
                          {listing.operatorOrganization || listing.operatorName || "—"}
                        </p>
                        <p className="line-clamp-1 text-xs text-brand-muted">{listing.operatorName}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-brand-muted">{listing.locationsLabel}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-brand-ink">{listing.priceLabel}</td>
                      <td className="px-5 py-3.5">
                        <ListingSlotsDisplay slots={getListingSlots(listing)} />
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-brand-ink">{listing.bookingCount ?? 0}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={listing.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          to={ROUTES.admin.listingDetail(listing.slug)}
                          className={`${adminIconBtnClass} ${adminIconBtnViewClass}`}
                          aria-label={`View ${listing.name}`}
                        >
                          <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableDesktop>
          </>
        )}

        {!loading && pagination.totalItems > 0 ? (
          <div className="border-t border-black/8 px-4 py-3 sm:px-5">
            <AdminPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              rangeStart={pagination.rangeStart}
              rangeEnd={pagination.rangeEnd}
              onPageChange={pagination.setPage}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
