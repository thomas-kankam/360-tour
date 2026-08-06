import { useMemo } from "react";
import { buildTourPriceDisplay, stripTourPriceFromPrefix } from "../../utils/tourPricing";

const VARIANT_STYLES = {
  card: {
    primary: "text-sm font-bold text-brand-ink",
    secondary: "mt-0.5 text-xs text-brand-muted",
    perPerson: "text-xs font-normal text-brand-muted",
  },
  detail: {
    primary: "text-3xl font-bold text-brand-primary",
    secondary: "mt-1 text-sm text-brand-muted",
    perPerson: "text-xs text-brand-muted",
  },
  detailCompact: {
    primary: "text-2xl font-bold text-brand-primary",
    secondary: "mt-1 text-xs text-brand-muted",
    perPerson: "text-xs text-brand-muted",
  },
  inline: {
    primary: "text-sm font-bold text-brand-primary",
    secondary: "text-xs text-brand-muted",
    perPerson: "text-xs font-normal text-brand-muted",
  },
  featured: {
    primary: "text-lg font-bold text-brand-primary",
    secondary: "mt-0.5 text-xs text-brand-muted",
    perPerson: "",
  },
};

function formatLabel(label, amountOnly) {
  if (!label) return "";
  return amountOnly ? stripTourPriceFromPrefix(label) : label;
}

export default function TourPriceDisplay({
  tour,
  variant = "card",
  perPerson = false,
  amountOnly = false,
  layout = "block",
  paymentRegion = null,
  className = "",
  primaryClassName = "",
  secondaryClassName = "",
}) {
  const display = useMemo(
    () => buildTourPriceDisplay(tour, paymentRegion),
    [tour, paymentRegion],
  );
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.card;
  const isInline = layout === "inline";
  const PrimaryTag = isInline ? "span" : "p";
  const SecondaryTag = isInline ? "span" : "p";
  const WrapperTag = isInline ? "span" : "div";

  if (!display.primaryLabel) return null;

  const primaryText = formatLabel(display.primaryLabel, amountOnly);
  const secondaryText = display.secondaryLabel ? formatLabel(display.secondaryLabel, amountOnly) : "";

  const secondaryHint = display.secondaryHint || "for international travelers";

  if (display.isDual && secondaryText) {
    if (isInline) {
      return (
        <span className={className}>
          <PrimaryTag className={[styles.primary, primaryClassName].filter(Boolean).join(" ")}>
            {primaryText}
          </PrimaryTag>
          <SecondaryTag className={[styles.secondary, secondaryClassName].filter(Boolean).join(" ")}>
            {" · "}
            {secondaryText}
            {` ${secondaryHint}`}
          </SecondaryTag>
        </span>
      );
    }

    return (
      <WrapperTag className={className}>
        <PrimaryTag className={[styles.primary, primaryClassName].filter(Boolean).join(" ")}>
          {primaryText}
          {perPerson ? (
            <span className={styles.perPerson ? ` ${styles.perPerson}` : ""}> / person</span>
          ) : null}
        </PrimaryTag>
        <SecondaryTag className={[styles.secondary, secondaryClassName].filter(Boolean).join(" ")}>
          {secondaryText}
          <span className="ml-1">{secondaryHint}</span>
        </SecondaryTag>
      </WrapperTag>
    );
  }

  return (
    <PrimaryTag className={[styles.primary, className, primaryClassName].filter(Boolean).join(" ")}>
      {primaryText}
      {perPerson ? (
        <span className={styles.perPerson ? ` ${styles.perPerson}` : ""}> / person</span>
      ) : null}
    </PrimaryTag>
  );
}
