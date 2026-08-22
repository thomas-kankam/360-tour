import { mapOperatorTour } from "./operatorTourMapper";
import { resolveTourUnitPrice } from "./bookingHelpers";
import { buildTourPriceDisplay, inferAudienceScope, resolveTourListPriceGhs, resolveTourListPriceUsd } from "./tourPricing";
import {
  GHANA_PACKAGE_LINE_OPTIONS,
  extractPackageLineId,
  formatTourCategoryLabel,
  formatTourSlotsLabel,
  getGhanaPackageLineOption,
  isGhanaPackageLineId,
} from "./operatorTourConstants";

export { GHANA_PACKAGE_LINE_OPTIONS as PACKAGE_FILTER_OPTIONS };

export const COUNTRY_FILTER_OPTIONS = [
  { id: "all", label: "All countries", iconKey: "globe" },
  { id: "ghana", label: "Ghana", iconKey: "mapPin", apiCountry: "Ghana" },
  { id: "kenya", label: "Kenya", iconKey: "mapPin", apiCountry: "Kenya" },
  { id: "southafrica", label: "South Africa", iconKey: "mapPin", apiCountry: "South Africa" },
];

export const LISTING_SORT_OPTIONS = [
  { value: "default", label: "Featured", description: "Platform default order" },
  { value: "newest", label: "Newest first", description: "sort_by: desc" },
  { value: "oldest", label: "Oldest first", description: "sort_by: asc" },
  { value: "price-asc", label: "Price: low to high", description: "sort_by_price: asc" },
  { value: "price-desc", label: "Price: high to low", description: "sort_by_price: desc" },
];

const BADGE_COLORS = {
  orange: "bg-brand-accent text-brand-primary",
  gold: "bg-brand-gold text-brand-ink",
  green: "bg-brand-green text-white",
};

export function buildListingsPayload({ countryFilter, sort, departureDate, packageFilter }) {
  const payload = {};

  const countryOption = COUNTRY_FILTER_OPTIONS.find((option) => option.id === countryFilter);
  if (countryOption?.apiCountry) {
    payload.country = countryOption.apiCountry;
  }

  if (packageFilter && isGhanaPackageLineId(packageFilter)) {
    payload.category = packageFilter;
  }

  if (departureDate) {
    payload.departure_date = departureDate;
  }

  if (sort === "newest") payload.sort_by = "desc";
  if (sort === "oldest") payload.sort_by = "asc";
  if (sort === "price-asc") payload.sort_by_price = "asc";
  if (sort === "price-desc") payload.sort_by_price = "desc";

  return payload;
}

export function buildToursSearchPath({ country, date, package: packageId } = {}) {
  const params = new URLSearchParams();
  if (country && country !== "all") params.set("country", country);
  if (packageId && isGhanaPackageLineId(packageId)) params.set("package", packageId);
  if (date) params.set("date", date);
  const query = params.toString();
  return query ? `/tours?${query}` : "/tours";
}

export function resolvePackageFilterFromParams(packageParam) {
  if (packageParam && isGhanaPackageLineId(packageParam)) return packageParam;
  return "";
}

export function tourMatchesPackageLine(tour, packageId) {
  if (!packageId) return true;
  return (tour.categories || []).includes(packageId);
}

export function getPackageLineLabel(packageId) {
  return getGhanaPackageLineOption(packageId)?.label || packageId;
}

export function resolveCountryFilterIdFromName(countryName) {
  if (!countryName) return null;
  const normalized = String(countryName).trim().toLowerCase();
  const match = COUNTRY_FILTER_OPTIONS.find(
    (option) =>
      option.apiCountry?.toLowerCase() === normalized ||
      option.id === normalized ||
      option.label.toLowerCase() === normalized,
  );
  return match?.id && match.id !== "all" ? match.id : null;
}

