import { GHANA_TOURIST_CITIES } from "../data/ghanaRegions";
import { AUDIENCE_SCOPE } from "../constants/tourAudience";
import {
  COUNTRY_OPTIONS,
  createEmptyTourListing,
  DEPARTURE_SCHEDULE_DATE_RANGE,
  DEPARTURE_SCHEDULE_SPECIFIC,
  findCountryOption,
  formatTourPriceLabel,
  parseTourPriceAmount,
  isCustomTourType,
  isUnlimitedTourSlots,
  normalizeTourType,
  resolveCountryOption,
  TOUR_CURRENCY,
  TOUR_CURRENCY_USD,
  UNLIMITED_TOUR_SLOTS,
} from "./operatorTourConstants";
import { inferAudienceScope } from "./tourPricing";
import { normalizeTourImages, resolveImageForApiPayload, normalizeTourImage } from "./tourImageUtils";

const POPULAR_GHANA_CITIES = [
  "Accra",
  "Cape Coast",
  "Kumasi",
  "Tamale",
  "Takoradi",
  "Ho",
  "Bolgatanga",
  "Elmina",
  "Kakum",
  "Ada Foah",
];

export const GHANA_CITY_SUGGESTIONS = [
  ...new Set([
    ...POPULAR_GHANA_CITIES,
    ...Object.values(GHANA_TOURIST_CITIES).flat(),
  ]),
].sort((a, b) => a.localeCompare(b));

