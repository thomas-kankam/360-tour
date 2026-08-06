import { ROUTES } from "../../constants/routes";
import { ADMIN_PERMISSIONS } from "../../constants/adminPermissions";
import { USER_ROLES } from "../../constants/roles";

/** Toggle guest-facing sections — flip to true when ready to launch */
export const NAV_FEATURES = {
  experiences: false,
  stories: false,
};

export const primaryNavLinks = [
  { label: "Home", to: ROUTES.home, end: true },
  { label: "About", to: ROUTES.about, end: true },
  { label: "Tours", to: ROUTES.tours },
  ...(NAV_FEATURES.experiences
    ? [{ label: "Experiences", to: ROUTES.experiences, end: true }]
    : []),
  ...(NAV_FEATURES.stories ? [{ label: "Stories", to: ROUTES.stories }] : []),
  { label: "Contact", to: ROUTES.contact, end: true },
];

export const exploreFooterLinks = [
  { label: "Home", to: ROUTES.home },
  { label: "Tours", to: ROUTES.tours },
  ...(NAV_FEATURES.experiences ? [{ label: "Experiences", to: ROUTES.experiences }] : []),
  ...(NAV_FEATURES.stories ? [{ label: "Stories", to: ROUTES.stories }] : []),
  { label: "Contact", to: ROUTES.contact },
];

const GUEST_ACCOUNT_LINKS = [
  { label: "My bookings", to: ROUTES.myBookings },
  { label: "Sign in", to: ROUTES.login },
  { label: "Create account", to: ROUTES.signup },
];

export function getFooterAccountLinks({ isAuthenticated, role, hasAdminPermission }) {
  if (!isAuthenticated) return GUEST_ACCOUNT_LINKS;

  if (role === USER_ROLES.SITE_OPERATOR) {
    return [
      { label: "Dashboard", to: ROUTES.operator.dashboard },
      { label: "My listings", to: ROUTES.operator.tours },
      { label: "Bookings", to: ROUTES.operator.bookings },
      { label: "Payments", to: ROUTES.operator.payments },
      { label: "Profile", to: ROUTES.operator.profile },
    ];
  }

  if (role === USER_ROLES.ADMINISTRATOR) {
    const links = [{ label: "Dashboard", to: ROUTES.admin.dashboard }];

    if (hasAdminPermission?.(ADMIN_PERMISSIONS.BOOKING_MANAGEMENT)) {
      links.push({ label: "Bookings", to: ROUTES.admin.bookings });
    }

    links.push({ label: "Profile", to: ROUTES.admin.profile });
    return links;
  }

  return [
    { label: "Dashboard", to: ROUTES.dashboard },
    { label: "My bookings", to: ROUTES.myBookings },
    { label: "My payments", to: ROUTES.myPayments },
    { label: "Profile", to: ROUTES.profile },
  ];
}
