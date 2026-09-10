import {
  aboutPage,
  aboutPageHero,
  company,
  homeAboutTeaser,
} from "../data/aboutContent";
import { ROUTES } from "../constants/routes";

export const STORAGE_KEY = "360tours_about_cms";

export const ABOUT_CMS_DEFAULTS = {
  hero: {
    eyebrow: aboutPageHero.eyebrow,
    title: aboutPageHero.title,
    titleLine: aboutPageHero.titleLine,
    titleHighlight: aboutPageHero.titleHighlight,
    description: aboutPageHero.description,
    tagline: aboutPageHero.tagline,
    services: aboutPageHero.services,
    heroImage: "/images/gallery/optimized/hero.webp",
    storyImage: "/images/home/manhyia_palace.jpg",
  },
  company: {
    name: company.name,
    shortName: company.shortName,
    tagline: company.tagline,
    subtitle: company.subtitle,
    location: company.location,
    motto: company.motto,
  },
  story: {
    intro: aboutPage.intro,
    story: aboutPage.story,
    journey: aboutPage.journey,
    commitment: aboutPage.commitment,
  },
  mission: aboutPage.mission,
  vision: aboutPage.vision,
  values: aboutPage.values,
  tourServices: aboutPage.tourServices,
  supportServices: aboutPage.supportServices,
  popularDestinations: aboutPage.popularDestinations,
  whyTravelWithUs: aboutPage.whyTravelWithUs,
  faqs: aboutPage.faqs,
  cta: {
    title: aboutPage.cta.title,
    subtitle: aboutPage.cta.subtitle,
    primaryLabel: aboutPage.cta.primary.label,
    primaryTo: aboutPage.cta.primary.to || ROUTES.contact,
    secondaryLabel: aboutPage.cta.secondary.label,
    secondaryTo: aboutPage.cta.secondary.to || ROUTES.tours,
  },
  teaser: {
    eyebrow: homeAboutTeaser.eyebrow,
    title: homeAboutTeaser.title,
    tagline: homeAboutTeaser.tagline,
    subtitle: homeAboutTeaser.subtitle,
    summary: homeAboutTeaser.summary,
    extended: homeAboutTeaser.extended,
  },
};

export const ABOUT_CMS_SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "company", label: "Company" },
  { id: "story", label: "Our story" },
  { id: "mission", label: "Mission & values" },
  { id: "tourServices", label: "Tour services" },
  { id: "supportServices", label: "Support services" },
  { id: "popularDestinations", label: "Destinations" },
  { id: "whyTravelWithUs", label: "Why us" },
  { id: "faqs", label: "FAQs" },
  { id: "cta", label: "CTA" },
];

function mergeArray(defaults, overrides) {
  // Empty arrays from the API mean "unset" — keep the live About page defaults
  // so the admin editor and preview match what guests already see.
  if (!Array.isArray(overrides) || overrides.length === 0) return defaults;
  return overrides;
}

function mergeText(defaults, overrides) {
  if (overrides == null) return defaults;
  if (typeof overrides === "string" && overrides.trim() === "") return defaults;
  return overrides;
}

function mergeObjectFields(defaults = {}, overrides = {}, textKeys = []) {
  const merged = { ...defaults, ...(overrides || {}) };
  textKeys.forEach((key) => {
    merged[key] = mergeText(defaults[key], overrides?.[key]);
  });
  return merged;
}

export function mergeAboutCmsWithDefaults(content = {}) {
  const defaults = ABOUT_CMS_DEFAULTS;
  const heroOverrides = content.hero || {};
  return {
    hero: {
      ...mergeObjectFields(defaults.hero, heroOverrides, [
        "eyebrow",
        "title",
        "titleLine",
        "titleHighlight",
        "description",
        "tagline",
        "heroImage",
        "storyImage",
      ]),
      services: mergeArray(defaults.hero.services, heroOverrides.services),
    },
    company: mergeObjectFields(defaults.company, content.company, [
      "name",
      "shortName",
      "tagline",
      "subtitle",
      "location",
      "motto",
    ]),
    story: mergeObjectFields(defaults.story, content.story, ["intro", "story", "journey", "commitment"]),
    mission: mergeObjectFields(defaults.mission, content.mission, ["title", "text"]),
    vision: mergeObjectFields(defaults.vision, content.vision, ["title", "text"]),
    values: mergeArray(defaults.values, content.values),
    tourServices: mergeArray(defaults.tourServices, content.tourServices),
    supportServices: mergeArray(defaults.supportServices, content.supportServices),
    popularDestinations: mergeArray(defaults.popularDestinations, content.popularDestinations),
    whyTravelWithUs: mergeArray(defaults.whyTravelWithUs, content.whyTravelWithUs),
    faqs: mergeArray(defaults.faqs, content.faqs),
    cta: mergeObjectFields(defaults.cta, content.cta, [
      "title",
      "subtitle",
      "primaryLabel",
      "primaryTo",
      "secondaryLabel",
      "secondaryTo",
    ]),
    teaser: mergeObjectFields(defaults.teaser, content.teaser, [
      "eyebrow",
      "title",
      "tagline",
      "subtitle",
      "summary",
      "extended",
    ]),
  };
}

export function loadAboutCms() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return ABOUT_CMS_DEFAULTS;
    return mergeAboutCmsWithDefaults(JSON.parse(raw));
  } catch {
    return ABOUT_CMS_DEFAULTS;
  }
}

export function saveAboutCms(content) {
  const merged = mergeAboutCmsWithDefaults(content);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

export function mapApiAboutCmsContent(raw) {
  const payload = raw?.content || raw?.draft || raw?.published || raw;
  if (!payload || typeof payload !== "object") return null;
  return mergeAboutCmsWithDefaults(payload);
}

export function mapAboutCmsForApi(content) {
  return { content: mergeAboutCmsWithDefaults(content) };
}

export function mapApiAboutCmsMeta(raw) {
  return {
    draftUpdatedAt: raw?.meta?.draft_updated_at || raw?.meta?.draftUpdatedAt || null,
    publishedAt: raw?.meta?.published_at || raw?.meta?.publishedAt || null,
    publishedBy: raw?.meta?.published_by || raw?.meta?.publishedBy || null,
    hasUnpublishedChanges: Boolean(raw?.meta?.has_unpublished_changes ?? raw?.meta?.hasUnpublishedChanges),
  };
}
