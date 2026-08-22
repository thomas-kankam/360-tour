import { Outlet } from "react-router";
import Footer from "../components/layout/Footer";
import GuestNavbar from "../components/navigation/GuestNavbar";
import LandingQuickActions from "../components/layout/LandingQuickActions";
import ScrollToTop from "../components/misc/ScrollToTop";
import PageSeo from "../components/seo/PageSeo";

export default function GuestLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PageSeo />
      <ScrollToTop />
      <GuestNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <LandingQuickActions />
    </div>
  );
}
