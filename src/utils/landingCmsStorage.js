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
import { buildDefaultDestinationItems, buildDefaultGalleryItems, buildDefaultRegionItems, buildDefaultTestimonialItems, mergeCmsItems } from "./landingCmsItems";
import { resolvePublicMediaUrl } from "./mediaUrl";

const STORAGE_KEY = "360tours_landing_cms";

export { STORAGE_KEY };

const IMAGE_FIELD_KEYS = new Set(["backgroundImage", "image", "sideImage"]);

export function isCmsImageField(key) {
  if (key === "slideshowImages" || key === "mediaType" || key === "backgroundVideo") return false;
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
    mediaType: "image",
    backgroundImage: images.home.heroBanner.webp,
    slideshowImages: [],
    backgroundVideo: "",
  },
  tours: {
    eyebrow: "Discover tours",
    title: "Popular tours",
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
    eyebrow: "Gallery",
    title: "Moments from the road",
    subtitle:
      "Castles on the coast, waterfalls in the Volta hills, palaces in Kumasi, and savanna at sunrise.",
    ctaLabel: "Browse all tours",
    items: buildDefaultGalleryItems(),
  },
  testimonials: {
    eyebrow: testimonialsSection.eyebrow,
    title: testimonialsSection.title,
    subtitle: testimonialsSection.subtitle,
    rating: testimonialsSection.rating,
    reviews: testimonialsSection.reviews,
    items: buildDefaultTestimonialItems(),
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
    contactEmail: "360toursghana@gmail.com",
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
  auth: {
    loginImage: images.destinations.popular.capeCoastCastle,
    signupImage: images.tour_sites.manhyia_palace,
    verifyImage: images.tour_sites.arts_and_craft,
    adminImage: images.home.heroBanner.webp,
  },
};

export function loadLandingCms() {
  if (typeof window === "undefined") return structuredClone(LANDING_CMS_DEFAULTS);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(LANDING_CMS_DEFAULTS);
    const parsed = JSON.parse(raw);
    const merged = deepMerge(structuredClone(LANDING_CMS_DEFAULTS), parsed);
    // Migrate old hero placeholder paths to the optimized gallery photo
    const heroBg = merged.hero?.backgroundImage;
    if (heroBg === "/images/hero_img.png" || heroBg === "/images/home/hero.jpg") {
      merged.hero.backgroundImage = LANDING_CMS_DEFAULTS.hero.backgroundImage;
    }
    if (merged.hero?.titleHighlight === "360°" || merged.hero?.title === "Experience Ghana in") {
      merged.hero.title = heroContent.title;
      merged.hero.titleHighlight = heroContent.titleHighlight;
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

function sanitizeBrokenRemoteImages(content) {
  ["regions", "destinations", "gallery", "testimonials"].forEach((sectionId) => {
    const items = content?.[sectionId]?.items;
    if (!Array.isArray(items)) return;
    items.forEach((item) => {
      if (!item?.image) return;
      if (!isTrustedMediaUrl(item.image)) {
        item.image = "";
        return;
      }
      item.image = resolvePublicMediaUrl(item.image);
    });
  });

  if (content?.hero?.backgroundImage) {
    content.hero.backgroundImage = resolvePublicMediaUrl(content.hero.backgroundImage);
  }
  if (content?.hero?.backgroundVideo) {
    content.hero.backgroundVideo = resolvePublicMediaUrl(content.hero.backgroundVideo);
  }
  if (Array.isArray(content?.hero?.slideshowImages)) {
    content.hero.slideshowImages = content.hero.slideshowImages
      .map((url) => (url && isTrustedMediaUrl(url) ? resolvePublicMediaUrl(url) : ""))
      .filter(Boolean);
  }
  if (content?.auth) {
    ["loginImage", "signupImage", "verifyImage", "adminImage"].forEach((key) => {
      if (!content.auth[key]) return;
      if (!isTrustedMediaUrl(content.auth[key])) {
        content.auth[key] = "";
        return;
      }
      content.auth[key] = resolvePublicMediaUrl(content.auth[key]);
    });
  }
  if (content?.cta?.image) {
    content.cta.image = resolvePublicMediaUrl(content.cta.image);
  }
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
  { id: "auth", label: "Login backgrounds" },
  { id: "tours", label: "Popular tours" },
  { id: "destinations", label: "Popular destinations" },
  { id: "gallery", label: "Photo gallery" },
  { id: "testimonials", label: "Testimonials" },
  { id: "cta", label: "Final call to action" },
];
