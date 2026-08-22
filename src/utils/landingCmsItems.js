import { ghanaRegions, popularDestinations, testimonials } from "../data/homeContent";
import { adventureGallery, getAdventureGallerySources, getPopularDestinationImage, getPopularDestinationSources } from "../config/images";

export function serializeHighlights(highlights) {
  if (Array.isArray(highlights)) return highlights.join(", ");
  return String(highlights || "");
}

export function parseHighlights(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function defaultItemImage(item) {
  return item.fallback || getPopularDestinationImage(item.imageKey, { preferWebp: false }) || "";
}

function toCmsRegionItem(region) {
  return {
    id: region.id,
    name: region.name,
    region: region.region,
    tagline: region.tagline,
    desc: region.desc,
    highlights: serializeHighlights(region.highlights),
    image: defaultItemImage(region),
    imageKey: region.imageKey || "",
    packageId: region.packageId || "",
  };
}

function toCmsDestinationItem(destination) {
  return {
    id: destination.id,
    name: destination.name,
    region: destination.region,
    image: defaultItemImage(destination),
    imageKey: destination.imageKey || "",
  };
}

export function buildDefaultRegionItems() {
  return ghanaRegions.map(toCmsRegionItem);
}

export function buildDefaultDestinationItems() {
  return popularDestinations.map(toCmsDestinationItem);
}

export function buildDefaultGalleryItems() {
  return adventureGallery.slice(0, 8).map((item) => ({
    id: item.id,
    slug: item.slug,
    caption: item.caption,
    region: item.region,
    image: getAdventureGallerySources(item.slug).webp,
  }));
}

export function buildDefaultTestimonialItems() {
  return testimonials.map((item) => ({
    id: item.id,
    quote: item.quote,
    name: item.name,
    role: item.role,
    rating: item.rating,
    tour: item.tour,
    initials: item.initials,
    imageKey: item.imageKey || "",
    image: getPopularDestinationImage(item.imageKey, { preferWebp: false }) || "",
  }));
}

export function mergeCmsItems(defaults = [], overrides = []) {
  if (!Array.isArray(overrides) || overrides.length === 0) {
    return defaults.map((item) => ({ ...item }));
  }

  const byId = new Map(defaults.map((item) => [item.id, { ...item }]));
  overrides.forEach((item) => {
    if (!item?.id) return;
    byId.set(item.id, { ...byId.get(item.id), ...item });
  });

  const order = overrides.map((item) => item.id).filter((id) => byId.has(id));
  defaults.forEach((item) => {
    if (!order.includes(item.id)) order.push(item.id);
  });

  return order.map((id) => byId.get(id)).filter(Boolean);
}

export function resolveCmsRegionItems(cmsSection) {
  const merged = mergeCmsItems(buildDefaultRegionItems(), cmsSection?.items);
  return merged.map((item) => ({
    ...item,
    highlights: parseHighlights(item.highlights),
    packageId: item.packageId ? String(item.packageId) : null,
  }));
}

export function resolveCmsDestinationItems(cmsSection) {
  return mergeCmsItems(buildDefaultDestinationItems(), cmsSection?.items);
}

export function resolveCmsGalleryItems(cmsSection) {
  return mergeCmsItems(buildDefaultGalleryItems(), cmsSection?.items).map((item) => {
    const slug = item.slug || item.id;
    const sources = item.image
      ? { webp: item.image, png: item.image }
      : getAdventureGallerySources(slug);
    return {
      ...item,
      slug,
      sources,
    };
  });
}

export function resolveCmsTestimonialItems(cmsSection) {
  return mergeCmsItems(buildDefaultTestimonialItems(), cmsSection?.items).map((item) => ({
    ...item,
    imageSrc:
      item.image ||
      getPopularDestinationImage(item.imageKey, { preferWebp: false }) ||
      null,
  }));
}

export function resolveCmsItemImage(item) {
  if (item?.image && !/\/images\/gallery\/optimized\/(?!hero\b)/i.test(item.image)) {
    return { webp: item.image, png: item.image };
  }
  if (item?.imageKey) {
    return getPopularDestinationSources(item.imageKey);
  }
  return null;
}
