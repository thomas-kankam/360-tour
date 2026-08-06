import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Mail } from "lucide-react";
import { toast } from "react-toastify";
import { ROUTES } from "../../constants/routes";
import { resolvePostAuthRedirect, USER_ROLES } from "../../constants/roles";
import { useAuth } from "../../hooks/useAuth";
import { images } from "../../config/images";
import OtpInput from "../../components/misc/OtpInput";
import consumerAuthServiceApi from "../../apis/ConsumerAuthServiceApi";
import { normalizeEmailOrPhoneForApi } from "../../utils/phoneUtils";

const EASE = [0.16, 1, 0.3, 1];
const RESEND_COOLDOWN_BY_TYPE = {
  registration: 15,
  login: 60,
};

export default function VerifyAccountPage() {
  const { login, isAuthenticated, isVerified, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const emailOrPhone = location.state?.emailOrPhone || "";
  const contactForApi = normalizeEmailOrPhoneForApi(emailOrPhone);
  const verifyType = location.state?.verifyType || "login";
  const initialHint = location.state?.reason || "";
  const redirectTo = location.state?.from;
  const resendCooldownSeconds = RESEND_COOLDOWN_BY_TYPE[verifyType] ?? 15;

  const isRegistration = verifyType === "registration";
  const displayContact = isRegistration ? emailOrPhone : emailOrPhone;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpHint, setOtpHint] = useState(initialHint);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  if (isAuthenticated && isVerified) {
    return <Navigate to={resolvePostAuthRedirect(redirectTo, user?.role)} replace />;
  }

  if (!emailOrPhone) {
    return <Navigate to={isRegistration ? ROUTES.signup : ROUTES.login} replace />;
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (otp.length < 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setOtpError("");

    const result = await consumerAuthServiceApi.verifyOtp({
      emailOrPhone: contactForApi,
      otp,
      type: verifyType,
    });

    setLoading(false);

    if (!result.ok || !result.token) {
      setOtpError(result.reason || result.message || "Invalid or expired code.");
      return;
    }

    login(result.token, result.user);
    toast.success(
      result.reason || (isRegistration ? "Welcome to AfriQuest!" : "Account verified — welcome back!")
    );
    navigate(resolvePostAuthRedirect(redirectTo, USER_ROLES.TOURIST), { replace: true });
  }

  async function handleResend() {
    if (resendCooldown > 0 || loading) return;

    setLoading(true);
    setOtpError("");
    setOtp("");

    const result = await consumerAuthServiceApi.resendOtp({ emailOrPhone: contactForApi });
    setLoading(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      setOtpError(result.reason || result.message);
      return;
    }

    setOtpHint(result.reason || "A new code has been sent to your email.");
    setResendCooldown(resendCooldownSeconds);
    toast.success(result.reason || "OTP sent to your email.");
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="relative hidden h-full overflow-hidden lg:flex lg:w-[44%] xl:w-[46%]">
        <img src={images.home.ghana} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#1C2B26]/50" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <Link to={ROUTES.home} className="text-sm font-medium text-white/70 hover:text-white">
            ← Back to home
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">Almost there</p>
            <h2 className="mt-3 text-3xl font-bold text-white">
              {isRegistration ? "Confirm your email" : "Verify your account"}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
              {isRegistration
                ? "One quick step left — enter the code we sent to your inbox to activate your traveler account."
                : "Enter the verification code to continue."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-brand-cream">
        <div className="flex w-full flex-col items-center px-5 py-8 sm:px-10 sm:py-10 lg:px-14 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="w-full max-w-md py-4"
          >
          <Link
            to={isRegistration ? ROUTES.signup : ROUTES.login}
            className="text-sm font-medium text-brand-muted hover:text-brand-ink"
          >
            ← Back to {isRegistration ? "sign up" : "sign in"}
          </Link>

          <div className="mt-8 rounded-[1.75rem] border border-brand-border/60 bg-white p-8 shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
              <Mail className="h-7 w-7" strokeWidth={1.75} aria-hidden />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
              {isRegistration ? "Email verification" : "Account verification"}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-brand-ink">
              {isRegistration ? "Check your inbox" : "Enter your OTP"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">
              {isRegistration ? (
                <>
                  We sent a 6-digit code to{" "}
                  <span className="font-semibold text-brand-ink">{displayContact}</span>. Codes are always delivered
                  by email.
                </>
              ) : (
                <>
                  Enter the code sent to{" "}
                  <span className="font-semibold text-brand-ink">{displayContact}</span>.
                </>
              )}
            </p>

            <AnimatePresence>
              {otpHint ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <p className="rounded-xl bg-brand-green/10 px-4 py-3 text-xs font-medium text-brand-green">
                    {otpHint}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <form onSubmit={handleVerify} className="mt-8 space-y-6">
              <div className="space-y-2">
                <OtpInput
                  value={otp}
                  onChange={(val) => {
                    setOtp(val);
                    if (otpError) setOtpError("");
                  }}
                  disabled={loading}
                  error={!!otpError}
                />
                <AnimatePresence>
                  {otpError ? (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-center text-xs font-medium text-red-500"
                    >
                      {otpError}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </div>

              <button
                type="submit"
                disabled={otp.length < 6 || loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-semibold text-white transition-all hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Verifying…
                  </>
                ) : isRegistration ? (
                  "Verify & create account"
                ) : (
                  "Verify account"
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

            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-brand-border/60 bg-brand-cream/50 px-4 py-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-[11px] leading-relaxed text-brand-muted">
                Code expires in <span className="font-semibold text-brand-ink">10 minutes</span>. Check spam if you
                don&apos;t see it.
              </p>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
}
