import { Route } from "react-router";
import GuestLayout from "../layouts/GuestLayout";
import AuthPageLayout from "../layouts/AuthPageLayout";
import AboutPage from "../pages/guest/AboutPage";
import ContactPage from "../pages/guest/ContactPage";
import ExperiencesPage from "../pages/guest/ExperiencesPage";
import HomePage from "../pages/guest/HomePage";
import LoginPage from "../pages/guest/LoginPage";
import SignupPage from "../pages/guest/SignupPage";
import VerifyAccountPage from "../pages/guest/VerifyAccountPage";
import StoriesPage from "../pages/guest/StoriesPage";
import StoryDetailPage from "../pages/guest/StoryDetailPage";
import MyBookingsPage from "../pages/guest/MyBookingsPage";
import MyBookingDetailPage from "../pages/guest/MyBookingDetailPage";
import MyBookingEditPage from "../pages/guest/MyBookingEditPage";
import MyPaymentsPage from "../pages/guest/MyPaymentsPage";
import BookingSuccessPage from "../pages/guest/BookingSuccessPage";
import PaymentSuccessPage from "../pages/guest/PaymentSuccessPage";
import PaymentFailurePage from "../pages/guest/PaymentFailurePage";
import TourBookingPage from "../pages/guest/TourBookingPage";
import TourDetailPage from "../pages/guest/TourDetailPage";
import ToursPage from "../pages/guest/ToursPage";
import WhyUsPage from "../pages/guest/WhyUsPage";
import { USER_ROLES } from "../constants/roles";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import RoleRoute from "./RoleRoute";

/**
 * Public marketing site — accessible to guests and authenticated users.
 * Login and signup use AuthPageLayout (no nav/footer, viewport-locked).
 */
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
