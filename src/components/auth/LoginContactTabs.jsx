import { AnimatePresence, motion } from "motion/react";
import { Mail, Phone } from "lucide-react";
import { isValidPhoneNumber } from "react-phone-number-input";
import InternationalPhoneInput from "../forms/InternationalPhoneInput";
import { phoneNumberHasCountryCode } from "../../utils/phoneUtils";

const TABS = [
  { id: "email", label: "Email", icon: Mail },
  { id: "phone", label: "Phone", icon: Phone },
];

export function validateLoginContact(mode, email, phone) {
  if (mode === "email") {
    const trimmed = email.trim();
    if (!trimmed) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Enter a valid email address.";
    return "";
  }

  if (!phone) return "Phone number is required.";
  if (!isValidPhoneNumber(phone)) return "Enter a valid phone number.";
  if (!phoneNumberHasCountryCode(phone)) return "Enter a valid phone number with country code.";
  return "";
}

export function getLoginContactValue(mode, email, phone) {
  return mode === "email" ? email.trim() : phone || "";
}

export default function LoginContactTabs({
  mode,
  onModeChange,
  email,
  onEmailChange,
  phone,
  onPhoneChange,
  error,
  onBlur,
  layoutId = "login-contact-tab",
  emailId = "login-email",
  phoneId = "login-phone",
}) {
  function handleModeChange(nextMode) {
    if (nextMode === mode) return;
    onModeChange(nextMode);
  }

  return (
    <div>
      <div
        className="relative grid grid-cols-2 gap-1 rounded-xl border border-brand-border/60 bg-brand-cream/60 p-1"
        role="tablist"
        aria-label="Sign in method"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = mode === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleModeChange(tab.id)}
              className={[
                "relative z-10 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors duration-200",
                active ? "text-brand-ink" : "text-brand-muted hover:text-brand-ink",
              ].join(" ")}
            >
              {active ? (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-0 rounded-lg bg-white shadow-sm ring-1 ring-brand-border/40"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <Icon className="relative h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <AnimatePresence mode="wait" initial={false}>
          {mode === "email" ? (
            <motion.div
              key="email-panel"
              role="tabpanel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <label htmlFor={emailId} className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
                Email address
              </label>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-brand-muted" aria-hidden />
                </span>
                <input
                  id={emailId}
                  type="email"
                  autoComplete="username email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  onBlur={onBlur}
                  placeholder="you@email.com"
                  className={[
                    "w-full rounded-xl border-2 bg-white py-3 pl-10 pr-4 text-sm font-medium text-brand-ink outline-none transition-all duration-200",
                    "placeholder:text-brand-muted/50 focus:ring-2",
                    error
                      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                      : "border-brand-border focus:border-brand-green focus:ring-brand-green/15",
                  ].join(" ")}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="phone-panel"
              role="tabpanel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <label htmlFor={phoneId} className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
                Phone number
              </label>
              <div className="mt-2">
                <InternationalPhoneInput
                  id={phoneId}
                  name={phoneId}
                  value={phone}
                  onChange={onPhoneChange}
                  onBlur={onBlur}
                  hasError={Boolean(error)}
                  placeholder="Enter phone number"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  );
}
