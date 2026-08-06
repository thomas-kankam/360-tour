import { ROUTES } from "./routes";

export const ADMIN_PERMISSIONS = {
  USER_MANAGEMENT: "user_management",
  LISTING_MANAGEMENT: "listing_management",
  BOOKING_MANAGEMENT: "booking_management",
  CLIENT_MANAGEMENT: "client_management",
  CONTACT_MANAGEMENT: "contact_management",
  ROLE_MANAGEMENT: "role_management",
};

export function getAdminPermissionNames(user) {
  return (user?.permissions ?? []).map((p) => p.name);
}

export function hasAdminPermission(user, permission) {
  if (!permission) return true;

  const names = getAdminPermissionNames(user);

  if (Array.isArray(permission)) {
    return permission.some((item) => names.includes(item));
  }

  return names.includes(permission);
}

export function getRequiredPermissionForAdminPath(pathname) {
  if (!pathname?.startsWith("/admin")) return null;

  if (
    pathname === ROUTES.admin.dashboard ||
    pathname === ROUTES.admin.profile ||
    pathname === ROUTES.admin.login
  ) {
    return null;
  }

  if (pathname.startsWith("/admin/users")) return ADMIN_PERMISSIONS.USER_MANAGEMENT;
  if (pathname.startsWith("/admin/clients")) return ADMIN_PERMISSIONS.CLIENT_MANAGEMENT;
  if (pathname.startsWith("/admin/bookings")) return ADMIN_PERMISSIONS.BOOKING_MANAGEMENT;
  if (pathname.startsWith("/admin/payments")) return ADMIN_PERMISSIONS.BOOKING_MANAGEMENT;
  if (pathname.startsWith("/admin/contacts")) return ADMIN_PERMISSIONS.CONTACT_MANAGEMENT;
  if (pathname.startsWith("/admin/listings")) return ADMIN_PERMISSIONS.LISTING_MANAGEMENT;
  if (pathname.startsWith("/admin/operators")) return ADMIN_PERMISSIONS.LISTING_MANAGEMENT;
  if (pathname.startsWith("/admin/roles")) return ADMIN_PERMISSIONS.ROLE_MANAGEMENT;

  return null;
}

export function canAccessAdminPath(pathname, user) {
  const required = getRequiredPermissionForAdminPath(pathname);
  if (!required) return true;
  return hasAdminPermission(user, required);
}

export const ADMIN_LISTING_NAV_ITEMS = [
  { to: ROUTES.admin.listings, label: "Listings" },
  { to: ROUTES.admin.operators, label: "Operators" },
];

export const ADMIN_BOOKING_NAV_ITEMS = [
  { to: ROUTES.admin.bookings, label: "Bookings" },
  { to: ROUTES.admin.payments, label: "Payments" },
];

export const ADMIN_PERMISSION_NAV_MAP = {
  [ADMIN_PERMISSIONS.BOOKING_MANAGEMENT]: {
    to: ROUTES.admin.bookings,
    label: "Bookings",
  },
  [ADMIN_PERMISSIONS.CLIENT_MANAGEMENT]: {
    to: ROUTES.admin.clients,
    label: "Clients",
  },
  [ADMIN_PERMISSIONS.CONTACT_MANAGEMENT]: {
    to: ROUTES.admin.contacts,
    label: "Contacts",
  },
  [ADMIN_PERMISSIONS.LISTING_MANAGEMENT]: {
    to: ROUTES.admin.listings,
    label: "Listings",
  },
  [ADMIN_PERMISSIONS.ROLE_MANAGEMENT]: {
    to: ROUTES.admin.roles,
    label: "Roles & permissions",
  },
  [ADMIN_PERMISSIONS.USER_MANAGEMENT]: {
    to: ROUTES.admin.users,
    label: "User accounts",
  },
};
