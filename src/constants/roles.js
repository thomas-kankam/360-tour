import { ROUTES } from "./routes";

export const USER_ROLES = {
  TOURIST: "tourist",
  ADMINISTRATOR: "administrator",
};

export const ROLE_META = {
  [USER_ROLES.TOURIST]: {
    label: "Traveler",
    shortLabel: "Traveler",
    description: "Browse tours, book trips, and manage your reservations.",
    icon: "luggage",
  },
  [USER_ROLES.ADMINISTRATOR]: {
    label: "Administrator",
    shortLabel: "Admin",
    description: "Manage platform users, bookings, listings, and internal operations.",
    icon: "shield",
  },
};

export function getHomeRouteForRole(role) {
  if (role === USER_ROLES.ADMINISTRATOR) return ROUTES.admin.dashboard;
  return ROUTES.dashboard;
}

/** Public landing after sign-in — travelers return to the marketing home. */
export function getGuestLandingRoute(role) {
  if (role === USER_ROLES.ADMINISTRATOR) return ROUTES.admin.dashboard;
  return ROUTES.home;
}

export function isTouristRole(role) {
  return role === USER_ROLES.TOURIST;
}

export function isAdminRole(role) {
  return role === USER_ROLES.ADMINISTRATOR;
}

const TOURIST_ONLY_PREFIXES = ["/dashboard", "/profile", "/my-inquiries", "/my-bookings", "/my-payments", "/my-reviews", "/my-invoices", "/notifications"];
const ADMIN_PREFIX = "/admin";

export function canAccessPath(pathname, role) {
  if (!pathname) return true;
  if (pathname.startsWith(ADMIN_PREFIX)) return isAdminRole(role);
  if (TOURIST_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return isTouristRole(role);
  }
  return true;
}

function resolvePathFromLocation(target) {
  if (!target) return "";
  if (typeof target === "string") return target;

  const pathname = target.pathname || "";
  const search = target.search || "";
  const hash = target.hash || "";

  return `${pathname}${search}${hash}`;
}

export function resolvePostAuthRedirect(target, role) {
  const path = resolvePathFromLocation(target);
  const pathname = typeof target === "object" && target?.pathname ? target.pathname : path;

  if (path && canAccessPath(pathname, role)) return path;
  return getGuestLandingRoute(role);
}
