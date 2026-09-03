/** Shared CMS helpers for Stories / Experiences admin forms. */

export function slugifyCmsValue(value = "") {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const STORY_CATEGORY_OPTIONS = [
  "Newsletter",
  "Heritage",
  "Safari",
  "Culture",
  "Adventure",
  "Corporate",
];

export const EXPERIENCE_REGION_SUGGESTIONS = [
  "Greater Accra",
  "Central Region",
  "Ashanti Region",
  "Volta Region",
  "Eastern Region",
  "Western Region",
  "Northern Region",
  "Nationwide",
];