export function formatDepartureDateLabel(isoDate) {
  if (!isoDate) return "";
  const parsed = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export function tourHasDepartureOnDate(tour, isoDate) {
  if (!isoDate || !tour) return true;
  return (tour.departureDates || []).includes(isoDate);
}

export function resolveCountryFilterFromParams(countryParam) {
  if (countryParam && COUNTRY_FILTER_OPTIONS.some((option) => option.id === countryParam)) {
    return countryParam;
  }
  return "all";
}

export function mapPublicTourToPopularCard(raw) {
  const card = mapPublicTourCard(raw);
  if (!card) return null;

  return {
    ...card,
    departDate: card.nextDate,
    bookingCount: Number(raw.bookingCount) || 0,
  };
}

export function mapPublicTourCard(tour) {
  if (!tour) return null;

  const nextDeparture = (tour.departureDates || []).find((departure) => departure.date);
  const isoDate = nextDeparture?.date || "";
  const spotsLeft = Number(nextDeparture?.spotsLeft ?? nextDeparture?.spotsTotal ?? tour.groupSizeMax) || 0;
  const totalSpots =
    Number(nextDeparture?.spotsTotal) || Number(tour.groupSizeMax) || Math.max(spotsLeft, 1);
  const locations = Array.isArray(tour.locations) ? tour.locations.filter(Boolean) : [];
  const priceDisplay = buildTourPriceDisplay(tour);

  let departDay = null;
  let departMonth = null;
  if (isoDate) {
    const parsed = new Date(`${isoDate}T12:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      departDay = String(parsed.getDate()).padStart(2, "0");
      departMonth = parsed.toLocaleDateString("en-US", { month: "short" });
    }
  }

  const packageLineId = extractPackageLineId(tour.categories);
  const categoryLabels = (tour.categories || [])
    .filter((category) => category && !isGhanaPackageLineId(category))
    .map(formatTourCategoryLabel)
    .filter(Boolean)
    .slice(0, 2);
  const highlight = (tour.highlights || []).find((item) => String(item || "").trim()) || "";
  const descriptionSnippet = String(tour.description || "").trim();

  return {
    slug: tour.slug,
    name: tour.name,
    location: locations.join(" · ") || tour.country || "",
    country: tour.country,
    categories: tour.categories || [],
    categoryLabels,
    packageLineLabel: packageLineId ? getPackageLineLabel(packageLineId) : "",
    duration: tour.durationLabel || `${tour.durationDays || 1} days`,
    durationDays: Number(tour.durationDays) || 1,
    groupSize: formatTourSlotsLabel(tour.groupSizeMax),
    nextDate: nextDeparture?.dateLabel || (isoDate ? formatDepartureDateLabel(isoDate) : "Dates coming soon"),
    departDay,
    departMonth,
    priceLabel: priceDisplay.priceLabel,
    priceLabelSecondary: priceDisplay.secondaryLabel,
    priceDisplay,
    audienceScope: priceDisplay.audienceScope,
    priceAmountGhs: resolveTourListPriceGhs(tour),
    priceAmountUsd: resolveTourListPriceUsd(tour),
    priceCurrency: tour.priceCurrency || "GHS",
    priceNum: resolveTourUnitPrice(tour),
    rating: Number(tour.rating) || 0,
    reviews: Number(tour.reviewCount) || 0,
    image: tour.coverImageUrl || "",
    badge: tour.badge || "",
    badgeColor: BADGE_COLORS[tour.badgeVariant] || "bg-white/90 text-brand-ink",
    spotsLeft,
    totalSpots,
    featured: Boolean(tour.featured),
    highlight,
    descriptionSnippet,
    departureDates: (tour.departureDates || []).map((departure) => departure.date).filter(Boolean),
  };
}

export function mapPublicTourDetail(raw) {
  const normalized = mapOperatorTour(raw);
  if (!normalized) return null;

  const card = mapPublicTourCard(normalized);
  const galleryUrls = (normalized.galleryImageUrls || []).filter(Boolean);
  const gallery = normalized.coverImageUrl && !galleryUrls.includes(normalized.coverImageUrl)
    ? [normalized.coverImageUrl, ...galleryUrls]
    : galleryUrls.length
      ? galleryUrls
      : normalized.coverImageUrl
        ? [normalized.coverImageUrl]
        : [];

  return {
    ...card,
    image: card.image || gallery[0] || "",
    gallery,
    description: normalized.description || "",
    highlights: (normalized.highlights || []).filter(Boolean),
    itinerary: normalized.itinerary || [],
    included: (normalized.included || []).filter(Boolean),
    notIncluded: (normalized.notIncluded || []).filter(Boolean),
    departureDates: normalized.departureDates || [],
    priceCurrency: normalized.priceCurrency || "GHS",
    priceAmount: Number(normalized.priceAmount) || 0,
    priceAmountGhs: Number(normalized.priceAmountGhs) || 0,
    priceAmountUsd: Number(normalized.priceAmountUsd) || 0,
    audienceScope: normalized.audienceScope || inferAudienceScope(normalized),
    depositPercent: normalized.bookingSettings?.depositPercent ?? 30,
    payOnSiteAllowed: normalized.bookingSettings?.payOnSiteAllowed !== false,
    onlinePaymentAllowed: normalized.bookingSettings?.onlinePaymentAllowed !== false,
    bookingSettings: normalized.bookingSettings || {},
  };
}

export function buildListingsPayloadFromCountry(country) {
  if (!country) return {};
  return { country };
}
