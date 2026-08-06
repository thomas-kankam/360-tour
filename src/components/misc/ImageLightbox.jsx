import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

export function normalizeLightboxImages(images) {
  return (images || [])
    .map((item) => {
      if (!item) return "";
      if (typeof item === "string") return item;
      return item.src || item.uri || item.url || "";
    })
    .filter(Boolean);
}

export default function ImageLightbox({
  open,
  images = [],
  index = 0,
  onClose,
  onIndexChange,
  alt = "",
}) {
  const sources = normalizeLightboxImages(images);
  const safeIndex = sources.length ? Math.min(Math.max(0, index), sources.length - 1) : 0;
  const currentSrc = sources[safeIndex];
  const hasMultiple = sources.length > 1;

  const goPrev = useCallback(() => {
    if (!hasMultiple) return;
    const next = safeIndex === 0 ? sources.length - 1 : safeIndex - 1;
    onIndexChange?.(next);
  }, [hasMultiple, safeIndex, sources.length, onIndexChange]);

  const goNext = useCallback(() => {
    if (!hasMultiple) return;
    const next = safeIndex === sources.length - 1 ? 0 : safeIndex + 1;
    onIndexChange?.(next);
  }, [hasMultiple, safeIndex, sources.length, onIndexChange]);

  useEffect(() => {
    if (!open) return undefined;

    function handleKey(event) {
      if (event.key === "Escape") onClose?.();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose, goPrev, goNext]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && currentSrc ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-8">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            aria-label="Close image viewer"
            onClick={onClose}
          />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>

          {hasMultiple ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition-colors hover:bg-white/20 sm:left-6"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={2} aria-hidden />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition-colors hover:bg-white/20 sm:right-6"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" strokeWidth={2} aria-hidden />
              </button>
              <p className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
                {safeIndex + 1} / {sources.length}
              </p>
            </>
          ) : null}

          <motion.img
            key={currentSrc}
            src={currentSrc}
            alt={alt}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="relative z-[1] max-h-[90vh] max-w-[min(100%,1200px)] object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
