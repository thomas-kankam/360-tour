import { useQuery, keepPreviousData } from "@tanstack/react-query";
import publicListingsServiceApi from "../apis/PublicListingsServiceApi";

export const PUBLIC_LISTINGS_QUERY_KEY = "public-listings";

export function usePublicListings({ page = 1, perPage = 10, sort = "default", search = "" } = {}) {
  const trimmedSearch = search.trim();

  return useQuery({
    queryKey: [PUBLIC_LISTINGS_QUERY_KEY, { page, perPage, sort, search: trimmedSearch }],
    queryFn: async () => {
      const payload = {};
      if (sort === "newest") payload.sort_by = "desc";
      if (sort === "oldest") payload.sort_by = "asc";
      if (sort === "price-asc") payload.price_amount = "asc";
      if (sort === "price-desc") payload.price_amount = "desc";
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
