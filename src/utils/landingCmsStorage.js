import {
  heroContent,
  homeCtaSection,
  operatingSection,
  popularDestinationsSection,
  testimonialsSection,
  toursPageSection,
} from "../data/homeContent";
import { images } from "../config/images";
import { isTrustedMediaUrl } from "./imageOptimize";
import { buildDefaultDestinationItems, buildDefaultRegionItems, mergeCmsItems } from "./landingCmsItems";

const STORAGE_KEY = "360tours_landing_cms";

export { STORAGE_KEY };

const IMAGE_FIELD_KEYS = new Set(["backgroundImage", "image", "sideImage"]);

export function isCmsImageField(key) {
  return IMAGE_FIELD_KEYS.has(key) || key.endsWith("Image");
}

export const LANDING_CMS_DEFAULTS = {
  hero: {
    badge: heroContent.badge,
    title: heroContent.title,
    titleHighlight: heroContent.titleHighlight,
    subtitle: "Tours, stays, and transport across Ghana and beyond, planned for you.",
    tagline: heroContent.tagline,
    primaryCtaLabel: heroContent.primaryCta.label,
    secondaryCtaLabel: heroContent.secondaryCta.label,
    backgroundImage: images.home.heroBanner.webp,
  },
  tours: {
    eyebrow: "Featured journeys",
    title: "Start with these four",
    subtitle: toursPageSection.subtitle,
    viewAllLabel: "View all tours",
  },
  destinations: {
    eyebrow: popularDestinationsSection.eyebrow,
    title: popularDestinationsSection.title,
    subtitle: popularDestinationsSection.subtitle,
    ctaLabel: "View all tours",
    bookLabel: "Book this experience",
    items: buildDefaultDestinationItems(),
  },
  regions: {
    eyebrow: operatingSection.eyebrow,
    title: operatingSection.title,
    subtitle: operatingSection.subtitle,
    ctaLabel: operatingSection.cta.label,
    footerNote: "Ghana is our home base, with curated experiences across Africa.",
    items: buildDefaultRegionItems(),
  },
  gallery: {
    eyebrow: "From the road",
    title: "Places we have already taken travellers",
    subtitle:
      "Real stops from real departures — castles on the coast, waterfalls in the Volta hills, palaces in Kumasi, and savanna at sunrise.",
    ctaLabel: "Browse tours by region",
  },
  testimonials: {
    eyebrow: testimonialsSection.eyebrow,
    title: testimonialsSection.title,
    subtitle: testimonialsSection.subtitle,
    rating: testimonialsSection.rating,
    reviews: testimonialsSection.reviews,
  },
  explore: {
    eyebrow: "Learn more",
    title: "Explore 360 Tours",
    aboutLabel: "About us",
    aboutText: "Our story, services, and offices in Ghana and Amsterdam.",
    aboutCta: "About 360 Tours",
    whyLabel: "Why choose us",
    whyText: "Guided tours, flexible departures, and end-to-end coordination.",
    whyCta: "See why travelers trust us",
    contactLabel: "Plan your trip",
    contactText: "Custom quotes, group travel, and visa on arrival guidance.",
    contactCta: "Contact us",
  },
  cta: {
    eyebrow: homeCtaSection.eyebrow,
    title: homeCtaSection.title,
    subtitle: "Tell us your dates and interests, we will handle the rest.",
    primaryCtaLabel: homeCtaSection.primaryCta.label,
    secondaryCtaLabel: "View all tours",
    whatsappMessage: homeCtaSection.whatsappMessage,
    image: images.home.hero_two,
  },
};

export function loadLandingCms() {
  if (typeof window === "undefined") return structuredClone(LANDING_CMS_DEFAULTS);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(LANDING_CMS_DEFAULTS);
    const parsed = JSON.parse(raw);
    const merged = deepMerge(structuredClone(LANDING_CMS_DEFAULTS), parsed);
    // Migrate old AI hero placeholder to real gallery photo
    const heroBg = merged.hero?.backgroundImage;
    if (heroBg === "/images/hero_img.png" || heroBg === "/images/home/hero.jpg") {
      merged.hero.backgroundImage = LANDING_CMS_DEFAULTS.hero.backgroundImage;
    }
    sanitizeBrokenRemoteImages(merged);
    return merged;
  } catch {
    return structuredClone(LANDING_CMS_DEFAULTS);
  }
}

export function saveLandingCms(content) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
}

function isStaleGalleryDestinationImage(image) {
  return /\/images\/gallery\/optimized\/(?!hero\b)/i.test(String(image || ""));
}

function sanitizeBrokenRemoteImages(content) {
  ["regions", "destinations"].forEach((sectionId) => {
    const items = content?.[sectionId]?.items;
    if (!Array.isArray(items)) return;

    items.forEach((item) => {
      const image = String(item?.image || "");
      if (!image) return;
      if (!isTrustedMediaUrl(item?.image) || isStaleGalleryDestinationImage(image)) {
        item.image = "";
      }
    });
  });
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

export const LANDING_CMS_SECTIONS = [
  { id: "hero", label: "Hero banner" },
  { id: "tours", label: "Featured tours" },
  { id: "destinations", label: "Popular destinations" },
  { id: "regions", label: "Ghana regions" },
  { id: "gallery", label: "Adventure gallery" },
  { id: "testimonials", label: "Guest stories" },
  { id: "explore", label: "Explore links" },
  { id: "cta", label: "Final call to action" },
];
