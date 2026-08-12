import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import OtpInput from "../../components/misc/OtpInput";
import LoginContactTabs, { getLoginContactValue, validateLoginContact } from "../../components/auth/LoginContactTabs";
import adminAuthServiceApi from "../../apis/AdminAuthServiceApi";
import { normalizeEmailOrPhoneForApi } from "../../utils/phoneUtils";
import { images } from "../../config/images";
import AuthPanelBackground from "../../components/auth/AuthPanelBackground";
import { ROUTES } from "../../constants/routes";
import { getHomeRouteForRole, isAdminRole, USER_ROLES } from "../../constants/roles";
import { useAuth } from "../../hooks/useAuth";

const EASE = [0.16, 1, 0.3, 1];
const RESEND_COOLDOWN = 30;

export default function AdminLoginPage() {
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || ROUTES.admin.dashboard;

  const [step, setStep] = useState("identity");
  const [contactMode, setContactMode] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldTouched, setFieldTouched] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [hint, setHint] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  if (isAuthenticated && isAdminRole(user?.role)) {
    return <Navigate to={getHomeRouteForRole(user?.role)} replace />;
  }

  function getContactValue() {
    return getLoginContactValue(contactMode, email, phone);
  }

  function handleFieldBlur() {
    setFieldTouched(true);
    setFieldError(validateLoginContact(contactMode, email, phone));
  }

  function handleContactModeChange(mode) {
    setContactMode(mode);
    setFieldError("");
    setFieldTouched(false);
  }

  async function requestOtp() {
    const contactForApi = normalizeEmailOrPhoneForApi(getContactValue());
    const result = await adminAuthServiceApi.loginAdmin({ emailOrPhone: contactForApi });

    if (!result.ok) {
      setFieldError(result.reason || result.message);
      toast.error(result.reason || result.message);
      return false;
    }

    setHint(result.reason || "OTP sent successfully.");
    setResendCooldown(RESEND_COOLDOWN);
    toast.success(result.reason || "OTP sent successfully.");
    return true;
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setFieldTouched(true);

    const error = validateLoginContact(contactMode, email, phone);
    if (error) {
      setFieldError(error);
      return;
    }

    setLoading(true);
    setFieldError("");
    setHint("");

    const sent = await requestOtp();
    setLoading(false);

    if (sent) {
      setStep("otp");
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (otp.length < 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setOtpError("");

    const contactForApi = normalizeEmailOrPhoneForApi(getContactValue());

    const result = await adminAuthServiceApi.verifyOtp({
      emailOrPhone: contactForApi,
      otp,
      type: "login",
    });

    setLoading(false);

    if (!result.ok || !result.token || result.user?.role !== USER_ROLES.ADMINISTRATOR) {
      setOtpError(result.reason || result.message || "Unable to verify administrator access.");
      return;
    }

    login(result.token, result.user);
    toast.success(result.reason || "Administrator signed in successfully.");
    navigate(redirectTo.startsWith("/admin") ? redirectTo : ROUTES.admin.dashboard, { replace: true });
  }

  async function handleResend() {
    if (loading || resendCooldown > 0) return;

    setLoading(true);
    setOtp("");
    setOtpError("");

    const contactForApi = normalizeEmailOrPhoneForApi(getContactValue());

    const result = await adminAuthServiceApi.resendOtp({
      emailOrPhone: contactForApi,
      type: "login",
    });

    setLoading(false);

    if (!result.ok) {
      setOtpError(result.reason || result.message);
      return;
    }

    setHint(result.reason || "OTP sent to your email.");
    setResendCooldown(RESEND_COOLDOWN);
  }

  const contactDisplay = getContactValue();

  return (
    <main className="flex h-screen min-h-0 overflow-hidden bg-brand-ink">
      <section className="relative hidden w-[46%] overflow-hidden lg:block">
        <AuthPanelBackground variant="admin" className="opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-ink via-brand-green/80 to-brand-ink" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <Link to={ROUTES.home} className="inline-flex text-sm font-semibold text-white/70 hover:text-white">
            ← Public site
          </Link>
          <div>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-brand-gold ring-1 ring-white/15">
              <ShieldCheck className="h-8 w-8" strokeWidth={1.7} aria-hidden />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Administrator access</p>
            <h1 className="mt-4 max-w-md text-4xl font-bold leading-tight text-white xl:text-5xl">
              Secure control for AfriQuest operations.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">
              Admin routes are isolated from traveler and operator accounts. Only verified administrator sessions can enter.
            </p>
          </div>
        </div>
      </section>

      <section className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-brand-cream">
        <div className="flex min-h-full w-full items-center justify-center px-5 py-10 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="w-full max-w-md"
          >
            <div className="mb-8 flex items-center justify-between">
              <img src={images.general_logo} alt="AfriQuest Global" className="h-10 w-auto" />
              <span className="rounded-full border border-brand-border bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-green">
                Admin
              </span>
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-brand-border/70 bg-white shadow-[0_18px_60px_-28px_rgba(28,43,38,0.35)]">
              <div className="border-b border-brand-border/60 bg-brand-cream/45 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                  {step === "identity" ? "Sign in" : "OTP verification"}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-brand-ink">
                  {step === "identity" ? "Administrator login" : "Enter your OTP"}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                  {step === "identity"
                    ? "Choose email or phone. We'll send a one-time passcode to verify your admin account."
                    : `We sent a 6-digit code to ${contactDisplay}.`}
                </p>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {step === "identity" ? (
                    <motion.form
                      key="identity"
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -18 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      onSubmit={handleSendOtp}
                      className="space-y-5"
                    >
                      <LoginContactTabs
                        mode={contactMode}
                        onModeChange={handleContactModeChange}
                        email={email}
                        onEmailChange={(value) => {
                          setEmail(value);
                          if (fieldTouched) setFieldError(validateLoginContact(contactMode, value, phone));
                        }}
                        phone={phone}
                        onPhoneChange={(value) => {
                          setPhone(value || "");
                          if (fieldTouched) setFieldError(validateLoginContact(contactMode, email, value || ""));
                        }}
                        error={fieldTouched ? fieldError : ""}
                        onBlur={handleFieldBlur}
                        layoutId="admin-login-contact-tab"
                        emailId="admin-login-email"
                        phoneId="admin-login-phone"
                      />

                      <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center rounded-xl bg-brand-ink py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-green disabled:opacity-60"
                      >
                        {loading ? "Sending OTP..." : "Send admin OTP"}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="otp"
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -18 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      onSubmit={handleVerify}
                      className="space-y-6"
                    >
                      {hint ? (
                        <p className="rounded-xl bg-brand-green/10 px-4 py-3 text-xs font-semibold text-brand-green">
                          {hint}
                        </p>
                      ) : null}

                      <div className="space-y-2">
                        <OtpInput
                          value={otp}
                          onChange={(value) => {
                            setOtp(value);
                            if (otpError) setOtpError("");
                          }}
                          disabled={loading}
                          error={!!otpError}
                        />
                        {otpError ? <p className="text-center text-xs font-medium text-red-500">{otpError}</p> : null}
                      </div>

                      <button
                        type="submit"
                        disabled={otp.length < 6 || loading}
                        className="flex w-full items-center justify-center rounded-xl bg-brand-ink py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-green disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loading ? "Verifying..." : "Verify & enter admin"}
                      </button>

                      <div className="flex items-center justify-between gap-3 text-sm">
                        <button
                          type="button"
                          onClick={() => {
                            setOtp("");
                            setOtpError("");
                            setStep("identity");
                          }}
                          className="font-semibold text-brand-muted hover:text-brand-ink"
                        >
                          Change account
                        </button>
                        <button
                          type="button"
                          onClick={handleResend}
                          disabled={loading || resendCooldown > 0}
                          className="font-semibold text-brand-green hover:text-brand-green-dark disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
