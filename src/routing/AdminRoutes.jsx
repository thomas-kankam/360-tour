import { Navigate, Route } from "react-router";
import AdminLayout from "../layouts/AdminLayout";
import { ADMIN_PERMISSIONS } from "../constants/adminPermissions";
import AdminBookingDetailPage from "../pages/admin/AdminBookingDetailPage";
import AdminBookingsPage from "../pages/admin/AdminBookingsPage";
import AdminClientDetailPage from "../pages/admin/AdminClientDetailPage";
import AdminClientsPage from "../pages/admin/AdminClientsPage";
import AdminContactDetailPage from "../pages/admin/AdminContactDetailPage";
import AdminContactsPage from "../pages/admin/AdminContactsPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminListingDetailPage from "../pages/admin/AdminListingDetailPage";
import AdminListingsPage from "../pages/admin/AdminListingsPage";
import AdminLoginPage from "../pages/admin/AdminLoginPage";
import AdminOperatorDetailPage from "../pages/admin/AdminOperatorDetailPage";
import AdminOperatorsPage from "../pages/admin/AdminOperatorsPage";
import AdminPaymentDetailPage from "../pages/admin/AdminPaymentDetailPage";
import AdminPaymentsPage from "../pages/admin/AdminPaymentsPage";
import AdminProfilePage from "../pages/admin/AdminProfilePage";
import AdminRolesPage from "../pages/admin/AdminRolesPage";
import AdminUserDetailPage from "../pages/admin/AdminUserDetailPage";
import AdminUserFormPage from "../pages/admin/AdminUserFormPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import { ROUTES } from "../constants/routes";
import { USER_ROLES } from "../constants/roles";
import AdminPermissionRoute from "./AdminPermissionRoute";
import RoleRoute from "./RoleRoute";

const adminRoutes = (
  <>
    <Route path="admin/login" element={<AdminLoginPage />} />
    <Route element={<RoleRoute allowedRoles={[USER_ROLES.ADMINISTRATOR]} loginPath={ROUTES.admin.login} />}>
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Navigate to={ROUTES.admin.dashboard} replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="profile" element={<AdminProfilePage />} />

        <Route element={<AdminPermissionRoute permission={ADMIN_PERMISSIONS.USER_MANAGEMENT} />}>
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/new" element={<AdminUserFormPage />} />
          <Route path="users/:id/edit" element={<AdminUserFormPage />} />
          <Route path="users/:id" element={<AdminUserDetailPage />} />
        </Route>

        <Route element={<AdminPermissionRoute permission={ADMIN_PERMISSIONS.CLIENT_MANAGEMENT} />}>
          <Route path="clients" element={<AdminClientsPage />} />
          <Route path="clients/:clientSlug" element={<AdminClientDetailPage />} />
        </Route>

        <Route element={<AdminPermissionRoute permission={ADMIN_PERMISSIONS.BOOKING_MANAGEMENT} />}>
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="bookings/:bookingCode" element={<AdminBookingDetailPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="payments/:paymentSlug" element={<AdminPaymentDetailPage />} />
        </Route>

        <Route element={<AdminPermissionRoute permission={ADMIN_PERMISSIONS.CONTACT_MANAGEMENT} />}>
          <Route path="contacts" element={<AdminContactsPage />} />
          <Route path="contacts/:id" element={<AdminContactDetailPage />} />
        </Route>

        <Route element={<AdminPermissionRoute permission={ADMIN_PERMISSIONS.LISTING_MANAGEMENT} />}>
          <Route path="listings" element={<AdminListingsPage />} />
          <Route path="listings/:slug" element={<AdminListingDetailPage />} />
          <Route path="operators" element={<AdminOperatorsPage />} />
          <Route path="operators/:operatorSlug" element={<AdminOperatorDetailPage />} />
        </Route>

        <Route element={<AdminPermissionRoute permission={ADMIN_PERMISSIONS.ROLE_MANAGEMENT} />}>
          <Route path="roles" element={<AdminRolesPage />} />
        </Route>
      </Route>
    </Route>
  </>
);

export default adminRoutes;
