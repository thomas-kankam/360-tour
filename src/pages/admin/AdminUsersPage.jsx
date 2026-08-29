import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Eye, Loader2, Pencil, Plus, Search, Trash2, UserCog, Users } from "lucide-react";
import { toast } from "react-toastify";
import adminUsersServiceApi from "../../apis/AdminUsersServiceApi";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";
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
  adminIconBtnDangerClass,
  adminIconBtnViewClass,
} from "../../components/admin/AdminResponsiveTable";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue, useServerAdminPagination } from "../../hooks/useAdminPagination";
import { buildListQueryParams } from "../../utils/adminPaginationHelpers";

const EASE = [0.22, 1, 0.36, 1];

function StatusBadge({ status }) {
  const styles =
    status === "active"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${styles}`}>
      {status || "unknown"}
    </span>
  );
}

function getAdminName(admin) {
  return [admin.first_name, admin.last_name].filter(Boolean).join(" ") || admin.email || "Admin";
}

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const pagination = useServerAdminPagination({ resetKey: debouncedSearch });

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    const result = await adminUsersServiceApi.listAdmins(
      token,
      buildListQueryParams({
        page: pagination.page,
        per_page: pagination.pageSize,
        search: debouncedSearch,
      })
    );
    setLoading(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    const { items, shouldRefetch } = pagination.syncFromResponse(result.data, pagination.page);
    if (shouldRefetch) return;

    setAdmins(items);
  }, [token, pagination, debouncedSearch]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const hasSearch = Boolean(debouncedSearch.trim());
  const isEmpty = !loading && admins.length === 0;

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    const result = await adminUsersServiceApi.deleteAdmin(token, deleteTarget.id);
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    toast.success(result.reason || "Admin deleted.");
    setDeleteTarget(null);
    loadAdmins();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">User management</p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-brand-ink">Admin accounts</h1>
          <p className="mt-2 max-w-2xl text-sm text-brand-muted">
            Create and manage administrator accounts, assign roles, and control platform access.
          </p>
        </div>
        <Link to={ROUTES.admin.userNew} className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm">
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
          Add admin
        </Link>
      </div>

      <div className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" strokeWidth={1.75} aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, or role..."
            className="w-full rounded-xl border-2 border-brand-border bg-white py-3 pl-10 pr-4 text-sm font-medium text-brand-ink outline-none transition-all focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-black/8 bg-white py-24">
          <Loader2 className="h-7 w-7 animate-spin text-brand-primary" aria-hidden />
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-black/12 bg-white py-20 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-brand-primary">
            <Users className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          </span>
          <p className="font-bold text-brand-ink">{hasSearch ? "No admins match your search" : "No admin accounts yet"}</p>
          <p className="max-w-sm text-sm text-brand-muted">
            {hasSearch ? "Try a different search term." : "Create the first administrator account to get started."}
          </p>
          {!hasSearch ? (
            <Link to={ROUTES.admin.userNew} className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
              <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
              Add admin
            </Link>
          ) : null}
        </div>
      ) : (
        <>
          <AdminTableMobile>
            {admins.map((admin, index) => (
              <motion.div
                key={admin.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: EASE, delay: index * 0.03 }}
              >
                <AdminMobileCard>
                  <AdminMobileCardHeader
                    avatar={
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-ink text-sm font-bold text-brand-gold">
                        {(admin.first_name?.[0] || admin.email?.[0] || "A").toUpperCase()}
                      </span>
                    }
                    title={getAdminName(admin)}
                    subtitle={admin.admin_slug}
                    trailing={<StatusBadge status={admin.status} />}
                  />
                  <AdminMobileCardBody>
                    <AdminMobileCardRow label="Email" value={admin.email} />
                    <AdminMobileCardRow label="Phone" value={admin.phone_number || "—"} />
                    <AdminMobileCardRow
                      label="Role"
                      value={
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/8 px-2.5 py-1 text-[11px] font-semibold text-brand-primary">
                          <UserCog className="h-3 w-3" strokeWidth={2} aria-hidden />
                          {admin.role?.name || "—"}
                        </span>
                      }
                    />
                  </AdminMobileCardBody>
                  <AdminMobileCardActions>
                    <Link
                      to={ROUTES.admin.userDetail(admin.id)}
                      className={`${adminIconBtnClass} ${adminIconBtnViewClass}`}
                      aria-label={`View ${getAdminName(admin)}`}
                    >
                      <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </Link>
                    <Link
                      to={ROUTES.admin.userEdit(admin.id)}
                      className={`${adminIconBtnClass} ${adminIconBtnViewClass}`}
                      aria-label={`Edit ${getAdminName(admin)}`}
                    >
                      <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(admin)}
                      className={`${adminIconBtnClass} ${adminIconBtnDangerClass}`}
                      aria-label={`Delete ${getAdminName(admin)}`}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </button>
                  </AdminMobileCardActions>
                </AdminMobileCard>
              </motion.div>
            ))}
          </AdminTableMobile>

          <AdminTableDesktop>
            <table className="w-full text-left">
              <thead className="border-b border-black/8 bg-brand-cream/50">
                <tr>
                  {["Admin", "Contact", "Role", "Status", "Actions"].map((heading) => (
                    <th key={heading} className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, index) => (
                  <motion.tr
                    key={admin.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: EASE, delay: index * 0.03 }}
                    className="border-b border-black/5 last:border-0 hover:bg-brand-cream/30"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-ink text-sm font-bold text-brand-gold">
                          {(admin.first_name?.[0] || admin.email?.[0] || "A").toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-brand-ink">{getAdminName(admin)}</p>
                          <p className="text-xs text-brand-muted">{admin.admin_slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-brand-ink">{admin.email}</p>
                      <p className="text-xs text-brand-muted">{admin.phone_number || "—"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/8 px-2.5 py-1 text-[11px] font-semibold text-brand-primary">
                        <UserCog className="h-3 w-3" strokeWidth={2} aria-hidden />
                        {admin.role?.name || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={admin.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={ROUTES.admin.userDetail(admin.id)}
                          className={`${adminIconBtnClass} ${adminIconBtnViewClass}`}
                          aria-label={`View ${getAdminName(admin)}`}
                        >
                          <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                        </Link>
                        <Link
                          to={ROUTES.admin.userEdit(admin.id)}
                          className={`${adminIconBtnClass} ${adminIconBtnViewClass}`}
                          aria-label={`Edit ${getAdminName(admin)}`}
                        >
                          <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(admin)}
                          className={`${adminIconBtnClass} ${adminIconBtnDangerClass}`}
                          aria-label={`Delete ${getAdminName(admin)}`}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </AdminTableDesktop>

          <AdminPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            rangeStart={pagination.rangeStart}
            rangeEnd={pagination.rangeEnd}
            onPageChange={pagination.setPage}
          />
        </>
      )}

      <AdminConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete admin account"
        itemLabel={deleteTarget ? getAdminName(deleteTarget) : ""}
        message="This action cannot be undone. The administrator will lose access immediately."
        loading={deleting}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
