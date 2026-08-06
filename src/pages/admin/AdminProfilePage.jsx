import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Camera, CheckCircle2, Loader2, Save, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import adminAuthServiceApi from "../../apis/AdminAuthServiceApi";
import { useAuth } from "../../hooks/useAuth";
import { getImagePreviewSrc, readImageFile } from "../../utils/tourImageUtils";

const EASE = [0.22, 1, 0.36, 1];
const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024;

function getInitialForm(user) {
  return {
    first_name: user?.firstName || "",
    last_name: user?.lastName || "",
    email: user?.email || "",
  };
}

function validateProfileForm(form) {
  const errors = {};
  const firstName = form.first_name.trim();
  const lastName = form.last_name.trim();
  const email = form.email.trim();

  if (!firstName) errors.first_name = "First name is required.";
  else if (firstName.length < 2) errors.first_name = "Must be at least 2 characters.";

  if (!lastName) errors.last_name = "Last name is required.";
  else if (lastName.length < 2) errors.last_name = "Must be at least 2 characters.";

  if (!email) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  return errors;
}

function FormField({ field, label, hint, error, children }) {
  return (
    <div data-field={field}>
      <label htmlFor={field} className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-[11px] text-brand-muted">{hint}</p> : null}
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

export default function AdminProfilePage() {
  const { user, token, login, logout } = useAuth();
  const permissions = user?.permissions ?? [];
  const profileInputRef = useRef(null);

  const [form, setForm] = useState(() => getInitialForm(user));
  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(user?.profileImage || "");
  const [profileError, setProfileError] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageRemoved, setImageRemoved] = useState(false);

  useEffect(() => {
    setForm(getInitialForm(user));
    setProfilePreview(user?.profileImage || "");
    setProfileImage(null);
    setImageRemoved(false);
    setErrors({});
  }, [user]);

  const handleFieldChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  async function handleProfileImageChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setProfileError("Profile photo must be under 2 MB.");
      return;
    }

    try {
      const image = await readImageFile(file);
      setProfileImage(image);
      setProfilePreview(getImagePreviewSrc(image));
      setProfileError("");
      setImageRemoved(false);
    } catch (err) {
      setProfileError(err.message || "Could not read image.");
    }
  }

  function clearProfilePhoto() {
    setProfileImage(null);
    setProfilePreview("");
    setProfileError("");
    setImageRemoved(true);
    if (profileInputRef.current) profileInputRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validateProfileForm(form);
    setErrors(nextErrors);
    if (profileError) return;
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
    };

    if (profileImage) {
      payload.profile_image = getImagePreviewSrc(profileImage);
    } else if (imageRemoved) {
      payload.profile_image = "";
    }

    setSaving(true);
    const result = await adminAuthServiceApi.updateProfile(token, payload);
    setSaving(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    if (result.user && token) {
      login(token, result.user);
      setProfilePreview(result.user.profileImage || "");
    }

    toast.success(result.reason || result.message || "Profile updated successfully.");
    setProfileImage(null);
    setImageRemoved(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">Admin account</p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-brand-ink">Profile</h1>
        <p className="mt-2 text-sm text-brand-muted">
          Update your administrator details and profile photo.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          onSubmit={handleSubmit}
          className="space-y-5 lg:col-span-3"
        >
          <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-brand-border bg-brand-cream/40 transition-all hover:border-brand-green hover:ring-4 hover:ring-brand-green/10"
              >
                {profilePreview ? (
                  <img src={profilePreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-8 w-8 text-brand-muted transition-colors group-hover:text-brand-green" aria-hidden />
                )}
              </button>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />
              <div className="text-center sm:text-left">
                <p className="text-sm font-bold text-brand-ink">Profile photo</p>
                <p className="mt-1 text-xs text-brand-muted">Optional. JPG or PNG, max 2 MB.</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <button
                    type="button"
                    onClick={() => profileInputRef.current?.click()}
                    className="rounded-xl border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-ink transition-colors hover:border-brand-green/30 hover:bg-brand-green/5"
                  >
                    Upload photo
                  </button>
                  {(profilePreview || user?.profileImage) && !imageRemoved ? (
                    <button
                      type="button"
                      onClick={clearProfilePhoto}
                      className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                      Remove
                    </button>
                  ) : null}
                </div>
                {profileError ? <p className="mt-2 text-xs font-medium text-red-500">{profileError}</p> : null}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField field="first_name" label="First name" error={errors.first_name}>
                <input
                  id="first_name"
                  type="text"
                  value={form.first_name}
                  onChange={(e) => handleFieldChange("first_name", e.target.value)}
                  className={inputClass(Boolean(errors.first_name))}
                  autoComplete="given-name"
                />
              </FormField>

              <FormField field="last_name" label="Last name" error={errors.last_name}>
                <input
                  id="last_name"
                  type="text"
                  value={form.last_name}
                  onChange={(e) => handleFieldChange("last_name", e.target.value)}
                  className={inputClass(Boolean(errors.last_name))}
                  autoComplete="family-name"
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField field="email" label="Email" hint="Used for login and account contact." error={errors.email}>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    className={inputClass(Boolean(errors.email))}
                    autoComplete="email"
                  />
                </FormField>
              </div>
            </div>

            <dl className="mt-6 grid gap-3 border-t border-black/8 pt-6 sm:grid-cols-2">
              {[
                ["Phone", user?.phone || "—"],
                ["Admin slug", user?.slug || "—"],
                ["Status", user?.status || "active"],
                ["Role", user?.roleLabel || user?.roleSlug || "—"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-black/8 bg-brand-cream/50 p-4">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-muted">{label}</dt>
                  <dd className="mt-1 break-words text-sm font-semibold text-brand-ink">{value}</dd>
                </div>
              ))}
            </dl>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
              Save changes
            </button>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
          >
            Sign out of admin console
          </button>
        </motion.form>

        <aside className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl bg-brand-ink p-6 text-white">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-brand-gold" strokeWidth={1.75} aria-hidden />
              <p className="text-sm font-bold text-brand-gold">Access permissions</p>
            </div>
            <p className="mt-2 text-xs text-white/50">
              {permissions.length} active module{permissions.length !== 1 ? "s" : ""}
            </p>
            <div className="mt-4 space-y-2">
              {permissions.map((p) => (
                <div key={p.name} className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                  <p className="text-sm text-white/80">{p.label}</p>
                </div>
              ))}
              {permissions.length === 0 && (
                <p className="rounded-xl bg-white/5 px-3 py-3 text-sm text-white/40">No permissions assigned.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
