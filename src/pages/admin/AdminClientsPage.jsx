import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Eye,
  Loader2,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import adminClientsServiceApi from "../../apis/AdminClientsServiceApi";
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
  formatAdminClientDate,
  getAdminClientStatusConfig,
  summarizeAdminClients,
} from "../../utils/adminClientHelpers";

const EASE = [0.22, 1, 0.36, 1];

const STATUS_FILTERS = [
  { id: "all", label: "All statuses" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "suspended", label: "Suspended" },
];

function StatusBadge({ client }) {
  const config = getAdminClientStatusConfig(client);
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${config.className}`}>
      {config.label}
    </span>
  );
}

function ClientAvatar({ client }) {
  if (client.profileImage) {
    return (
      <img
        src={client.profileImage}
        alt=""
        className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-black/8"
      />
    );
  }

  const initial = (client.firstName?.[0] || client.email?.[0] || "C").toUpperCase();

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sm font-bold text-sky-700 ring-1 ring-sky-200">
      {initial}
    </span>
  );
}

function VerifiedBadge({ client }) {
  if (!client.isVerified) {
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

export default function AdminClientsPage() {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearch = useDebouncedValue(search);
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

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function loadClients() {
      setLoading(true);
      const result = await adminClientsServiceApi.listClients(
        token,
        buildListQueryParams({
          page,
          per_page: pageSize,
          search: debouncedSearch,
          status: statusFilter !== "all" ? statusFilter : undefined,
        }),
      );

      if (cancelled) return;

      setLoading(false);

      if (!result.ok) {
        toast.error(result.reason || result.message);
        return;
      }

      const { items, shouldRefetch } = syncFromResponse(
        { items: result.items, pagination: result.pagination },
        page,
      );

      if (cancelled || shouldRefetch) return;

      setClients(items);
    }

    loadClients();

    return () => {
      cancelled = true;
    };
  }, [token, page, pageSize, syncFromResponse, debouncedSearch, statusFilter]);

  const pageSummary = useMemo(() => summarizeAdminClients(clients), [clients]);
  const isEmpty = !loading && clients.length === 0;
  const hasFilters = debouncedSearch || statusFilter !== "all";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">Client management</p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-brand-ink">Clients</h1>
        <p className="mt-2 text-sm text-brand-muted">
          View registered travelers — account status, verification, and contact details.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/8 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Total clients</p>
          <p className="mt-1 text-2xl font-bold text-brand-ink">{totalItems || clients.length}</p>
          <p className="mt-1 text-xs text-brand-muted">Across platform</p>
        </div>
        <div className="rounded-2xl border border-black/8 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Active (page)</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{pageSummary.active}</p>
          <p className="mt-1 text-xs text-brand-muted">On this page</p>
        </div>
        <div className="rounded-2xl border border-black/8 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Verified (page)</p>
          <p className="mt-1 text-2xl font-bold text-brand-green">{pageSummary.verified}</p>
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
                placeholder="Search by name, email, phone, or location…"
                className="w-full rounded-xl border border-brand-border/70 bg-brand-cream/30 py-2.5 pl-10 pr-3 text-sm outline-none transition-shadow focus:border-brand-green focus:ring-2 focus:ring-brand-green/15"
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
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600">
              <Users className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="text-base font-bold text-brand-ink">No clients found</p>
            <p className="max-w-sm text-sm text-brand-muted">
              {hasFilters
                ? "Try adjusting your search or filters."
                : "Registered traveler accounts will appear here."}
            </p>
          </div>
        ) : (
          <>
            <AdminTableMobile columns={1}>
              {clients.map((client, index) => (
                <motion.div
                  key={client.clientSlug || client.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE, delay: index * 0.03 }}
                >
                  <AdminMobileCard>
                    <AdminMobileCardHeader
                      title={client.name || "—"}
                      subtitle={client.email}
                      avatar={<ClientAvatar client={client} />}
                      trailing={
                        <div className="flex flex-wrap items-center gap-1">
                          <StatusBadge client={client} />
                          <VerifiedBadge client={client} />
                        </div>
                      }
                    />
                    <AdminMobileCardBody>
                      <AdminMobileCardRow label="Phone" value={client.phoneNumber || "—"} />
                      <AdminMobileCardRow
                        label="Location"
                        value={
                          client.location ? (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3 shrink-0 text-brand-muted" strokeWidth={2} aria-hidden />
                              {client.location}
                            </span>
                          ) : (
                            "—"
                          )
                        }
                      />
                      <AdminMobileCardRow label="Joined" value={formatAdminClientDate(client.createdAt)} />
                      <AdminMobileCardRow label="Verified" value={formatAdminClientDate(client.verifiedAt)} />
                    </AdminMobileCardBody>
                    <AdminMobileCardActions>
                      <Link
                        to={ROUTES.admin.clientDetail(client.clientSlug)}
                        className={`${adminIconBtnClass} ${adminIconBtnViewClass}`}
                        aria-label={`View ${client.name}`}
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
                    {["Client", "Contact", "Location", "Status", "Verified", "Joined", "Actions"].map((heading) => (
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
                  {clients.map((client) => (
                    <tr
                      key={client.clientSlug || client.id}
                      className="border-b border-black/5 last:border-0 hover:bg-brand-cream/30"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex min-w-[10rem] items-center gap-3">
                          <ClientAvatar client={client} />
                          <div className="min-w-0">
                            <p className="line-clamp-1 font-semibold text-brand-ink">{client.name || "—"}</p>
                            <p className="line-clamp-1 text-xs text-brand-muted">{client.clientSlug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="line-clamp-1 text-sm text-brand-ink">{client.email || "—"}</p>
                        <p className="line-clamp-1 text-xs text-brand-muted">{client.phoneNumber || "—"}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="line-clamp-2 max-w-[12rem] text-sm text-brand-ink">{client.location || "—"}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge client={client} />
                      </td>
                      <td className="px-5 py-3.5">
                        <VerifiedBadge client={client} />
                        {client.isVerified && client.verifiedAt ? (
                          <p className="mt-1 text-[10px] text-brand-muted">{formatAdminClientDate(client.verifiedAt)}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-brand-ink">{formatAdminClientDate(client.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <Link
                          to={ROUTES.admin.clientDetail(client.clientSlug)}
                          className={`${adminIconBtnClass} ${adminIconBtnViewClass}`}
                          aria-label={`View ${client.name}`}
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

        {!loading && totalItems > 0 ? (
          <div className="border-t border-black/8 px-4 py-3 sm:px-5">
            <AdminPagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
