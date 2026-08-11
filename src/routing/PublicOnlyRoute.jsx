import { Navigate, Outlet, useLocation } from "react-router";
import { isTouristRole, resolvePostAuthRedirect } from "../constants/roles";
import { useAuth } from "../hooks/useAuth";

/**
 * Login and signup only — authenticated travelers are redirected away.
 * Admins and operators may access these pages to switch to a traveler account.
 */
export default function PublicOnlyRoute() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const from = location.state?.from;

  if (isAuthenticated && isTouristRole(user?.role)) {
    return <Navigate to={resolvePostAuthRedirect(from, user?.role)} replace />;
  }

  return <Outlet />;
}
