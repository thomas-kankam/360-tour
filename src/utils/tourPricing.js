import { AUDIENCE_SCOPE } from "../constants/tourAudience";
import { PAYMENT_REGION } from "../constants/paymentRegions";
import { TOUR_CURRENCY, TOUR_CURRENCY_USD, formatTourPriceLabel } from "./operatorTourConstants";

function parsePrice(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

function parseAmountFromPriceLabel(priceLabel) {
  if (!priceLabel) return null;
  const match = String(priceLabel).replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function resolveLegacyUnitPrice(tour) {
  if (!tour) return 0;
  const amount = Number(tour.priceAmount ?? tour.priceNum) || 0;
  const fromLabel = parseAmountFromPriceLabel(tour.priceLabel);
  if (fromLabel != null) {
    if (amount <= 0) return fromLabel;
    if (fromLabel > amount * 10) return fromLabel;
  }
  return amount;
}

export function inferAudienceScope(tour) {
  if (
    tour?.audienceScope === AUDIENCE_SCOPE.LOCAL
    || tour?.audienceScope === AUDIENCE_SCOPE.GLOBAL
    || tour?.audienceScope === AUDIENCE_SCOPE.FOREIGN
  ) {
    return tour.audienceScope;
  }

  const hasGhs =
    parsePrice(tour?.priceAmountGhs) > 0
    || (tour?.priceCurrency === TOUR_CURRENCY.code && parsePrice(tour?.priceAmount) > 0);
  const hasUsd =
    parsePrice(tour?.priceAmountUsd) > 0
    || (tour?.priceCurrency === TOUR_CURRENCY_USD.code && parsePrice(tour?.priceAmount) > 0);

  if (hasGhs && hasUsd) return AUDIENCE_SCOPE.GLOBAL;
  if (hasGhs && !hasUsd) return AUDIENCE_SCOPE.LOCAL;
  if (hasUsd && !hasGhs) return AUDIENCE_SCOPE.FOREIGN;

  return AUDIENCE_SCOPE.LOCAL;
}

export function resolveTourListPriceGhs(tour) {
  const ghs = parsePrice(tour?.priceAmountGhs);
  if (ghs > 0) return ghs;

  if (tour?.priceCurrency === TOUR_CURRENCY.code) {
    const amount = parsePrice(tour?.priceAmount ?? resolveLegacyUnitPrice(tour));
    if (amount > 0) return amount;
  }

  const fromLabel = parseAmountFromPriceLabel(tour?.priceLabel);
  if (fromLabel != null && String(tour?.priceLabel || "").includes("GH")) return fromLabel;

  return 0;
}

export function resolveTourListPriceUsd(tour) {
  const usd = parsePrice(tour?.priceAmountUsd);
  if (usd > 0) return usd;

  if (tour?.priceCurrency === TOUR_CURRENCY_USD.code) {
    return parsePrice(tour?.priceAmount ?? resolveLegacyUnitPrice(tour));
  }

  return 0;
}

export function stripTourPriceFromPrefix(label) {
  return String(label || "").replace(/^From\s+/i, "").trim();
}

/**
 * Build consumer-facing price labels for listings and detail pages.
 * When paymentRegion is provided on global tours, the matching currency is shown as primary.
 */
export function buildTourPriceDisplay(tour, paymentRegion = null) {
  const audienceScope = inferAudienceScope(tour);
  const ghsAmount = resolveTourListPriceGhs(tour);
  const usdAmount = resolveTourListPriceUsd(tour);
  const ghsLabel = ghsAmount > 0 ? formatTourPriceLabel(ghsAmount, TOUR_CURRENCY.code) : "";
  const usdLabel = usdAmount > 0 ? formatTourPriceLabel(usdAmount, TOUR_CURRENCY_USD.code) : "";
  let primaryLabel = ghsLabel;
  let secondaryLabel = usdLabel;
  let secondaryHint = "for international travelers";

  if (audienceScope === AUDIENCE_SCOPE.FOREIGN) {
    primaryLabel = usdLabel || ghsLabel;
    secondaryLabel = null;
  } else if (audienceScope === AUDIENCE_SCOPE.LOCAL) {
    secondaryLabel = null;
  }

  if (!primaryLabel && tour?.priceLabel) {
    primaryLabel = tour.priceLabel;
  }

  const isDual = audienceScope === AUDIENCE_SCOPE.GLOBAL && Boolean(ghsLabel && usdLabel);

  if (isDual && paymentRegion === PAYMENT_REGION.INTERNATIONAL) {
    primaryLabel = usdLabel;
    secondaryLabel = ghsLabel;
    secondaryHint = "local price in Ghana";
  }

  return {
    audienceScope,
    primaryLabel,
    secondaryLabel: isDual ? secondaryLabel : null,
    secondaryHint: isDual ? secondaryHint : null,
    priceLabel: primaryLabel,
    isDual,
  };
}

/**
 * Default listing/display pricing before payment region is known.
 */
export function resolveTourDisplayPricing(tour) {
  const audienceScope = inferAudienceScope(tour);

  if (audienceScope === AUDIENCE_SCOPE.FOREIGN) {
    return {
      unitPrice: resolveTourListPriceUsd(tour),
      currency: TOUR_CURRENCY_USD.code,
      audienceScope,
    };
  }

  if (audienceScope === AUDIENCE_SCOPE.LOCAL) {
    return {
      unitPrice: resolveTourListPriceGhs(tour),
      currency: TOUR_CURRENCY.code,
      audienceScope,
    };
  }

  const ghs = resolveTourListPriceGhs(tour);
  if (ghs > 0) {
    return {
      unitPrice: ghs,
      currency: TOUR_CURRENCY.code,
      audienceScope,
    };
  }

  return {
    unitPrice: resolveTourListPriceUsd(tour),
    currency: TOUR_CURRENCY_USD.code,
    audienceScope,
  };
}

/**
 * Resolve unit price + currency for checkout based on tour audience and buyer region.
 */
export function resolveTourChargePricing(tour, paymentRegion = PAYMENT_REGION.DOMESTIC) {
  const audienceScope = inferAudienceScope(tour);

  if (audienceScope === AUDIENCE_SCOPE.LOCAL) {
    return {
      unitPrice: resolveTourListPriceGhs(tour),
      currency: TOUR_CURRENCY.code,
      audienceScope,
    };
  }

  if (audienceScope === AUDIENCE_SCOPE.FOREIGN) {
    return {
      unitPrice: resolveTourListPriceUsd(tour),
      currency: TOUR_CURRENCY_USD.code,
      audienceScope,
    };
  }

  if (paymentRegion === PAYMENT_REGION.DOMESTIC) {
    return {
      unitPrice: resolveTourListPriceGhs(tour),
      currency: TOUR_CURRENCY.code,
      audienceScope,
    };
  }

  return {
    unitPrice: resolveTourListPriceUsd(tour),
    currency: TOUR_CURRENCY_USD.code,
    audienceScope,
  };
}

export function computeChargeSubtotal(tour, travelers, paymentRegion) {
  const charge = resolveTourChargePricing(tour, paymentRegion);
  const count = Number(travelers) || 0;
  const subtotal = Number((charge.unitPrice * count).toFixed(2));
  return {
    ...charge,
    subtotal,
  };
}

export function validateTourPricing(form) {
  const audienceScope = form.audienceScope || AUDIENCE_SCOPE.LOCAL;

  if (audienceScope === AUDIENCE_SCOPE.LOCAL) {
    const ghs = parsePrice(form.priceAmountGhs ?? form.priceAmount);
    if (ghs <= 0) return "Enter a Ghana Cedis (GHS) price for this tour.";
    return "";
  }

  if (audienceScope === AUDIENCE_SCOPE.FOREIGN) {
    const usd = parsePrice(form.priceAmountUsd ?? form.priceAmount);
    if (usd <= 0) return "Enter a US Dollars (USD) price for this tour.";
    return "";
  }

  const ghs = parsePrice(form.priceAmountGhs);
  const usd = parsePrice(form.priceAmountUsd);

  if (ghs <= 0) return "Enter the Ghana (GHS) price for local buyers.";
  if (usd <= 0) return "Enter the international (USD) price for foreign buyers.";

  return "";
}
