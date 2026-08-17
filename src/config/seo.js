import { buildWebsiteUrl } from "./env";
import { company } from "../data/aboutContent";

export const DEFAULT_SEO = {
  siteName: company.name,
  title: `${company.name} | Tours, Stays & Transport in Ghana`,
  description:
    "360 Tours and Investment Limited — guided tours, accommodation, and transportation across Ghana and beyond. Book heritage tours, adventure trips, and custom travel from Accra to Cape Coast, Kumasi, and the Volta Region.",
  keywords:
    "360 Tours Ghana, Ghana tours, Accra tours, Cape Coast tours, Kumasi travel, Ghana heritage tours, Africa travel, tour operator Ghana",
  imagePath: "/images/seo/og-image.png",
  twitterHandle: "",
};

export const ROUTE_SEO = {
  "/": {
    title: `${company.name} | Discover Africa. Travel Without Limits.`,
    description: DEFAULT_SEO.description,
  },
  "/about": {
    title: `About Us | ${company.name}`,
    description:
      "Learn about 360 Tours and Investment Limited — your trusted Ghana travel partner for guided tours, stays, transport, and personalized itineraries.",
  },
  "/tours": {
    title: `Ghana Tours & Experiences | ${company.name}`,
    description:
      "Browse guided Ghana tours — heritage, adventure, beach getaways, and custom itineraries with flexible departures and local expert guides.",
  },
  "/why-us": {
    title: `Why Choose Us | ${company.name}`,
    description:
      "Eight reasons travelers choose 360 Tours for Ghana adventures — local guides, safe transport, flexible planning, and end-to-end coordination.",
  },
  "/experiences": {
    title: `Travel Experiences | ${company.name}`,
    description:
      "Group travel, educational tours, corporate retreats, and volunteer experiences across Ghana with 360 Tours and Investment Limited.",
  },
  "/stories": {
    title: `Travel Stories & Insights | ${company.name}`,
    description: "Travel perspectives, cultural insights, and news from 360 Tours Ghana.",
  },
  "/contact": {
    title: `Contact & Custom Quotes | ${company.name}`,
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
