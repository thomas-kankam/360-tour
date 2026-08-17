import { LANDING_CMS_DEFAULTS } from "./landingCmsStorage";

const SECTION_IDS = ["hero", "tours", "destinations", "regions", "explore", "cta"];

function snakeToCamel(key) {
  return String(key).replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

function normalizeFieldKeys(section = {}) {
  if (!section || typeof section !== "object" || Array.isArray(section)) return {};

  return Object.entries(section).reduce((acc, [key, value]) => {
    acc[snakeToCamel(key)] = value;
    return acc;
  }, {});
}

function deepMerge(base, patch) {
  const out = { ...base };
  Object.entries(patch || {}).forEach(([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = deepMerge(base[key] || {}, value);
    } else if (value !== undefined) {
      out[key] = value;
    }
  });
  return out;
}

export function mergeLandingCmsWithDefaults(content) {
  const merged = structuredClone(LANDING_CMS_DEFAULTS);

  SECTION_IDS.forEach((sectionId) => {
    merged[sectionId] = deepMerge(
      LANDING_CMS_DEFAULTS[sectionId],
      normalizeFieldKeys(content?.[sectionId]),
    );
  });

  return merged;
}

export function mapApiLandingCmsContent(raw) {
  if (!raw) return null;

  const payload = raw.content ?? raw.draft ?? raw.published ?? raw;
  if (!payload || typeof payload !== "object") return null;

  const hasSections = SECTION_IDS.some((sectionId) => payload[sectionId]);
  if (!hasSections) return null;

  return mergeLandingCmsWithDefaults(payload);
}

export function mapLandingCmsForApi(content) {
  return {
    content: mergeLandingCmsWithDefaults(content),
  };
}

export function mapApiLandingCmsMeta(raw) {
  const meta = raw?.meta ?? raw ?? {};
  return {
    draftUpdatedAt: meta.draft_updated_at ?? meta.draftUpdatedAt ?? null,
    publishedAt: meta.published_at ?? meta.publishedAt ?? raw?.published_at ?? null,
    publishedBy: meta.published_by ?? meta.publishedBy ?? null,
    hasUnpublishedChanges: Boolean(
      meta.has_unpublished_changes ?? meta.hasUnpublishedChanges ?? false,
    ),
  };
}
