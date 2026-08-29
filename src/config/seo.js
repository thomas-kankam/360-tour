import { buildWebsiteUrl } from "./env";
import { company } from "../data/aboutContent";

export const DEFAULT_SEO = {
  siteName: company.shortName,
  title: `${company.shortName} | 360 Tours, Ghana Travel & Africa Adventures`,
  description:
    "360 Tours Ghana — book guided tours in Ghana and Africa. Heritage trips, Cape Coast castles, Kumasi culture, Volta waterfalls, tailor-made group travel, stays and transport. Accra-based tour operator.",
  keywords: [
    "360 Tours Ghana",
    "360 tour",
    "360 tours",
    "Ghana tours",
    "tours in Ghana",
    "Ghana travel",
    "Accra tours",
    "Cape Coast tours",
    "Kumasi tours",
    "Volta Region tours",
    "Ghana heritage tours",
    "Africa tours",
    "West Africa travel",
    "Ghana tour operator",
    "group tours Ghana",
    "custom Ghana itinerary",
    "Ghana vacation packages",
    "tour packages Ghana",
  ].join(", "),
  imagePath: "/images/seo/og-image.png",
  twitterHandle: "",
};

export const ROUTE_SEO = {
  "/": {
    title: `${company.shortName} | 360 Tours — Discover Africa. Travel Without Limits.`,
    description: DEFAULT_SEO.description,
  },
  "/about": {
    title: `About 360 Tours Ghana | Local Tour Operator`,
    description:
      "Meet the Ghanaian team behind 360 Tours — guided heritage tours, stays, transport, and custom itineraries across Ghana and Africa.",
  },
  "/tours": {
    title: `Ghana Tours & Travel Packages | ${company.shortName}`,
    description:
      "Browse all Ghana tours and travel packages — scheduled departures and tailor-made trips to Accra, Cape Coast, Kumasi, Takoradi, Volta, and beyond with local guides.",
  },
  "/why-us": {
    title: `Why Book Ghana Tours With 360 Tours | ${company.shortName}`,
    description:
      "Eight reasons travellers choose 360 Tours Ghana — local guides, safe transport, flexible planning, and end-to-end trip coordination.",
  },
  "/experiences": {
    title: `Ghana Travel Experiences | Group & Educational Tours`,
    description:
      "Group travel, educational tours, corporate retreats, and volunteer experiences across Ghana with 360 Tours and Investment Limited.",
  },
  "/stories": {
    title: `Ghana Travel Stories, Blog & Tour Tips | ${company.shortName}`,
    description:
      "Read Ghana travel stories, safari reports, heritage reflections, and cultural guides from 360 Tours — tips for Cape Coast, Accra, Maasai Mara, and beyond.",
  },
  "/contact": {
    title: `Contact 360 Tours Ghana | Custom Quotes & WhatsApp`,
    description:
      "Plan your Ghana tour with 360 Tours — custom quotes, group travel, visa guidance, and WhatsApp support from Accra.",
  },
};

export function resolveSeoForPath(pathname) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const tourMatch = normalized.match(/^\/tours\/([^/]+)$/);
  if (tourMatch) {
    return resolveSeoForTourSlug(tourMatch[1]);
  }

  const storyMatch = normalized.match(/^\/stories\/([^/]+)$/);
  if (storyMatch) {
    return resolveSeoForStorySlug(storyMatch[1]);
  }

  const base = ROUTE_SEO[normalized] || DEFAULT_SEO;
  const canonicalPath = normalized === "/" ? "" : normalized;
  return {
    ...DEFAULT_SEO,
    ...base,
    canonicalUrl: buildWebsiteUrl(canonicalPath),
    imageUrl: buildWebsiteUrl(DEFAULT_SEO.imagePath),
  };
}

export function resolveSeoForTourSlug(slug) {
  return {
    ...DEFAULT_SEO,
    title: `Ghana Tour | ${company.shortName}`,
    description: `View tour details, itinerary, prices, and departure dates for this Ghana travel package with ${company.shortName}.`,
    canonicalUrl: buildWebsiteUrl(`/tours/${slug}`),
    imageUrl: buildWebsiteUrl(DEFAULT_SEO.imagePath),
  };
}

export function resolveSeoForTour(tour) {
  if (!tour) return resolveSeoForPath("/tours");

  const locations = Array.isArray(tour.locations) ? tour.locations.filter(Boolean).join(", ") : tour.location || "";
  const regionText = (tour.regionLabels || []).slice(0, 2).join(", ");
  const place = locations || regionText || tour.country || "Ghana";
  const duration = tour.duration || tour.durationLabel || "";
  const price = tour.priceLabel || "";

  const descriptionParts = [
    tour.description?.slice(0, 140),
    place ? `Visit ${place}.` : "",
    duration ? `${duration}.` : "",
    price ? `From ${price}.` : "",
    "Book with 360 Tours Ghana.",
  ].filter(Boolean);

  const image = tour.image || tour.coverImageUrl || tour.gallery?.[0] || DEFAULT_SEO.imagePath;

  return {
    ...DEFAULT_SEO,
    title: `${tour.name} | Ghana Tour | ${company.shortName}`,
    description: descriptionParts.join(" ").slice(0, 320),
    keywords: [
      tour.name,
      "Ghana tour",
      "360 Tours Ghana",
      place,
      regionText,
      tour.country,
      "tours in Ghana",
    ]
      .filter(Boolean)
      .join(", "),
    canonicalUrl: buildWebsiteUrl(`/tours/${tour.slug}`),
    imageUrl: String(image).startsWith("http") ? image : buildWebsiteUrl(String(image).startsWith("/") ? image : DEFAULT_SEO.imagePath),
    ogType: "product",
  };
}

