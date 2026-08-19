import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Check,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import adminRolesServiceApi from "../../apis/AdminRolesServiceApi";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";
import AdminModal from "../../components/admin/AdminModal";
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
import { useServerAdminPagination } from "../../hooks/useAdminPagination";
import { buildListQueryParams, parsePaginatedList } from "../../utils/adminPaginationHelpers";

const EASE = [0.22, 1, 0.36, 1];
const TABS = [
  { id: "roles", label: "Roles", icon: Shield },
  { id: "permissions", label: "Permissions", icon: KeyRound },
];

function PermissionBadge({ permission }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-green/8 px-2.5 py-1 text-[11px] font-semibold text-brand-green">
      {permission.label}
    </span>
  );
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-black/12 bg-white py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-brand-green">
        <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
      </span>
      <div>
        <p className="font-bold text-brand-ink">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-brand-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

function PermissionsPanel({ token }) {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const pagination = useServerAdminPagination();

  const loadPermissions = useCallback(async () => {
    setLoading(true);
    const result = await adminRolesServiceApi.listPermissions(
      token,
      buildListQueryParams({ page: pagination.page, per_page: pagination.pageSize })
    );
    setLoading(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    const { items, shouldRefetch } = pagination.syncFromResponse(result.data, pagination.page);
    if (shouldRefetch) return;

    setPermissions(items);
  }, [token, pagination]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const isEmpty = !loading && permissions.length === 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-brand-ink">Permissions</h2>
        <p className="text-sm text-brand-muted">
          System-defined access modules. View only — assign them to roles on the Roles tab.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-black/8 bg-white py-20">
          <Loader2 className="h-7 w-7 animate-spin text-brand-green" aria-hidden />
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={KeyRound}
          title="No permissions found"
          description="Permission modules are managed by the system and will appear here when available."
        />
      ) : (
        <>
          <AdminTableMobile columns={2}>
            {permissions.map((permission, index) => (
              <motion.div
                key={permission.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: EASE, delay: index * 0.03 }}
              >
                <AdminMobileCard>
                  <AdminMobileCardHeader title={permission.label} subtitle="Permission module" />
                  <AdminMobileCardBody>
                    <AdminMobileCardRow
                      label="System name"
                      value={
                        <code className="rounded-lg bg-brand-cream px-2 py-1 text-xs text-brand-muted">
                          {permission.name}
                        </code>
                      }
                    />
                  </AdminMobileCardBody>
                </AdminMobileCard>
              </motion.div>
            ))}
          </AdminTableMobile>

          <AdminTableDesktop>
            <table className="w-full text-left">
              <thead className="border-b border-black/8 bg-brand-cream/50">
                <tr>
                  {["Label", "System name"].map((heading) => (
                    <th key={heading} className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission, index) => (
                  <motion.tr
                    key={permission.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: EASE, delay: index * 0.03 }}
                    className="border-b border-black/5 last:border-0 hover:bg-brand-cream/30"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-brand-ink">{permission.label}</p>
                    </td>
                    <td className="px-5 py-4">
                      <code className="rounded-lg bg-brand-cream px-2 py-1 text-xs text-brand-muted">{permission.name}</code>
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
    </div>
  );
}

function RolesPanel({ token }) {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [fieldError, setFieldError] = useState("");
  const pagination = useServerAdminPagination();

  const loadPermissionsForModal = useCallback(async () => {
    const result = await adminRolesServiceApi.listPermissions(
      token,
      buildListQueryParams({ page: 1, per_page: 100 })
    );

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    setPermissions(parsePaginatedList(result.data).items);
  }, [token]);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    const result = await adminRolesServiceApi.listRoles(
      token,
      buildListQueryParams({ page: pagination.page, per_page: pagination.pageSize })
    );
    setLoading(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    const { items, shouldRefetch } = pagination.syncFromResponse(result.data, pagination.page);
    if (shouldRefetch) return;

    setRoles(items);
  }, [token, pagination]);

  useEffect(() => {
    loadPermissionsForModal();
  }, [loadPermissionsForModal]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  function openCreateModal() {
    setEditing(null);
    setName("");
    setSelectedIds([]);
    setFieldError("");
    setModalOpen(true);
  }

  function openEditModal(role) {
    setEditing(role);
    setName(role.name);
    setSelectedIds((role.permissions ?? []).map((p) => p.id));
    setFieldError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
    setName("");
    setSelectedIds([]);
    setFieldError("");
  }

  function togglePermission(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFieldError("Role name is required.");
      return;
    }

    if (selectedIds.length === 0) {
      setFieldError("Select at least one permission.");
      return;
    }

    setSaving(true);
    setFieldError("");

    const payload = { name: trimmed, permissions: selectedIds };
    const result = editing
      ? await adminRolesServiceApi.updateRole(token, editing.id, payload)
      : await adminRolesServiceApi.createRole(token, payload);

    setSaving(false);

    if (!result.ok) {
      setFieldError(result.reason || result.message);
      toast.error(result.reason || result.message);
      return;
    }

    toast.success(result.reason || (editing ? "Role updated." : "Role created."));
    closeModal();
    loadRoles();
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setSaving(true);
    const result = await adminRolesServiceApi.deleteRole(token, deleteTarget.id);
    setSaving(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    toast.success(result.reason || "Role deleted.");
    setDeleteTarget(null);
    loadRoles();
  }

  const isEmpty = !loading && roles.length === 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-brand-ink">Roles</h2>
          <p className="text-sm text-brand-muted">Group permissions into roles and assign them to administrators.</p>
        </div>
        <button type="button" onClick={openCreateModal} className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm">
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
          New role
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-black/8 bg-white py-20">
          <Loader2 className="h-7 w-7 animate-spin text-brand-green" aria-hidden />
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={Shield}
          title="No roles yet"
          description="Create a role and assign permissions to control admin access."
          action={
            <button type="button" onClick={openCreateModal} className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
              <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
              Create role
            </button>
          }
        />
      ) : (
        <>
        <div className="grid gap-4 lg:grid-cols-2">
          {roles.map((role, index) => (
            <motion.article
              key={role.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE, delay: index * 0.04 }}
              className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-ink text-brand-gold">
                    <Users className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-bold text-brand-ink">{role.name}</h3>
                    <p className="text-xs text-brand-muted">
                      {(role.permissions ?? []).length} permission{(role.permissions ?? []).length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(role)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border/60 text-brand-muted transition-colors hover:border-brand-green/30 hover:bg-brand-green/5 hover:text-brand-green"
                    aria-label={`Edit ${role.name}`}
                  >
                    <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(role)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border/60 text-brand-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete ${role.name}`}
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {(role.permissions ?? []).length === 0 ? (
                  <span className="text-xs text-brand-muted">No permissions assigned</span>
                ) : (
                  role.permissions.map((permission) => <PermissionBadge key={permission.id} permission={permission} />)
                )}
              </div>
            </motion.article>
          ))}
        </div>

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

      <AdminModal
        open={modalOpen}
        title={editing ? "Edit role" : "Create role"}
        subtitle="Choose a name and assign the permissions this role should have."
        onClose={closeModal}
        footer={
          <>
            <button type="button" onClick={closeModal} disabled={saving} className="btn-secondary px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              form="role-form"
              disabled={saving}
              className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {editing ? "Save role" : "Create role"}
            </button>
          </>
        }
      >
        <form id="role-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="role-name" className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
              Role name
            </label>
            <input
              id="role-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldError) setFieldError("");
              }}
              placeholder="e.g. Developer"
              className={[
                "mt-2 w-full rounded-xl border-2 bg-white px-4 py-3 text-sm font-medium text-brand-ink outline-none transition-all focus:ring-2",
                fieldError && !name.trim()
                  ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                  : "border-brand-border focus:border-brand-green focus:ring-brand-green/15",
              ].join(" ")}
            />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">Permissions</p>
              <span className="text-xs font-semibold text-brand-green">{selectedIds.length} selected</span>
            </div>

            {permissions.length === 0 ? (
              <p className="rounded-xl bg-brand-cream/60 px-4 py-3 text-sm text-brand-muted">
                No permissions available from the system yet.
              </p>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-brand-border/60 bg-brand-cream/30 p-3">
                {permissions.map((permission) => {
                  const checked = selectedIds.includes(permission.id);
                  return (
                    <label
                      key={permission.id}
                      className={[
                        "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition-colors",
                        checked
                          ? "border-brand-green/30 bg-brand-green/8"
                          : "border-transparent bg-white hover:border-brand-border/60",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePermission(permission.id)}
                        className="sr-only"
                      />
                      <span
                        className={[
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                          checked ? "border-brand-green bg-brand-green text-white" : "border-brand-border bg-white",
                        ].join(" ")}
                      >
                        {checked ? <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-brand-ink">{permission.label}</span>
                        <span className="block text-xs text-brand-muted">{permission.name}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {fieldError ? <p className="mt-2 text-xs font-medium text-red-500">{fieldError}</p> : null}
          </div>
        </form>
      </AdminModal>

      <AdminConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete role"
        itemLabel={deleteTarget?.name}
        message="This action cannot be undone. Administrators assigned to this role may lose access."
        loading={saving}
        onClose={() => !saving && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default function AdminRolesPage() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState("roles");
  const myPermissions = user?.permissions ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">Role management</p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-brand-ink">Roles & permissions</h1>
          <p className="mt-2 max-w-2xl text-sm text-brand-muted">
            View system permissions and bundle them into roles to control what each administrator can access.
          </p>
        </div>

        <div className="rounded-2xl border border-black/8 bg-white px-4 py-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Your role</p>
          <p className="mt-0.5 text-sm font-bold text-brand-ink">{user?.roleLabel || user?.roleSlug || "Administrator"}</p>
          <p className="text-xs text-brand-muted">{myPermissions.length} active permissions</p>
        </div>
      </div>

      <div className="inline-flex rounded-2xl border border-black/8 bg-white p-1 shadow-sm">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={[
              "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
              activeTab === id ? "bg-brand-ink text-white shadow-sm" : "text-brand-muted hover:bg-brand-cream hover:text-brand-ink",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            {label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="rounded-2xl border border-black/8 bg-brand-cream/20 p-5 sm:p-6"
      >
        {activeTab === "roles" ? <RolesPanel token={token} /> : <PermissionsPanel token={token} />}
      </motion.div>
    </div>
  );
}
