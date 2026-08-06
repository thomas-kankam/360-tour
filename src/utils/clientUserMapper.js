import { USER_ROLES } from "../constants/roles";

export function mapClientUser(client) {
  if (!client) return null;

  const firstName = client.first_name ?? client.firstName ?? "";
  const lastName = client.last_name ?? client.lastName ?? "";
  const email = client.email ?? "";
  const phone = client.phone_number ?? client.phone ?? "";

  return {
    id: client.id,
    slug: client.client_slug ?? client.slug,
    firstName,
    lastName,
    name: [firstName, lastName].filter(Boolean).join(" ") || email || phone,
    phone,
    email,
    isVerified: Boolean(client.is_verified ?? client.isVerified),
    verifiedAt: client.verified_at ?? client.verifiedAt ?? null,
    location: client.location ?? "",
    status: client.status ?? "active",
    profileImage: client.profile_image ?? client.profileImage ?? null,
    role: USER_ROLES.TOURIST,
  };
}
