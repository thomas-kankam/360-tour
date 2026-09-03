import { useQuery, keepPreviousData } from "@tanstack/react-query";
import publicListingsServiceApi from "../apis/PublicListingsServiceApi";
import { buildListingsPayload } from "../utils/publicListingsHelpers";

export const PUBLIC_LISTINGS_QUERY_KEY = "public-listings";

export function usePublicListings({
  page = 1,
  perPage = 10,
  sort = "default",
  search = "",
  tourType = "all",
  country = "all",
  departureDate = "",
} = {}) {
  const trimmedSearch = search.trim();

  return useQuery({
    queryKey: [
      PUBLIC_LISTINGS_QUERY_KEY,
      { page, perPage, sort, search: trimmedSearch, tourType, country, departureDate },
    ],
    queryFn: async () => {
      const payload = buildListingsPayload({
        countryFilter: country,
        tourTypeFilter: tourType,
        sort,
        departureDate: departureDate || undefined,
      });
      if (trimmedSearch) payload.search = trimmedSearch;

      const result = await publicListingsServiceApi.listListings(payload, {
        page,
        per_page: perPage,
      });

      if (!result.ok) {
        throw new Error(result.reason || result.message || "Could not load tours.");
      }

      return {
        items: result.items,
        pagination: result.pagination,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });
}
