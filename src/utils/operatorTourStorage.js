import { buildCreateTourPayload } from "./operatorTourMapper";
import {
  BADGE_VARIANTS,
  COUNTRY_OPTIONS,
  TOUR_CATEGORY_OPTIONS,
  GHANA_PACKAGE_LINE_OPTIONS,
  createEmptyTourListing,
  getPackageLinePhotoHints,
  isGhanaPackageLineId,
  isCountryCategoryId,
  resolveCountryOption,
  findCountryOption,
} from "./operatorTourConstants";
import { getImagePreviewSrc, MAX_FEATURE_IMAGES, normalizeTourImages, toApiImagePayload } from "./tourImageUtils";

const tour_KEY = "360tours_operator_tours";
const LEGACY_TOUR_KEY = "afriqwest_operator_tours";

function generateId() {
  return `tour_${Date.now().toString(36)}`;
}

export function getOperatorTours() {
  try {
    const raw = localStorage.getItem(tour_KEY) ?? localStorage.getItem(LEGACY_TOUR_KEY);
    const tours = raw ? JSON.parse(raw) : [];
    return tours.map(normalizeTourListing);
  } catch {
    return [];
  }
}

function saveAll(tours) {
  localStorage.setItem(tour_KEY, JSON.stringify(tours));
  window.dispatchEvent(new CustomEvent("360tours:operator-tours-updated"));
}

export function getOperatorTourById(id) {
  const tour = getOperatorTours().find((t) => t.id === id || t.slug === id) ?? null;
  return tour ? normalizeTourListing(tour) : null;
}

export function normalizeTourListing(tour) {
  const normalized = normalizeTourImages(tour);
  const locations = Array.isArray(normalized.locations)
    ? normalized.locations.filter(Boolean)
    : normalized.location
      ? [normalized.location]
      : [];

  return {
    ...normalized,
    locations,
    location: locations.join(" · "),
    countryId: normalized.countryId || resolveCountryOption(normalized.countryCode, normalized.country).id,
  };
}

export function buildTourApiPayload(tour) {
  return buildCreateTourPayload(normalizeTourListing(tour));
}

export function saveOperatorTour(tour) {
  const payload = buildTourApiPayload(tour);
  const record = {
    ...payload,
    ...(tour.slug ? { slug: tour.slug } : {}),
    id: tour.id || generateId(),
    updatedAt: new Date().toISOString(),
    createdAt: tour.createdAt || new Date().toISOString(),
  };
  const existing = getOperatorTours();
  const updated = [record, ...existing.filter((t) => t.id !== record.id)];
  saveAll(updated);
  return record;
}

export function deleteOperatorTour(id) {
  const updated = getOperatorTours().filter((t) => t.id !== id && t.slug !== id);
  saveAll(updated);
}

export {
  TOUR_CATEGORY_OPTIONS,
  GHANA_PACKAGE_LINE_OPTIONS,
  COUNTRY_OPTIONS,
  BADGE_VARIANTS,
  createEmptyTourListing,
  getPackageLinePhotoHints,
  isGhanaPackageLineId,
  isCountryCategoryId,
  findCountryOption,
};

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export { getImagePreviewSrc, toApiImagePayload, MAX_FEATURE_IMAGES };
