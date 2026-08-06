import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "react-toastify";
import { Camera, Mail, Building2, MapPin, ShieldCheck } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { resolvePostAuthRedirect, ROLE_META, USER_ROLES } from "../../constants/roles";
import { useAuth } from "../../hooks/useAuth";
import { images } from "../../config/images";
import OtpInput from "../../components/misc/OtpInput";
import InternationalPhoneInput from "../../components/forms/InternationalPhoneInput";
import AccountTypePicker from "../../components/auth/AccountTypePicker";
import AppIcon from "../../components/icons/AppIcon";
import consumerAuthServiceApi from "../../apis/ConsumerAuthServiceApi";
import operatorAuthServiceApi from "../../apis/OperatorAuthServiceApi";
import { useResendCooldown } from "../../hooks/useResendCooldown";
import { normalizePhoneForApi, phoneNumberHasCountryCode } from "../../utils/phoneUtils";
import { isValidPhoneNumber } from "react-phone-number-input";
import { getImagePreviewSrc, readImageFile } from "../../utils/tourImageUtils";

const EASE = [0.16, 1, 0.3, 1];

const slideIn = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.42, ease: EASE },
};

const perks = [
  { icon: "map", text: "Save & track your tour inquiries" },
  { icon: "bell", text: "Get early access to new itineraries" },
  { icon: "message-circle", text: "Direct line to your travel consultant" },
  { icon: "globe", text: "Exclusive group travel offers" },
];

const operatorPerks = [
  { icon: "landmark", text: "Publish and manage your site listings" },
  { icon: "calendar", text: "Control departures and availability" },
  { icon: "clipboard-list", text: "Track bookings from travelers worldwide" },
  { icon: "shield", text: "Verified operator profile on AfriQuest" },
];

const OPERATOR_OTP_RESEND_COOLDOWN = 15;
const OPERATOR_VERIFY_TYPE = "registration";
const OPERATOR_RESEND_TYPE = "registeration";