export function formatDepartureDateLabel(dateStr) {
  if (!dateStr) return "";
  const date = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDepartureRangeLabel(startDate, endDate) {
  const startLabel = formatDepartureDateLabel(startDate);
  const endLabel = formatDepartureDateLabel(endDate);
  if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
  return startLabel || endLabel || "";
}

function parseIsoDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(`${dateStr}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function diffDaysBetween(startDate, endDate) {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!start || !end) return 0;
  if (end < start) return 0;
  const diffMs = end.getTime() - start.getTime();
  const spanDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, spanDays || 0);
}

export function formatTourDurationLabel(days) {
  const count = Math.max(1, Number(days) || 1);
  return `${count} ${count === 1 ? "day" : "days"}`;
}

export function resolveTourDurationDays(source) {
  const rangeDeparture = (source?.departureDates || []).find(
    (departure) => departure.date && departure.endDate,
  );
  if (rangeDeparture) {
    return diffDaysBetween(rangeDeparture.date, rangeDeparture.endDate);
  }

  const fromField = Number(source?.durationDays);
  if (Number.isFinite(fromField) && fromField > 0) return fromField;

  const match = String(source?.durationLabel || "").match(/(\d+)/);
  return match ? Number(match[1]) : 1;
}

export function syncEndDateFromDuration(startDate, durationDays) {
  const start = parseIsoDate(startDate);
  const days = Math.max(1, Number(durationDays) || 1);
  if (!start) return "";
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  return end.toISOString().slice(0, 10);
}

export function inferDepartureScheduleType(raw, departureDates = []) {
  if (raw?.departureScheduleType === DEPARTURE_SCHEDULE_DATE_RANGE) return DEPARTURE_SCHEDULE_DATE_RANGE;
  if (raw?.departureScheduleType === DEPARTURE_SCHEDULE_SPECIFIC) return DEPARTURE_SCHEDULE_SPECIFIC;
  if ((departureDates || []).some((departure) => departure.endDate)) return DEPARTURE_SCHEDULE_DATE_RANGE;
  return DEPARTURE_SCHEDULE_SPECIFIC;
}

export function resolveTourTotalSlots(form) {
  const scheduleType = form.departureScheduleType || DEPARTURE_SCHEDULE_SPECIFIC;
  const departures = (form.departureDates || []).filter((departure) => departure.date);

  if (scheduleType === DEPARTURE_SCHEDULE_DATE_RANGE) {
    const rangeDeparture = departures[0] || form.departureDates?.[0] || {};
    return Math.max(1, Number(rangeDeparture.spotsTotal) || 1);
  }

  return getAllocatedDepartureSlots(form.departureDates);
}

export function mapOperatorTour(raw) {
  if (!raw) return null;

  const country = resolveCountryOption(raw.countryCode, raw.country);
  const locations = Array.isArray(raw.locations)
    ? raw.locations.filter(Boolean)
    : raw.location
      ? [raw.location]
      : [];

  const galleryUrls = raw.galleryImageUrls || raw.featureImageUrls || [];
  const featureImages = galleryUrls.map((url, index) => ({
    uri: url,
    data: "",
    mimeType: "image/jpeg",
    id: `gallery-${index}`,
  }));

  const coverUrl = raw.coverImageUrl || raw.coverImage?.uri || "";
  const departureDates = raw.departureDates?.length
    ? raw.departureDates
    : [{ date: "", dateLabel: "", spotsTotal: 18, label: "Next departure" }];
  const departureScheduleType = inferDepartureScheduleType(raw, departureDates);
  const allocatedSlots = getAllocatedDepartureSlots(departureDates);
  const totalSlots = Number(raw.totalSlots) || allocatedSlots || raw.groupSizeMax || 18;
  const durationDays = resolveTourDurationDays({ ...raw, departureDates });
  const durationLabel = formatTourDurationLabel(durationDays);

  return normalizeTourImages({
    slug: raw.slug || "",
    name: raw.name || "",
    locations,
    country: raw.country || country.country,
    countryId: country.id,
    countryCode: country.dialCode,
    categories: raw.categories || [],
    tourType: normalizeTourType(raw.tourType ?? raw.tour_type),
    regions: raw.regions || [],
    regionLabels: raw.regionLabels || [],
    status: raw.status || "draft",
    durationDays,
    durationLabel,
    groupSizeMin: raw.groupSizeMin ?? 2,
    groupSizeMax: raw.groupSizeMax ?? 20,
    priceAmount: raw.priceAmount ?? 0,
    priceAmountGhs: raw.priceAmountGhs ?? (raw.priceCurrency === TOUR_CURRENCY.code ? raw.priceAmount : ""),
    priceAmountUsd: raw.priceAmountUsd ?? (raw.priceCurrency === "USD" ? raw.priceAmount : ""),
    audienceScope: inferAudienceScope(raw),
    priceCurrency: raw.priceCurrency || TOUR_CURRENCY.code,
    priceLabel: raw.priceLabel || "",
    rating: raw.rating ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    coverImage: { uri: coverUrl, data: "", mimeType: "image/jpeg" },
    coverImageUrl: coverUrl,
    featureImages,
    galleryImageUrls: galleryUrls,
    description: raw.description || "",
    highlights: raw.highlights?.length ? raw.highlights : [""],
    itinerary: (raw.itinerary || []).map(normalizeItineraryDay).filter(Boolean),
    included: raw.included?.length ? raw.included : [""],
    notIncluded: raw.notIncluded?.length ? raw.notIncluded : [""],
    totalSlots,
    departureScheduleType,
    departureDates,
    bookingSettings: {
      depositPercent: raw.bookingSettings?.depositPercent ?? 30,
      payOnSiteAllowed: raw.bookingSettings?.payOnSiteAllowed ?? true,
      onlinePaymentAllowed: raw.bookingSettings?.onlinePaymentAllowed ?? true,
      maxGroupSize: raw.bookingSettings?.maxGroupSize ?? 200,
      minGroupSize: raw.bookingSettings?.minGroupSize ?? 2,
    },
    operatorSlug: raw.operatorSlug || "",
    createdAt: raw.createdAt || "",
    updatedAt: raw.updatedAt || "",
  });
}

export function mapOperatorTourList(data) {
  if (Array.isArray(data)) {
    return { items: data.map(mapOperatorTour).filter(Boolean), pagination: null };
  }

  const rawItems = data?.items ?? data?.data ?? [];
  const items = (Array.isArray(rawItems) ? rawItems : []).map(mapOperatorTour).filter(Boolean);
  return { items, pagination: data?.pagination ?? null };
}

export function buildLocationsLabel(locations) {
  return (locations || []).filter(Boolean).join(" · ");
}

function normalizeItineraryDay(day, index) {
  if (!day) return null;
  const imageUrl = day.imageUrl || day.image_url || day.image?.uri || "";
  return {
    day: Number(day.day) || index + 1,
    title: day.title || "",
    description: day.description || "",
    imageUrl,
    image: normalizeTourImage(day.image || imageUrl, imageUrl),
  };
}

function mapItineraryForApi(day) {
  const imageUrl = resolveImageForApiPayload(day.image, day.imageUrl || "");
  const payload = {
    day: Number(day.day) || 1,
    title: (day.title || "").trim(),
    description: (day.description || "").trim(),
  };
  if (imageUrl) payload.imageUrl = imageUrl;
  return payload;
}

export function getAllocatedDepartureSlots(departureDates) {
  return (departureDates || [])
    .filter((d) => d.date)
    .reduce((sum, d) => sum + Math.max(0, Number(d.spotsTotal) || 0), 0);
}

export function getRemainingDepartureSlots(totalSlots, departureDates) {
  const total = Math.max(0, Number(totalSlots) || 0);
  return Math.max(0, total - getAllocatedDepartureSlots(departureDates));
}

export function validateTourSlotAllocation(form) {
  // Customized tours are enquiry-led: dates and capacity are agreed per traveller.
  if (isCustomTourType(form?.tourType)) return "";

  const scheduleType = form.departureScheduleType || DEPARTURE_SCHEDULE_SPECIFIC;

  if (scheduleType === DEPARTURE_SCHEDULE_DATE_RANGE) {
    const departure = (form.departureDates || [])[0] || {};
    if (!departure.date) return "Select a start date for this tour window.";
    if (!departure.endDate) return "Select an end date for this tour window.";
    if (departure.endDate < departure.date) return "End date must be on or after the start date.";
    if (!isUnlimitedTourSlots(departure.spotsTotal) && (Number(departure.spotsTotal) || 0) < 1) {
      return "Set available slots to at least 1 or choose unlimited.";
    }
    return "";
  }

  const datedDepartures = (form.departureDates || []).filter((departure) => departure.date);
  if (!datedDepartures.length) return "Add at least one departure date.";
  if (datedDepartures.some((departure) => (Number(departure.spotsTotal) || 0) < 1)) {
    return "Each departure needs at least 1 available slot.";
  }

  return "";
}

export function buildCreateTourPayload(form) {
  return buildTourPayload(form, { isUpdate: false });
}

export function buildTourPayload(form, { isUpdate = false } = {}) {
  const country = findCountryOption(form.countryId) || COUNTRY_OPTIONS[0];
  const locations = (form.locations || []).map((l) => String(l).trim()).filter(Boolean);
  const tourType = normalizeTourType(form.tourType);
  const isCustom = isCustomTourType(tourType);
  const uniqueCategories = [country.id];

  const galleryFallbacks = form.galleryImageUrls || [];
  const featureImages = (form.featureImages || []).filter((img) => img?.uri || img?.data);
  const coverImageUrl = resolveImageForApiPayload(form.coverImage, form.coverImageUrl || "");
  const galleryImageUrls = featureImages
    .map((img, index) => resolveImageForApiPayload(img, galleryFallbacks[index] || img?.uri || ""))
    .filter(Boolean);

  const departureDates = isCustom
    ? []
    : (form.departureDates || [])
    .filter((departure) => departure.date)
    .map((departure, index) => {
      const spotsTotal = Number(departure.spotsTotal) || 0;
      const spotsLeft = isUpdate && departure.spotsLeft != null
        ? Math.min(Number(departure.spotsLeft) || 0, spotsTotal)
        : spotsTotal;
      const endDate = departure.endDate || "";
      const rangeLabel = endDate
        ? formatDepartureRangeLabel(departure.date, endDate)
        : formatDepartureDateLabel(departure.date);

      return {
        date: departure.date,
        ...(endDate ? { endDate } : {}),
        dateLabel: departure.dateLabel || formatDepartureDateLabel(departure.date),
        ...(endDate ? { endDateLabel: departure.endDateLabel || formatDepartureDateLabel(endDate) } : {}),
        spotsTotal,
        spotsLeft,
        label: departure.label || rangeLabel || (index === 0 ? "Next departure" : "Available"),
      };
    });

  // Customized tours have no published capacity, so they carry unlimited slots.
  const totalSlots = isCustom
    ? UNLIMITED_TOUR_SLOTS
    : resolveTourTotalSlots({
      ...form,
      departureDates: (form.departureDates || []).filter((departure) => departure.date || departure.endDate),
    });
  const normalizedTotalSlots = isUnlimitedTourSlots(totalSlots) ? UNLIMITED_TOUR_SLOTS : Math.max(1, totalSlots);
  const durationDays = resolveTourDurationDays(form);
  const audienceScope = form.audienceScope || AUDIENCE_SCOPE.LOCAL;
  let priceAmountGhs = null;
  let priceAmountUsd = null;
  let priceAmount;
  let priceCurrency;
  let priceLabel;

  if (audienceScope === AUDIENCE_SCOPE.LOCAL) {
    priceAmountGhs = parseTourPriceAmount(form.priceAmountGhs ?? form.priceAmount);
    priceAmount = priceAmountGhs;
    priceCurrency = TOUR_CURRENCY.code;
    priceLabel = form.priceLabel || formatTourPriceLabel(priceAmount, priceCurrency);
  } else if (audienceScope === AUDIENCE_SCOPE.FOREIGN) {
    priceAmountUsd = parseTourPriceAmount(form.priceAmountUsd ?? form.priceAmount);
    priceAmount = priceAmountUsd;
    priceCurrency = TOUR_CURRENCY_USD.code;
    priceLabel = form.priceLabel || formatTourPriceLabel(priceAmount, priceCurrency);
  } else {
    priceAmountGhs = parseTourPriceAmount(form.priceAmountGhs);
    priceAmountUsd = parseTourPriceAmount(form.priceAmountUsd);
    priceAmount = priceAmountGhs;
    priceCurrency = TOUR_CURRENCY.code;
    priceLabel = form.priceLabel || formatTourPriceLabel(priceAmount, priceCurrency);
  }

  const groupSizeMin = 1;
  const groupSizeMax = normalizedTotalSlots;

  return {
    name: form.name.trim(),
    locations,
    country: country.country,
    countryCode: country.dialCode,
    categories: uniqueCategories,
    tourType,
    status: form.status || "draft",
    durationDays,
    durationLabel: formatTourDurationLabel(durationDays),
    groupSizeMin,
    groupSizeMax,
    totalSlots: normalizedTotalSlots,
    departureScheduleType: form.departureScheduleType || DEPARTURE_SCHEDULE_SPECIFIC,
    audienceScope,
    priceAmount,
    priceAmountGhs,
    ...(priceAmountUsd != null ? { priceAmountUsd } : {}),
    priceCurrency,
    priceLabel,
    rating: Number(form.rating) || 0,
    reviewCount: Number(form.reviewCount) || 0,
    coverImageUrl,
    galleryImageUrls,
    description: form.description.trim(),
    highlights: (form.highlights || []).map((h) => h.trim()).filter(Boolean),
    itinerary: (form.itinerary || [])
      .filter((d) => d.title?.trim() || d.description?.trim() || d.image?.uri || d.image?.data || d.imageUrl)
      .map(mapItineraryForApi),
    included: (form.included || []).map((i) => i.trim()).filter(Boolean),
    notIncluded: (form.notIncluded || []).map((i) => i.trim()).filter(Boolean),
    departureDates,
    bookingSettings: {
      depositPercent: Number(form.bookingSettings?.depositPercent) || 0,
      payOnSiteAllowed: Boolean(form.bookingSettings?.payOnSiteAllowed),
      onlinePaymentAllowed: Boolean(form.bookingSettings?.onlinePaymentAllowed),
      maxGroupSize: Number(form.bookingSettings?.maxGroupSize) || groupSizeMax,
      minGroupSize: Number(form.bookingSettings?.minGroupSize) || 1,
    },
  };
}

export function mapOperatorTourToForm(tour) {
  return mapOperatorTour(tour) || createEmptyTourListing();
}
