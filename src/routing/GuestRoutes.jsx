import { Route } from "react-router";
import { USER_ROLES } from "../constants/roles";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import RoleRoute from "./RoleRoute";
import {
  AboutPage,
  AuthPageLayout,
  BookingSuccessPage,
  ContactPage,
  ExperiencesPage,
  GuestLayout,
  HomePage,
  LoginPage,
  MyBookingDetailPage,
  MyBookingEditPage,
  MyBookingsPage,
  MyPaymentsPage,
  MyReviewsPage,
  MyInvoicesPage,
  ClientInvoiceDetailPage,
  NotificationsPage,
  PaymentFailurePage,
  PaymentSuccessPage,
  SignupPage,
  StoriesPage,
  StoryDetailPage,
  TourBookingPage,
  TourDetailPage,
  ToursPage,
  VerifyAccountPage,
  WhyUsPage,
} from "./lazyPages";

const guestRoutes = (
  <>
    <Route element={<GuestLayout />}>
      <Route index element={<HomePage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="experiences" element={<ExperiencesPage />} />
      <Route path="tours" element={<ToursPage />} />
      <Route path="tours/:slug" element={<TourDetailPage />} />
      <Route path="why-us" element={<WhyUsPage />} />
      <Route path="stories" element={<StoriesPage />} />
      <Route path="stories/:slug" element={<StoryDetailPage />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="payment/success" element={<PaymentSuccessPage />} />
      <Route path="payment/failure" element={<PaymentFailurePage />} />
    </Route>

    <Route element={<GuestLayout />}>
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={[USER_ROLES.TOURIST]} />}>
          <Route path="tours/:slug/book" element={<TourBookingPage />} />
          <Route path="booking/success" element={<BookingSuccessPage />} />
          <Route path="my-bookings" element={<MyBookingsPage />} />
          <Route path="my-bookings/:bookingCode/edit" element={<MyBookingEditPage />} />
          <Route path="my-bookings/:bookingCode" element={<MyBookingDetailPage />} />
          <Route path="my-payments" element={<MyPaymentsPage />} />
          <Route path="my-reviews" element={<MyReviewsPage />} />
          <Route path="my-invoices" element={<MyInvoicesPage />} />
          <Route path="my-invoices/:id" element={<ClientInvoiceDetailPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Route>
    </Route>

    <Route element={<AuthPageLayout />}>
      <Route element={<PublicOnlyRoute />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
      </Route>
      <Route path="verify" element={<VerifyAccountPage />} />
    </Route>
  </>
);

export default guestRoutes;
