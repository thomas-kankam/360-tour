import { useCallback, useEffect, useMemo, useState } from "react";
import { GHANA_COUNTRY_CODE, PAYMENT_REGION } from "../constants/paymentRegions";
import {
  isDevPaymentRegionEnabled,
  PAYMENT_REGION_OVERRIDE_EVENT,
  readDevPaymentRegionOverride,
  writeDevPaymentRegionOverride,
} from "../utils/devPaymentRegion";
import { buildUserRegion, detectUserRegion, USER_REGION_SOURCE } from "../utils/userRegion";
import { useUserRegion } from "./useUserRegion";

function buildRegionFromPaymentRegion(paymentRegion) {
  const countryCode =
    paymentRegion === PAYMENT_REGION.DOMESTIC ? GHANA_COUNTRY_CODE : null;
  return buildUserRegion(countryCode, USER_REGION_SOURCE.OVERRIDE);
}

/**
 * Combines auto-detected user region with an optional manual payment-region override.
 */
export function usePaymentRegion({ enabled = true } = {}) {
  const { data: detectedRegion, isLoading, isFetching } = useUserRegion({ enabled });
  const [overridePaymentRegion, setOverridePaymentRegion] = useState(() =>
    isDevPaymentRegionEnabled() ? readDevPaymentRegionOverride() : null,
  );

  useEffect(() => {
    if (!isDevPaymentRegionEnabled()) return undefined;

    const syncOverride = () => {
      setOverridePaymentRegion(readDevPaymentRegionOverride());
    };

    window.addEventListener(PAYMENT_REGION_OVERRIDE_EVENT, syncOverride);
    return () => window.removeEventListener(PAYMENT_REGION_OVERRIDE_EVENT, syncOverride);
  }, []);

  const applyOverride = useCallback((paymentRegion) => {
    setOverridePaymentRegion(paymentRegion);
    if (isDevPaymentRegionEnabled()) {
      writeDevPaymentRegionOverride(paymentRegion);
    }
  }, []);

  const region = useMemo(() => {
    if (overridePaymentRegion) {
      return buildRegionFromPaymentRegion(overridePaymentRegion);
    }
    return detectedRegion ?? null;
  }, [overridePaymentRegion, detectedRegion]);

  const resolveRegionForSubmit = useCallback(async () => {
    if (overridePaymentRegion) {
      return buildRegionFromPaymentRegion(overridePaymentRegion);
    }
    return detectedRegion ?? (await detectUserRegion());
  }, [overridePaymentRegion, detectedRegion]);

  return {
    region,
    detectedRegion,
    isLoading: isLoading && !detectedRegion && !overridePaymentRegion,
    isFetching,
    isOverridden: Boolean(overridePaymentRegion),
    isDomestic: region?.paymentRegion === PAYMENT_REGION.DOMESTIC,
    isInternational: region?.paymentRegion === PAYMENT_REGION.INTERNATIONAL,
    selectDomesticRegion: () => applyOverride(PAYMENT_REGION.DOMESTIC),
    selectInternationalRegion: () => applyOverride(PAYMENT_REGION.INTERNATIONAL),
    resetRegionOverride: () => applyOverride(null),
    resolveRegionForSubmit,
  };
}
