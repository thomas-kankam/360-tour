import HomeHero from "../../components/home/HomeHero";
import HomeFeaturedTours from "../../components/home/HomeFeaturedTours";
import HomeDestinations from "../../components/home/HomeDestinations";
import HomeHubs from "../../components/home/HomeHubs";
import HomeExploreLinks from "../../components/home/HomeExploreLinks";
import HomeCta from "../../components/home/HomeCta";
import { useLandingCms } from "../../hooks/useLandingCms";

export default function HomePage() {
  const { cms } = useLandingCms();

  return (
    <>
      <HomeHero cmsOverride={cms.hero} />
      <HomeFeaturedTours cmsOverride={cms.tours} />
      <HomeHubs cmsOverride={cms.regions} />
      <HomeDestinations cmsOverride={cms.destinations} />
      <HomeExploreLinks cmsOverride={cms.explore} />
      <HomeCta cmsOverride={cms.cta} />
    </>
  );
}
