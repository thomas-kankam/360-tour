import { PAYMENT_REGION } from "../constants/paymentRegions";
import {
  applyDevPaymentRegionFromUrl,
  normalizePaymentRegionParam,
  readDevPaymentRegionOverride,
  writeDevPaymentRegionOverride,
} from "./devPaymentRegion";

describe("dev payment region helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("normalizes common domestic aliases", () => {
    expect(normalizePaymentRegionParam("domestic")).toBe(PAYMENT_REGION.DOMESTIC);
    expect(normalizePaymentRegionParam("ghana")).toBe(PAYMENT_REGION.DOMESTIC);
    expect(normalizePaymentRegionParam("paystack")).toBe(PAYMENT_REGION.DOMESTIC);
  });

  test("normalizes common international aliases", () => {
    expect(normalizePaymentRegionParam("international")).toBe(PAYMENT_REGION.INTERNATIONAL);
    expect(normalizePaymentRegionParam("foreign")).toBe(PAYMENT_REGION.INTERNATIONAL);
    expect(normalizePaymentRegionParam("stripe")).toBe(PAYMENT_REGION.INTERNATIONAL);
  });

  test("persists override in localStorage during development", () => {
    writeDevPaymentRegionOverride(PAYMENT_REGION.INTERNATIONAL);
    expect(readDevPaymentRegionOverride()).toBe(PAYMENT_REGION.INTERNATIONAL);
  });

  test("applies paymentRegion from URL query", () => {
    const result = applyDevPaymentRegionFromUrl("?paymentRegion=domestic");
    expect(result).toBe(PAYMENT_REGION.DOMESTIC);
    expect(readDevPaymentRegionOverride()).toBe(PAYMENT_REGION.DOMESTIC);
  });

  test("clears override from URL query", () => {
    writeDevPaymentRegionOverride(PAYMENT_REGION.INTERNATIONAL);
    applyDevPaymentRegionFromUrl("?clearPaymentRegion=1");
    expect(readDevPaymentRegionOverride()).toBeNull();
  });
});
