import { useCallback } from "react";
import { useNavigate } from "react-router";
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
import adminAuthServiceApi from "../apis/AdminAuthServiceApi";
import operatorAuthServiceApi from "../apis/OperatorAuthServiceApi";

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAppSelector(selectUser);
  const token = useAppSelector(selectToken);
  const role = useAppSelector(selectUserRole);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isVerified = useAppSelector(selectIsVerified);

  const login = useCallback(
    (nextToken, nextUser) => {
      dispatch(setCredentials({ token: nextToken, user: nextUser }));
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    const wasAdmin = isAdminRole(role);
    const wasOperator = isOperatorRole(role);
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

    dispatch(clearCredentials());
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
