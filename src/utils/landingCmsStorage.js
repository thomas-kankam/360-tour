import { heroContent, homeCtaSection, whyUsSection, testimonialsSection } from "../data/homeContent";
import { homeAboutTeaser } from "../data/aboutContent";
import { images } from "../config/images";

const STORAGE_KEY = "360tours_landing_cms";

const IMAGE_FIELD_KEYS = new Set(["backgroundImage", "image", "sideImage"]);

export function isCmsImageField(key) {
  return IMAGE_FIELD_KEYS.has(key) || key.endsWith("Image");
}

export const LANDING_CMS_DEFAULTS = {
  hero: {
    badge: heroContent.badge,
    title: heroContent.title,
    titleHighlight: heroContent.titleHighlight,
    subtitle: heroContent.subtitle,
    tagline: heroContent.tagline,
    primaryCtaLabel: heroContent.primaryCta.label,
    secondaryCtaLabel: heroContent.secondaryCta.label,
    backgroundImage: images.home.hero_img,
  },
  about: {
    eyebrow: homeAboutTeaser.eyebrow,
    title: homeAboutTeaser.title,
    tagline: homeAboutTeaser.tagline,
    summary: homeAboutTeaser.summary,
    extended: homeAboutTeaser.extended,
    image: images.tour_sites.volta,
  },
  features: {
    eyebrow: whyUsSection.eyebrow,
    title: whyUsSection.title,
    titleHighlight: whyUsSection.titleHighlight,
    subtitle: whyUsSection.subtitle,
    sideImage: images.tour_sites.arts_and_craft,
  },
  cta: {
    eyebrow: homeCtaSection.eyebrow,
    title: homeCtaSection.title,
    subtitle: homeCtaSection.subtitle,
    primaryCtaLabel: homeCtaSection.primaryCta.label,
    secondaryCtaLabel: homeCtaSection.secondaryCta.label,
    whatsappMessage: homeCtaSection.whatsappMessage,
    image: images.home.hero_two,
  },
  testimonials: {
    eyebrow: testimonialsSection.eyebrow,
    title: testimonialsSection.title,
    subtitle: testimonialsSection.subtitle,
    rating: testimonialsSection.rating,
    reviews: testimonialsSection.reviews,
  },
};

export function loadLandingCms() {
  if (typeof window === "undefined") return structuredClone(LANDING_CMS_DEFAULTS);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(LANDING_CMS_DEFAULTS);
    const parsed = JSON.parse(raw);
    return deepMerge(structuredClone(LANDING_CMS_DEFAULTS), parsed);
  } catch {
    return structuredClone(LANDING_CMS_DEFAULTS);
  }
}

export function saveLandingCms(content) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
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

export const LANDING_CMS_SECTIONS = [
  { id: "hero", label: "Hero banner" },
  { id: "about", label: "About teaser" },
  { id: "features", label: "Why choose us" },
  { id: "testimonials", label: "Testimonials" },
  { id: "cta", label: "Call to action" },
];
