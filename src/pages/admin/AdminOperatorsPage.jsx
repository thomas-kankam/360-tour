import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Eye,
  Loader2,
  MapPin,
  Search,
  Store,
} from "lucide-react";
import { toast } from "react-toastify";
import adminOperatorsServiceApi from "../../apis/AdminOperatorsServiceApi";
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
import {
  formatAdminOperatorDate,
  getAdminOperatorStatusConfig,
  summarizeAdminOperators,
} from "../../utils/adminOperatorHelpers";

const EASE = [0.22, 1, 0.36, 1];

const STATUS_FILTERS = [
  { id: "all", label: "All statuses" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "suspended", label: "Suspended" },
];

const VERIFIED_FILTERS = [
  { id: "all", label: "All operators" },
  { id: "verified", label: "Verified" },
  { id: "unverified", label: "Unverified" },
];

function StatusBadge({ operator }) {
  const config = getAdminOperatorStatusConfig(operator);
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${config.className}`}>
      {config.label}
    </span>
  );
}

function VerifiedBadge({ operator }) {
  if (!operator.isVerified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-cream px-2 py-0.5 text-[10px] font-semibold text-brand-muted">
        Unverified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
      <CheckCircle2 className="h-3 w-3" strokeWidth={2} aria-hidden />
      Verified
    </span>
  );
}

function OperatorAvatar({ operator }) {
  if (operator.profileImage) {
    return (
      <img
        src={operator.profileImage}
        alt=""
        className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-black/8"
      />
    );
  }

  const initial = (operator.organization?.[0] || operator.firstName?.[0] || operator.email?.[0] || "O").toUpperCase();

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-accent/25 text-sm font-bold text-brand-primary ring-1 ring-brand-accent/30">
      {initial}
    </span>
  );
}

function resolveVerifiedParam(filter) {
  if (filter === "verified") return true;
  if (filter === "unverified") return false;
  return undefined;
}

export default function AdminOperatorsPage() {
  const { token } = useAuth();
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const debouncedSearch = useDebouncedValue(search);
  const pagination = useServerAdminPagination({
    resetKey: `${debouncedSearch}-${statusFilter}-${verifiedFilter}`,
  });

  const loadOperators = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    const result = await adminOperatorsServiceApi.listOperators(
      token,
      buildListQueryParams({
        page: pagination.page,
        per_page: pagination.pageSize,
        search: debouncedSearch,
        status: statusFilter !== "all" ? statusFilter : undefined,
        is_verified: resolveVerifiedParam(verifiedFilter),
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

    setOperators(items);
  }, [token, pagination, debouncedSearch, statusFilter, verifiedFilter]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    loadOperators();
  }, [token, loadOperators]);

  const pageSummary = useMemo(() => summarizeAdminOperators(operators), [operators]);
  const isEmpty = !loading && operators.length === 0;
  const hasFilters = debouncedSearch || statusFilter !== "all" || verifiedFilter !== "all";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">Operator management</p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-brand-ink">Operators</h1>
        <p className="mt-2 text-sm text-brand-muted">
          View tour operators on the platform — verification status, organization details, and contact info.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/8 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Total operators</p>
          <p className="mt-1 text-2xl font-bold text-brand-ink">{pagination.totalItems || operators.length}</p>
          <p className="mt-1 text-xs text-brand-muted">Matching filters</p>
        </div>
        <div className="rounded-2xl border border-black/8 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Active (page)</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{pageSummary.active}</p>
          <p className="mt-1 text-xs text-brand-muted">On this page</p>
        </div>
        <div className="rounded-2xl border border-black/8 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Verified (page)</p>
          <p className="mt-1 text-2xl font-bold text-brand-primary">{pageSummary.verified}</p>
          <p className="mt-1 text-xs text-brand-muted">Email verified</p>
        </div>
      </div>

      <div className="rounded-2xl border border-black/8 bg-white shadow-sm">
        <div className="border-b border-black/8 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3">
            <div className="relative max-w-md flex-1">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted"
                strokeWidth={2}
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, organization, email, or location…"
                className="w-full rounded-xl border border-brand-border/70 bg-brand-cream/30 py-2.5 pl-10 pr-3 text-sm outline-none transition-shadow focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(filter.id);
                    pagination.setPage(1);
                  }}
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
              <span className="mx-1 hidden h-6 w-px bg-black/10 sm:block" aria-hidden />
              {VERIFIED_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => {
                    setVerifiedFilter(filter.id);
                    pagination.setPage(1);
                  }}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    verifiedFilter === filter.id
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
          <div className="flex min-h-[280px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" strokeWidth={2} aria-hidden />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent/25 text-brand-primary">
              <Store className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="text-base font-bold text-brand-ink">No operators found</p>
            <p className="max-w-sm text-sm text-brand-muted">
              {hasFilters
                ? "Try adjusting your search or filters."
                : "Registered tour operator accounts will appear here."}
            </p>
          </div>
        ) : (
          <>
            <AdminTableMobile columns={1}>
              {operators.map((operator, index) => (
                <motion.div
                  key={operator.operatorSlug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE, delay: index * 0.03 }}
                >
                  <AdminMobileCard>
                    <AdminMobileCardHeader
                      title={operator.organization || operator.name || "—"}
                      subtitle={operator.name || operator.email}
                      avatar={<OperatorAvatar operator={operator} />}
                      trailing={
                        <div className="flex flex-wrap items-center gap-1">
                          <StatusBadge operator={operator} />
                          <VerifiedBadge operator={operator} />
                        </div>
                      }
                    />
                    <AdminMobileCardBody>
                      <AdminMobileCardRow label="Email" value={operator.email || "—"} />
                      <AdminMobileCardRow label="Phone" value={operator.phoneNumber || "—"} />
                      <AdminMobileCardRow
                        label="Location"
                        value={
                          operator.location ? (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3 shrink-0 text-brand-muted" strokeWidth={2} aria-hidden />
                              {operator.location}
                            </span>
                          ) : (
                            "—"
                          )
                        }
                      />
                      <AdminMobileCardRow label="Joined" value={formatAdminOperatorDate(operator.createdAt)} />
                    </AdminMobileCardBody>
                    <AdminMobileCardActions>
                      <Link
                        to={ROUTES.admin.operatorDetail(operator.operatorSlug)}
                        className={`${adminIconBtnClass} ${adminIconBtnViewClass}`}
                        aria-label={`View ${operator.organization || operator.name}`}
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
                    {["Operator", "Contact", "Location", "Status", "Verified", "Joined", "Actions"].map((heading) => (
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
                  {operators.map((operator) => (
                    <tr
                      key={operator.operatorSlug}
                      className="border-b border-black/5 last:border-0 hover:bg-brand-cream/30"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex min-w-[11rem] items-center gap-3">
                          <OperatorAvatar operator={operator} />
                          <div className="min-w-0">
                            <p className="line-clamp-1 font-semibold text-brand-ink">
                              {operator.organization || operator.name || "—"}
                            </p>
                            <p className="line-clamp-1 text-xs text-brand-muted">{operator.name || operator.operatorSlug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="line-clamp-1 text-sm text-brand-ink">{operator.email || "—"}</p>
                        <p className="line-clamp-1 text-xs text-brand-muted">{operator.phoneNumber || "—"}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="line-clamp-2 max-w-[12rem] text-sm text-brand-ink">{operator.location || "—"}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge operator={operator} />
                      </td>
                      <td className="px-5 py-3.5">
                        <VerifiedBadge operator={operator} />
                        {operator.isVerified && operator.verifiedAt ? (
                          <p className="mt-1 text-[10px] text-brand-muted">{formatAdminOperatorDate(operator.verifiedAt)}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-brand-ink">{formatAdminOperatorDate(operator.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <Link
                          to={ROUTES.admin.operatorDetail(operator.operatorSlug)}
                          className={`${adminIconBtnClass} ${adminIconBtnViewClass}`}
                          aria-label={`View ${operator.organization || operator.name}`}
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
