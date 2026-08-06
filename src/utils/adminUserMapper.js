import { USER_ROLES } from "../constants/roles";

export function mapAdminUser(admin) {
  if (!admin) return null;

  const firstName = admin.first_name ?? admin.firstName ?? "";
  const lastName = admin.last_name ?? admin.lastName ?? "";
  const email = admin.email ?? "";
  const phone = admin.phone_number ?? admin.phone ?? "";

  const roleObj = admin.role ?? {};
  const permissions = Array.isArray(roleObj.permissions)
    ? roleObj.permissions.map((p) => ({ name: p.name, label: p.label }))
    : [];

  return {
    id: admin.id,
    slug: admin.admin_slug ?? admin.slug,
    firstName,
    lastName,
    name: [firstName, lastName].filter(Boolean).join(" ") || email || phone,
    phone,
    email,
    status: admin.status ?? "active",
    profileImage: admin.profile_image ?? admin.profileImage ?? null,
    roleSlug: admin.role_slug ?? roleObj.roleSlug ?? "",
    roleLabel: roleObj.name ?? "",
    permissions,
    isVerified: true,
    role: USER_ROLES.ADMINISTRATOR,
  };
}
