import HomeHero from "../../components/home/HomeHero";
import HomeFeaturedTours from "../../components/home/HomeFeaturedTours";
import HomeExploreLinks from "../../components/home/HomeExploreLinks";
import HomeCta from "../../components/home/HomeCta";
import { useLandingCms } from "../../hooks/useLandingCms";

export default function HomePage() {
  const { cms } = useLandingCms();

  return (
    <>
      <HomeHero cmsOverride={cms.hero} />
      <HomeFeaturedTours cmsOverride={cms.tours} />
      <HomeExploreLinks cmsOverride={cms.explore} />
      <HomeCta cmsOverride={cms.cta} />
    </>
  );
}
