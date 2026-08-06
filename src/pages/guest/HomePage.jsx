import HomeCta from "../../components/home/HomeCta";
import HomeAbout from "../../components/home/HomeAbout";
import HomeDestinations from "../../components/home/HomeDestinations";
import HomeHubs from "../../components/home/HomeHubs";
import HomeFeatures from "../../components/home/HomeFeatures";
import HomeHero from "../../components/home/HomeHero";
import HomeTestimonial from "../../components/home/HomeTestimonial";
import HomeUpcomingTours from "../../components/home/HomeUpcomingTours";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeAbout />
      <HomeHubs />
      <HomeUpcomingTours />
      <HomeFeatures />
      <HomeDestinations />
      <HomeTestimonial />
      <HomeCta />
    </>
  );
}
