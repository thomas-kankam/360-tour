import { useQuery } from "@tanstack/react-query";
import publicListingsServiceApi from "../apis/PublicListingsServiceApi";

export const RANDOM_LISTINGS_QUERY_KEY = ["listings", "random"];

export function useRandomListings() {
  return useQuery({
    queryKey: RANDOM_LISTINGS_QUERY_KEY,
    queryFn: async () => {
      const result = await publicListingsServiceApi.getRandomListings();
      if (!result.ok) {
        throw new Error(result.reason || result.message || "Could not load popular tours.");
      }
      return result.items;
    },
  });
}
