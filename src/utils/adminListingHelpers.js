import { parsePaginatedList } from "./adminPaginationHelpers";
import { formatTourCategoryLabel } from "./operatorTourConstants";
import { buildLocationsLabel, mapOperatorTour } from "./operatorTourMapper";

export const LISTING_STATUS_STYLES = {
  published: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-brand-cream text-brand-muted",
};

export function mapAdminOperator(raw) {
  if (!raw) return null;

  const firstName = raw.firstName || raw.first_name || "";
  const lastName = raw.lastName || raw.last_name || "";

  return {
    id: raw.id,
    operatorSlug: raw.operatorSlug || raw.operator_slug || "",
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    email: raw.email || "",
    phoneNumber: raw.phoneNumber || raw.phone_number || "",
    organization: raw.organization || "",
    location: raw.location || "",
    isVerified: Boolean(raw.isVerified ?? raw.is_verified),
    verifiedAt: raw.verifiedAt || raw.verified_at || "",
    status: raw.status || "",
    profileImage: raw.profileImage || raw.profile_image || "",
    createdAt: raw.createdAt || raw.created_at || "",
    updatedAt: raw.updatedAt || raw.updated_at || "",
  };
}

export function mapAdminListing(raw) {
  const tour = mapOperatorTour(raw);
  if (!tour) return null;

  const operator = mapAdminOperator(raw.operator);

  return {
    ...tour,
    bookingCount: Number(raw.bookingCount) || 0,
    locationsLabel: buildLocationsLabel(tour.locations) || tour.country || "",
    operator,
    operatorName: operator?.name || "",
    operatorOrganization: operator?.organization || "",
    categoryLabels: (tour.categories || [])
      .filter((category) => !["ghana", "kenya", "southafrica"].includes(category))
      .map(formatTourCategoryLabel),
  };
}

export function mapAdminListingList(data) {
  const { items, pagination } = parsePaginatedList(data);
  return {
    items: items.map(mapAdminListing).filter(Boolean),
    pagination,
  };
}

export function formatListingDate(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
