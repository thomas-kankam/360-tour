import HomeHero from "../../components/home/HomeHero";
import HomeTrustBar from "../../components/home/HomeTrustBar";
import HomePopularTours from "../../components/home/HomePopularTours";
import HomeDestinations from "../../components/home/HomeDestinations";
import HomeAdventureGallery from "../../components/home/HomeAdventureGallery";
import HomeTestimonial from "../../components/home/HomeTestimonial";
import HomeCta from "../../components/home/HomeCta";
import { useLandingCms } from "../../hooks/useLandingCms";

export default function HomePage() {
  const { cms } = useLandingCms();

  return (
    <>
      <HomeHero cmsOverride={cms.hero} />
      <HomeTrustBar />
      <HomePopularTours cmsOverride={cms.tours} />
      <HomeDestinations cmsOverride={cms.destinations} />
      <HomeAdventureGallery cmsOverride={cms.gallery} />
      <HomeTestimonial cmsOverride={cms.testimonials} />
      <HomeCta cmsOverride={cms.cta} />
    </>
  );
}
