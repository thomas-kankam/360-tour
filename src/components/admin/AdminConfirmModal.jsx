import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

const VARIANTS = {
  danger: {
    icon: AlertTriangle,
    iconWrap: "bg-red-50 text-red-600 ring-red-100",
    confirmClass:
      "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
  },
  primary: {
    icon: CheckCircle2,
    iconWrap: "bg-brand-green/10 text-brand-green ring-brand-green/20",
    confirmClass:
      "btn-primary inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
  },
};

export default function AdminConfirmModal({
  open,
  title = "Confirm deletion",
  message,
  itemLabel,
  confirmLabel = "Delete",
  variant = "danger",
  loading = false,
  onClose,
  onConfirm,
}) {
  const config = VARIANTS[variant] ?? VARIANTS.danger;
  const Icon = config.icon;

  useEffect(() => {
    if (!open) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape" && !loading) onClose?.();
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, loading, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            aria-hidden
            onClick={() => !loading && onClose?.()}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.28, ease: EASE }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            aria-describedby="admin-confirm-message"
            className="relative z-10 w-full max-w-md overflow-hidden rounded-t-3xl border border-black/8 bg-white shadow-2xl sm:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-6 pb-2 pt-6">
              <div className="flex flex-col items-center text-center">
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${config.iconWrap}`}>
                  <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                </span>
                <h2 id="admin-confirm-title" className="mt-4 text-lg font-bold text-brand-ink">
                  {title}
                </h2>
                {itemLabel ? (
                  <p className="mt-2 rounded-xl bg-brand-cream/70 px-4 py-2 text-sm font-semibold text-brand-ink">
                    {itemLabel}
                  </p>
                ) : null}
                <p id="admin-confirm-message" className="mt-3 text-sm leading-relaxed text-brand-muted">
                  {message}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn-secondary w-full px-4 py-2.5 text-sm sm:w-auto"
              >
                Cancel
              </button>
              <button type="button" onClick={onConfirm} disabled={loading} className={config.confirmClass}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