export function buildTourProductJsonLd(tour) {
  if (!tour?.slug) return null;

  const locations = Array.isArray(tour.locations) ? tour.locations.filter(Boolean) : [];
  const price = Number(tour.priceNum || tour.priceAmount) || undefined;

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.name,
    description: tour.description || tour.descriptionSnippet || undefined,
    url: buildWebsiteUrl(`/tours/${tour.slug}`),
    image: tour.image || tour.coverImageUrl || buildWebsiteUrl(DEFAULT_SEO.imagePath),
    touristType: "Leisure travelers",
    provider: {
      "@type": "TravelAgency",
      name: company.name,
      url: buildWebsiteUrl("/"),
    },
    itinerary: locations.length ? { "@type": "Place", name: locations.join(", ") } : undefined,
    offers: price
      ? {
          "@type": "Offer",
          price,
          priceCurrency: tour.priceCurrency || "GHS",
          availability: "https://schema.org/InStock",
          url: buildWebsiteUrl(`/tours/${tour.slug}/book`),
        }
      : undefined,
  };
}

export function buildToursItemListJsonLd(tours = []) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ghana Tours by 360 Tours Ghana",
    itemListElement: tours.slice(0, 20).map((tour, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: buildWebsiteUrl(`/tours/${tour.slug}`),
      name: tour.name,
    })),
  };
}

/** Parse display dates like "March 18, 2025" into ISO for schema.org. */
export function parseStoryDisplayDate(value) {
  if (!value) return undefined;
  const parsed = Date.parse(String(value));
  if (Number.isNaN(parsed)) return undefined;
  return new Date(parsed).toISOString().slice(0, 10);
}

function resolveStoryImageUrl(image) {
  if (!image) return buildWebsiteUrl(DEFAULT_SEO.imagePath);
  const src = String(image);
  if (src.startsWith("http")) return src;
  return buildWebsiteUrl(src.startsWith("/") ? src : DEFAULT_SEO.imagePath);
}

export function resolveSeoForStorySlug(slug) {
  return {
    ...DEFAULT_SEO,
    title: `Travel Story | ${company.shortName}`,
    description: "Ghana and Africa travel story from 360 Tours Ghana.",
    canonicalUrl: buildWebsiteUrl(`/stories/${slug}`),
    imageUrl: buildWebsiteUrl(DEFAULT_SEO.imagePath),
    ogType: "article",
  };
}

/**
 * SEO template for Stories/blog detail pages.
 * Pass a story object from storiesContent.js.
 */
export function resolveSeoForStory(story) {
  if (!story) return resolveSeoForPath("/stories");

  const place = story.country || "Ghana";
  const category = story.category || "Travel";
  const keywords = [
    story.title,
    `${place} travel`,
    `${category} Ghana`,
    "360 Tours Ghana",
    "Ghana tours blog",
    "Africa travel stories",
    story.country === "Ghana" ? "tours in Ghana" : `${story.country} tours`,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    ...DEFAULT_SEO,
    title: `${story.title} | ${company.shortName}`,
    description: (story.excerpt || "").slice(0, 320),
    keywords,
    canonicalUrl: buildWebsiteUrl(`/stories/${story.slug}`),
    imageUrl: resolveStoryImageUrl(story.image),
    ogType: "article",
    publishedTime: parseStoryDisplayDate(story.date),
    author: story.author || company.shortName,
    section: category,
  };
}

export function buildStoryArticleJsonLd(story) {
  if (!story?.slug) return null;

  const published = parseStoryDisplayDate(story.date);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: story.title,
    description: story.excerpt,
    url: buildWebsiteUrl(`/stories/${story.slug}`),
    image: resolveStoryImageUrl(story.image),
    datePublished: published,
    dateModified: published,
    author: {
      "@type": "Person",
      name: story.author || company.shortName,
      jobTitle: story.authorRole || undefined,
    },
    publisher: {
      "@type": "Organization",
      name: company.name,
      logo: {
        "@type": "ImageObject",
        url: buildWebsiteUrl("/images/logo.png"),
      },
    },
    articleSection: story.category,
    keywords: [story.category, story.country, "Ghana tours", "360 Tours"].filter(Boolean).join(", "),
    mainEntityOfPage: buildWebsiteUrl(`/stories/${story.slug}`),
  };
}

export function buildStoriesItemListJsonLd(storyList = []) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "360 Tours Ghana Travel Stories",
    itemListElement: storyList.slice(0, 30).map((story, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: buildWebsiteUrl(`/stories/${story.slug}`),
      name: story.title,
    })),
  };
}

export function buildStoriesBlogJsonLd(storyList = []) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "360 Tours Ghana Travel Stories",
    description: ROUTE_SEO["/stories"].description,
    url: buildWebsiteUrl("/stories"),
    publisher: {
      "@type": "Organization",
      name: company.name,
      url: buildWebsiteUrl("/"),
    },
    blogPost: storyList.slice(0, 10).map((story) => ({
      "@type": "BlogPosting",
      headline: story.title,
      url: buildWebsiteUrl(`/stories/${story.slug}`),
      datePublished: parseStoryDisplayDate(story.date),
    })),
  };
}
