import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  clearCredentials,
  selectIsAuthenticated,
  selectIsVerified,
  selectToken,
  selectUser,
  selectUserRole,
  setCredentials,
} from "../features/auth/authSlice";
import { ROUTES } from "../constants/routes";
import { getHomeRouteForRole, isAdminRole, isOperatorRole, isTouristRole } from "../constants/roles";
import { hasAdminPermission as checkAdminPermission } from "../constants/adminPermissions";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { persistor } from "../store";
import { clearLegacyAuth } from "../store/legacyAuthMigration";
import { normalizeAuthRole, resolveAuthContextFromPath } from "../utils/authSessionHelpers";
import adminAuthServiceApi from "../apis/AdminAuthServiceApi";
import operatorAuthServiceApi from "../apis/OperatorAuthServiceApi";

export function useAuth(options = {}) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();

  const contextRole = useMemo(
    () => normalizeAuthRole(options.context ?? resolveAuthContextFromPath(location.pathname)),
    [location.pathname, options.context],
  );

  const user = useAppSelector((state) => selectUser(state, contextRole));
  const token = useAppSelector((state) => selectToken(state, contextRole));
  const role = useAppSelector((state) => selectUserRole(state, contextRole));
  const isAuthenticated = useAppSelector((state) => selectIsAuthenticated(state, contextRole));
  const isVerified = useAppSelector((state) => selectIsVerified(state, contextRole));

  const login = useCallback(
    (nextToken, nextUser) => {
      dispatch(setCredentials({ token: nextToken, user: nextUser }));
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    const sessionRole = normalizeAuthRole(role);
    const wasAdmin = isAdminRole(sessionRole);
    const wasOperator = isOperatorRole(sessionRole);
    const currentToken = token;

    if (wasAdmin && currentToken) {
      try {
        await adminAuthServiceApi.logout(currentToken);
      } catch {
        // Local session is still cleared if the API call fails.
      }
    }

    if (wasOperator && currentToken) {
      try {
        await operatorAuthServiceApi.logout(currentToken);
      } catch {
        // Local session is still cleared if the API call fails.
      }
    }

    dispatch(clearCredentials({ role: sessionRole }));
    clearLegacyAuth();
    queryClient.clear();

    try {
      await persistor.flush();
    } catch {
      // Persist flush is best-effort; in-memory state is already cleared.
    }

    if (wasAdmin) {
      navigate(ROUTES.admin.login, { replace: true });
      return;
    }

    navigate(ROUTES.home, { replace: true });
  }, [dispatch, navigate, queryClient, role, token]);

  return {
    user,
    token,
    role,
    contextRole,
    isAuthenticated,
    isVerified,
    isTourist: isTouristRole(role),
    isOperator: isOperatorRole(role),
    isAdmin: isAdminRole(role),
    hasAdminPermission: (permission) => checkAdminPermission(user, permission),
    homeRoute: getHomeRouteForRole(role),
    login,
    logout,
  };
}
