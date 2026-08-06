import { Route } from "react-router";
import OperatorLayout from "../layouts/OperatorLayout";
import OperatorBookingsPage from "../pages/operator/OperatorBookingsPage";
import OperatorDashboardPage from "../pages/operator/OperatorDashboardPage";
import OperatorPaymentsPage from "../pages/operator/OperatorPaymentsPage";
import OperatorPaymentDetailPage from "../pages/operator/OperatorPaymentDetailPage";
import OperatorProfilePage from "../pages/operator/OperatorProfilePage";
import OperatorTourDetailPage from "../pages/operator/OperatorTourDetailPage";
import OperatorTourFormPage from "../pages/operator/OperatorTourFormPage";
import OperatorToursPage from "../pages/operator/OperatorToursPage";
import { USER_ROLES } from "../constants/roles";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

const operatorRoutes = (
  <Route element={<ProtectedRoute />}>
    <Route element={<RoleRoute allowedRoles={[USER_ROLES.SITE_OPERATOR]} />}>
      <Route path="operator" element={<OperatorLayout />}>
        <Route path="dashboard" element={<OperatorDashboardPage />} />
        <Route path="tours" element={<OperatorToursPage />} />
        <Route path="tours/new" element={<OperatorTourFormPage />} />
        <Route path="tours/:slug/edit" element={<OperatorTourFormPage />} />
        <Route path="tours/:slug" element={<OperatorTourDetailPage />} />
        <Route path="bookings" element={<OperatorBookingsPage />} />
        <Route path="payments" element={<OperatorPaymentsPage />} />
        <Route path="payments/:paymentSlug" element={<OperatorPaymentDetailPage />} />
        <Route path="profile" element={<OperatorProfilePage />} />
      </Route>
    </Route>
  </Route>
);

export default operatorRoutes;
