import { images } from "../config/images";
import { ROUTES } from "../constants/routes";

export const heroContent = {
  badge: "360 Tours and Investment Limited",
  title: "Discover Africa.",
  titleHighlight: "Travel Without Limits.",
  subtitle:
    "Your trusted partner for tours, accommodation, and transportation across Ghana and beyond. We create exciting, safe, and memorable journeys — making every leisure, business, cultural, or adventure trip seamless from start to finish.",
  tagline: "Explore More. Travel Better. Experience Africa with 360 Tours.",
  primaryCta: { label: "Explore our tours", to: ROUTES.tours },
  secondaryCta: { label: "Plan your trip", to: ROUTES.contact },
};

export const stats = [
  { value: "15+", label: "Popular destinations" },
  { value: "360", label: "Travel services" },
  { value: "100%", label: "Personalized planning" },
  { value: "24/7", label: "Customer support" },
];

export const toursPageSection = {
  eyebrow: "Our tours",
  title: "Explore Ghana with 360 Tours",
  subtitle:
    "Heritage tours, adventure trails, beach getaways, and custom itineraries — guided by local experts with transport and stays arranged for you.",
  highlights: ["Guided experiences", "Flexible departures", "Custom planning"],
  customCta: {
    title: "Need something tailored?",
    subtitle: "Tell us your dates, group size, and interests — we'll build a bespoke Ghana itinerary.",
    label: "Request a custom quote",
    to: ROUTES.contact,
  },
};

export const featuredTours = [
  {
    slug: "ghana-heritage-2025",
    name: "Ghana Heritage Tour",
    country: "Ghana",
    duration: "10 days",
    description:
      "Accra, Cape Coast Castle, Kumasi, and living culture — a deep dive into West Africa's history and hospitality.",
    priceLabel: "From $1,850",
    rating: "5.0",
    image: images.home.ghana,
  },
  {
    slug: "kenya-safari-culture-2025",
    name: "Kenya Safari & Culture",
    country: "Kenya",
    duration: "9 days",
    description:
      "Maasai Mara wildlife, cultural encounters, and landscapes that define the soul of East Africa.",
    priceLabel: "From $2,200",
    rating: "4.9",
    image: images.home.kenya,
  },
  {
    slug: "south-africa-discovery-2025",
    name: "South Africa Discovery",
    country: "South Africa",
    duration: "8 days",
    description:
      "Cape Town, Johannesburg, and curated experiences across one of Africa's most dynamic regions.",
    priceLabel: "From $1,950",
    rating: "4.9",
    image: images.home.southAfrica,
  },
];

export const upcomingTours = [
  {
    slug: "ghana-heritage-classic",
    name: "Ghana Heritage Tour",
    country: "Ghana",
    departDate: "June 14, 2025",
    departDay: "14",
    departMonth: "Jun",
    duration: "10 days",
    priceLabel: "From $1,850",
    spotsLeft: 4,
    totalSpots: 18,
    image: images.home.destinations.ghana,
  },
  {
    slug: "ghana-cultural-immersion",
    name: "Ghana Cultural Immersion",
    country: "Ghana",
    departDate: "September 10, 2025",
    departDay: "10",
    departMonth: "Sep",
    duration: "10 days",
    priceLabel: "From $1,850",
    spotsLeft: 7,
    totalSpots: 18,
    image: images.home.ghana,
  },
  {
    slug: "kenya-safari-culture",
    name: "Kenya Safari & Culture",
    country: "Kenya",
    departDate: "July 3, 2025",
    departDay: "03",
    departMonth: "Jul",
    duration: "9 days",
    priceLabel: "From $2,200",
    spotsLeft: 2,
    totalSpots: 14,
    image: images.home.destinations.kenya,
  },
  {
    slug: "maasai-mara-experience",
    name: "Kenya Maasai Mara Experience",
    country: "Kenya",
    departDate: "August 5, 2025",
    departDay: "05",
    departMonth: "Aug",
    duration: "9 days",
    priceLabel: "From $2,200",
    spotsLeft: 5,
    totalSpots: 14,
    image: images.home.kenya,
  },
  {
    slug: "ghana-year-end-heritage",
    name: "Ghana Year-End Heritage",
    country: "Ghana",
    departDate: "December 5, 2025",
    departDay: "05",
    departMonth: "Dec",
    duration: "10 days",
    priceLabel: "From $1,850",
    spotsLeft: 6,
    totalSpots: 18,
    image: images.home.ghana,
  },
  {
    slug: "kenya-autumn-safari",
    name: "Kenya Autumn Safari",
    country: "Kenya",
    departDate: "September 22, 2025",
    departDay: "22",
    departMonth: "Sep",
    duration: "9 days",
    priceLabel: "From $2,200",
    spotsLeft: 4,
    totalSpots: 14,
    image: images.home.kenya,
  },
  {
    slug: "south-africa-discovery",
    name: "South Africa Discovery",
    country: "South Africa",
    departDate: "October 18, 2025",
    departDay: "18",
    departMonth: "Oct",
    duration: "8 days",
    priceLabel: "From $1,950",
    spotsLeft: 6,
    totalSpots: 15,
    image: images.home.destinations.southAfrica,
  },
  {
    slug: "cape-town-johannesburg",
    name: "Cape Town & Johannesburg",
    country: "South Africa",
    departDate: "November 12, 2025",
    departDay: "12",
    departMonth: "Nov",
    duration: "8 days",
    priceLabel: "From $1,950",
    spotsLeft: 9,
    totalSpots: 15,
    image: images.home.southAfrica,
  },
];

