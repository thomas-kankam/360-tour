import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Shield,
  Trash2,
  UserCog,
} from "lucide-react";
import { toast } from "react-toastify";
import adminUsersServiceApi from "../../apis/AdminUsersServiceApi";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";

const EASE = [0.22, 1, 0.36, 1];

function getAdminName(admin) {
  if (!admin) return "Admin";
  return [admin.first_name, admin.last_name].filter(Boolean).join(" ") || admin.email || "Admin";
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-black/8 bg-brand-cream/40 px-4 py-3.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-green">
        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-muted">{label}</p>
        <p className="mt-0.5 break-words text-sm font-semibold text-brand-ink">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadAdmin = useCallback(async () => {
    setLoading(true);
    const result = await adminUsersServiceApi.getAdmin(token, id);
    setLoading(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      navigate(ROUTES.admin.users, { replace: true });
      return;
    }

    setAdmin(result.data);
  }, [token, id, navigate]);

  useEffect(() => {
    loadAdmin();
  }, [loadAdmin]);

  async function handleDelete() {
    setDeleting(true);
    const result = await adminUsersServiceApi.deleteAdmin(token, id);
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    toast.success(result.reason || "Admin deleted.");
    navigate(ROUTES.admin.users, { replace: true });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-black/8 bg-white py-24">
        <Loader2 className="h-7 w-7 animate-spin text-brand-green" aria-hidden />
      </div>
    );
  }

  if (!admin) return null;

  const permissions = admin.role?.permissions ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to={ROUTES.admin.users}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted transition-colors hover:text-brand-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          Back to admin accounts
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.admin.userEdit(admin.id)}
            className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Delete
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm"
      >
        <div className="bg-brand-ink px-6 py-8 sm:px-8">
          <div className="flex flex-wrap items-center gap-5">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gold text-2xl font-bold text-brand-ink">
              {(admin.first_name?.[0] || admin.email?.[0] || "A").toUpperCase()}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">Administrator</p>
              <h1 className="mt-1 font-heading text-3xl font-bold text-white">{getAdminName(admin)}</h1>
              <p className="mt-1 text-sm text-white/60">{admin.admin_slug}</p>
            </div>
            <span className="ml-auto rounded-full bg-white/10 px-3 py-1 text-xs font-bold capitalize text-white">
              {admin.status || "active"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-5 lg:p-8">
          <section className="space-y-3 lg:col-span-3">
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-brand-muted">Contact details</h2>
            <InfoRow icon={Mail} label="Email" value={admin.email} />
            <InfoRow icon={Phone} label="Phone" value={admin.phone_number} />
            <InfoRow icon={Calendar} label="Created" value={formatDate(admin.created_at)} />
            <InfoRow icon={Calendar} label="Last updated" value={formatDate(admin.updated_at)} />
          </section>

          <aside className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-black/8 bg-brand-cream/30 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
                  <UserCog className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-muted">Assigned role</p>
                  <p className="font-bold text-brand-ink">{admin.role?.name || "—"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-black/8 bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-brand-green" strokeWidth={1.75} aria-hidden />
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">
                  Permissions ({permissions.length})
                </p>
              </div>
              {permissions.length === 0 ? (
                <p className="text-sm text-brand-muted">No permissions assigned to this role.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {permissions.map((permission) => (
                    <span
                      key={permission.id}
                      className="rounded-full bg-brand-green/8 px-2.5 py-1 text-[11px] font-semibold text-brand-green"
                    >
                      {permission.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </motion.div>

      <AdminConfirmModal
        open={deleteOpen}
        title="Delete admin account"
        itemLabel={getAdminName(admin)}
        message="This action cannot be undone. The administrator will lose access immediately."
        loading={deleting}
        onClose={() => !deleting && setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
