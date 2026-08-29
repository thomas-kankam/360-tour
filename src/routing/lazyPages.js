import { lazy } from "react";

/** Central lazy imports — keeps admin/operator/auth out of the main bundle. */
function lazyPage(importer) {
  return lazy(importer);
}

// Layouts
export const AdminLayout = lazyPage(() => import("../layouts/AdminLayout"));
export const AuthLayout = lazyPage(() => import("../layouts/AuthLayout"));
export const AuthPageLayout = lazyPage(() => import("../layouts/AuthPageLayout"));
export const GuestLayout = lazyPage(() => import("../layouts/GuestLayout"));

// Guest — marketing
export const HomePage = lazyPage(() => import("../pages/guest/HomePage"));
export const AboutPage = lazyPage(() => import("../pages/guest/AboutPage"));
export const ContactPage = lazyPage(() => import("../pages/guest/ContactPage"));
export const ExperiencesPage = lazyPage(() => import("../pages/guest/ExperiencesPage"));
export const ToursPage = lazyPage(() => import("../pages/guest/ToursPage"));
export const TourDetailPage = lazyPage(() => import("../pages/guest/TourDetailPage"));
export const WhyUsPage = lazyPage(() => import("../pages/guest/WhyUsPage"));
export const StoriesPage = lazyPage(() => import("../pages/guest/StoriesPage"));
export const StoryDetailPage = lazyPage(() => import("../pages/guest/StoryDetailPage"));
export const LoginPage = lazyPage(() => import("../pages/guest/LoginPage"));
export const SignupPage = lazyPage(() => import("../pages/guest/SignupPage"));
export const VerifyAccountPage = lazyPage(() => import("../pages/guest/VerifyAccountPage"));
export const TourBookingPage = lazyPage(() => import("../pages/guest/TourBookingPage"));
export const BookingSuccessPage = lazyPage(() => import("../pages/guest/BookingSuccessPage"));
export const PaymentSuccessPage = lazyPage(() => import("../pages/guest/PaymentSuccessPage"));
export const PaymentFailurePage = lazyPage(() => import("../pages/guest/PaymentFailurePage"));
export const MyBookingsPage = lazyPage(() => import("../pages/guest/MyBookingsPage"));
export const MyBookingDetailPage = lazyPage(() => import("../pages/guest/MyBookingDetailPage"));
export const MyBookingEditPage = lazyPage(() => import("../pages/guest/MyBookingEditPage"));
export const MyPaymentsPage = lazyPage(() => import("../pages/guest/MyPaymentsPage"));
export const MyReviewsPage = lazyPage(() => import("../pages/guest/MyReviewsPage"));
export const NotificationsPage = lazyPage(() => import("../pages/guest/NotificationsPage"));
export const MyInvoicesPage = lazyPage(() => import("../pages/guest/MyInvoicesPage"));
export const ClientInvoiceDetailPage = lazyPage(() => import("../pages/guest/ClientInvoiceDetailPage"));

// Auth (legacy dashboard routes)
export const DashboardPage = lazyPage(() => import("../pages/auth/DashboardPage"));
export const ProfilePage = lazyPage(() => import("../pages/auth/ProfilePage"));
export const MyInquiriesPage = lazyPage(() => import("../pages/auth/MyInquiriesPage"));
export const UnauthorizedPage = lazyPage(() => import("../pages/auth/UnauthorizedPage"));

// Admin
export const AdminLoginPage = lazyPage(() => import("../pages/admin/AdminLoginPage"));
export const AdminDashboardPage = lazyPage(() => import("../pages/admin/AdminDashboardPage"));
export const AdminProfilePage = lazyPage(() => import("../pages/admin/AdminProfilePage"));
export const AdminUsersPage = lazyPage(() => import("../pages/admin/AdminUsersPage"));
export const AdminUserFormPage = lazyPage(() => import("../pages/admin/AdminUserFormPage"));
export const AdminUserDetailPage = lazyPage(() => import("../pages/admin/AdminUserDetailPage"));
export const AdminClientsPage = lazyPage(() => import("../pages/admin/AdminClientsPage"));
export const AdminClientDetailPage = lazyPage(() => import("../pages/admin/AdminClientDetailPage"));
export const AdminBookingsPage = lazyPage(() => import("../pages/admin/AdminBookingsPage"));
export const AdminBookingDetailPage = lazyPage(() => import("../pages/admin/AdminBookingDetailPage"));
export const AdminPaymentsPage = lazyPage(() => import("../pages/admin/AdminPaymentsPage"));
export const AdminPaymentDetailPage = lazyPage(() => import("../pages/admin/AdminPaymentDetailPage"));
export const AdminContactsPage = lazyPage(() => import("../pages/admin/AdminContactsPage"));
export const AdminContactDetailPage = lazyPage(() => import("../pages/admin/AdminContactDetailPage"));
export const AdminListingsPage = lazyPage(() => import("../pages/admin/AdminListingsPage"));
export const AdminListingDetailPage = lazyPage(() => import("../pages/admin/AdminListingDetailPage"));
export const AdminOperatorsPage = lazyPage(() => import("../pages/admin/AdminOperatorsPage"));
export const AdminOperatorDetailPage = lazyPage(() => import("../pages/admin/AdminOperatorDetailPage"));
export const AdminRatingsPage = lazyPage(() => import("../pages/admin/AdminRatingsPage"));
export const AdminInvoicesPage = lazyPage(() => import("../pages/admin/AdminInvoicesPage"));
export const AdminInvoiceFormPage = lazyPage(() => import("../pages/admin/AdminInvoiceFormPage"));
export const AdminInvoiceDetailPage = lazyPage(() => import("../pages/admin/AdminInvoiceDetailPage"));
export const AdminLandingCmsPage = lazyPage(() => import("../pages/admin/AdminLandingCmsPage"));
export const AdminNotificationsPage = lazyPage(() => import("../pages/admin/AdminNotificationsPage"));
export const AdminInvoiceRequestsPage = lazyPage(() => import("../pages/admin/AdminInvoiceRequestsPage"));
export const AdminRolesPage = lazyPage(() => import("../pages/admin/AdminRolesPage"));

// Operator (used inside admin console)
export const OperatorToursPage = lazyPage(() => import("../pages/operator/OperatorToursPage"));
export const OperatorTourFormPage = lazyPage(() => import("../pages/operator/OperatorTourFormPage"));
export const OperatorTourDetailPage = lazyPage(() => import("../pages/operator/OperatorTourDetailPage"));
