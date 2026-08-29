import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  BadgeCheck,
  Building2,
  Camera,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import operatorAuthServiceApi from "../../apis/OperatorAuthServiceApi";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { normalizePhoneForApi } from "../../utils/phoneUtils";
import { resolveProfileImageSrc, uploadProfilePhoto } from "../../utils/profileImage";

const EASE = [0.22, 1, 0.36, 1];
function getInitialForm(user) {
  return {
    first_name: user?.firstName || "",
    last_name: user?.lastName || "",
    organization: user?.organization || "",
    location: user?.location || "",
  };
}

function validateProfileForm(form) {
  const errors = {};
  const firstName = form.first_name.trim();
  const lastName = form.last_name.trim();
  const organization = form.organization.trim();
  const location = form.location.trim();

  if (!firstName) errors.first_name = "First name is required.";
  else if (firstName.length < 2) errors.first_name = "Must be at least 2 characters.";

  if (!lastName) errors.last_name = "Last name is required.";
  else if (lastName.length < 2) errors.last_name = "Must be at least 2 characters.";

  if (!organization) errors.organization = "Organization name is required.";

  if (!location) errors.location = "Location is required.";

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
      : "border-brand-border focus:border-brand-primary focus:ring-brand-primary/15",
  ].join(" ");
}

function ReadOnlyContactField({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-brand-border/60 bg-brand-cream/40 px-4 py-3.5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-primary shadow-sm">
          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-muted">{label}</p>
          <p className="mt-0.5 break-words text-sm font-semibold text-brand-ink">{value || "—"}</p>
        </div>
        <Lock className="mt-1 h-3.5 w-3.5 shrink-0 text-brand-muted/50" strokeWidth={2} aria-hidden />
      </div>
    </div>
  );
}

export default function OperatorProfilePage() {
  const { user, token, login } = useAuth();
  const profileInputRef = useRef(null);

  const [form, setForm] = useState(() => getInitialForm(user));
  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(() => resolveProfileImageSrc(user?.profileImage));
  const [profileError, setProfileError] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageRemoved, setImageRemoved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm(getInitialForm(user));
    setProfilePreview(resolveProfileImageSrc(user.profileImage));
    setProfileImage(null);
    setImageRemoved(false);
    setErrors({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.firstName, user?.lastName, user?.organization, user?.location, user?.profileImage]);

  const handleFieldChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  async function handleProfileImageChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      if (!token) {
        setProfileError("Sign in again to upload a photo.");
        return;
      }
      const result = await uploadProfilePhoto(token, file, "admin");
      if (!result.ok || !result.url) {
        setProfileError(result.reason || "Could not upload photo.");
        return;
      }
      setProfileImage(result.url);
      setProfilePreview(result.url);
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

    if (!user?.email || !user?.phone) {
      toast.error("Your account is missing email or phone. Please contact support.");
      return;
    }

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      organization: form.organization.trim(),
      location: form.location.trim(),
      email: user.email,
      phone_number: normalizePhoneForApi(user.phone),
    };

    if (profileImage) {
      payload.profile_image = profileImage;
    } else if (imageRemoved) {
      payload.profile_image = "";
    }

    setSaving(true);
    const result = await operatorAuthServiceApi.updateProfile(token, payload);
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
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">Account</p>
        <h1 className="mt-1 font-heading text-3xl text-brand-ink sm:text-4xl">Operator profile</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          Update your operator details and organization info. Email and phone changes require our support team.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
          onSubmit={handleSubmit}
          className="space-y-5 lg:col-span-3"
        >
          <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-brand-border bg-brand-cream/40 transition-all hover:border-brand-primary hover:ring-4 hover:ring-brand-primary/10"
              >
                {profilePreview ? (
                  <img src={profilePreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-8 w-8 text-brand-muted transition-colors group-hover:text-brand-primary" aria-hidden />
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
                    className="rounded-xl border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-ink transition-colors hover:border-brand-primary/30 hover:bg-brand-primary/5"
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
                <FormField field="organization" label="Organization / site name" error={errors.organization}>
                  <input
                    id="organization"
                    type="text"
                    value={form.organization}
                    onChange={(e) => handleFieldChange("organization", e.target.value)}
                    className={inputClass(Boolean(errors.organization))}
                    placeholder="e.g. Toms Villa"
                  />
                </FormField>
              </div>

              <div className="sm:col-span-2">
                <FormField field="location" label="Location" error={errors.location}>
                  <input
                    id="location"
                    type="text"
                    value={form.location}
                    onChange={(e) => handleFieldChange("location", e.target.value)}
                    className={inputClass(Boolean(errors.location))}
                    autoComplete="address-level2"
                    placeholder="e.g. Accra, Off Kanda Road"
                  />
                </FormField>
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-brand-border/60 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">Locked details</p>
              <ReadOnlyContactField icon={Mail} label="Email" value={user?.email} />
              <ReadOnlyContactField icon={Phone} label="Phone" value={user?.phone} />
              <p className="text-xs leading-relaxed text-brand-muted">
                To update your email or phone,{" "}
                <Link to={ROUTES.contact} className="font-semibold text-brand-primary hover:underline">
                  contact our support team
                </Link>
                .
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              )}
              Save changes
            </button>
          </div>
        </motion.form>

        <motion.aside
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
          className="space-y-4 lg:col-span-2"
        >
          <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-brand-ink text-brand-gold">
                {resolveProfileImageSrc(user?.profileImage) ? (
                  <img src={resolveProfileImageSrc(user.profileImage)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-brand-ink">{user?.organization || "Your organization"}</p>
                <p className="truncate text-xs text-brand-muted">{user?.slug || "—"}</p>
              </div>
            </div>

            <dl className="mt-5 space-y-3">
              {[
                ["Operator", user?.name || "—"],
                ["Status", user?.status || "active"],
                ["Location", user?.location || "—"],
                ["Verified", user?.isVerified ? "Yes" : "No"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 rounded-xl bg-brand-cream/50 px-4 py-3">
                  <dt className="text-xs font-semibold text-brand-muted">{label}</dt>
                  <dd className="text-sm font-semibold capitalize text-brand-ink">{value}</dd>
                </div>
              ))}
            </dl>

            {user?.isVerified ? (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-primary/10 px-4 py-3 text-sm font-semibold text-brand-primary">
                <BadgeCheck className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                Verified operator
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-black/8 bg-brand-cream/40 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-primary shadow-sm">
                <MapPin className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <p className="text-sm font-bold text-brand-ink">Need to change contact info?</p>
                <p className="mt-1 text-xs leading-relaxed text-brand-muted">
                  For security, email and phone updates are handled manually by our team.
                </p>
                <Link
                  to={ROUTES.contact}
                  className="mt-3 inline-flex text-sm font-semibold text-brand-primary hover:underline"
                >
                  Go to contact page
                </Link>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
