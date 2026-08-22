import { buildWebsiteUrl } from "./env";
import { company } from "../data/aboutContent";

export const DEFAULT_SEO = {
  siteName: company.shortName,
  title: `${company.shortName} | Tours, Stays & Transport Across Ghana`,
  description:
    "360 Tours and Investment Limited — guided tours, accommodation, and transportation across Ghana and beyond. Book heritage tours, adventure trips, and tailor-made travel from Accra to Cape Coast, Kumasi, and the Volta Region.",
  keywords:
    "360 Tours Ghana, Ghana tours, Accra tours, Cape Coast tours, Kumasi travel, Ghana heritage tours, Africa travel, tour operator Ghana",
  imagePath: "/images/seo/og-image.png",
  twitterHandle: "",
};

export const ROUTE_SEO = {
  "/": {
    title: `${company.shortName} | Discover Africa. Travel Without Limits.`,
    description: DEFAULT_SEO.description,
  },
  "/about": {
    title: `Our Story | ${company.shortName}`,
    description:
      "Meet the Ghanaian team behind 360 Tours — guided tours, stays, transport, and itineraries built around the way you want to travel.",
  },
  "/tours": {
    title: `Ghana Tours by Region | ${company.shortName}`,
    description:
      "Browse Ghana tours region by region — Greater Accra, Central, Ashanti, Volta, and beyond. Scheduled departures plus tailor-made journeys with local guides.",
  },
  "/why-us": {
    title: `Why Travel With Us | ${company.shortName}`,
    description:
      "Eight reasons travellers choose 360 Tours for Ghana — local guides, safe transport, flexible planning, and end-to-end coordination.",
  },
  "/experiences": {
    title: `Travel Experiences | ${company.shortName}`,
    description:
      "Group travel, educational tours, corporate retreats, and volunteer experiences across Ghana with 360 Tours and Investment Limited.",
  },
  "/stories": {
    title: `Travel Stories & Insights | ${company.shortName}`,
    description: "Travel perspectives, cultural insights, and news from 360 Tours Ghana.",
  },
  "/contact": {
    title: `Contact & Custom Quotes | ${company.shortName}`,
    description:
      "Plan your Ghana trip with 360 Tours — custom quotes, group travel, visa guidance, and WhatsApp support.",
  },
};

export function resolveSeoForPath(pathname) {
  const base = ROUTE_SEO[pathname] || DEFAULT_SEO;
  const canonicalPath = pathname === "/" ? "" : pathname;
  return {
    ...DEFAULT_SEO,
    ...base,
    canonicalUrl: buildWebsiteUrl(canonicalPath),
    imageUrl: buildWebsiteUrl(DEFAULT_SEO.imagePath),
  };
}
