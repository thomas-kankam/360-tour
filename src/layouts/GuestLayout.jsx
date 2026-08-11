import { Outlet } from "react-router";
import Footer from "../components/layout/Footer";
import GuestNavbar from "../components/navigation/GuestNavbar";
import ScrollToTop from "../components/misc/ScrollToTop";

export default function GuestLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <GuestNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
