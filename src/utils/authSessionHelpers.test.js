import { describe, expect, test } from "@jest/globals";
import { USER_ROLES } from "../constants/roles";
import {
  createEmptyAuthSessions,
  normalizePersistedAuthState,
  resolveAuthContextFromPath,
} from "./authSessionHelpers";

describe("authSessionHelpers", () => {
  test("resolveAuthContextFromPath maps admin and guest routes", () => {
    expect(resolveAuthContextFromPath("/admin/invoices")).toBe(USER_ROLES.ADMINISTRATOR);
    expect(resolveAuthContextFromPath("/admin/login")).toBe(USER_ROLES.ADMINISTRATOR);
    expect(resolveAuthContextFromPath("/operator/dashboard")).toBe(USER_ROLES.TOURIST);
    expect(resolveAuthContextFromPath("/my-bookings")).toBe(USER_ROLES.TOURIST);
    expect(resolveAuthContextFromPath("/")).toBe(USER_ROLES.TOURIST);
  });

  test("normalizePersistedAuthState migrates legacy flat auth", () => {
    const normalized = normalizePersistedAuthState({
      token: "abc",
      user: { role: USER_ROLES.ADMINISTRATOR, name: "Admin" },
    });

    expect(normalized.sessions[USER_ROLES.ADMINISTRATOR]).toEqual({
      token: "abc",
      user: { role: USER_ROLES.ADMINISTRATOR, name: "Admin" },
    });
    expect(normalized.sessions[USER_ROLES.TOURIST]).toEqual({ token: null, user: null });
  });

  test("normalizePersistedAuthState preserves separate sessions", () => {
    const sessions = createEmptyAuthSessions();
    sessions[USER_ROLES.TOURIST] = { token: "client", user: { role: USER_ROLES.TOURIST } };
    sessions[USER_ROLES.ADMINISTRATOR] = { token: "admin", user: { role: USER_ROLES.ADMINISTRATOR } };

    const normalized = normalizePersistedAuthState({ sessions });

    expect(normalized.sessions[USER_ROLES.TOURIST].token).toBe("client");
    expect(normalized.sessions[USER_ROLES.ADMINISTRATOR].token).toBe("admin");
  });
});
