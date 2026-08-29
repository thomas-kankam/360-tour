import { USER_ROLES } from "../constants/roles";

export function normalizeAuthRole(role) {
  if (role === USER_ROLES.ADMINISTRATOR) return USER_ROLES.ADMINISTRATOR;
  if (role === USER_ROLES.SITE_OPERATOR) return USER_ROLES.SITE_OPERATOR;
  return USER_ROLES.TOURIST;
}

/** Pick which stored session applies based on the current URL. */
export function resolveAuthContextFromPath(pathname = "") {
  if (pathname.startsWith("/admin")) return USER_ROLES.ADMINISTRATOR;
  if (pathname.startsWith("/operator")) return USER_ROLES.SITE_OPERATOR;
  return USER_ROLES.TOURIST;
}

export function audienceToAuthRole(audience) {
  return audience === "admin" ? USER_ROLES.ADMINISTRATOR : USER_ROLES.TOURIST;
}

export function createEmptyAuthSessions() {
  return {
    [USER_ROLES.TOURIST]: { token: null, user: null },
    [USER_ROLES.ADMINISTRATOR]: { token: null, user: null },
    [USER_ROLES.SITE_OPERATOR]: { token: null, user: null },
  };
}

export function normalizePersistedAuthState(auth) {
  if (!auth) {
    return { sessions: createEmptyAuthSessions() };
  }

  if (auth.sessions) {
    return {
      sessions: {
        ...createEmptyAuthSessions(),
        ...auth.sessions,
      },
    };
  }

  if (auth.token && auth.user) {
    const role = normalizeAuthRole(auth.user.role);
    return {
      sessions: {
        ...createEmptyAuthSessions(),
        [role]: { token: auth.token, user: auth.user },
      },
    };
  }

  return { sessions: createEmptyAuthSessions() };
}
