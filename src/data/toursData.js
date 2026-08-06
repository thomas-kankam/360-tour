import { images } from "../config/images";

export const FILTER_CATEGORIES = [
  { id: "all",         label: "All tours",    icon: "🌍" },
  { id: "ghana",       label: "Ghana",        icon: "🇬🇭" },
  { id: "kenya",       label: "Kenya",        icon: "🇰🇪" },
  { id: "southafrica", label: "South Africa", icon: "🇿🇦" },
  { id: "safari",      label: "Safari",       icon: "🦁" },
  { id: "heritage",    label: "Heritage",     icon: "🏛️" },
  { id: "adventure",   label: "Adventure",    icon: "🏔️" },
  { id: "cultural",    label: "Cultural",     icon: "🎭" },
  { id: "beach",       label: "Beach",        icon: "🌊" },
  { id: "group",       label: "Groups",       icon: "👥" },
];

export const COUNTRY_FILTER_IDS = ["ghana", "kenya", "southafrica"];

/** Countries with published tour listings — expand as hubs go live */
export const LIVE_TOUR_COUNTRIES = ["Ghana"];

export const COUNTRY_FILTER_META = {
  kenya: {
    name: "Kenya",
    icon: "🇰🇪",
    tagline: "Safari & savanna experiences are on the way",
    description:
      "We're building curated Kenya itineraries with Maasai Mara wildlife, cultural encounters, and breathtaking landscapes. In the meantime, explore our live Ghana programs.",
  },
  southafrica: {
    name: "South Africa",
    icon: "🇿🇦",
    tagline: "Vibrant city & coastal tours coming soon",
    description:
      "Cape Town, Johannesburg, and beyond — our South Africa hub is in development. Browse available Ghana heritage and cultural tours while we prepare this region.",
  },
};

export function isCountryFilter(id) {
  return COUNTRY_FILTER_IDS.includes(id);
}

export function isLiveCountryFilter(id) {
  return id === "ghana";
}

// Rotate between the two available local variants per country
const gh1 = images.home.destinations.ghana;
const gh2 = images.home.ghana;
const ke1 = images.home.destinations.kenya;
const ke2 = images.home.kenya;
const sa1 = images.home.destinations.southAfrica;
const sa2 = images.home.southAfrica;
const hero = images.home.hero;
const tst  = images.home.testimonial;