export default function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const presetRole = location.state?.role;
  const returnPath = location.state?.from?.pathname;
  const isBookingReturn = Boolean(returnPath?.includes("/book"));

  const [step, setStep] = useState(isBookingReturn ? "details" : "role"); // "role" | "details" | "otp"
  const [role, setRole] = useState(presetRole || USER_ROLES.TOURIST);
  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    phone: "",
    organization: "",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [otpError, setOtpError] = useState("");
  const [otpHint, setOtpHint] = useState("");
  const { cooldown: resendCooldown, isCoolingDown, startCooldown } = useResendCooldown();
  const [profilePreview, setProfilePreview] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileError, setProfileError] = useState("");
  const profileInputRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isBookingReturn) return;
    setRole(USER_ROLES.TOURIST);
    setStep((current) => (current === "role" ? "details" : current));
  }, [isBookingReturn]);

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  function validateField(field, val) {
    const v = val.trim();
    switch (field) {
      case "firstName":
        if (!v) return "First name is required.";
        if (v.length < 2) return "Must be at least 2 characters.";
        return "";
      case "lastName":
        if (!v) return "Last name is required.";
        if (v.length < 2) return "Must be at least 2 characters.";
        return "";
      case "email":
        if (!v) return "Email address is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
        return "";
      case "location":
        if (!v) return "Location is required.";
        return "";
      case "phone":
        if (!v) return "Phone number is required.";
        if (!isValidPhoneNumber(v)) return "Enter a valid phone number.";
        if (!phoneNumberHasCountryCode(v)) return "Enter a valid phone number with country code.";
        return "";
      case "organization":
        if (role === USER_ROLES.SITE_OPERATOR && !v) return "Organization or site name is required.";
        return "";
      default:
        return "";
    }
  }

  function handleBlur(field) {
    setTouched((p) => ({ ...p, [field]: true }));
    setErrors((p) => ({ ...p, [field]: validateField(field, fields[field]) }));
  }

  function handleFieldChange(field, val) {
    setFields((p) => ({ ...p, [field]: val }));
    if (touched[field]) {
      setErrors((p) => ({ ...p, [field]: validateField(field, val) }));
    }
  }

  async function handleProfileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Profile photo must be under 2 MB.");
      return;
    }

    try {
      const image = await readImageFile(file);
      const dataUri = getImagePreviewSrc(image);
      setProfilePreview(dataUri);
      setProfileImage(dataUri);
      setProfileError("");
    } catch (err) {
      setProfileError(err.message || "Could not read image.");
    }
  }

  function clearProfilePhoto() {
    setProfilePreview("");
    setProfileImage("");
    setProfileError("");
    if (profileInputRef.current) profileInputRef.current.value = "";
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    const allFields = ["firstName", "lastName", "email", "location", "phone"];
    if (role === USER_ROLES.SITE_OPERATOR) allFields.push("organization");
    const allTouched = Object.fromEntries(allFields.map((f) => [f, true]));
    const allErrors = Object.fromEntries(allFields.map((f) => [f, validateField(f, fields[f])]));
    setTouched(allTouched);
    setErrors(allErrors);
    if (allFields.some((f) => allErrors[f])) return;

    setLoading(true);

    if (role === USER_ROLES.TOURIST) {
      const payload = {
        first_name: fields.firstName.trim(),
        last_name: fields.lastName.trim(),
        email: fields.email.trim(),
        phone_number: normalizePhoneForApi(fields.phone),
        location: fields.location.trim(),
      };

      if (profileImage) {
        payload.profile_image = profileImage;
      }

      const result = await consumerAuthServiceApi.registerConsumer(payload);
      setLoading(false);

      if (!result.ok) {
        toast.error(result.reason || result.message);
        return;
      }

      toast.success(result.reason || "Check your email for the verification code.");
      navigate(ROUTES.verify, {
        replace: true,
        state: {
          emailOrPhone: fields.email.trim(),
          verifyType: "registration",
          reason: result.reason || "OTP sent to your email successfully.",
          from: location.state?.from,
        },
      });
      return;
    }

    // Operator registration
    const payload = {
      first_name: fields.firstName.trim(),
      last_name: fields.lastName.trim(),
      phone_number: normalizePhoneForApi(fields.phone),
      email: fields.email.trim(),
      organization: fields.organization.trim(),
      location: fields.location.trim(),
    };

    const result = await operatorAuthServiceApi.registerOperator(payload);
    setLoading(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    setOtp("");
    setOtpError("");
    setOtpHint(result.reason || "OTP sent to your email successfully.");
    startCooldown(OPERATOR_OTP_RESEND_COOLDOWN);
    toast.success(result.reason || "Check your email for the verification code.");
    setStep("otp");
  }

  function handleOtpChange(val) {
    setOtp(val);
    if (otpError) setOtpError("");
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (otp.length < 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setOtpError("");

    const result = await operatorAuthServiceApi.verifyOtp({
      emailOrPhone: fields.email.trim(),
      otp,
      type: OPERATOR_VERIFY_TYPE,
    });

    setLoading(false);

    if (!result.ok || !result.token) {
      setOtpError(result.reason || result.message || "Invalid or expired code.");
      return;
    }

    login(result.token, result.user);
    toast.success(result.reason || "Welcome to AfriQuest — your operator account is live.");
    navigate(resolvePostAuthRedirect(null, USER_ROLES.SITE_OPERATOR), { replace: true });
  }

  async function handleResendOtp() {
    if (isCoolingDown || loading) return;

    setLoading(true);
    setOtpError("");
    setOtp("");

    const result = await operatorAuthServiceApi.resendOtp({
      emailOrPhone: fields.email.trim(),
      type: OPERATOR_RESEND_TYPE,
    });

    setLoading(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      setOtpError(result.reason || result.message);
      return;
    }

    setOtpHint(result.reason || "A new code has been sent to your email.");
    startCooldown(OPERATOR_OTP_RESEND_COOLDOWN);
    toast.success(result.reason || "OTP sent to your email.");
  }

  const roleMeta = ROLE_META[role];
  const activePerks = role === USER_ROLES.SITE_OPERATOR ? operatorPerks : perks;
  const signupSteps =
    isBookingReturn
      ? [{ id: "details", label: "Traveler details" }]
      : role === USER_ROLES.TOURIST
      ? [
          { id: "role", label: "Account type" },
          { id: "details", label: "Your details" },
        ]
      : [
          { id: "role", label: "Account type" },
          { id: "details", label: "Your details" },
          { id: "otp", label: "Verify OTP" },
        ];
  const stepIndex = signupSteps.findIndex((s) => s.id === step);

  // Shared input class builder
  function inputClass(field) {
    return [
      "w-full rounded-xl border-2 bg-white py-3 pl-10 pr-4 text-sm font-medium text-brand-ink outline-none transition-all duration-200",
      "placeholder:text-brand-muted/50 focus:ring-2",
      errors[field] && touched[field]
        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
        : "border-brand-border focus:border-brand-green focus:ring-brand-green/15",
    ].join(" ");
  }

  function FieldError({ field }) {
    if (!errors[field] || !touched[field]) return null;
    return (
      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
        </svg>
        {errors[field]}
      </p>
    );
  }

  return (
    <div className="flex h-full min-h-0">

      {/* ── Left panel — fixed, non-scrollable ── */}
      <div className="relative hidden h-full overflow-hidden lg:flex lg:w-[44%] xl:w-[46%]">
        <img
          src={images.home.kenya}
          alt="AfriQuest travel"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1C2B26]/45" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C2B26]/50 via-[#2D5A47]/35 to-[#1C2B26]/50" />

        {/* Kente textile grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cg fill='none' transform='rotate(45 14 14)'%3E%3Crect width='14' height='14' fill='%232D5A47' fill-opacity='0.08'/%3E%3Crect x='14' y='14' width='14' height='14' fill='%23E3A020' fill-opacity='0.06'/%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Concentric rings */}
        <svg
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
          viewBox="0 0 500 500"
          fill="none"
        >
          <circle cx="250" cy="250" r="80" stroke="#E3A020" strokeWidth="1" />
          <circle cx="250" cy="250" r="140" stroke="#2D5A47" strokeWidth="0.8" strokeDasharray="5 9" />
          <circle cx="250" cy="250" r="200" stroke="#D4611A" strokeWidth="0.6" strokeDasharray="3 12" />
          <circle cx="250" cy="250" r="240" stroke="#E3A020" strokeWidth="0.5" strokeDasharray="8 16" />
        </svg>

        {/* Ambient blobs */}
        <div aria-hidden className="pointer-events-none absolute -right-16 top-0 h-72 w-72 rounded-full bg-brand-gold/12 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-10 left-10 h-56 w-56 rounded-full bg-brand-orange/10 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14">
          {/* Back + Logo */}
          <div className="space-y-6">
            <Link
              to={ROUTES.home}
              className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to home
            </Link>
            <img src={images.general_logo} alt="AfriQuest Global" className="h-12 w-auto drop-shadow-[0_4px_16px_rgba(227,160,32,0.4)]" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">Join the movement</p>
            <h2 className="mt-3 text-3xl font-bold leading-snug text-white xl:text-4xl">
              Africa is waiting.<br />Your account is free.
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
              Create your AfriQuest account in under 60 seconds — no passwords, just a quick OTP.
            </p>

            {/* Perks list */}
            <ul className="mt-8 space-y-3">
              {activePerks.map((p) => (
                <li key={p.text} className="flex items-center gap-3 text-sm text-white/75">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-gold backdrop-blur-sm">
                    <AppIcon name={p.icon} className="h-4 w-4" strokeWidth={2} />
                  </span>
                  {p.text}
                </li>
              ))}
            </ul>

            <div
              aria-hidden
              className="mt-10 h-1 w-32 rounded-full opacity-60"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg,#2D5A47 0,#2D5A47 6px,transparent 6px,transparent 12px,#E3A020 12px,#E3A020 18px,transparent 18px,transparent 24px,#D4611A 24px,#D4611A 30px,transparent 30px,transparent 36px)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Right panel — scrollable ── */}
      <div ref={panelRef} className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-brand-cream">
        <div className="flex w-full flex-col items-center px-5 py-8 sm:px-10 sm:py-10 lg:px-14 xl:px-20">
        {/* Mobile top bar */}
        <div className="mb-8 w-full max-w-[560px] lg:hidden">
          <Link
            to={ROUTES.home}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-muted transition-colors hover:text-brand-ink"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>
          <div className="mt-5 flex justify-center">
            <img src={images.general_logo} alt="AfriQuest Global" className="h-10 w-auto" />
          </div>
        </div>

        <div className="w-full max-w-[560px] lg:max-w-[600px] xl:max-w-[640px]">
          {/* Step indicator */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {signupSteps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={[
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                    stepIndex > i || step === s.id
                      ? "bg-brand-green text-white"
                      : "border-2 border-brand-border bg-white text-brand-muted",
                  ].join(" ")}
                >
                  {stepIndex > i ? (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-xs font-medium ${step === s.id ? "text-brand-ink" : "text-brand-muted"}`}>{s.label}</span>
                {i < signupSteps.length - 1 && (
                  <div className={`mx-1 h-px w-6 transition-all duration-300 ${stepIndex > i ? "bg-brand-green" : "bg-brand-border"}`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ── Step 1: Account type ── */}
            {step === "role" && (
              <motion.div key="role" {...slideIn}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">Get started</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand-ink sm:text-3xl">
                  Join AfriQuest
                </h1>
                {isBookingReturn ? (
                  <p className="mt-3 rounded-xl border border-brand-green/25 bg-brand-green/5 px-4 py-3 text-sm text-brand-muted">
                    Create an account to finish your tour booking. You&apos;ll return to checkout after email verification.
                  </p>
                ) : null}
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                  Travelers book unforgettable trips. Site operators manage listings and departures.
                </p>

                <div className="mt-8">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">I am joining as</p>
                  <AccountTypePicker value={role} onChange={setRole} />
                </div>

                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="group mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(45,90,71,0.6)] transition-all hover:bg-brand-green-dark"
                >
                  Continue as {roleMeta.shortLabel}
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </button>

                <p className="mt-6 text-center text-sm text-brand-muted">
                  Already have an account?{" "}
                  <Link to={ROUTES.login} state={{ role, from: location.state?.from }} className="font-semibold text-brand-green hover:text-brand-green-dark">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}

            {/* ── Step 2: Details ── */}
            {step === "details" && (
              <motion.div key="details" {...slideIn}>
                {!isBookingReturn ? (
                  <button
                    type="button"
                    onClick={() => setStep("role")}
                    className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-muted transition-colors hover:text-brand-ink"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    Back
                  </button>
                ) : null}

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">{roleMeta.shortLabel} registration</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand-ink sm:text-3xl">
                  Create your account
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                  {role === USER_ROLES.SITE_OPERATOR
                    ? "Tell us about you and your tourist site. We'll verify your phone with a one-time code."
                    : "Register with your details. We'll email you a one-time code to verify your account."}
                </p>

                <form onSubmit={handleSendOtp} className="mt-8 space-y-4">
                  {role === USER_ROLES.TOURIST && (
                    <div className="flex flex-col items-center gap-3 pb-2">
                      <button
                        type="button"
                        onClick={() => profileInputRef.current?.click()}
                        className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-brand-border bg-white transition-all hover:border-brand-green hover:ring-4 hover:ring-brand-green/10"
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
                        onChange={handleProfileChange}
                      />
                      <div className="text-center">
                        <p className="text-xs font-semibold text-brand-ink">Profile photo (optional)</p>
                        {profilePreview ? (
                          <button
                            type="button"
                            onClick={clearProfilePhoto}
                            className="mt-1 text-[11px] font-medium text-brand-orange hover:underline"
                          >
                            Remove photo
                          </button>
                        ) : (
                          <p className="mt-1 text-[11px] text-brand-muted">JPG or PNG, max 2 MB</p>
                        )}
                        {profileError ? <p className="mt-1 text-[11px] text-red-500">{profileError}</p> : null}
                      </div>
                    </div>
                  )}

                  {/* First + Last name row */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* First name */}
                    <div>
                      <label htmlFor="firstName" className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
                        First Name
                      </label>
                      <div className="relative mt-2">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <svg className="h-4 w-4 text-brand-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <input
                          id="firstName"
                          type="text"
                          autoComplete="given-name"
                          value={fields.firstName}
                          onChange={(e) => handleFieldChange("firstName", e.target.value)}
                          onBlur={() => handleBlur("firstName")}
                          placeholder="Kofi"
                          className={inputClass("firstName").replace("pl-10", "pl-9")}
                        />
                      </div>
                      <FieldError field="firstName" />
                    </div>

                    {/* Last name */}
                    <div>
                      <label htmlFor="lastName" className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
                        Last Name
                      </label>
                      <div className="relative mt-2">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <svg className="h-4 w-4 text-brand-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <input
                          id="lastName"
                          type="text"
                          autoComplete="family-name"
                          value={fields.lastName}
                          onChange={(e) => handleFieldChange("lastName", e.target.value)}
                          onBlur={() => handleBlur("lastName")}
                          placeholder="Mensah"
                          className={inputClass("lastName").replace("pl-10", "pl-9")}
                        />
                      </div>
                      <FieldError field="lastName" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
                      Email Address
                    </label>
                    <div className="relative mt-2">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <svg className="h-4 w-4 text-brand-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </span>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={fields.email}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        onBlur={() => handleBlur("email")}
                        placeholder="kofi@example.com"
                        className={inputClass("email")}
                      />
                    </div>
                    <FieldError field="email" />
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
                      Location
                    </label>
                    <div className="relative mt-2">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <svg className="h-4 w-4 text-brand-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                      </span>
                      <input
                        id="location"
                        type="text"
                        autoComplete="country-name"
                        value={fields.location}
                        onChange={(e) => handleFieldChange("location", e.target.value)}
                        onBlur={() => handleBlur("location")}
                        placeholder="e.g. Accra, Ghana"
                        className={inputClass("location")}
                      />
                    </div>
                    <FieldError field="location" />
                  </div>

                  {/* Organization — operators only */}
                  {role === USER_ROLES.SITE_OPERATOR && (
                    <div>
                      <label htmlFor="organization" className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
                        Tourist site / Organization
                      </label>
                      <div className="relative mt-2">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                          <svg className="h-4 w-4 text-brand-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
                          </svg>
                        </span>
                        <input
                          id="organization"
                          type="text"
                          value={fields.organization}
                          onChange={(e) => handleFieldChange("organization", e.target.value)}
                          onBlur={() => handleBlur("organization")}
                          placeholder="e.g. Elmina Castle Heritage Site"
                          className={inputClass("organization")}
                        />
                      </div>
                      <FieldError field="organization" />
                    </div>
                  )}

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
                      Phone Number
                    </label>
                    <div className="mt-2">
                      <InternationalPhoneInput
                        id="phone"
                        name="phone"
                        value={fields.phone}
                        onChange={(value) => handleFieldChange("phone", value || "")}
                        onBlur={() => handleBlur("phone")}
                        hasError={Boolean(errors.phone && touched.phone)}
                        defaultCountry="GH"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <FieldError field="phone" />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(45,90,71,0.6)] transition-all hover:bg-brand-green-dark disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        {role === USER_ROLES.TOURIST ? "Creating account…" : "Sending code…"}
                      </>
                    ) : role === USER_ROLES.TOURIST ? (
                      <>
                        Create account
                        <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </>
                    ) : (
                      <>
                        Send OTP
                        <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-4 text-center text-[11px] leading-relaxed text-brand-muted/60">
                  By creating an account you agree to our{" "}
                  <span className="underline underline-offset-2 cursor-pointer">Terms of Service</span>{" "}
                  and{" "}
                  <span className="underline underline-offset-2 cursor-pointer">Privacy Policy</span>.
                </p>

                <p className="mt-5 text-center text-sm text-brand-muted">
                  Already have an account?{" "}
                  <Link
                    to={ROUTES.login}
                    state={{ role: USER_ROLES.TOURIST, from: location.state?.from }}
                    className="font-semibold text-brand-green hover:text-brand-green-dark"
                  >
                    Sign in as traveler
                  </Link>
                </p>
              </motion.div>
            )}

            {/* ── Step 3: OTP (operators only) ── */}
            {step === "otp" && role === USER_ROLES.SITE_OPERATOR && (
              <motion.div key="otp" {...slideIn}>
                <button
                  type="button"
                  onClick={() => {
                    setStep("details");
                    setOtp("");
                    setOtpError("");
                  }}
                  className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-muted transition-colors hover:text-brand-ink"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  Back to details
                </button>

                <div className="overflow-hidden rounded-2xl bg-brand-ink p-5 text-white shadow-[0_16px_40px_-16px_rgba(28,43,38,0.55)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">Operator registration</p>
                  <div className="mt-3 flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold">
                      <Building2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{fields.organization || "Your organization"}</p>
                      <p className="mt-0.5 truncate text-sm text-white/70">
                        {[fields.firstName, fields.lastName].filter(Boolean).join(" ") || "Operator"}
                      </p>
                      <p className="mt-1 flex items-center gap-1 truncate text-xs text-white/55">
                        <MapPin className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
                        {fields.location || "Location pending"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.75rem] border border-brand-border/60 bg-white p-7 shadow-sm sm:p-8">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
                    <Mail className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                  </div>

                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">Email verification</p>
                  <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand-ink sm:text-3xl">
                    Confirm your operator account
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                    We sent a 6-digit code to{" "}
                    <span className="font-semibold text-brand-ink">{fields.email}</span>. Enter it below to
                    activate your listing dashboard.
                  </p>

                  <AnimatePresence>
                    {otpHint ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 overflow-hidden"
                      >
                        <p className="flex items-start gap-2 rounded-xl bg-brand-green/10 px-4 py-3 text-xs font-medium text-brand-green">
                          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                          {otpHint}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <form onSubmit={handleVerify} className="mt-8 space-y-6">
                    <div className="space-y-2">
                      <OtpInput value={otp} onChange={handleOtpChange} disabled={loading} error={!!otpError} />
                      <AnimatePresence>
                        {otpError ? (
                          <motion.p
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-center gap-1.5 text-xs font-medium text-red-500"
                          >
                            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                            {otpError}
                          </motion.p>
                        ) : null}
                      </AnimatePresence>
                    </div>

                    <button
                      type="submit"
                      disabled={otp.length < 6 || loading}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(45,90,71,0.6)] transition-all hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                          </svg>
                          Verifying account…
                        </>
                      ) : (
                        <>
                          Verify &amp; launch dashboard
                          <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                        </>
                      )}
                    </button>
                  </form>

                  <p className="mt-6 text-center text-sm text-brand-muted">
                    Didn&apos;t receive a code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isCoolingDown || loading}
                      className="font-semibold text-brand-green transition-colors hover:text-brand-green-dark disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isCoolingDown ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                    </button>
                  </p>

                  <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-brand-border/60 bg-brand-cream/50 px-4 py-3">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <p className="text-[11px] leading-relaxed text-brand-muted">
                      Codes expire in <span className="font-semibold text-brand-ink">10 minutes</span> and are sent by
                      email only. Check spam if you don&apos;t see it.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
        </div>
      </div>
    </div>
  );
}
