import HomeHero from "../../components/home/HomeHero";
import HomeAbout from "../../components/home/HomeAbout";
import HomeCta from "../../components/home/HomeCta";
import HomeDestinations from "../../components/home/HomeDestinations";
import HomeHubs from "../../components/home/HomeHubs";
import HomeFeatures from "../../components/home/HomeFeatures";
import HomeTestimonial from "../../components/home/HomeTestimonial";
import HomeUpcomingTours from "../../components/home/HomeUpcomingTours";
import { useLandingCms } from "../../hooks/useLandingCms";

export default function HomePage() {
  const { cms } = useLandingCms();

  return (
    <>
      <HomeHero cmsOverride={cms.hero} />
      <HomeAbout cmsOverride={cms.about} />
      <HomeHubs />
      <HomeUpcomingTours />
      <HomeFeatures cmsOverride={cms.features} />
      <HomeDestinations />
      <HomeTestimonial cmsOverride={cms.testimonials} />
      <HomeCta cmsOverride={cms.cta} />
    </>
  );
}
