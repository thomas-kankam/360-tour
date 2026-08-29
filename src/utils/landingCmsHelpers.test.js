import { mergeLandingCmsWithDefaults } from "./landingCmsHelpers";
import { LANDING_CMS_DEFAULTS } from "./landingCmsStorage";

if (typeof structuredClone !== "function") {
  global.structuredClone = (value) => JSON.parse(JSON.stringify(value));
}

describe("landing CMS helpers", () => {
  test("keeps default destination cards so they stay editable", () => {
    const merged = mergeLandingCmsWithDefaults({
      destinations: { title: "Popular Destinations" },
    });

    expect(merged.destinations.items.length).toBeGreaterThan(0);
    expect(merged.destinations.items[0].name).toBe("Accra City Tour");
    expect(merged.destinations.items[0].image).toMatch(/^\/images\//);
  });

  test("does not strip uploaded storage URLs", () => {
    const merged = mergeLandingCmsWithDefaults({
      destinations: {
        items: [
          {
            id: "accra-city-tour",
            image: "http://127.0.0.1:8000/storage/uploads/images/accra.webp",
          },
        ],
      },
    });

    expect(merged.destinations.items[0].image).toBe(
      "https://api.360toursghana.com/storage/uploads/images/accra.webp",
    );
  });

  test("clears unmatched remote stock photos", () => {
    const merged = mergeLandingCmsWithDefaults({
      destinations: {
        items: [
          {
            id: "accra-city-tour",
            image: "https://upload.wikimedia.org/wikipedia/commons/wrong.jpg",
          },
        ],
      },
    });

    expect(merged.destinations.items[0].image).toBe("");
  });

  test("keeps local gallery optimized paths for CMS items", () => {
    const merged = mergeLandingCmsWithDefaults({
      gallery: {
        items: [
          {
            id: "accra-city-tour",
            slug: "accra-city-tour",
            image: "/images/gallery/optimized/accra-city-tour.webp",
          },
        ],
      },
    });

    expect(merged.gallery.items[0].image).toBe("/images/gallery/optimized/accra-city-tour.webp");
  });

  test("popular tours keep a single view-all label", () => {
    expect(LANDING_CMS_DEFAULTS.tours.viewAllLabel).toBe("View all tours");
  });
});