export const popularDestinationsSection = {
  eyebrow: "Tour Packages",
  title: "Popular Destinations",
  subtitle: "Fifteen unforgettable stops across Ghana — from historic castles to rainforest canopy walks.",
  cta: { label: "View all tours", to: ROUTES.toursSearch({ country: "ghana" }) },
};

export const popularDestinations = [
  {
    id: "accra-city-tour",
    name: "Accra City Tour",
    region: "Greater Accra",
    imageKey: "accraCityTour",
    fallback: images.tour_sites.arts_and_craft,
  },
  {
    id: "cape-coast-castle",
    name: "Cape Coast Castle",
    region: "Central Region",
    imageKey: "capeCoastCastle",
    fallback: images.home.ghana,
  },
  {
    id: "elmina-castle",
    name: "Elmina Castle",
    region: "Central Region",
    imageKey: "elminaCastle",
    fallback: images.home.hero_three,
  },
  {
    id: "kakum-national-park",
    name: "Kakum National Park",
    region: "Central Region",
    imageKey: "kakumNationalPark",
    fallback: images.home.destinations.ghana,
  },
  {
    id: "akosombo-boat-cruise",
    name: "Akosombo Boat Cruise",
    region: "Eastern Region",
    imageKey: "akosomboBoatCruise",
    fallback: images.tour_sites.waterfall,
  },
  {
    id: "aburi-botanical-gardens",
    name: "Aburi Botanical Gardens",
    region: "Eastern Region",
    imageKey: "aburiBotanicalGardens",
    fallback: images.home.hero_one,
  },
  {
    id: "wli-waterfalls",
    name: "Wli Waterfalls",
    region: "Volta Region",
    imageKey: "wliWaterfalls",
    fallback: images.tour_sites.volta,
  },
  {
    id: "boti-falls",
    name: "Boti Falls",
    region: "Eastern Region",
    imageKey: "botiFalls",
    fallback: images.tour_sites.waterfall,
  },
  {
    id: "shai-hills",
    name: "Shai Hills Resource Reserve",
    region: "Greater Accra",
    imageKey: "shaiHills",
    fallback: images.home.hero_four,
  },
  {
    id: "ada-foah",
    name: "Ada Foah",
    region: "Greater Accra",
    imageKey: "adaFoah",
    fallback: images.home.hero_two,
  },
  {
    id: "nzulezu-stilt-village",
    name: "Nzulezu Stilt Village",
    region: "Western Region",
    imageKey: "nzulezuStiltVillage",
    fallback: images.home.destinations.ghana,
  },
  {
    id: "mole-national-park",
    name: "Mole National Park",
    region: "Northern Region",
    imageKey: "moleNationalPark",
    fallback: images.home.destinations.ghana,
  },
  {
    id: "kumasi-cultural-tour",
    name: "Kumasi Cultural Tour",
    region: "Ashanti Region",
    imageKey: "kumasiCulturalTour",
    fallback: images.tour_sites.manhyia_palace,
  },
  {
    id: "volta-region-adventure",
    name: "Volta Region Adventure",
    region: "Volta Region",
    imageKey: "voltaRegionAdventure",
    fallback: images.tour_sites.volta,
  },
  {
    id: "tafi-atome-monkey-sanctuary",
    name: "Tafi Atome Monkey Sanctuary",
    region: "Volta Region",
    imageKey: "tafiAtomeMonkeySanctuary",
    fallback: images.home.hero,
  },
];

