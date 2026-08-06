import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Loader2, Save, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import adminRolesServiceApi from "../../apis/AdminRolesServiceApi";
import adminUsersServiceApi from "../../apis/AdminUsersServiceApi";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { scrollToFirstFormError, validateAdminUserForm } from "../../utils/adminUserFormValidation";
import { parsePaginatedList } from "../../utils/adminPaginationHelpers";
import { normalizePhoneForApi } from "../../utils/phoneUtils";

const EASE = [0.22, 1, 0.36, 1];
const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  role_id: "",
};

function FormField({ field, label, error, children }) {
  return (
    <div data-field={field}>
      <label htmlFor={field} className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p> : null}
    </div>
  );
}

function inputClass(hasError) {
  return [
    "mt-2 w-full rounded-xl border-2 bg-white px-4 py-3 text-sm font-medium text-brand-ink outline-none transition-all focus:ring-2",
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-brand-border focus:border-brand-green focus:ring-brand-green/15",
  ].join(" ");
}

export default function AdminUserFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadRoles = useCallback(async () => {
    const result = await adminRolesServiceApi.listRoles(token, { page: 1, per_page: 100 });
    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }
    setRoles(parsePaginatedList(result.data).items);
  }, [token]);

  const loadAdmin = useCallback(async () => {
    if (!isEdit) return;

    setLoading(true);
    const result = await adminUsersServiceApi.getAdmin(token, id);
    setLoading(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      navigate(ROUTES.admin.users, { replace: true });
      return;
    }

    const admin = result.data;
    setForm({
      first_name: admin.first_name || "",
      last_name: admin.last_name || "",
      email: admin.email || "",
      phone_number: admin.phone_number || "",
      role_id: admin.role?.id ? String(admin.role.id) : "",
    });
  }, [token, id, isEdit, navigate]);

  useEffect(() => {
    loadRoles();
    loadAdmin();
  }, [loadRoles, loadAdmin]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function buildPayload() {
    return {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone_number: normalizePhoneForApi(form.phone_number),
      role_id: Number(form.role_id),
    };
  }

  function validateForm() {
    const nextErrors = validateAdminUserForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstFormError(nextErrors);
      return false;
    }

    return true;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEdit) {
      setConfirmOpen(true);
      return;
    }

    submitCreate();
  }

  async function submitCreate() {
    setSaving(true);
    const result = await adminUsersServiceApi.createAdmin(token, buildPayload());
    setSaving(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    toast.success(result.reason || "Admin created.");
    navigate(ROUTES.admin.userDetail(result.data.id), { replace: true });
  }

  async function submitUpdate() {
    setSaving(true);
    const result = await adminUsersServiceApi.updateAdmin(token, id, buildPayload());
    setSaving(false);
    setConfirmOpen(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    toast.success(result.reason || "Admin updated.");
    navigate(ROUTES.admin.userDetail(id), { replace: true });
  }

  function handleConfirmUpdate() {
    if (!validateForm()) {
      setConfirmOpen(false);
      return;
    }
    submitUpdate();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-black/8 bg-white py-24">
        <Loader2 className="h-7 w-7 animate-spin text-brand-green" aria-hidden />
      </div>
    );
  }

  const adminName = [form.first_name, form.last_name].filter(Boolean).join(" ") || "this admin";

  return (
    <div className="space-y-6">
      <Link
        to={isEdit ? ROUTES.admin.userDetail(id) : ROUTES.admin.users}
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted transition-colors hover:text-brand-ink"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        {isEdit ? "Back to admin profile" : "Back to admin accounts"}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="w-full"
      >
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
            {isEdit ? "Edit admin" : "New admin"}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-brand-ink">
            {isEdit ? "Update administrator" : "Create administrator"}
          </h1>
          <p className="mt-2 text-sm text-brand-muted">
            {isEdit
              ? "Update account details and role assignment for this administrator."
              : "Add a new administrator and assign their access role."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-black/8 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField field="first_name" label="First name" error={errors.first_name}>
              <input
                id="first_name"
                type="text"
                value={form.first_name}
                onChange={(e) => updateField("first_name", e.target.value)}
                placeholder="John"
                className={inputClass(errors.first_name)}
              />
            </FormField>

            <FormField field="last_name" label="Last name" error={errors.last_name}>
              <input
                id="last_name"
                type="text"
                value={form.last_name}
                onChange={(e) => updateField("last_name", e.target.value)}
                placeholder="Doe"
                className={inputClass(errors.last_name)}
              />
            </FormField>
          </div>

          <FormField field="email" label="Email address" error={errors.email}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="admin@email.com"
              className={inputClass(errors.email)}
            />
          </FormField>

          <FormField field="phone_number" label="Phone number" error={errors.phone_number}>
            <input
              id="phone_number"
              type="tel"
              autoComplete="tel"
              value={form.phone_number}
              onChange={(e) => updateField("phone_number", e.target.value)}
              placeholder="233261923244"
              className={inputClass(errors.phone_number)}
            />
          </FormField>

          <FormField field="role_id" label="Role" error={errors.role_id}>
            <select
              id="role_id"
              value={form.role_id}
              onChange={(e) => updateField("role_id", e.target.value)}
              className={inputClass(errors.role_id)}
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex flex-col-reverse gap-3 border-t border-black/8 pt-6 sm:flex-row sm:justify-end">
            <Link
              to={isEdit ? ROUTES.admin.userDetail(id) : ROUTES.admin.users}
              className="btn-secondary inline-flex items-center justify-center px-4 py-2.5 text-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : isEdit ? (
                <Save className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              ) : (
                <UserPlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              )}
              {isEdit ? "Save changes" : "Create admin"}
            </button>
          </div>
        </form>
      </motion.div>

      <AdminConfirmModal
        open={confirmOpen}
        variant="primary"
        title="Confirm update"
        itemLabel={adminName}
        message="Review the changes before updating this administrator account."
        confirmLabel="Confirm update"
        loading={saving}
        onClose={() => !saving && setConfirmOpen(false)}
        onConfirm={handleConfirmUpdate}
      />
    </div>
  );
}
