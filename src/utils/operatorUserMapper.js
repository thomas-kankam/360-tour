import { USER_ROLES } from "../constants/roles";

export function mapOperatorUser(operator) {
  if (!operator) return null;

  const firstName = operator.first_name ?? operator.firstName ?? "";
  const lastName = operator.last_name ?? operator.lastName ?? "";
  const email = operator.email ?? "";
  const phone = operator.phone_number ?? operator.phone ?? "";

  return {
    id: operator.id,
    slug: operator.operator_slug ?? operator.slug,
    firstName,
    lastName,
    name: [firstName, lastName].filter(Boolean).join(" ") || email || phone,
    phone,
    email,
    organization: operator.organization ?? "",
    location: operator.location ?? "",
    isVerified: Boolean(operator.is_verified ?? operator.isVerified),
    verifiedAt: operator.verified_at ?? operator.verifiedAt ?? null,
    status: operator.status ?? "inactive",
    profileImage: operator.profile_image ?? operator.profileImage ?? null,
    role: USER_ROLES.SITE_OPERATOR,
  };
}