export const allTours = [
  // ── Ghana ──────────────────────────────────────────────────────────
  {
    slug: "ghana-heritage-classic",
    name: "Ghana Heritage Tour",
    location: "Accra · Cape Coast · Kumasi",
    country: "Ghana",
    categories: ["ghana", "heritage", "cultural"],
    duration: "10 days",
    groupSize: "12–20 pax",
    nextDate: "Jun 14, 2025",
    priceLabel: "From $1,850",
    priceNum: 1850,
    rating: 5.0,
    reviews: 38,
    image: gh1,
    badge: "Most popular",
    badgeColor: "bg-brand-accent text-brand-primary",
    spotsLeft: 4,
    featured: true,
  },
  {
    slug: "ghana-cultural-immersion",
    name: "Ghana Cultural Immersion",
    location: "Cape Coast · Elmina · Kakum",
    country: "Ghana",
    categories: ["ghana", "heritage", "cultural"],
    duration: "8 days",
    groupSize: "10–18 pax",
    nextDate: "Sep 10, 2025",
    priceLabel: "From $1,650",
    priceNum: 1650,
    rating: 4.9,
    reviews: 22,
    image: gh2,
    badge: null,
    spotsLeft: 7,
  },
  {
    slug: "accra-cultural-weekend",
    name: "Accra Arts & Culture",
    location: "Accra · Labadi · Arts Centre",
    country: "Ghana",
    categories: ["ghana", "cultural", "group"],
    duration: "4 days",
    groupSize: "8–24 pax",
    nextDate: "Jul 20, 2025",
    priceLabel: "From $850",
    priceNum: 850,
    rating: 4.8,
    reviews: 15,
    image: hero,
    badge: "Short break",
    badgeColor: "bg-brand-accent text-brand-primary",
    spotsLeft: 10,
  },
  {
    slug: "kumasi-ashanti-heritage",
    name: "Kumasi & Ashanti Heritage",
    location: "Kumasi · Manhyia Palace · Kente Village",
    country: "Ghana",
    categories: ["ghana", "heritage", "cultural"],
    duration: "5 days",
    groupSize: "10–16 pax",
    nextDate: "Aug 8, 2025",
    priceLabel: "From $1,050",
    priceNum: 1050,
    rating: 4.9,
    reviews: 19,
    image: gh1,
    badge: null,
    spotsLeft: 6,
  },
  {
    slug: "volta-region-adventure",
    name: "Volta Region Adventure",
    location: "Ho · Wli Falls · Tafi Atome",
    country: "Ghana",
    categories: ["ghana", "adventure", "cultural"],
    duration: "6 days",
    groupSize: "8–14 pax",
    nextDate: "Oct 5, 2025",
    priceLabel: "From $1,200",
    priceNum: 1200,
    rating: 4.8,
    reviews: 11,
    image: gh2,
    badge: null,
    spotsLeft: 8,
  },
  {
    slug: "ghana-year-end-heritage",
    name: "Ghana Year-End Heritage",
    location: "Accra · Cape Coast · Kumasi",
    country: "Ghana",
    categories: ["ghana", "heritage", "group"],
    duration: "10 days",
    groupSize: "12–20 pax",
    nextDate: "Dec 5, 2025",
    priceLabel: "From $1,850",
    priceNum: 1850,
    rating: 5.0,
    reviews: 8,
    image: tst,
    badge: "Festive season",
    badgeColor: "bg-brand-green text-white",
    spotsLeft: 6,
  },

  // ── Kenya ───────────────────────────────────────────────────────────
  {
    slug: "kenya-safari-culture",
    name: "Kenya Safari & Culture",
    location: "Nairobi · Maasai Mara · Amboseli",
    country: "Kenya",
    categories: ["kenya", "safari", "adventure"],
    duration: "9 days",
    groupSize: "8–16 pax",
    nextDate: "Jul 3, 2025",
    priceLabel: "From $2,200",
    priceNum: 2200,
    rating: 4.9,
    reviews: 46,
    image: ke1,
    badge: "Best seller",
    badgeColor: "bg-brand-accent text-brand-primary",
    spotsLeft: 2,
    featured: true,
  },
  {
    slug: "maasai-mara-experience",
    name: "Maasai Mara Experience",
    location: "Nairobi · Maasai Mara",
    country: "Kenya",
    categories: ["kenya", "safari", "cultural"],
    duration: "7 days",
    groupSize: "6–12 pax",
    nextDate: "Aug 5, 2025",
    priceLabel: "From $1,950",
    priceNum: 1950,
    rating: 5.0,
    reviews: 31,
    image: ke2,
    badge: null,
    spotsLeft: 5,
  },
  {
    slug: "kenya-maasai-village",
    name: "Maasai Village & Wilderness",
    location: "Amboseli · Maasai Village",
    country: "Kenya",
    categories: ["kenya", "cultural", "safari"],
    duration: "6 days",
    groupSize: "8–14 pax",
    nextDate: "Sep 22, 2025",
    priceLabel: "From $1,750",
    priceNum: 1750,
    rating: 4.8,
    reviews: 18,
    image: ke1,
    badge: null,
    spotsLeft: 4,
  },
  {
    slug: "kenya-diani-beach",
    name: "Kenya Coast & Diani Beach",
    location: "Mombasa · Diani Beach",
    country: "Kenya",
    categories: ["kenya", "beach", "adventure"],
    duration: "5 days",
    groupSize: "6–16 pax",
    nextDate: "Aug 18, 2025",
    priceLabel: "From $1,400",
    priceNum: 1400,
    rating: 4.9,
    reviews: 24,
    image: ke2,
    badge: "New route",
    badgeColor: "bg-brand-accent text-brand-primary",
    spotsLeft: 9,
  },
  {
    slug: "lake-victoria-cultural",
    name: "Lake Victoria Cultural Tour",
    location: "Kisumu · Rusinga Island",
    country: "Kenya",
    categories: ["kenya", "cultural", "adventure"],
    duration: "4 days",
    groupSize: "8–18 pax",
    nextDate: "Nov 1, 2025",
    priceLabel: "From $990",
    priceNum: 990,
    rating: 4.7,
    reviews: 9,
    image: hero,
    badge: null,
    spotsLeft: 11,
  },
  {
    slug: "kenya-autumn-safari",
    name: "Kenya Autumn Safari",
    location: "Nairobi · Maasai Mara · Nakuru",
    country: "Kenya",
    categories: ["kenya", "safari", "group"],
    duration: "9 days",
    groupSize: "10–20 pax",
    nextDate: "Sep 22, 2025",
    priceLabel: "From $2,200",
    priceNum: 2200,
    rating: 4.9,
    reviews: 13,
    image: ke1,
    badge: null,
    spotsLeft: 4,
  },

  // ── South Africa ────────────────────────────────────────────────────
  {
    slug: "south-africa-discovery",
    name: "South Africa Discovery",
    location: "Cape Town · Johannesburg",
    country: "South Africa",
    categories: ["southafrica", "cultural", "heritage"],
    duration: "8 days",
    groupSize: "10–18 pax",
    nextDate: "Oct 18, 2025",
    priceLabel: "From $1,950",
    priceNum: 1950,
    rating: 4.9,
    reviews: 29,
    image: sa1,
    badge: "Fan favourite",
    badgeColor: "bg-brand-green text-white",
    spotsLeft: 6,
    featured: true,
  },
  {
    slug: "cape-town-johannesburg",
    name: "Cape Town & Johannesburg",
    location: "Cape Town · Soweto · Joburg",
    country: "South Africa",
    categories: ["southafrica", "cultural", "heritage"],
    duration: "8 days",
    groupSize: "10–18 pax",
    nextDate: "Nov 12, 2025",
    priceLabel: "From $1,950",
    priceNum: 1950,
    rating: 4.9,
    reviews: 17,
    image: sa2,
    badge: null,
    spotsLeft: 9,
  },
  {
    slug: "kruger-safari-sa",
    name: "Kruger Park Safari",
    location: "Johannesburg · Kruger · Panorama",
    country: "South Africa",
    categories: ["southafrica", "safari", "adventure"],
    duration: "7 days",
    groupSize: "6–12 pax",
    nextDate: "Oct 2, 2025",
    priceLabel: "From $2,100",
    priceNum: 2100,
    rating: 5.0,
    reviews: 21,
    image: sa1,
    badge: "Big Five",
    badgeColor: "bg-brand-accent text-brand-primary",
    spotsLeft: 4,
  },
  {
    slug: "cape-winelands",
    name: "Cape Winelands & Heritage",
    location: "Stellenbosch · Franschhoek · Cape",
    country: "South Africa",
    categories: ["southafrica", "cultural", "heritage"],
    duration: "5 days",
    groupSize: "8–14 pax",
    nextDate: "Nov 5, 2025",
    priceLabel: "From $1,450",
    priceNum: 1450,
    rating: 4.8,
    reviews: 14,
    image: tst,
    badge: null,
    spotsLeft: 7,
  },
  {
    slug: "soweto-township-tour",
    name: "Soweto & Heritage Walks",
    location: "Johannesburg · Soweto · Apartheid Museum",
    country: "South Africa",
    categories: ["southafrica", "heritage", "cultural", "group"],
    duration: "4 days",
    groupSize: "10–24 pax",
    nextDate: "Sep 15, 2025",
    priceLabel: "From $950",
    priceNum: 950,
    rating: 4.9,
    reviews: 26,
    image: sa2,
    badge: "Historical",
    badgeColor: "bg-brand-accent text-brand-primary",
    spotsLeft: 12,
  },
  {
    slug: "cape-point-adventure",
    name: "Cape Point & Garden Route",
    location: "Cape Town · Knysna · Cape Point",
    country: "South Africa",
    categories: ["southafrica", "adventure", "beach"],
    duration: "6 days",
    groupSize: "8–16 pax",
    nextDate: "Dec 10, 2025",
    priceLabel: "From $1,700",
    priceNum: 1700,
    rating: 4.8,
    reviews: 12,
    image: sa1,
    badge: null,
    spotsLeft: 8,
  },
];

