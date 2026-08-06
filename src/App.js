import { Navigate, Route, Routes } from "react-router";
import DevPaymentRegionToolbar from "./components/dev/DevPaymentRegionToolbar";
import env from "./config/env";
import { ROUTES } from "./constants/routes";
import adminRoutes from "./routing/AdminRoutes";
import authRoutes from "./routing/AuthRoutes";
import guestRoutes from "./routing/GuestRoutes";
import operatorRoutes from "./routing/OperatorRoutes";
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
      <Routes>
        {adminRoutes}
        {guestRoutes}
        {authRoutes}
        {operatorRoutes}
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </>
  );
}

export default App;
