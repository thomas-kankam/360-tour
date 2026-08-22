import { ghanaRegions, popularDestinations } from "../data/homeContent";
import { getPopularDestinationSources } from "../config/images";

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

function toCmsRegionItem(region) {
  return {
    id: region.id,
    name: region.name,
    region: region.region,
    tagline: region.tagline,
    desc: region.desc,
    highlights: serializeHighlights(region.highlights),
    image: "",
    imageKey: region.imageKey || "",
    packageId: region.packageId || "",
  };
}

function toCmsDestinationItem(destination) {
  return {
    id: destination.id,
    name: destination.name,
    region: destination.region,
    image: "",
    imageKey: destination.imageKey || "",
  };
}

export function buildDefaultRegionItems() {
  return ghanaRegions.map(toCmsRegionItem);
}

export function buildDefaultDestinationItems() {
  return popularDestinations.map(toCmsDestinationItem);
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

export function resolveCmsItemImage(item) {
  if (item?.image) {
    return { webp: item.image, png: item.image };
  }
  if (item?.imageKey) {
    return getPopularDestinationSources(item.imageKey);
  }
  return null;
}
