/**
 * Images served from /public/images (reliable local paths).
 * Replace with client photography when available.
 */
export const images = {
  logo: "/images/logo.png",
  general_logo: "/images/logo.png",
  /** Ghana flag roundel with no wordmark — for avatars, tight badges, and loaders. */
  logo_mark: "/images/logo-mark.png",
  favicon_logo: "/images/seo/favicon-192x192.png",
  home: {
    hero: "/images/home/hero.jpg",
    hero_img: "/images/gallery/optimized/hero.webp",
    heroBanner: {
      webp: "/images/gallery/optimized/hero.webp",
      png: "/images/gallery/optimized/hero.png",
    },
    hero_one: "/images/home/hero_one.jpg",
    hero_two: "/images/home/hero_two.jpg",
    hero_three: "/images/home/hero_three.jpg",
    hero_four: "/images/home/hero_four.png",
    ghana: "/images/home/ghana_tour.png",
    kenya: "/images/home/kenyan_tour.png",
    southAfrica: "/images/home/sa_tour.png",
    testimonial: "/images/home/testimonial.jpg",
    destinations: {
      ghana: "/images/home/dest-ghana.jpg",
      kenya: "/images/home/dest-kenya.jpg",
      southAfrica: "/images/home/dest-sa.jpg",
      tanzania: "/images/home/dest-tanzania.jpg",
      rwanda: "/images/home/dest-rwanda.jpg",
      senegal: "/images/home/dest-senegal.jpg",
      ethiopia: "/images/home/dest-ethiopia.jpg",
      morocco: "/images/home/dest-morocco.jpg",
    },
  },

  tour_sites: {
    waterfall: "/images/home/waterfall.jpg",
    volta: "/images/home/volta.jpg",
    manhyia_palace: "/images/home/manhyia_palace.jpg",
    detty_december: "/images/home/detty_december.webp",
    arts_and_craft: "/images/home/arts_and_craft.jpg",
  },

  /** Ghana destination photos — original local assets that match each stop. */
  destinations: {
    popular: {
      accraCityTour: "/images/home/arts_and_craft.jpg",
      capeCoastCastle: "/images/home/ghana_tour.png",
      elminaCastle: "/images/home/hero_three.jpg",
      kakumNationalPark: "/images/home/dest-ghana.jpg",
      akosomboBoatCruise: "/images/home/waterfall.jpg",
      aburiBotanicalGardens: "/images/home/hero_one.jpg",
      wliWaterfalls: "/images/home/volta.jpg",
      botiFalls: "/images/home/waterfall.jpg",
      shaiHills: "/images/home/hero_four.png",
      adaFoah: "/images/home/hero_two.jpg",
      nzulezuStiltVillage: "/images/home/dest-ghana.jpg",
      moleNationalPark: "/images/home/dest-ghana.jpg",
      kumasiCulturalTour: "/images/home/manhyia_palace.jpg",
      voltaRegionAdventure: "/images/home/volta.jpg",
      tafiAtomeMonkeySanctuary: "/images/home/hero.jpg",
    },
  },

  banners:{
    banner_one: "/images/home/sun_city_banner.png",
  }
};

/**
 * Moments from tours we have already run — used by the adventure gallery.
 * Each entry points at the optimized WebP/PNG pair in /public/images/gallery/optimized.
 */
export const adventureGallery = [
  { id: "cape-coast-castle", slug: "cape-coast-castle", caption: "Cape Coast Castle", region: "Central" },
  { id: "wli-waterfalls", slug: "wli-waterfalls", caption: "Wli Waterfalls", region: "Volta" },
  { id: "kumasi-cultural-tour", slug: "kumasi-cultural-tour", caption: "Manhyia & Kejetia, Kumasi", region: "Ashanti" },
  { id: "kakum-national-park", slug: "kakum-national-park", caption: "Kakum Canopy Walk", region: "Central" },
  { id: "accra-city-tour", slug: "accra-city-tour", caption: "Accra City Tour", region: "Greater Accra" },
  { id: "nzulezu-stilt-village", slug: "nzulezu-stilt-village", caption: "Nzulezu Stilt Village", region: "Western" },
  { id: "mole-national-park", slug: "mole-national-park", caption: "Mole Safari", region: "Savannah" },
  { id: "ada-foah", slug: "ada-foah", caption: "Ada Foah Estuary", region: "Greater Accra" },
  { id: "elmina-castle", slug: "elmina-castle", caption: "Elmina Castle", region: "Central" },
  { id: "aburi-botanical-gardens", slug: "aburi-botanical-gardens", caption: "Aburi Gardens", region: "Eastern" },
  { id: "tafi-atome", slug: "tafi-atome-monkey-sanctuary", caption: "Tafi Atome Sanctuary", region: "Volta" },
  { id: "shai-hills", slug: "shai-hills", caption: "Shai Hills Reserve", region: "Greater Accra" },
];

export function getAdventureGallerySources(slug) {
  return {
    webp: `/images/gallery/optimized/${slug}.webp`,
    png: `/images/gallery/optimized/${slug}.png`,
  };
}

/** Resolve optimized gallery image — prefers WebP, falls back to PNG or legacy string paths */
export function getPopularDestinationImage(imageKey, { preferWebp = true } = {}) {
  const entry = images.destinations?.popular?.[imageKey];
  if (!entry) return null;
  if (typeof entry === "string") return entry;
  return preferWebp ? entry.webp ?? entry.png : entry.png ?? entry.webp;
}

export function getPopularDestinationSources(imageKey) {
  const entry = images.destinations?.popular?.[imageKey];
  if (!entry) return null;
  if (typeof entry === "string") return { webp: entry, png: entry };
  return entry;
}
