import { useQuery } from "@tanstack/react-query";
import { detectUserRegion, getCachedUserRegion } from "../utils/userRegion";

export const USER_REGION_QUERY_KEY = ["user-region"];

const REGION_STALE_MS = 1000 * 60 * 60 * 24;

/**
 * Resolves the user's likely country / payment region for gateway selection.
 * Uses sessionStorage cache first, then IP + timezone fallbacks via detectUserRegion().
 */
export function useUserRegion({ enabled = true } = {}) {
  return useQuery({
    queryKey: USER_REGION_QUERY_KEY,
    queryFn: detectUserRegion,
    enabled,
    staleTime: REGION_STALE_MS,
    gcTime: REGION_STALE_MS,
    placeholderData: getCachedUserRegion,
    retry: 1,
  });
}
