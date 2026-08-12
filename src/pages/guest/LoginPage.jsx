import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "react-toastify";
import { ROUTES } from "../../constants/routes";
import { resolvePostAuthRedirect, ROLE_META, USER_ROLES } from "../../constants/roles";
import { useAuth } from "../../hooks/useAuth";
import { images } from "../../config/images";
import AuthPanelBackground from "../../components/auth/AuthPanelBackground";
import OtpInput from "../../components/misc/OtpInput";
import LoginContactTabs, { getLoginContactValue, validateLoginContact } from "../../components/auth/LoginContactTabs";
import consumerAuthServiceApi from "../../apis/ConsumerAuthServiceApi";
import { normalizeEmailOrPhoneForApi } from "../../utils/phoneUtils";

const EASE = [0.16, 1, 0.3, 1];
const RESEND_COOLDOWN = 60;

const slideIn = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.42, ease: EASE },
};

export default function LoginPage() {
  const { login, isAuthenticated, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const presetRole = location.state?.role;
  const returnTo = location.state?.from;
  const returnPath = returnTo?.pathname;
  const isBookingReturn = Boolean(returnPath?.includes("/book"));

  const [step, setStep] = useState("contact");
  const [role] = useState(USER_ROLES.TOURIST);
  const [contactMode, setContactMode] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactTouched, setContactTouched] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpHint, setOtpHint] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (!isBookingReturn) return;
    setStep("contact");
  }, [isBookingReturn]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  function getContactValue() {
    return getLoginContactValue(contactMode, email, phone);
  }

  function handleContactBlur() {
    setContactTouched(true);
    setContactError(validateLoginContact(contactMode, email, phone));
  }

  function handleContactModeChange(mode) {
    setContactMode(mode);
    setContactError("");
    setContactTouched(false);
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setContactTouched(true);
    const err = validateLoginContact(contactMode, email, phone);
    if (err) {
      setContactError(err);
      return;
    }

    setContactError("");
    setLoading(true);
    setOtpHint("");
    setOtpSent(false);

    const contactForApi = normalizeEmailOrPhoneForApi(getContactValue());
    const result = await consumerAuthServiceApi.loginConsumer({ emailOrPhone: contactForApi });
    setLoading(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      setContactError(result.reason || result.message);
      return;
    }

    const unverified = result.user && result.user.isVerified === false;
    setNeedsVerification(unverified);
    setOtpHint(result.reason || "Check your inbox or messages for the code.");
    setOtpSent(true);
    setResendCooldown(RESEND_COOLDOWN);
    toast.success(result.reason || "OTP sent successfully.");

    if (unverified) {
      navigate(ROUTES.verify, {
        replace: true,
        state: {
          emailOrPhone: contactForApi,
          verifyType: "login",
          from: location.state?.from,
        },
      });
      return;
    }

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

    const contactForApi = normalizeEmailOrPhoneForApi(getContactValue());
    const result = await consumerAuthServiceApi.verifyOtp({
      emailOrPhone: contactForApi,
      otp,
      type: "login",
    });

    setLoading(false);

    if (!result.ok || !result.token) {
      setOtpError(result.reason || result.message || "Invalid or expired code.");
      return;
    }

    if (result.user?.isVerified === false) {
      navigate(ROUTES.verify, {
        replace: true,
        state: {
          emailOrPhone: contactForApi,
          verifyType: "login",
          from: location.state?.from,
        },
      });
      return;
    }

    login(result.token, result.user);
    toast.success(result.reason || "Welcome back!");
    navigate(resolvePostAuthRedirect(returnTo, USER_ROLES.TOURIST), { replace: true });
  }

  async function handleResend() {
    if (resendCooldown > 0 || loading) return;

    setOtp("");
    setOtpError("");
    setLoading(true);

    const contactForApi = normalizeEmailOrPhoneForApi(getContactValue());
    const result = await consumerAuthServiceApi.resendOtp({ emailOrPhone: contactForApi });
    setLoading(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      setOtpError(result.reason || result.message);
      return;
    }

    setOtpHint(result.reason || "A new code has been sent.");
    setResendCooldown(RESEND_COOLDOWN);
    toast.success(result.reason || "OTP resent.");
  }

  const roleMeta = ROLE_META[role];
  const loginSteps = [
    { id: "contact", label: "Contact" },
    { id: "otp", label: "Verify" },
  ];
  const stepIndex = loginSteps.findIndex((s) => s.id === step);
  const contactIsEmail = contactMode === "email";
  const contactDisplay = getContactValue();

  return (
    <div className="flex h-full min-h-0">
      <div className="relative hidden h-full overflow-hidden lg:flex lg:w-[44%] xl:w-[46%]">
        <AuthPanelBackground variant="login" />
        <div className="absolute inset-0 bg-[#1C2B26]/45" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C2B26]/50 via-[#2D5A47]/35 to-[#1C2B26]/50" />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cg fill='none' transform='rotate(45 14 14)'%3E%3Crect width='14' height='14' fill='%232D5A47' fill-opacity='0.08'/%3E%3Crect x='14' y='14' width='14' height='14' fill='%23E3A020' fill-opacity='0.06'/%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14">
          <div className="space-y-6">
            <Link to={ROUTES.home} className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to home
            </Link>
            <img src={images.general_logo} alt="360 Tours and Investment Limited" className="h-12 w-auto drop-shadow-[0_4px_16px_rgba(227,160,32,0.4)]" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">Since 2014</p>
            <h2 className="mt-3 text-3xl font-bold leading-snug text-white xl:text-4xl">
              Your African journey
              <br />
              starts with a single step.
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
              Join 5,000+ travelers who have explored Ghana, Kenya, and South Africa with AfriQuest.
            </p>
          </div>
        </div>
      </div>

      <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-brand-cream">
        <div className="flex w-full flex-col items-center px-5 py-8 sm:px-10 sm:py-10 lg:px-14 xl:px-20">
          <div className="mb-8 w-full max-w-[560px] lg:hidden">
            <Link to={ROUTES.home} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-muted transition-colors hover:text-brand-ink">
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
            <div className="mb-8 flex items-center gap-2">
              {loginSteps.map((s, i) => (
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
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden>
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className={`text-xs font-medium ${step === s.id ? "text-brand-ink" : "text-brand-muted"}`}>{s.label}</span>
                  {i < loginSteps.length - 1 && (
                    <div className={`mx-1 h-px w-6 transition-all duration-300 ${stepIndex > i ? "bg-brand-green" : "bg-brand-border"}`} />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === "contact" && (
                <motion.div key="contact" {...slideIn}>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">Welcome back</p>
                  <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand-ink sm:text-3xl">Sign in to 360 Tours</h1>
                  {isBookingReturn ? (
                    <p className="mt-3 rounded-xl border border-brand-green/25 bg-brand-green/5 px-4 py-3 text-sm text-brand-muted">
                      Sign in to continue your tour booking. You&apos;ll return to checkout right after verification.
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                    Choose email or phone. We&apos;ll send a one-time code to verify your traveler account.
                  </p>

                  {isAuthenticated && isAdmin ? (
                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                      You&apos;re signed in as <span className="font-semibold">{user?.firstName || "admin"}</span>. Completing traveler sign-in here will switch you to your client account.
                    </div>
                  ) : null}

                  <form onSubmit={handleSendOtp} className="mt-8 space-y-5">
                    <LoginContactTabs
                      mode={contactMode}
                      onModeChange={handleContactModeChange}
                      email={email}
                      onEmailChange={(value) => {
                        setEmail(value);
                        if (contactTouched) setContactError(validateLoginContact(contactMode, value, phone));
                      }}
                      phone={phone}
                      onPhoneChange={(value) => {
                        setPhone(value || "");
                        if (contactTouched) setContactError(validateLoginContact(contactMode, email, value || ""));
                      }}
                      error={contactTouched ? contactError : ""}
                      onBlur={handleContactBlur}
                      layoutId="guest-login-contact-tab"
                      emailId="login-email"
                      phoneId="login-phone"
                    />
                    <p className="text-[11px] text-brand-muted">
                      Use the {contactIsEmail ? "email" : "phone number"} linked to your 360 Tours account.
                    </p>

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
                          Sending code…
                        </>
                      ) : (
                        <>
                          Send OTP
                          <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>

                  <p className="mt-6 text-center text-sm text-brand-muted">
                    New here?{" "}
                    <Link
                      to={ROUTES.signup}
                      state={{ role: USER_ROLES.TOURIST, from: location.state?.from }}
                      className="font-semibold text-brand-green hover:text-brand-green-dark"
                    >
                      Create a traveler account
                    </Link>
                  </p>
                </motion.div>
              )}

              {step === "otp" && (
                <motion.div key="otp" {...slideIn}>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("contact");
                      setOtp("");
                      setOtpError("");
                    }}
                    className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-muted transition-colors hover:text-brand-ink"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>

                  <AnimatePresence>
                    {otpSent ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 flex items-center gap-3 rounded-xl border border-brand-green/20 bg-brand-green/5 px-4 py-3"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-white">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <p className="text-sm font-medium text-brand-ink">{otpHint || "Code sent successfully."}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
                    {needsVerification ? "Account verification" : "Verification"}
                  </p>
                  <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand-ink sm:text-3xl">Enter your OTP</h1>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                    We sent a 6-digit code to your {contactIsEmail ? "email" : "phone"} linked to{" "}
                    <span className="font-semibold text-brand-ink">{contactDisplay}</span>
                  </p>

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
                          Verifying…
                        </>
                      ) : (
                        <>
                          Verify & Sign in
                          <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>

                  <p className="mt-6 text-center text-sm text-brand-muted">
                    Didn&apos;t receive a code?{" "}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCooldown > 0 || loading}
                      className="font-semibold text-brand-green hover:text-brand-green-dark disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                    </button>
                  </p>

                  <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-brand-border/60 bg-white px-4 py-3">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <p className="text-[11px] leading-relaxed text-brand-muted">
                      This code expires in <span className="font-semibold text-brand-ink">10 minutes</span>. Never share it with anyone.
                    </p>
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
