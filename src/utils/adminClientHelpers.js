import { parsePaginatedList } from "./adminPaginationHelpers";

export const ADMIN_CLIENT_STATUS_STYLES = {
  active: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  inactive: "bg-amber-100 text-amber-700 ring-amber-200",
  suspended: "bg-red-100 text-red-700 ring-red-200",
};

export function mapAdminClient(raw) {
  if (!raw) return null;

  const firstName = raw.firstName || raw.first_name || "";
  const lastName = raw.lastName || raw.last_name || "";

  return {
    id: raw.id,
    clientSlug: raw.clientSlug || raw.client_slug || "",
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    email: raw.email || "",
    phoneNumber: raw.phoneNumber || raw.phone_number || "",
    location: raw.location || "",
    status: raw.status || "",
    profileImage: raw.profileImage || raw.profile_image || "",
    isVerified: Boolean(raw.isVerified ?? raw.is_verified),
    verifiedAt: raw.verifiedAt || raw.verified_at || "",
    createdAt: raw.createdAt || raw.created_at || "",
    updatedAt: raw.updatedAt || raw.updated_at || "",
  };
}

export function mapAdminClientList(data) {
  const { items, pagination } = parsePaginatedList(data);
  return {
    items: items.map(mapAdminClient).filter(Boolean),
    pagination,
  };
}

export function getAdminClientStatusConfig(client) {
  const status = client?.status || "";
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";

  return {
    label,
    className: ADMIN_CLIENT_STATUS_STYLES[status] ?? "bg-brand-cream text-brand-muted ring-black/8",
  };
}

export function formatAdminClientDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function summarizeAdminClients(clients = []) {
  let active = 0;
  let verified = 0;

  clients.forEach((client) => {
    if (client.status === "active") active += 1;
    if (client.isVerified) verified += 1;
  });

  return { active, verified };
}
