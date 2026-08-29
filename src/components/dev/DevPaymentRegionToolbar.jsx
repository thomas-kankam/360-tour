import { useState } from "react";
import { Globe, MapPin, RotateCcw, X } from "lucide-react";
import env from "../../config/env";
import { PAYMENT_REGION } from "../../constants/paymentRegions";
import { usePaymentRegion } from "../../hooks/usePaymentRegion";

function RegionButton({ active, onClick, children, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
        active
          ? "bg-brand-primary text-white"
          : "bg-white/90 text-brand-ink hover:bg-brand-cream",
      ].join(" ")}
    >
      <Icon className="h-3 w-3" strokeWidth={2} aria-hidden />
      {children}
    </button>
  );
}

export default function DevPaymentRegionToolbar() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    region,
    detectedRegion,
    isOverridden,
    selectDomesticRegion,
    selectInternationalRegion,
    resetRegionOverride,
  } = usePaymentRegion();

  if (!env.isDev) return null;

  const activeRegion = region?.paymentRegion;
  const detectedLabel = detectedRegion?.paymentRegion || "detecting…";

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 z-[9999] rounded-full border border-brand-primary/15 bg-brand-accent px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-brand-primary shadow-lg"
        title="Open payment region dev tools"
      >
        Dev region
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-[min(100vw-2rem,320px)] rounded-2xl border border-brand-orange/35 bg-brand-ink/95 p-4 text-white shadow-2xl backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-orange">
            Dev payment region
          </p>
          <p className="mt-1 text-xs text-white/75">
            Active:{" "}
            <span className="font-semibold text-white">
              {activeRegion === PAYMENT_REGION.DOMESTIC ? "Domestic (GHS)" : "International (USD)"}
            </span>
          </p>
          <p className="mt-0.5 text-[11px] text-white/55">
            Detected: {detectedLabel}
            {isOverridden ? " · overridden" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Collapse dev payment region toolbar"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <RegionButton
          active={activeRegion === PAYMENT_REGION.DOMESTIC}
          onClick={selectDomesticRegion}
          icon={MapPin}
        >
          Ghana
        </RegionButton>
        <RegionButton
          active={activeRegion === PAYMENT_REGION.INTERNATIONAL}
          onClick={selectInternationalRegion}
          icon={Globe}
        >
          International
        </RegionButton>
        <RegionButton active={!isOverridden} onClick={resetRegionOverride} icon={RotateCcw}>
          Auto
        </RegionButton>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-white/50">
        URL: <code className="text-white/70">?paymentRegion=domestic</code> or{" "}
        <code className="text-white/70">?paymentRegion=international</code>
        {" · "}
        <code className="text-white/70">?clearPaymentRegion=1</code>
      </p>
    </div>
  );
}
