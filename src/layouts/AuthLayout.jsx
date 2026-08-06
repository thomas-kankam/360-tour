import { Outlet } from "react-router";
import AuthNavbar from "../components/navigation/AuthNavbar";
import ScrollToTop from "../components/misc/ScrollToTop";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <ScrollToTop />
      <AuthNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
