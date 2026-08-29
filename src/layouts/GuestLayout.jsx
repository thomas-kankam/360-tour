import { Outlet } from "react-router";
import Footer from "../components/layout/Footer";
import GuestNavbar from "../components/navigation/GuestNavbar";
import LandingQuickActions from "../components/layout/LandingQuickActions";
import ScrollToTop from "../components/misc/ScrollToTop";
import PageSeo from "../components/seo/PageSeo";
import { SeoProvider, useSeoContext } from "../components/seo/SeoContext";

function GuestSeo() {
  const { override, jsonLd, jsonLdId } = useSeoContext();
  return <PageSeo override={override} jsonLd={jsonLd} jsonLdId={jsonLdId} />;
}

export default function GuestLayout() {
  return (
    <SeoProvider>
      <GuestSeo />
      <ScrollToTop />
      <GuestNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <LandingQuickActions />
    </SeoProvider>
  );
}