export const liveTours = allTours.filter((tour) => LIVE_TOUR_COUNTRIES.includes(tour.country));

const COUNTRY_GALLERY = {
  Ghana: [gh1, gh2, hero, tst],
  Kenya: [ke1, ke2, hero, ke1],
  "South Africa": [sa1, sa2, hero, sa1],
};

const INCLUDED_DEFAULT = [
  "Airport transfers — Pickup on arrival and drop-off on departure",
  "Accommodation — 3–4 star hotels and lodges for the full trip",
  "Meals — Daily breakfast and selected meals on activity days",
  "Local guide — Licensed guide with you throughout the journey",
  "Activities & entry fees — Scheduled tours and site visits included",
  "On-trip support — 24/7 help from our team while you travel",
];

const NOT_INCLUDED_DEFAULT = [
  "Flights — International airfare to and from your destination",
  "Travel insurance — Not included but strongly recommended",
  "Personal spending — Souvenirs, tips, and extras you choose",
  "Optional extras — Activities outside the planned itinerary",
  "Visa fees — Where required for your nationality",
];

function parseDays(duration) {
  const match = String(duration).match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 7;
}

function primaryTheme(categories = []) {
  if (categories.includes("safari")) return "safari";
  if (categories.includes("heritage")) return "heritage";
  if (categories.includes("beach")) return "beach";
  if (categories.includes("adventure")) return "adventure";
  if (categories.includes("cultural")) return "cultural";
  return "cultural";
}

