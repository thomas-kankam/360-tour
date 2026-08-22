import { mapOperatorTour } from "./operatorTourMapper";
import { resolveTourUnitPrice } from "./bookingHelpers";
import { buildTourPriceDisplay, inferAudienceScope, resolveTourListPriceGhs, resolveTourListPriceUsd } from "./tourPricing";
import { GHANA_REGIONS, getRegionLabel, isGhanaRegionId } from "../data/ghanaRegions";
import {
  formatTourSlotsLabel,
  getTourTypeLabel,
  isCustomTourType,
  normalizeTourType,
  TOUR_TYPE,
} from "./operatorTourConstants";

/** Region chips for the tours browser — "All regions" first, then every Ghana region. */
export const REGION_FILTER_OPTIONS = [
  { id: "all", label: "All regions", iconKey: "globe" },
  ...GHANA_REGIONS.map((region) => ({ ...region, iconKey: "mapPin" })),
];

export const COUNTRY_FILTER_OPTIONS = [
  { id: "all", label: "All countries", iconKey: "globe" },
  { id: "ghana", label: "Ghana", iconKey: "mapPin", apiCountry: "Ghana" },
  { id: "kenya", label: "Kenya", iconKey: "mapPin", apiCountry: "Kenya" },
  { id: "southafrica", label: "South Africa", iconKey: "mapPin", apiCountry: "South Africa" },
];

export const TOUR_TYPE_FILTER_OPTIONS = [
  { id: "all", label: "All trips" },
  { id: TOUR_TYPE.REGULAR, label: "Scheduled" },
  { id: TOUR_TYPE.CUSTOM, label: "Tailor-made" },
];

export const LISTING_SORT_OPTIONS = [
  { value: "default", label: "Recommended", description: "Platform default order" },
  { value: "newest", label: "Newest first", description: "sort_by: desc" },
  { value: "oldest", label: "Oldest first", description: "sort_by: asc" },
  { value: "price-asc", label: "Price: low to high", description: "sort_by_price: asc" },
  { value: "price-desc", label: "Price: high to low", description: "sort_by_price: desc" },
];

export function buildListingsPayload({ countryFilter, regionFilter, tourTypeFilter, sort, departureDate }) {
  const payload = {};

  const countryOption = COUNTRY_FILTER_OPTIONS.find((option) => option.id === countryFilter);
  if (countryOption?.apiCountry) {
    payload.country = countryOption.apiCountry;
  }

  if (regionFilter && isGhanaRegionId(regionFilter)) {
    payload.region = regionFilter;
  }

  if (tourTypeFilter && tourTypeFilter !== "all") {
    payload.tour_type = normalizeTourType(tourTypeFilter);
  }

  if (departureDate) {
    payload.departure_date = departureDate;
  }

  if (sort === "newest") payload.sort_by = "desc";
  if (sort === "oldest") payload.sort_by = "asc";
  if (sort === "price-asc") payload.price_amount = "asc";
  if (sort === "price-desc") payload.price_amount = "desc";

  return payload;
}

export function buildToursSearchPath({ country, date, region, tourType } = {}) {
  const params = new URLSearchParams();
  if (country && country !== "all") params.set("country", country);
  if (region && isGhanaRegionId(region)) params.set("region", region);
  if (tourType && tourType !== "all") params.set("type", normalizeTourType(tourType));
  if (date) params.set("date", date);
  const query = params.toString();
  return query ? `/tours?${query}` : "/tours";
}

export function resolveRegionFilterFromParams(regionParam) {
  return regionParam && isGhanaRegionId(regionParam) ? regionParam : "all";
}

export function resolveTourTypeFilterFromParams(typeParam) {
  const value = String(typeParam || "").toLowerCase();
  return value === TOUR_TYPE.REGULAR || value === TOUR_TYPE.CUSTOM ? value : "all";
}

export function tourMatchesRegion(tour, regionId) {
  if (!regionId || regionId === "all") return true;
  if ((tour.regions || []).includes(regionId)) return true;

  const label = getRegionLabel(regionId);
  if (!label) return false;
  return (tour.locations || []).some((location) => String(location).includes(label));
}

export function getRegionFilterLabel(regionId) {
  return getRegionLabel(regionId) || regionId;
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

  const tourType = normalizeTourType(tour.tourType);
  const isCustom = isCustomTourType(tourType);
  const regions = tour.regions || [];
  const regionLabels = (tour.regionLabels?.length
    ? tour.regionLabels
    : regions.map(getRegionLabel)
  ).filter(Boolean);
  const highlight = (tour.highlights || []).find((item) => String(item || "").trim()) || "";
  const descriptionSnippet = String(tour.description || "").trim();

  return {
    slug: tour.slug,
    name: tour.name,
    location: locations.join(" · ") || tour.country || "",
    country: tour.country,
    categories: tour.categories || [],
    tourType,
    isCustom,
    tourTypeLabel: getTourTypeLabel(tourType),
    regions,
    regionLabels,
    locations,
    duration: tour.durationLabel || `${tour.durationDays || 1} days`,
    durationDays: Number(tour.durationDays) || 1,
    groupSize: formatTourSlotsLabel(tour.groupSizeMax),
    nextDate: isCustom
      ? "Dates to suit you"
      : nextDeparture?.dateLabel || (isoDate ? formatDepartureDateLabel(isoDate) : "Dates coming soon"),
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
    spotsLeft,
    totalSpots,
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
