import { Navigate, Outlet, useLocation } from "react-router";
import { resolvePostAuthRedirect } from "../constants/roles";
import { useAuth } from "../hooks/useAuth";

/**
 * Login and signup only — authenticated users are redirected away.
 */
export default function PublicOnlyRoute() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const from = location.state?.from;

  if (isAuthenticated) {
    return <Navigate to={resolvePostAuthRedirect(from, user?.role)} replace />;
  }

  return <Outlet />;
}
