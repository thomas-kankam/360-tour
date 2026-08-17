import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import DevPaymentRegionToolbar from "./components/dev/DevPaymentRegionToolbar";
import Loader from "./components/misc/Loader";
import env from "./config/env";
import { ROUTES } from "./constants/routes";
import adminRoutes from "./routing/AdminRoutes";
import authRoutes from "./routing/AuthRoutes";
import guestRoutes from "./routing/GuestRoutes";
import {
  applyDevPaymentRegionFromUrl,
  installDevPaymentRegionConsoleHelpers,
} from "./utils/devPaymentRegion";
import Toastr from "./utils/Toastr";

if (env.isDev && typeof window !== "undefined") {
  applyDevPaymentRegionFromUrl(window.location.search);
  installDevPaymentRegionConsoleHelpers();
}

function App() {
  return (
    <>
      <Toastr />
      {env.isDev ? <DevPaymentRegionToolbar /> : null}
      <Suspense fallback={<Loader />}>
        <Routes>
          {adminRoutes}
          {guestRoutes}
          {authRoutes}
          <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
