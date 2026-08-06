import { Route } from "react-router";
import AuthLayout from "../layouts/AuthLayout";
import DashboardPage from "../pages/auth/DashboardPage";
import MyInquiriesPage from "../pages/auth/MyInquiriesPage";
import ProfilePage from "../pages/auth/ProfilePage";
import UnauthorizedPage from "../pages/auth/UnauthorizedPage";
import { ROUTES } from "../constants/routes";
import { USER_ROLES } from "../constants/roles";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

const authRoutes = (
  <>
    <Route path={ROUTES.unauthorized} element={<UnauthorizedPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<RoleRoute allowedRoles={[USER_ROLES.TOURIST]} />}>
        <Route element={<AuthLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="my-inquiries" element={<MyInquiriesPage />} />
        </Route>
      </Route>
    </Route>
  </>
);

export default authRoutes;
