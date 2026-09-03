import { images } from "../config/images";
import { ROUTES } from "../constants/routes";
import { buildWebsiteUrl } from "../config/env";

/**
 * Ghana-first experience pillars — SEO landing content that deep-links
 * into live tours and travel stories for topical authority.
 */
export const experiencesPageSeo = {
  title: "Ghana Travel Experiences | Heritage, Adventure & Group Tours | 360 Tours Ghana",
  description:
    "Explore Ghana travel experiences with 360 Tours — Accra city tours, Cape Coast heritage, Volta waterfalls, Kakum canopy walks, cultural immersion, beach getaways, university programs, and custom group itineraries.",
  keywords: [
    "Ghana travel experiences",
    "Ghana heritage tours",
    "Cape Coast Castle tours",
    "Accra city tour",
    "Volta Region tours",
    "Kakum National Park",
    "Ghana adventure travel",
    "university study abroad Ghana",
    "group tours Ghana",
    "cultural immersion Ghana",
    "360 Tours Ghana experiences",
    "tours in Ghana",
  ].join(", "),
};

export const EXPERIENCES = [
  {
    id: "heritage",
    slug: "ghana-heritage-history",
    label: "Heritage & History",
    iconKey: "landmark",
    tagline: "Walk Ghana’s corridors of memory",
    description:
      "Cape Coast Castle, Elmina Castle, and living Ashanti heritage in Kumasi — journeys that deepen understanding of Ghana’s past and present, guided by local experts.",
    highlights: ["Cape Coast Castle", "Elmina Castle", "Manhyia Palace, Kumasi", "Ancestral & naming ceremonies"],
    regions: ["Central Region", "Ashanti Region", "Greater Accra"],
    keywords: ["Cape Coast tours", "Elmina Castle", "Ghana heritage tour", "Kumasi cultural tour"],
    image: images.home.destinations?.ghana || images.home.ghana,
    badgeText: "Most searched",
    tourQuery: {},
    storyCategory: "Heritage",
    relatedStorySlugs: ["cultural-immersion-newsletter-issue-01"],
  },
  {
    id: "accra",
    slug: "accra-city-culture",
    label: "Accra City & Culture",
    iconKey: "building",
    tagline: "Feel the pulse of Ghana’s capital",
    description:
      "Independence Square, arts markets, nightlife, and creative Accra — ideal as a first day or a full city immersion before coastal and inland adventures.",
    highlights: ["City landmarks", "Arts & crafts markets", "Food & nightlife", "Creative neighborhoods"],
    regions: ["Greater Accra"],
    keywords: ["Accra city tour", "things to do in Accra", "Accra cultural tour"],
    image: images.tour_sites?.arts_and_craft || images.home.hero_one,
    badgeText: "City starter",
    tourQuery: {},
    storyCategory: "Culture",
    relatedStorySlugs: [],
  },
  {
    id: "adventure",
    slug: "volta-adventure-nature",
    label: "Adventure & Nature",
    iconKey: "mountain",
    tagline: "Waterfalls, canopy walks, and open trails",
    description:
      "Wli Falls, Boti Falls, Kakum canopy walk, Shai Hills, and Volta Region treks — active Ghana travel with scenery and local guides who know the routes.",
    highlights: ["Wli Waterfalls", "Kakum Canopy Walk", "Shai Hills", "Volta Region hiking"],
    regions: ["Volta Region", "Eastern Region", "Central Region"],
    keywords: ["Volta Region tours", "Kakum National Park", "Wli Falls tour", "Ghana adventure travel"],
    image: images.tour_sites?.volta || images.home.hero_one,
    badgeText: "Active travel",
    tourQuery: {},
    storyCategory: "Adventure",
    relatedStorySlugs: [],
  },
  {
    id: "coast",
    slug: "ghana-coast-beach",
    label: "Coast & Beach",
    iconKey: "waves",
    tagline: "Atlantic shores with culture nearby",
    description:
      "Ada Foah estuary, Labadi Beach, and Western Region coastlines — pair beach time with fishing villages, stilt communities, and sunset boat rides.",
    highlights: ["Ada Foah", "Labadi Beach", "Nzulezu Stilt Village", "Coastal day trips"],
    regions: ["Greater Accra", "Western Region"],
    keywords: ["Ada Foah tours", "Ghana beach holiday", "Nzulezu stilt village"],
    image: images.home.hero_two,
    badgeText: "Relaxation",
    tourQuery: {},
    storyCategory: "Culture",
    relatedStorySlugs: [],
  },
  {
    id: "cultural",
    slug: "cultural-immersion-ghana",
    label: "Cultural Immersion",
    iconKey: "drama",
    tagline: "Live it — don’t just observe",
    description:
      "Kente weaving in Bonwire, drumming workshops, market walks, and community visits. Participatory experiences designed for travelers who want authentic connection.",
    highlights: ["Kente weaving, Bonwire", "Drumming sessions", "Market immersion", "Community visits"],
    regions: ["Ashanti Region", "Greater Accra", "Volta Region"],
    keywords: ["cultural immersion Ghana", "kente weaving tour", "Ghana drumming experience"],
    image: images.home.ghana,
    badgeText: "Hands-on",
    tourQuery: {},
    storyCategory: "Culture",
    relatedStorySlugs: ["cultural-immersion-newsletter-issue-01"],
  },
  {
    id: "university",
    slug: "university-educational-tours-ghana",
    label: "University & Educational Tours",
    iconKey: "graduation",
    tagline: "Study Ghana, not just visit it",
    description:
      "Curriculum-aligned itineraries for universities and schools — heritage sites, guest lectures, safe group logistics, and faculty co-design with 360 Tours.",
    highlights: ["Curriculum-aligned routes", "Faculty co-design", "Guest lectures", "Group logistics"],
    regions: ["Nationwide"],
    keywords: ["university study abroad Ghana", "educational tours Ghana", "school trip Ghana"],
    image: images.home.destinations?.southAfrica || images.home.hero_three,
    badgeText: "Groups",
    tourQuery: {},
    storyCategory: "Corporate",
    relatedStorySlugs: [],
  },
  {
    id: "corporate",
    slug: "corporate-retreats-ghana",
    label: "Corporate & Team Retreats",
    iconKey: "briefcase",
    tagline: "Team building with Ghanaian soul",
    description:
      "Leadership workshops, community impact days, and scenic retreat bases — end-to-end coordination for corporate groups visiting Ghana.",
    highlights: ["Team leadership modules", "Impact days", "Flexible group sizing", "Full logistics"],
    regions: ["Nationwide"],
    keywords: ["corporate retreat Ghana", "team building Accra", "company offsite Ghana"],
    image: images.home.hero_four,
    badgeText: "Business",
    tourQuery: {},
    storyCategory: "Corporate",
    relatedStorySlugs: [],
  },
  {
    id: "custom",
    slug: "custom-ghana-itinerary",
    label: "Custom Ghana Itineraries",
    iconKey: "route",
    tagline: "Built around your dates and interests",
    description:
      "Private families, diaspora homecomings, multi-stop Ghana circuits — tell us your dates and we design tours, stays, and transport as one plan.",
    highlights: ["Private & family trips", "Diaspora homecoming", "Multi-region circuits", "Stays & transport included"],
    regions: ["Nationwide"],
    keywords: ["custom Ghana itinerary", "private Ghana tour", "diaspora travel Ghana"],
    image: images.home.hero,
    badgeText: "Tailor-made",
    tourQuery: {},
    storyCategory: "Newsletter",
    relatedStorySlugs: [],
  },
];

export function buildExperienceToursPath() {
  return ROUTES.tours;
}

export function buildExperiencesItemListJsonLd(items = EXPERIENCES) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ghana Travel Experiences by 360 Tours Ghana",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      url: buildWebsiteUrl(`/experiences#${item.id}`),
      description: item.description,
    })),
  };
}

export function buildExperiencesFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What kinds of Ghana travel experiences does 360 Tours offer?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Heritage castles, Accra city culture, Volta and Kakum nature adventures, beach getaways, cultural immersion, university programs, corporate retreats, and fully custom Ghana itineraries.",
        },
      },
      {
        "@type": "Question",
        name: "Can I book a custom group or university trip to Ghana?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. 360 Tours designs curriculum-aligned educational tours and private or corporate group itineraries with stays and transport arranged end to end.",
        },
      },
      {
        "@type": "Question",
        name: "Where can I read real Ghana travel stories?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Visit the 360 Tours Stories page for heritage reflections, cultural guides, and trip tips that pair with our experiences and tour packages.",
        },
      },
    ],
  };
}
