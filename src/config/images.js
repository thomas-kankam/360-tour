/**
 * Images served from /public/images (reliable local paths).
 * Replace with client photography when available.
 */
export const images = {
  logo: "/images/logo.png",
  general_logo: "/images/logo.png",
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

  /** Optimized gallery photos — WebP primary, PNG fallback (1280×800) */
  destinations: {
    popular: {
      accraCityTour: {
        webp: "/images/gallery/optimized/accra-city-tour.webp",
        png: "/images/gallery/optimized/accra-city-tour.png",
      },
      capeCoastCastle: {
        webp: "/images/gallery/optimized/cape-coast-castle.webp",
        png: "/images/gallery/optimized/cape-coast-castle.png",
      },
      elminaCastle: {
        webp: "/images/gallery/optimized/elmina-castle.webp",
        png: "/images/gallery/optimized/elmina-castle.png",
      },
      kakumNationalPark: {
        webp: "/images/gallery/optimized/kakum-national-park.webp",
        png: "/images/gallery/optimized/kakum-national-park.png",
      },
      akosomboBoatCruise: {
        webp: "/images/gallery/optimized/akosombo-boat-cruise.webp",
        png: "/images/gallery/optimized/akosombo-boat-cruise.png",
      },
      aburiBotanicalGardens: {
        webp: "/images/gallery/optimized/aburi-botanical-gardens.webp",
        png: "/images/gallery/optimized/aburi-botanical-gardens.png",
      },
      wliWaterfalls: {
        webp: "/images/gallery/optimized/wli-waterfalls.webp",
        png: "/images/gallery/optimized/wli-waterfalls.png",
      },
      botiFalls: {
        webp: "/images/gallery/optimized/boti-falls.webp",
        png: "/images/gallery/optimized/boti-falls.png",
      },
      shaiHills: {
        webp: "/images/gallery/optimized/shai-hills.webp",
        png: "/images/gallery/optimized/shai-hills.png",
      },
      adaFoah: {
        webp: "/images/gallery/optimized/ada-foah.webp",
        png: "/images/gallery/optimized/ada-foah.png",
      },
      nzulezuStiltVillage: {
        webp: "/images/gallery/optimized/nzulezu-stilt-village.webp",
        png: "/images/gallery/optimized/nzulezu-stilt-village.png",
      },
      moleNationalPark: {
        webp: "/images/gallery/optimized/mole-national-park.webp",
        png: "/images/gallery/optimized/mole-national-park.png",
      },
      kumasiCulturalTour: {
        webp: "/images/gallery/optimized/kumasi-cultural-tour.webp",
        png: "/images/gallery/optimized/kumasi-cultural-tour.png",
      },
      voltaRegionAdventure: {
        webp: "/images/gallery/optimized/volta-region-adventure.webp",
        png: "/images/gallery/optimized/volta-region-adventure.png",
      },
      tafiAtomeMonkeySanctuary: {
        webp: "/images/gallery/optimized/tafi-atome-monkey-sanctuary.webp",
        png: "/images/gallery/optimized/tafi-atome-monkey-sanctuary.png",
      },
    },
  },

  banners:{
    banner_one: "/images/home/sun_city_banner.png",
  }
};

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
