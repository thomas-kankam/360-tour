import { Globe, Loader2, MapPin } from "lucide-react";
import { PAYMENT_REGION } from "../../constants/paymentRegions";

const REGION_COPY = {
  [PAYMENT_REGION.DOMESTIC]: {
    title: "Paying from Ghana",
    description: "Mobile Money, Telecel Cash, and local debit/credit cards via our Ghana checkout.",
    methods: "MTN MoMo · Telecel Cash · Local cards",
  },
  [PAYMENT_REGION.INTERNATIONAL]: {
    title: "International checkout",
    description: "Card payments processed through our international payment partner.",
    methods: "Visa · Mastercard · International cards",
  },
};

export default function PaymentRegionNotice({
  region,
  isLoading = false,
  isOverridden = false,
  onSelectDomestic,
  onSelectInternational,
  className = "",
}) {
  if (isLoading && !region) {
    return (
      <div
        className={[
          "flex items-center gap-2 rounded-xl border border-brand-border/60 bg-brand-cream/40 px-4 py-3 text-xs text-brand-muted",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} aria-hidden />
        Detecting your region for the right checkout…
      </div>
    );
  }

  if (!region) return null;

  const copy = REGION_COPY[region.paymentRegion] ?? REGION_COPY[PAYMENT_REGION.INTERNATIONAL];
  const isDomestic = region.paymentRegion === PAYMENT_REGION.DOMESTIC;
  const Icon = isDomestic ? MapPin : Globe;

  return (
    <div
      className={[
        "rounded-xl border p-4",
        isDomestic ? "border-brand-green/25 bg-brand-green/5" : "border-brand-border/60 bg-brand-cream/40",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            isDomestic ? "bg-brand-green/10 text-brand-green" : "bg-brand-border/30 text-brand-muted",
          ].join(" ")}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-brand-ink">{copy.title}</p>
            {isOverridden ? (
              <span className="rounded-full bg-brand-orange/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-orange">
                Updated by you
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-brand-muted">{copy.description}</p>
          <p className="mt-1.5 text-[11px] font-medium text-brand-ink/70">{copy.methods}</p>
        </div>
      </div>

      {onSelectDomestic && onSelectInternational ? (
        <div className="mt-3 border-t border-brand-border/30 pt-3">
          {isDomestic ? (
            <button
              type="button"
              onClick={onSelectInternational}
              className="text-left text-xs font-semibold text-brand-green hover:underline"
            >
              Paying from outside Ghana? Switch to international checkout
            </button>
          ) : (
            <button
              type="button"
              onClick={onSelectDomestic}
              className="text-left text-xs font-semibold text-brand-green hover:underline"
            >
              I&apos;m in Ghana, use local payment methods
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
