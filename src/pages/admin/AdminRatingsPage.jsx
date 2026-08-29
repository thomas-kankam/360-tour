import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check, Loader2, Search, Star, X } from "lucide-react";
import { toast } from "react-toastify";
import adminRatingsServiceApi from "../../apis/AdminRatingsServiceApi";
import AdminPagination from "../../components/admin/AdminPagination";
import {
  AdminMobileCard,
  AdminMobileCardBody,
  AdminMobileCardHeader,
  AdminMobileCardRow,
  AdminTableDesktop,
  AdminTableMobile,
} from "../../components/admin/AdminResponsiveTable";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue, useServerAdminPagination } from "../../hooks/useAdminPagination";
import { buildListQueryParams } from "../../utils/adminPaginationHelpers";

const EASE = [0.22, 1, 0.36, 1];

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

function StarDisplay({ value }) {
  const rounded = Math.round(Number(value) || 0);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={[
            "h-3.5 w-3.5",
            index < rounded ? "fill-brand-accent text-brand-accent" : "text-brand-border",
          ].join(" ")}
          strokeWidth={1.5}
          aria-hidden
        />
      ))}
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[status] ?? "bg-brand-cream text-brand-muted"}`}
    >
      {status || "pending"}
    </span>
  );
}

function RatingActions({ rating, updating, onApprove, onReject }) {
  const isUpdating = updating === rating.id;
  const isPending = (rating.status || "pending") === "pending";

  if (!isPending) {
    return <StatusBadge status={rating.status} />;
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        disabled={isUpdating}
        onClick={() => onApprove(rating.id)}
        className="inline-flex h-9 items-center gap-1 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
        Approve
      </button>
      <button
        type="button"
        disabled={isUpdating}
        onClick={() => onReject(rating.id)}
        className="inline-flex h-9 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
        Reject
      </button>
    </div>
  );
}

export default function AdminRatingsPage() {
  const { token } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const {
    page,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    rangeStart,
    rangeEnd,
    syncFromResponse,
  } = useServerAdminPagination({ resetKey: `${debouncedSearch}-${statusFilter}` });

  const loadRatings = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    const params = buildListQueryParams({
      page,
      per_page: pageSize,
      search: debouncedSearch,
      status: statusFilter !== "all" ? statusFilter : undefined,
    });

    const result = await adminRatingsServiceApi.listRatings(token, params);
    setLoading(false);

    if (!result.ok) {
      toast.error(result.reason || result.message || "Could not load ratings.");
      setRatings([]);
      return;
    }

    const { items, shouldRefetch } = syncFromResponse(
      { items: result.items, pagination: result.pagination },
      page,
    );

    if (shouldRefetch) return;
    setRatings(items ?? []);
  }, [token, page, pageSize, debouncedSearch, statusFilter, syncFromResponse]);

  useEffect(() => {
    loadRatings();
  }, [loadRatings]);

  async function handleStatusUpdate(id, status) {
    setUpdatingId(id);
    const result = await adminRatingsServiceApi.updateRatingStatus(token, id, status);
    setUpdatingId(null);

    if (!result.ok) {
      toast.error(result.reason || result.message || "Could not update rating.");
      return;
    }

    toast.success(status === "approved" ? "Review approved" : "Review rejected");
    loadRatings();
  }

  const stats = useMemo(() => {
    const pending = ratings.filter((item) => (item.status || "pending") === "pending").length;
    const approved = ratings.filter((item) => item.status === "approved").length;
    const rejected = ratings.filter((item) => item.status === "rejected").length;
    return { pending, approved, rejected };
  }, [ratings]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-primary">Moderation</p>
        <h1 className="mt-1 text-2xl font-bold text-brand-ink sm:text-3xl">Ratings & reviews</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          Review traveler feedback on tours. Approve comments to publish them on tour pages, or reject entries that do not meet your standards.
        </p>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Pending", value: stats.pending, tone: "border-amber-200 bg-amber-50 text-amber-800" },
          { label: "Approved", value: stats.approved, tone: "border-emerald-200 bg-emerald-50 text-emerald-800" },
          { label: "Rejected", value: stats.rejected, tone: "border-red-200 bg-red-50 text-red-700" },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl border px-5 py-4 ${item.tone}`}>
            <p className="text-2xl font-bold">{loading ? "…" : item.value}</p>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide opacity-80">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-brand-border/60 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" strokeWidth={1.75} aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by tour, client, or comment…"
              className="h-10 w-full rounded-xl border border-brand-border/70 bg-white pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/15"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => {
                  setStatusFilter(filter.id);
                  setPage(1);
                }}
                className={[
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  statusFilter === filter.id
                    ? "bg-brand-primary text-white"
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
        <div className="flex items-center justify-center py-20 text-brand-muted">
          <Loader2 className="h-6 w-6 animate-spin" strokeWidth={1.75} aria-hidden />
        </div>
      ) : ratings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-border/70 bg-white px-6 py-16 text-center">
          <Star className="mx-auto h-8 w-8 text-brand-muted/40" strokeWidth={1.5} aria-hidden />
          <p className="mt-3 text-sm font-semibold text-brand-ink">No reviews to moderate yet</p>
          <p className="mt-1 text-sm text-brand-muted">Submitted tour reviews will appear here for approval.</p>
        </div>
      ) : (
        <>
          <AdminTableMobile>
            {ratings.map((rating) => (
              <AdminMobileCard key={rating.id}>
                <AdminMobileCardHeader
                  title={rating.tourTitle}
                  subtitle={rating.clientName}
                  badge={<StatusBadge status={rating.status} />}
                />
                <AdminMobileCardBody>
                  <AdminMobileCardRow label="Rating" value={<StarDisplay value={rating.rating} />} />
                  <AdminMobileCardRow label="Comment" value={rating.comment || "No comment"} />
                  <div className="pt-2">
                    <RatingActions
                      rating={rating}
                      updating={updatingId}
                      onApprove={(id) => handleStatusUpdate(id, "approved")}
                      onReject={(id) => handleStatusUpdate(id, "rejected")}
                    />
                  </div>
                </AdminMobileCardBody>
              </AdminMobileCard>
            ))}
          </AdminTableMobile>

          <AdminTableDesktop>
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-brand-border/50 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">
                  <th className="px-5 py-3">Tour</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Rating</th>
                  <th className="px-5 py-3">Comment</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((rating, index) => (
                  <motion.tr
                    key={rating.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.03, ease: EASE }}
                    className="border-b border-brand-border/30 last:border-0 hover:bg-brand-cream/30"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-brand-ink">{rating.tourTitle}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-brand-ink">{rating.clientName}</p>
                      {rating.clientEmail ? <p className="text-xs text-brand-muted">{rating.clientEmail}</p> : null}
                    </td>
                    <td className="px-5 py-4">
                      <StarDisplay value={rating.rating} />
                    </td>
                    <td className="max-w-xs px-5 py-4">
                      <p className="line-clamp-3 text-sm text-brand-muted">{rating.comment || "No comment"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={rating.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <RatingActions
                          rating={rating}
                          updating={updatingId}
                          onApprove={(id) => handleStatusUpdate(id, "approved")}
                          onReject={(id) => handleStatusUpdate(id, "rejected")}
                        />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </AdminTableDesktop>
        </>
      )}

      {!loading && totalItems > 0 ? (
        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