/** @deprecated Use popularDestinations */
export const topDestinations = [
  {
    slug: "ghana-heritage-2025",
    name: "Ghana",
    region: "Heritage Coast",
    tagline: "Cape Coast Castles, Kumasi & living culture",
    tours: "12 tours",
    image: images.home.ghana,
  },
  {
    slug: "kenya-safari-culture-2025",
    name: "Kenya",
    region: "Safari & Savanna",
    tagline: "Maasai Mara, wildlife & cultural encounters",
    tours: "9 tours",
    image: images.home.kenya,
  },
  {
    slug: "south-africa-discovery-2025",
    name: "South Africa",
    region: "Vibrant Cities",
    tagline: "Cape Town, Johannesburg & dynamic regions",
    tours: "8 tours",
    image: images.home.southAfrica,
  },
];

export const operatingHubs = [
  {
    name: "Ghana",
    filterId: "ghana",
    region: "West Africa",
    tagline: "Heritage Coast",
    desc: "Cape Coast Castles, Kumasi royal heritage, and the living culture of West Africa.",
    image: images.home.ghana,
    badge: "bg-brand-gold/20 text-brand-gold",
  },
  {
    name: "Kenya",
    filterId: "kenya",
    region: "East Africa",
    tagline: "Safari & Savanna",
    desc: "Maasai Mara wildlife, cultural encounters, and breathtaking landscapes across East Africa.",
    image: images.home.kenya,
    badge: "bg-brand-orange/15 text-brand-orange",
  },
  {
    name: "South Africa",
    filterId: "southafrica",
    region: "Southern Africa",
    tagline: "Vibrant Cities",
    desc: "Table Mountain, Johannesburg townships, and Cape Town's vibrant urban culture.",
    image: images.home.southAfrica,
    badge: "bg-brand-green/15 text-brand-green",
  },
];

export const operatingSection = {
  eyebrow: "Where We Operate",
  title: "Discover Ghana, Region by Region",
  subtitle:
    "From Accra's vibrant streets to Cape Coast's historic castles, Volta's waterfalls, and beyond — we bring every corner of Ghana to life.",
  cta: { label: "View all Ghana tours", to: ROUTES.toursSearch({ country: "ghana" }) },
};

export const ghanaRegions = [
  {
    id: "accra",
    name: "Accra",
    region: "Greater Accra",
    tagline: "Capital culture & city life",
    desc: "Explore Independence Square, W.E.B. Du Bois Centre, bustling markets, and the creative energy of Ghana's capital.",
    highlights: ["City tours", "Arts & crafts", "Nightlife"],
    image: images.tour_sites.arts_and_craft,
    packageId: "accra",
  },
  {
    id: "cape-coast",
    name: "Cape Coast",
    region: "Central Region",
    tagline: "Heritage & history",
    desc: "Walk through Cape Coast Castle, Elmina Castle, and UNESCO World Heritage sites that tell Ghana's powerful story.",
    highlights: ["Slave castles", "Museums", "Coastal tours"],
    image: images.home.ghana,
    packageId: null,
  },
  {
    id: "kumasi",
    name: "Kumasi",
    region: "Ashanti Region",
    tagline: "Royal Ashanti heritage",
    desc: "Visit Manhyia Palace, kente weaving villages, and the living traditions of the Ashanti Kingdom.",
    highlights: ["Palace tours", "Kente villages", "Cultural immersion"],
    image: images.tour_sites.manhyia_palace,
    packageId: "kumasi",
  },
  {
    id: "volta",
    name: "Volta Region",
    region: "Eastern Volta",
    tagline: "Waterfalls & adventure",
    desc: "Trek to Wli Falls, explore Boti Falls, canopy walks, and the lush highlands of eastern Ghana.",
    highlights: ["Wli Falls", "Eco tours", "Hiking"],
    image: images.tour_sites.volta,
    packageId: "volta",
  },
  {
    id: "akosombo",
    name: "Akosombo",
    region: "Eastern Region",
    tagline: "River cruises & scenery",
    desc: "Enjoy scenic boat cruises on the Volta River, mountain views, and relaxing resort experiences.",
    highlights: ["Boat cruises", "Lake views", "Resort stays"],
    image: images.tour_sites.waterfall,
    packageId: null,
  },
  {
    id: "northern",
    name: "Northern Ghana",
    region: "Savanna Zone",
    tagline: "Wildlife & nature",
    desc: "Discover Mole National Park, savanna landscapes, and unforgettable wildlife adventures in northern Ghana.",
    highlights: ["Safari", "Wildlife", "Nature parks"],
    image: images.home.destinations.ghana,
    packageId: null,
  },
];

