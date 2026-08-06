import { Navigate, Outlet, useLocation } from "react-router";
import { hasAdminPermission } from "../constants/adminPermissions";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";

export default function AdminPermissionRoute({ permission, redirectTo = ROUTES.admin.dashboard }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!hasAdminPermission(user, permission)) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ accessDenied: true, from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}

export function AdminPermissionGuard({ permission, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!hasAdminPermission(user, permission)) {
    return (
      <Navigate
        to={ROUTES.admin.dashboard}
        replace
        state={{ accessDenied: true, from: location.pathname }}
      />
    );
  }

  return children;
}