function buildItinerary(tour) {
  const days = parseDays(tour.duration);
  const theme = primaryTheme(tour.categories);
  const city = tour.location.split("·")[0]?.trim() || tour.country;

  const dayPlans = {
    safari: [
      "Arrival & welcome briefing",
      "Morning game drive & bush breakfast",
      "Full-day safari with picnic lunch",
      "Community visit & cultural evening",
      "Sunrise drive & wildlife tracking",
      "Leisure morning & departure transfer",
    ],
    heritage: [
      "Arrival & orientation walk",
      "Historic sites & guided museum tour",
      "Community immersion & local crafts",
      "Coastal heritage & cultural performance",
      "Market day & artisan workshops",
      "Reflection session & departure",
    ],
    beach: [
      "Arrival & beach welcome",
      "Coastal exploration & water activities",
      "Old town heritage walk",
      "Free beach day & optional excursions",
      "Sunset cruise & farewell dinner",
      "Departure transfer",
    ],
    adventure: [
      "Arrival & gear briefing",
      "Guided trek & scenic viewpoints",
      "Adventure activity day",
      "Nature reserve exploration",
      "Optional challenge day",
      "Recovery morning & departure",
    ],
    cultural: [
      "Arrival & neighbourhood orientation",
      "Living culture workshops",
      "Local family visit & shared meal",
      "Arts district & market immersion",
      "Traditional ceremony experience",
      "Farewell & departure",
    ],
  };

  const plans = dayPlans[theme] ?? dayPlans.cultural;

  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    title: i === 0 ? `Welcome to ${city}` : i === days - 1 ? "Departure day" : plans[Math.min(i, plans.length - 1)],
    description:
      i === 0
        ? `Meet your AfriQuest guide, settle in, and receive a full trip briefing over a welcome dinner.`
        : i === days - 1
          ? `Final breakfast, checkout, and transfer to the airport. Safe travels!`
          : `Explore ${tour.country} with curated activities, local guides, and authentic encounters.`,
  }));
}

function buildDescription(tour) {
  const theme = primaryTheme(tour.categories);
  const intros = {
    safari: `Experience the raw beauty of ${tour.country}'s wilderness on this expertly guided safari. From dawn game drives to evenings under African skies, every moment is designed for wonder and connection.`,
    heritage: `Walk through centuries of history on this deeply moving heritage journey across ${tour.location}. Led by knowledgeable local guides, you'll encounter stories that textbooks cannot tell.`,
    beach: `Combine sun, sea, and culture on this coastal escape through ${tour.country}. Relax on pristine beaches by day and discover vibrant local communities by evening.`,
    adventure: `Push beyond the ordinary on this adventure through ${tour.location}. Trekking, exploration, and natural wonders await — always with safety and expert guidance at the core.`,
    cultural: `Immerse yourself in the living culture of ${tour.country}. This is not sightseeing — it's participation: markets, artisans, ceremonies, and meals shared with local hosts.`,
  };
  return intros[theme] ?? intros.cultural;
}

function buildHighlights(tour) {
  const theme = primaryTheme(tour.categories);
  const map = {
    safari: ["Expert naturalist guides", "Big Five game drives", "Bush breakfast experience", "Conservation-focused travel"],
    heritage: ["UNESCO heritage sites", "Local historian guides", "Community storytelling", "Authentic cultural exchange"],
    beach: ["Pristine coastal stays", "Water activities included", "Heritage old town visits", "Sunset experiences"],
    adventure: ["Certified adventure guides", "Scenic trekking routes", "Small group sizes", "Flexible difficulty levels"],
    cultural: ["Hands-on workshops", "Local host family visits", "Traditional performances", "Market & cuisine tours"],
  };
  return map[theme] ?? map.cultural;
}

function buildDepartureDates(tour) {
  const base = tour.nextDate;
  const extras = [
    { date: base, spots: tour.spotsLeft, label: "Next departure" },
    { date: "Aug 12, 2025", spots: Math.max(2, tour.spotsLeft - 1), label: "Available" },
    { date: "Oct 3, 2025", spots: Math.max(3, tour.spotsLeft + 2), label: "Available" },
  ];
  return extras;
}

export function getTourBySlug(slug) {
  const tour = allTours.find((t) => t.slug === slug);
  if (!tour) return null;

  return {
    ...tour,
    description: buildDescription(tour),
    highlights: buildHighlights(tour),
    itinerary: buildItinerary(tour),
    included: INCLUDED_DEFAULT,
    notIncluded: NOT_INCLUDED_DEFAULT,
    gallery: COUNTRY_GALLERY[tour.country] ?? [tour.image, hero, tst],
    departureDates: buildDepartureDates(tour),
    depositPercent: 30,
    payLaterHoldHours: 72,
  };
}

export function getRelatedTours(slug, limit = 3) {
  const current = allTours.find((t) => t.slug === slug);
  if (!current) return allTours.slice(0, limit);
  return allTours
    .filter((t) => t.slug !== slug && (t.country === current.country || t.categories.some((c) => current.categories.includes(c))))
    .slice(0, limit);
}
