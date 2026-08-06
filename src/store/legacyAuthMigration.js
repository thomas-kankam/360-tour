const AUTH_TOKEN_KEY = "afriquest_auth_token";
const AUTH_USER_KEY = "afriquest_auth_user";

export function getLegacyAuth() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const rawUser = localStorage.getItem(AUTH_USER_KEY);

  if (!token || !rawUser) {
    return null;
  }

  try {
    return { token, user: JSON.parse(rawUser) };
  } catch {
    clearLegacyAuth();
    return null;
  }
}

export function clearLegacyAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}
