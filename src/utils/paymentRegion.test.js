import {
  countryCodeToPaymentRegion,
  GHANA_COUNTRY_CODE,
  isGhanaCountryCode,
  PAYMENT_REGION,
} from "../constants/paymentRegions";
import { buildCreateBookingPayload, mapApiBookingToListRecord, resolveBookingAmount, resolveBookingCurrency } from "./bookingHelpers";
import { buildUserRegion, USER_REGION_SOURCE } from "./userRegion";

const mockTour = {
  slug: "cape-coast-adventure",
  pricePerPerson: 500,
  depositPercent: 30,
  bookingSettings: { maxGroupSize: 10 },
};

const mockForm = {
  bookingType: "individual",
  selectedDate: "2026-08-01",
  travelers: 1,
  paymentMode: "online",
  firstName: "Ama",
  lastName: "Mensah",
  email: "ama@example.com",
  phone: "233241234567",
  specialRequests: "",
  dietaryNeeds: "",
};

describe("payment region constants", () => {
  test("identifies Ghana country code", () => {
    expect(isGhanaCountryCode("GH")).toBe(true);
    expect(isGhanaCountryCode("gh")).toBe(true);
    expect(isGhanaCountryCode("US")).toBe(false);
  });

  test("maps country code to payment region", () => {
    expect(countryCodeToPaymentRegion(GHANA_COUNTRY_CODE)).toBe(PAYMENT_REGION.DOMESTIC);
    expect(countryCodeToPaymentRegion("US")).toBe(PAYMENT_REGION.INTERNATIONAL);
    expect(countryCodeToPaymentRegion(null)).toBe(PAYMENT_REGION.INTERNATIONAL);
  });
});

describe("buildUserRegion", () => {
  test("builds domestic region for Ghana", () => {
    const region = buildUserRegion("GH", USER_REGION_SOURCE.IPAPI);

    expect(region.countryCode).toBe("GH");
    expect(region.isInGhana).toBe(true);
    expect(region.paymentRegion).toBe(PAYMENT_REGION.DOMESTIC);
    expect(region.source).toBe(USER_REGION_SOURCE.IPAPI);
  });

  test("builds international region when country is unknown", () => {
    const region = buildUserRegion(null, USER_REGION_SOURCE.DEFAULT);

    expect(region.countryCode).toBeNull();
    expect(region.isInGhana).toBe(false);
    expect(region.paymentRegion).toBe(PAYMENT_REGION.INTERNATIONAL);
  });

  test("supports manual override source", () => {
    const region = buildUserRegion("GH", USER_REGION_SOURCE.OVERRIDE);

    expect(region.source).toBe(USER_REGION_SOURCE.OVERRIDE);
    expect(region.paymentRegion).toBe(PAYMENT_REGION.DOMESTIC);
  });
});

describe("buildCreateBookingPayload region fields", () => {
  test("attaches countryCode and paymentRegion when region is provided", () => {
    const region = buildUserRegion("GH", USER_REGION_SOURCE.OVERRIDE);
    const payload = buildCreateBookingPayload(mockForm, mockTour, region);

    expect(payload.countryCode).toBe("GH");
    expect(payload.paymentRegion).toBe(PAYMENT_REGION.DOMESTIC);
    expect(payload.paymentMode).toBe("online");
    expect(payload.tourSlug).toBe(mockTour.slug);
    expect(payload.groupDetails).toEqual([]);
  });

  test("omits region fields when region is not provided", () => {
    const payload = buildCreateBookingPayload(mockForm, mockTour);

    expect(payload.countryCode).toBeUndefined();
    expect(payload.paymentRegion).toBeUndefined();
  });

  test("sends international region for non-Ghana override", () => {
    const region = buildUserRegion(null, USER_REGION_SOURCE.OVERRIDE);
    const payload = buildCreateBookingPayload(mockForm, mockTour, region);

    expect(payload.countryCode).toBeNull();
    expect(payload.paymentRegion).toBe(PAYMENT_REGION.INTERNATIONAL);
  });

  test("sends currency from resolved pricing for international checkout", () => {
    const region = buildUserRegion("US", USER_REGION_SOURCE.OVERRIDE);
    const tour = {
      ...mockTour,
      audienceScope: "global",
      priceAmountGhs: 0.8,
      priceAmountUsd: 0.9,
    };
    const payload = buildCreateBookingPayload(mockForm, tour, region);

    expect(payload.currency).toBe("USD");
    expect(payload.amount).toBe(0.9);
    expect(payload.paymentRegion).toBe(PAYMENT_REGION.INTERNATIONAL);
    expect(payload.countryCode).toBe("US");
  });
});

