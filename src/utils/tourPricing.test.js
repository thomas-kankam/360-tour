import { AUDIENCE_SCOPE } from "../constants/tourAudience";
import { PAYMENT_REGION } from "../constants/paymentRegions";
import {
  buildTourPriceDisplay,
  computeChargeSubtotal,
  inferAudienceScope,
  resolveTourChargePricing,
  stripTourPriceFromPrefix,
  validateTourPricing,
} from "./tourPricing";

describe("tour audience pricing", () => {
  test("local tour always charges GHS", () => {
    const tour = {
      audienceScope: AUDIENCE_SCOPE.LOCAL,
      priceAmountGhs: 1850,
      priceAmount: 1850,
      priceCurrency: "GHS",
    };

    const domestic = resolveTourChargePricing(tour, PAYMENT_REGION.DOMESTIC);
    const international = resolveTourChargePricing(tour, PAYMENT_REGION.INTERNATIONAL);

    expect(domestic.unitPrice).toBe(1850);
    expect(domestic.currency).toBe("GHS");
    expect(international.unitPrice).toBe(1850);
    expect(international.currency).toBe("GHS");
  });

  test("global tour uses GHS for domestic and USD for international", () => {
    const tour = {
      audienceScope: AUDIENCE_SCOPE.GLOBAL,
      priceAmountGhs: 1850,
      priceAmountUsd: 150,
      priceCurrency: "GHS",
    };

    const domestic = resolveTourChargePricing(tour, PAYMENT_REGION.DOMESTIC);
    const international = resolveTourChargePricing(tour, PAYMENT_REGION.INTERNATIONAL);

    expect(domestic).toEqual({
      unitPrice: 1850,
      currency: "GHS",
      audienceScope: AUDIENCE_SCOPE.GLOBAL,
    });
    expect(international).toEqual({
      unitPrice: 150,
      currency: "USD",
      audienceScope: AUDIENCE_SCOPE.GLOBAL,
    });
  });

  test("computes subtotal for two travelers on international pricing", () => {
    const tour = {
      audienceScope: AUDIENCE_SCOPE.GLOBAL,
      priceAmountGhs: 1850,
      priceAmountUsd: 150,
    };

    const result = computeChargeSubtotal(tour, 2, PAYMENT_REGION.INTERNATIONAL);

    expect(result.subtotal).toBe(300);
    expect(result.currency).toBe("USD");
  });

  test("validates global pricing requires both currencies", () => {
    expect(validateTourPricing({ audienceScope: AUDIENCE_SCOPE.GLOBAL, priceAmountGhs: 1000, priceAmountUsd: 0 }))
      .toBe("Enter the international (USD) price for foreign buyers.");
    expect(validateTourPricing({ audienceScope: AUDIENCE_SCOPE.GLOBAL, priceAmountGhs: 1000, priceAmountUsd: 150 }))
      .toBe("");
  });

  test("infers local scope for legacy GHS-only tours", () => {
    expect(inferAudienceScope({ priceAmount: 1850, priceCurrency: "GHS" })).toBe(AUDIENCE_SCOPE.LOCAL);
  });

  test("foreign tour always charges USD", () => {
    const tour = {
      audienceScope: AUDIENCE_SCOPE.FOREIGN,
      priceAmountUsd: 150,
      priceAmount: 150,
      priceCurrency: "USD",
    };

    const domestic = resolveTourChargePricing(tour, PAYMENT_REGION.DOMESTIC);
    const international = resolveTourChargePricing(tour, PAYMENT_REGION.INTERNATIONAL);

    expect(domestic.unitPrice).toBe(150);
    expect(domestic.currency).toBe("USD");
    expect(international.unitPrice).toBe(150);
    expect(international.currency).toBe("USD");
  });

  test("validates foreign pricing requires USD", () => {
    expect(validateTourPricing({ audienceScope: AUDIENCE_SCOPE.FOREIGN, priceAmountUsd: 0 }))
      .toBe("Enter a US Dollars (USD) price for this tour.");
    expect(validateTourPricing({ audienceScope: AUDIENCE_SCOPE.FOREIGN, priceAmountUsd: 150 }))
      .toBe("");
  });

  test("infers foreign scope for legacy USD-only tours", () => {
    expect(inferAudienceScope({ priceAmount: 150, priceCurrency: "USD" })).toBe(AUDIENCE_SCOPE.FOREIGN);
  });

  test("infers global scope when both prices exist on legacy tour", () => {
    expect(inferAudienceScope({ priceAmountGhs: 1000, priceAmountUsd: 120 })).toBe(AUDIENCE_SCOPE.GLOBAL);
  });

  test("buildTourPriceDisplay shows GHS only for local tours", () => {
    const display = buildTourPriceDisplay({
      audienceScope: AUDIENCE_SCOPE.LOCAL,
      priceAmountGhs: 1850,
    });

    expect(display.primaryLabel).toBe("From GH₵1,850");
    expect(display.secondaryLabel).toBeNull();
    expect(display.isDual).toBe(false);
  });

  test("buildTourPriceDisplay shows USD only for foreign tours", () => {
    const display = buildTourPriceDisplay({
      audienceScope: AUDIENCE_SCOPE.FOREIGN,
      priceAmountUsd: 150,
    });

    expect(display.primaryLabel).toBe("From $150");
    expect(display.secondaryLabel).toBeNull();
    expect(display.isDual).toBe(false);
  });

  test("buildTourPriceDisplay shows dual labels for global tours", () => {
    const display = buildTourPriceDisplay({
      audienceScope: AUDIENCE_SCOPE.GLOBAL,
      priceAmountGhs: 1850,
      priceAmountUsd: 150,
    });

    expect(display.primaryLabel).toBe("From GH₵1,850");
    expect(display.secondaryLabel).toBe("From $150");
    expect(display.isDual).toBe(true);
  });

  test("buildTourPriceDisplay emphasizes USD for international viewers on global tours", () => {
    const display = buildTourPriceDisplay(
      {
        audienceScope: AUDIENCE_SCOPE.GLOBAL,
        priceAmountGhs: 1850,
        priceAmountUsd: 150,
      },
      PAYMENT_REGION.INTERNATIONAL,
    );

    expect(display.primaryLabel).toBe("From $150");
    expect(display.secondaryLabel).toBe("From GH₵1,850");
    expect(display.secondaryHint).toBe("local price in Ghana");
  });

  test("stripTourPriceFromPrefix removes leading From", () => {
    expect(stripTourPriceFromPrefix("From GH₵1,850")).toBe("GH₵1,850");
    expect(stripTourPriceFromPrefix("From $150")).toBe("$150");
  });
});
