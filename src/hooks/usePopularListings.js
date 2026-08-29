import { useQuery } from "@tanstack/react-query";
import publicListingsServiceApi from "../apis/PublicListingsServiceApi";

export const POPULAR_LISTINGS_QUERY_KEY = ["listings", "popular"];

export function usePopularListings() {
  return useQuery({
    queryKey: POPULAR_LISTINGS_QUERY_KEY,
    queryFn: async () => {
      const result = await publicListingsServiceApi.getPopularListings();
      if (!result.ok) {
        throw new Error(result.reason || result.message || "Could not load popular tours.");
      }
      return result.items;
    },
  });
}

/** @deprecated use usePopularListings */
export function useRandomListings() {
  return usePopularListings();
}

export const RANDOM_LISTINGS_QUERY_KEY = POPULAR_LISTINGS_QUERY_KEY;