describe("resolveBookingAmount", () => {
  const globalTour = {
    audienceScope: "global",
    priceAmountGhs: 1959.94,
    priceAmountUsd: 171.05,
    priceAmount: 1959.94,
    priceCurrency: "GHS",
    priceLabel: "From GH₵1,959.94",
  };

  test("uses stored booking amount and currency for domestic checkout", () => {
    const booking = {
      amount: 1959.94,
      currency: "GHS",
      paymentRegion: PAYMENT_REGION.DOMESTIC,
      travelers: 1,
      tour: globalTour,
    };

    expect(resolveBookingAmount(booking)).toBe(1959.94);
    expect(resolveBookingCurrency(booking)).toBe("GHS");
  });

  test("uses stored booking amount and currency for international checkout", () => {
    const booking = {
      amount: 171.05,
      currency: "USD",
      paymentRegion: PAYMENT_REGION.INTERNATIONAL,
      travelers: 1,
      tour: globalTour,
    };

    expect(resolveBookingAmount(booking)).toBe(171.05);
    expect(resolveBookingCurrency(booking)).toBe("USD");
  });

  test("does not replace stored amount with tour GHS list price", () => {
    const booking = {
      amount: 171.05,
      currency: "USD",
      paymentRegion: PAYMENT_REGION.INTERNATIONAL,
      travelers: 1,
      tour: globalTour,
    };

    expect(resolveBookingAmount(booking, globalTour)).not.toBe(1959.94);
  });
});

describe("mapApiBookingToListRecord", () => {
  const globalTour = {
    slug: "51e7d991-3c1a-4bec-bde2-8568f733b893",
    name: "Sun City Cabanas Hotel - Sun City",
    locations: ["Sun City"],
    country: "South Africa",
    durationLabel: "2 days",
    priceAmount: 1959.94,
    priceCurrency: "GHS",
    audienceScope: "global",
    priceAmountGhs: 1959.94,
    priceAmountUsd: 171.05,
    priceLabel: "From GH₵1,959.94",
    coverImageUrl: "https://example.com/cover.webp",
    departureDates: [{ date: "2026-09-26", dateLabel: "Sep 26, 2026" }],
    bookingSettings: { depositPercent: 30 },
  };

  test("maps domestic booking with GHS amount from API", () => {
    const record = mapApiBookingToListRecord({
      bookingCode: "AFQ_TEVK6E",
      amount: 1959.94,
      currency: "GHS",
      paymentRegion: PAYMENT_REGION.DOMESTIC,
      travelers: 1,
      paymentMode: "online",
      paymentStatus: "paid",
      status: "confirmed",
      selectedDate: "2026-09-26",
      tour: globalTour,
      createdAt: "2026-07-15T12:59:59.000000Z",
    });

    expect(record.subtotal).toBe(1959.94);
    expect(record.currency).toBe("GHS");
  });

  test("maps international booking with USD amount from API", () => {
    const record = mapApiBookingToListRecord({
      bookingCode: "AFQ_G1ELLV",
      amount: 171.05,
      currency: "USD",
      paymentRegion: PAYMENT_REGION.INTERNATIONAL,
      travelers: 1,
      paymentMode: "online",
      paymentStatus: "paid",
      status: "confirmed",
      selectedDate: "2026-09-26",
      tour: globalTour,
      createdAt: "2026-07-15T12:57:35.000000Z",
    });

    expect(record.subtotal).toBe(171.05);
    expect(record.amount).toBe(171.05);
    expect(record.currency).toBe("USD");
    expect(record.subtotal).not.toBe(1959.94);
  });
});
