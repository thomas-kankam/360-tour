import { Outlet } from "react-router";
import Footer from "../components/layout/Footer";
import GuestNavbar from "../components/navigation/GuestNavbar";
import OperatorNavbar from "../components/navigation/OperatorNavbar";
import TouristNavbar from "../components/navigation/TouristNavbar";
import ScrollToTop from "../components/misc/ScrollToTop";
import { useAuth } from "../hooks/useAuth";

export default function GuestLayout() {
  const { isAuthenticated, isOperator } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      {isAuthenticated ? (isOperator ? <OperatorNavbar /> : <TouristNavbar />) : <GuestNavbar />}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
