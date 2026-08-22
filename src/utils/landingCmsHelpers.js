import { dataUrlToFile, isTrustedMediaUrl, optimizeImageFile } from "./imageOptimize";
import uploadServiceApi from "../apis/UploadServiceApi";
import { LANDING_CMS_DEFAULTS } from "./landingCmsStorage";
import { mergeCmsItems } from "./landingCmsItems";

function isStaleGalleryDestinationImage(image) {
  return /\/images\/gallery\/optimized\/(?!hero\b)/i.test(String(image || ""));
}

function sanitizeBrokenRemoteImages(content) {
  ["regions", "destinations", "gallery", "testimonials"].forEach((sectionId) => {
    const items = content?.[sectionId]?.items;
    if (!Array.isArray(items)) return;
    items.forEach((item) => {
      if (!isTrustedMediaUrl(item?.image) || isStaleGalleryDestinationImage(item?.image)) {
        item.image = "";
      }
    });
  });
}

const SECTION_IDS = ["hero", "tours", "destinations", "regions", "gallery", "testimonials", "explore", "cta"];

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
    if (key === "items" && Array.isArray(value)) {
      out.items = mergeCmsItems(base.items || [], value);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
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

  sanitizeBrokenRemoteImages(merged);

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

async function persistCmsImageValue(value, token, variant) {
  if (!value || typeof value !== "string") return value || "";
  if (!value.startsWith("data:")) return value;

  const file = dataUrlToFile(value);
  if (!file) return "";

  const optimized = await optimizeImageFile(file, variant);
  const result = await uploadServiceApi.uploadImage(token, optimized, { variant, role: "admin" });
  return result.ok ? result.url : "";
}

export async function persistLandingCmsMedia(content, token) {
  const next = structuredClone(content);

  if (next.hero) {
    next.hero.backgroundImage = await persistCmsImageValue(next.hero.backgroundImage, token, "hero");
  }
  if (next.cta) {
    next.cta.image = await persistCmsImageValue(next.cta.image, token, "destination");
  }

  for (const sectionId of ["destinations", "regions", "gallery", "testimonials"]) {
    const items = next[sectionId]?.items;
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      item.image = await persistCmsImageValue(item.image, token, "destination");
    }
  }

  return next;
}
