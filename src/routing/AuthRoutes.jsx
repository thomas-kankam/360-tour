import { Route } from "react-router";
import { ROUTES } from "../constants/routes";
import { USER_ROLES } from "../constants/roles";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import {
  AuthLayout,
  DashboardPage,
  MyInquiriesPage,
  ProfilePage,
  UnauthorizedPage,
} from "./lazyPages";

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
