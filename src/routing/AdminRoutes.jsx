import { Navigate, Route } from "react-router";
import { ADMIN_PERMISSIONS } from "../constants/adminPermissions";
import { ROUTES } from "../constants/routes";
import { USER_ROLES } from "../constants/roles";
import AdminPermissionRoute from "./AdminPermissionRoute";
import RoleRoute from "./RoleRoute";
import {
  AdminBookingDetailPage,
  AdminBookingsPage,
  AdminClientDetailPage,
  AdminClientsPage,
  AdminContactDetailPage,
  AdminContactsPage,
  AdminDashboardPage,
  AdminInvoiceDetailPage,
  AdminInvoiceFormPage,
  AdminInvoiceRequestsPage,
  AdminInvoicesPage,
  AdminExperienceFormPage,
  AdminExperiencesPage,
  AdminLandingCmsPage,
  AdminLayout,
  AdminStoriesPage,
  AdminStoryFormPage,
  AdminListingDetailPage,
  AdminListingsPage,
  AdminLoginPage,
  AdminNotificationsPage,
  AdminPaymentDetailPage,
  AdminPaymentsPage,
  AdminProfilePage,
  AdminRatingsPage,
  AdminRolesPage,
  AdminUserDetailPage,
  AdminUserFormPage,
  AdminUsersPage,
  OperatorTourDetailPage,
  OperatorTourFormPage,
  OperatorToursPage,
} from "./lazyPages";

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
          <Route path="tours" element={<OperatorToursPage />} />
          <Route path="tours/new" element={<OperatorTourFormPage />} />
          <Route path="tours/:slug/edit" element={<OperatorTourFormPage />} />
          <Route path="tours/:slug" element={<OperatorTourDetailPage />} />
          <Route path="listings" element={<AdminListingsPage />} />
          <Route path="listings/:slug" element={<AdminListingDetailPage />} />
        </Route>

        <Route element={<AdminPermissionRoute permission={ADMIN_PERMISSIONS.RATING_MANAGEMENT} />}>
          <Route path="ratings" element={<AdminRatingsPage />} />
        </Route>

        <Route element={<AdminPermissionRoute permission={ADMIN_PERMISSIONS.INVOICE_MANAGEMENT} />}>
          <Route path="invoices" element={<AdminInvoicesPage />} />
          <Route path="invoices/new" element={<AdminInvoiceFormPage />} />
          <Route path="invoices/:id/edit" element={<AdminInvoiceFormPage />} />
          <Route path="invoices/:id" element={<AdminInvoiceDetailPage />} />
          <Route path="invoice-requests" element={<AdminInvoiceRequestsPage />} />
        </Route>

        <Route path="notifications" element={<AdminNotificationsPage />} />

        <Route element={<AdminPermissionRoute permission={ADMIN_PERMISSIONS.CMS_MANAGEMENT} />}>
          <Route path="landing-cms" element={<AdminLandingCmsPage />} />
          <Route path="stories" element={<AdminStoriesPage />} />
          <Route path="stories/new" element={<AdminStoryFormPage />} />
          <Route path="stories/:id/edit" element={<AdminStoryFormPage />} />
          <Route path="experiences" element={<AdminExperiencesPage />} />
          <Route path="experiences/new" element={<AdminExperienceFormPage />} />
          <Route path="experiences/:id/edit" element={<AdminExperienceFormPage />} />
        </Route>

        <Route element={<AdminPermissionRoute permission={ADMIN_PERMISSIONS.ROLE_MANAGEMENT} />}>
          <Route path="roles" element={<AdminRolesPage />} />
        </Route>
      </Route>
    </Route>

    <Route path="operator/*" element={<Navigate to={ROUTES.admin.dashboard} replace />} />
  </>
);

export default adminRoutes;
