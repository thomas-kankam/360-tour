import { Outlet } from "react-router";
import ScrollToTop from "../components/misc/ScrollToTop";

/**
 * Bare full-viewport layout for login / signup.
 * No navbar, no footer. Viewport-locked so only the right
 * panel scrolls while the left brand panel stays fixed.
 */
export default function AuthPageLayout() {
  return (
    <div className="h-screen overflow-hidden">
      <ScrollToTop />
      <Outlet />
    </div>
  );
}
