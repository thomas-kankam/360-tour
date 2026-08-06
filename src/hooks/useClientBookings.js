import { useQuery } from "@tanstack/react-query";
import consumerBookingsServiceApi from "../apis/ConsumerBookingsServiceApi";

export function useClientBookings(token, { page = 1, per_page = 15 } = {}) {
  return useQuery({
    queryKey: ["client-bookings", token, page, per_page],
    queryFn: async () => {
      const result = await consumerBookingsServiceApi.listBookings(token, { page, per_page });
      if (!result.ok) {
        throw new Error(result.reason || result.message || "Could not load your bookings.");
      }
      return {
        items: result.items,
        pagination: result.pagination,
      };
    },
    enabled: Boolean(token),
  });
}
