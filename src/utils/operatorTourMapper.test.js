import { buildTourPayload, mapOperatorTour, validateTourSlotAllocation } from "./operatorTourMapper";
import {
  createEmptyTourListing,
  DEPARTURE_SCHEDULE_SPECIFIC,
  TOUR_TYPE,
  UNLIMITED_TOUR_SLOTS,
} from "./operatorTourConstants";

function makeForm(overrides = {}) {
  return {
    ...createEmptyTourListing(),
    name: "Cape Coast Heritage",
    countryId: "ghana",
    locations: ["Cape Coast, Central"],
    description: "Three days along the Central coast.",
    priceAmountGhs: 1500,
    departureScheduleType: DEPARTURE_SCHEDULE_SPECIFIC,
    ...overrides,
  };
}

describe("mapOperatorTour", () => {
  it("defaults unknown or missing tour types to regular", () => {
    expect(mapOperatorTour({ slug: "a", name: "A" }).tourType).toBe(TOUR_TYPE.REGULAR);
    expect(mapOperatorTour({ slug: "a", name: "A", tourType: "packaged" }).tourType).toBe(TOUR_TYPE.REGULAR);
  });

  it("reads the tour type from either camelCase or snake_case payloads", () => {
    expect(mapOperatorTour({ slug: "a", name: "A", tourType: "custom" }).tourType).toBe(TOUR_TYPE.CUSTOM);
    expect(mapOperatorTour({ slug: "a", name: "A", tour_type: "custom" }).tourType).toBe(TOUR_TYPE.CUSTOM);
  });

  it("carries regions and region labels through untouched", () => {
    const tour = mapOperatorTour({
      slug: "a",
      name: "A",
      regions: ["central"],
      regionLabels: ["Central"],
    });

    expect(tour.regions).toEqual(["central"]);
    expect(tour.regionLabels).toEqual(["Central"]);
  });
});

describe("validateTourSlotAllocation", () => {
  it("requires at least one dated departure for regular tours", () => {
    const form = makeForm({ departureDates: [{ date: "", spotsTotal: 10 }] });

    expect(validateTourSlotAllocation(form)).toBe("Add at least one departure date.");
  });

  it("skips departure validation entirely for customized tours", () => {
    const form = makeForm({ tourType: TOUR_TYPE.CUSTOM, departureDates: [{ date: "", spotsTotal: 0 }] });

    expect(validateTourSlotAllocation(form)).toBe("");
  });
});

describe("buildTourPayload", () => {
  it("keeps dated departures for regular tours", () => {
    const payload = buildTourPayload(
      makeForm({ departureDates: [{ date: "2026-09-12", spotsTotal: 12 }] }),
    );

    expect(payload.tourType).toBe(TOUR_TYPE.REGULAR);
    expect(payload.departureDates).toHaveLength(1);
    expect(payload.departureDates[0]).toMatchObject({ date: "2026-09-12", spotsTotal: 12, spotsLeft: 12 });
    expect(payload.totalSlots).toBe(12);
  });

  it("strips departures and publishes unlimited slots for customized tours", () => {
    const payload = buildTourPayload(
      makeForm({ tourType: TOUR_TYPE.CUSTOM, departureDates: [{ date: "2026-09-12", spotsTotal: 12 }] }),
    );

    expect(payload.tourType).toBe(TOUR_TYPE.CUSTOM);
    expect(payload.departureDates).toEqual([]);
    expect(payload.totalSlots).toBe(UNLIMITED_TOUR_SLOTS);
  });

  it("reduces categories to the country and drops the retired badge fields", () => {
    const payload = buildTourPayload(makeForm({ categories: ["ghana", "heritage", "cultural"] }));

    expect(payload.categories).toEqual(["ghana"]);
    expect(payload).not.toHaveProperty("badge");
    expect(payload).not.toHaveProperty("badgeVariant");
    expect(payload).not.toHaveProperty("featured");
    expect(payload).not.toHaveProperty("packageLineId");
  });
});