/** @deprecated Use ghanaRegions */
export const ghanaPackageHubs = [
  {
    packageId: "accra",
    name: "Accra",
    region: "Ghana",
    tagline: "Arts & city culture",
    desc: "Arts Centre, Aburi crafts markets, and the creative pulse of the capital.",
    image: images.tour_sites.arts_and_craft,
    badge: "bg-brand-gold/20 text-brand-gold",
  },
  {
    packageId: "kumasi",
    name: "Kumasi",
    region: "Ashanti Region",
    tagline: "Royal heritage",
    desc: "Manhyia Palace, kente villages, and the living culture of the Ashanti Kingdom.",
    image: images.tour_sites.manhyia_palace,
    badge: "bg-brand-orange/15 text-brand-orange",
  },
  {
    packageId: "volta",
    name: "Volta",
    region: "Eastern Ghana",
    tagline: "Mountains & waterfalls",
    desc: "Wli Falls, highland treks, and nature-forward journeys in the Volta Region.",
    image: images.tour_sites.volta,
    badge: "bg-brand-green/15 text-brand-green",
  },
  {
    packageId: "end-of-year",
    name: "End of Year",
    region: "Ghana",
    tagline: "Detty December",
    desc: "Festival season energy — concerts, Afrochella vibes, and December celebrations.",
    image: images.tour_sites.detty_december,
    badge: "bg-brand-orange/20 text-brand-orange",
  },
];

export const whyUsSection = {
  eyebrow: "Why Choose Us",
  title: "Travel With Confidence",
  titleHighlight: "360 Tours",
  subtitle:
    "We combine deep local expertise with professional service — delivering safe, authentic, and unforgettable journeys across Ghana and beyond.",
  cta: { label: "See all reasons", to: ROUTES.whyUs },
  pillars: [
    {
      title: "Local expertise",
      description:
        "Our guides know Ghana inside out — from hidden gems to historic landmarks — giving you an authentic perspective on every destination.",
      icon: "map",
    },
    {
      title: "Complete travel solutions",
      description:
        "Tours, accommodation, airport transfers, and private transport — everything coordinated under one roof for a seamless trip.",
      icon: "layers",
    },
    {
      title: "Personalized planning",
      description:
        "Every itinerary is tailored to your interests, budget, and schedule — whether solo, family, group, or corporate.",
      icon: "route",
    },
  ],
};

export const features = whyUsSection.pillars;

export const testimonials = [
  {
    id: "heritage-guest",
    quote:
      "Our trip to Ghana exceeded every expectation. The team was professional, punctual, and incredibly knowledgeable.",
    name: "Happy Traveler",
    role: "Ghana heritage tour guest",
    rating: "5.0",
    tour: "Ghana Heritage",
    initials: "HT",
    imageKey: "capeCoastCastle",
  },
  {
    id: "family-vacation",
    quote:
      "Everything was perfectly organized—from airport pickup to our cultural tours. Highly recommended!",
    name: "Satisfied Guest",
    role: "Family vacation",
    rating: "5.0",
    tour: "Custom itinerary",
    initials: "SG",
    imageKey: "accraCityTour",
  },
  {
    id: "adventure-return",
    quote:
      "The Akosombo boat cruise and Cape Coast experience were unforgettable. We'll definitely book again.",
    name: "Returning Client",
    role: "Adventure tour guest",
    rating: "5.0",
    tour: "Akosombo & Cape Coast",
    initials: "RC",
    imageKey: "akosomboBoatCruise",
  },
];

export const testimonialsSection = {
  eyebrow: "Traveler stories",
  title: "Real journeys, real memories",
  subtitle:
    "Universities, families, and groups share what it felt like to explore Ghana with 360 Tours and Investment Limited.",
  rating: "4.9",
  reviews: "120+ reviews",
};

export const homeCtaSection = {
  eyebrow: "Start your journey",
  title: "Ready to explore Ghana?",
  subtitle:
    "From heritage tours and adventure trails to transport, stays, and fully custom itineraries — 360 Tours handles every detail so you can focus on the experience.",
  imageKey: "capeCoastCastle",
  highlights: [
    { label: "Guided tours", description: "Heritage, culture & adventure", icon: "map" },
    { label: "Transport & stays", description: "Door-to-door coordination", icon: "car" },
    { label: "Custom planning", description: "Solo, family, or group trips", icon: "route" },
  ],
  destinationChips: ["Accra", "Cape Coast", "Kumasi", "Volta"],
  primaryCta: { label: "Request a quote", to: ROUTES.contact },
  secondaryCta: { label: "Browse tours", to: ROUTES.toursSearch({ country: "ghana" }) },
  whatsappMessage: "Hello 360 Tours, I would like to plan a trip to Ghana.",
};

/** @deprecated Use testimonials array */
export const testimonial = {
  quote: testimonials[0].quote,
  name: testimonials[0].name,
  role: testimonials[0].role,
  rating: testimonials[0].rating,
  reviews: "120+ reviews",
  image: images.home.testimonial,
};

export const partners = [
  "Universities",
  "Corporate retreats",
  "Cultural exchanges",
  "Community impact",
  "Group travel",
];
