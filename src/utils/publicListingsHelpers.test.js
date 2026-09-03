import {
  buildListingsPayload,
  buildToursSearchPath,
  getRegionFilterLabel,
  mapPublicTourCard,
  REGION_FILTER_OPTIONS,
  resolveRegionFilterFromParams,
  resolveTourTypeFilterFromParams,
  tourMatchesRegion,
} from "./publicListingsHelpers";
import { TOUR_TYPE } from "./operatorTourConstants";

describe("region filter options", () => {
  it("leads with an all-regions chip", () => {
    expect(REGION_FILTER_OPTIONS[0]).toMatchObject({ id: "all", label: "All regions" });
  });

  it("includes every Ghana region after the all chip", () => {
    expect(REGION_FILTER_OPTIONS.length).toBeGreaterThan(10);
    expect(REGION_FILTER_OPTIONS.map((option) => option.id)).toContain("volta");
  });
});

describe("resolveRegionFilterFromParams", () => {
  it("keeps known region ids", () => {
    expect(resolveRegionFilterFromParams("central")).toBe("central");
  });

  it("falls back to all for unknown or missing values", () => {
    expect(resolveRegionFilterFromParams("atlantis")).toBe("all");
    expect(resolveRegionFilterFromParams(null)).toBe("all");
  });
});

describe("resolveTourTypeFilterFromParams", () => {
  it("accepts the two supported types, case-insensitively", () => {
    expect(resolveTourTypeFilterFromParams("regular")).toBe("regular");
    expect(resolveTourTypeFilterFromParams("CUSTOM")).toBe("custom");
  });

  it("maps customized as an alias for custom", () => {
    expect(resolveTourTypeFilterFromParams("customized")).toBe(TOUR_TYPE.CUSTOM);
  });

  it("falls back to all for anything else", () => {
    expect(resolveTourTypeFilterFromParams("featured")).toBe("all");
    expect(resolveTourTypeFilterFromParams(undefined)).toBe("all");
  });
});

describe("buildListingsPayload", () => {
  it("sends country and tour_type when they are set", () => {
    expect(
      buildListingsPayload({ countryFilter: "ghana", tourTypeFilter: "custom" }),
    ).toEqual({ country: "Ghana", tour_type: "custom" });
  });

  it("omits tour_type when the filter is cleared", () => {
    expect(buildListingsPayload({ tourTypeFilter: "all" })).toEqual({});
  });

  it("maps sort choices onto the API sort keys", () => {
    expect(buildListingsPayload({ sort: "price-asc" })).toEqual({ price_amount: "asc" });
    expect(buildListingsPayload({ sort: "newest" })).toEqual({ sort_by: "desc" });
  });
});

describe("buildToursSearchPath", () => {
  it("builds a country-scoped tours link", () => {
    expect(buildToursSearchPath({ country: "ghana" })).toBe("/tours?country=ghana");
  });

  it("builds a tour-type link and ignores legacy region args", () => {
    expect(buildToursSearchPath({ region: "volta", tourType: "custom" })).toBe("/tours?type=custom");
  });

  it("drops the all-trips type", () => {
    expect(buildToursSearchPath({ tourType: "all" })).toBe("/tours");
  });
});

describe("tourMatchesRegion", () => {
  it("matches on the stored region ids", () => {
    expect(tourMatchesRegion({ regions: ["central"] }, "central")).toBe(true);
    expect(tourMatchesRegion({ regions: ["central"] }, "volta")).toBe(false);
  });

  it("falls back to the region label inside locations for legacy tours", () => {
    expect(tourMatchesRegion({ regions: [], locations: ["Ho, Volta"] }, "volta")).toBe(true);
  });

  it("always matches when no region is selected", () => {
    expect(tourMatchesRegion({ regions: [] }, "all")).toBe(true);
  });
});

describe("mapPublicTourCard", () => {
  const baseTour = {
    slug: "cape-coast-heritage",
    name: "Cape Coast Heritage",
    country: "Ghana",
    locations: ["Cape Coast, Central"],
    regions: ["central"],
    durationDays: 3,
    priceCurrency: "GHS",
    priceAmountGhs: 1500,
    departureDates: [{ date: "2026-09-12", dateLabel: "Sep 12, 2026", spotsLeft: 4, spotsTotal: 12 }],
  };

  it("maps country, stops, and a scheduled departure date", () => {
    const card = mapPublicTourCard(baseTour);

    expect(card.tourType).toBe("regular");
    expect(card.isCustom).toBe(false);
    expect(card.country).toBe("Ghana");
    expect(card.location).toContain("Cape Coast");
    expect(card.nextDate).toBe("Sep 12, 2026");
    expect(card.departDay).toBe("12");
  });

  it("labels customized tours as flexible instead of showing a departure", () => {
    const card = mapPublicTourCard({ ...baseTour, tourType: "custom", departureDates: [] });

    expect(card.isCustom).toBe(true);
    expect(card.tourTypeLabel).toBeTruthy();
    expect(card.nextDate).toBe("Dates to suit you");
  });

  it("no longer emits the retired badge and featured fields", () => {
    const card = mapPublicTourCard(baseTour);

    expect(card).not.toHaveProperty("badge");
    expect(card).not.toHaveProperty("featured");
  });
});

describe("getRegionFilterLabel", () => {
  it("returns the display label for a region id", () => {
    expect(getRegionFilterLabel("greater-accra")).toBe("Greater Accra");
  });
});
