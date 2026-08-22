import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Download, Loader2, X } from "lucide-react";
import { toast } from "react-toastify";
import PaymentReceiptPreview from "./PaymentReceiptPreview";

const EASE = [0.22, 1, 0.36, 1];

export default function PaymentReceiptModal({ open, receipt, onClose, onDownload }) {
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !receipt) return null;

  async function handleDownload() {
    if (downloading) return;

    setDownloading(true);
    try {
      const ok = await onDownload?.();
      if (ok === false) {
        toast.error("Could not generate PDF receipt. Please try again.");
        return;
      }
      toast.success("Receipt downloaded.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-receipt-title"
    >
      <button
        type="button"
        aria-label="Close receipt preview"
        className="absolute inset-0 bg-brand-ink/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[1.5rem] border border-brand-border/60 bg-brand-cream shadow-[0_24px_64px_-24px_rgba(23,19,14,0.35)] sm:rounded-[1.5rem]"
      >
        <div className="flex items-center justify-between border-b border-brand-border/40 bg-white px-5 py-4">
          <div>
            <p id="payment-receipt-title" className="font-heading text-lg font-bold text-brand-ink">
              Your receipt
            </p>
            <p className="text-xs text-brand-muted">Review before downloading</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-border/60 bg-white text-brand-muted transition-colors hover:bg-brand-cream hover:text-brand-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          <PaymentReceiptPreview receipt={receipt} />
        </div>

        <div className="border-t border-brand-border/40 bg-white px-4 py-4 sm:px-5">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,107,63,0.45)] transition-all hover:bg-brand-green-dark disabled:opacity-70"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden />
            ) : (
              <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
            )}
            {downloading ? "Preparing PDF…" : "Download PDF"}
          </button>
          <p className="mt-2 text-center text-xs text-brand-muted">
            Downloads a PDF you can save or print and present at tour check-in.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
