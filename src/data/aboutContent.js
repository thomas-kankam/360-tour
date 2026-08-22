import { ROUTES } from "../constants/routes";
import env from "../config/env";

export const company = {
  name: "360 Tours and Investment Limited",
  shortName: "360 Tours Ghana",
  tagline: "Discover Africa. Travel Without Limits.",
  subtitle: "Your trusted travel partner for tours, accommodation & transportation",
  location: "Accra, Ghana",
  email: env.contactEmail,
  motto: "Explore. Experience. Remember.",
};

export const aboutPageHero = {
  eyebrow: "About Us",
  title: "Who We Are",
  titleLine: "Discover Africa.",
  titleHighlight: "Travel Without Limits.",
  description:
    "Welcome to 360 Tours and Investment Limited, where unforgettable travel experiences begin. We create exciting, safe, and seamless journeys across Ghana and beyond, with guided tours, comfortable stays, and reliable transport under one roof.",
  tagline: "Explore More. Travel Better. Experience Africa with 360 Tours.",
  services: [
    { label: "Guided Tours", icon: "compass" },
    { label: "Accommodation", icon: "building" },
    { label: "Transportation", icon: "car" },
  ],
};

/** Short copy for the home-page teaser only */
export const homeAboutTeaser = {
  eyebrow: "About Us",
  title: "Who We Are",
  tagline: company.tagline,
  subtitle: company.subtitle,
  summary:
    "360 Tours and Investment Limited is a registered travel and tourism company dedicated to showcasing the very best of Ghana and Africa, through authentic tours, comfortable accommodation, and reliable transportation.",
  extended:
    "From Accra to Cape Coast, Akosombo to the Volta Region, we help travelers discover Africa from a local perspective with personalized, safe, and memorable experiences.",
  highlights: [
    { label: "Guided Tours", description: "City, heritage, adventure & beach", icon: "compass" },
    { label: "Accommodation", description: "Hotels, resorts & guest houses", icon: "building" },
    { label: "Transportation", description: "Airport transfers & private hire", icon: "car" },
    { label: "Custom Planning", description: "Itineraries built around you", icon: "route" },
  ],
  whyHighlights: [
    "Professional and friendly tour guides",
    "Comfortable and reliable transportation",
    "Customized travel experiences",
    "Local expertise and authentic experiences",
  ],
  cta: { label: "Read our full story", to: ROUTES.about },
  secondaryCta: { label: "Explore tours", to: ROUTES.tours },
};

/** Full content for the dedicated About page */
export const aboutPage = {
  intro:
    "Welcome to 360 Tours and Investment Limited, your trusted travel partner for unforgettable experiences across Ghana and beyond. We specialize in creating authentic, exciting, and personalized tours that allow travelers to experience the rich history, vibrant culture, breathtaking landscapes, and warm hospitality that Africa is known for.",
  story:
    "360 Tours and Investment Limited is a registered travel and tourism company dedicated to showcasing the very best of Ghana and Africa. We are passionate about connecting travelers with unforgettable destinations, unique cultural experiences, and world-class customer service.",
  journey:
    "From the bustling streets of Accra to the historic castles of Cape Coast, the serene waters of Akosombo, the lush rainforests of Kakum, and the breathtaking waterfalls of the Volta Region, we help our guests discover Africa from a local perspective.",
  commitment:
    "Our goal is to provide personalized travel experiences that leave lasting memories while supporting sustainable tourism and local communities. Whether you're visiting for leisure, business, heritage exploration, or adventure, our experienced team is committed to making every journey safe, comfortable, and memorable.",
  mission: {
    title: "Our Mission",
    text: "To deliver exceptional travel experiences through quality service, professionalism, and authentic cultural connections while promoting sustainable tourism throughout Ghana and Africa.",
  },
  vision: {
    title: "Our Vision",
    text: "To become Africa's leading travel and tourism company by inspiring travelers to explore the continent through unforgettable experiences, outstanding service, and innovative travel solutions.",
  },
  values: [
    "Excellence",
    "Integrity",
    "Customer Satisfaction",
    "Safety",
    "Professionalism",
    "Sustainability",
    "Innovation",
    "Reliability",
  ],
  tourServices: [
    {
      label: "Guided City Tours",
      description:
        "Explore Ghana's vibrant cities with knowledgeable local guides who bring every destination to life.",
      icon: "compass",
    },
    {
      label: "Historical & Heritage Tours",
      description:
        "Visit UNESCO World Heritage Sites, slave castles, museums, memorial parks, and historical landmarks that tell the story of Ghana's rich past.",
      icon: "landmark",
    },
    {
      label: "Adventure Tours",
      description:
        "Experience nature through hiking, waterfalls, canopy walks, boat cruises, wildlife parks, mountain excursions, and eco-tourism activities.",
      icon: "mountain",
    },
    {
      label: "Beach & Island Getaways",
      description:
        "Relax on beautiful beaches, enjoy island excursions, and experience Ghana's stunning coastline.",
      icon: "waves",
    },
    {
      label: "Private Tours",
      description: "Customized itineraries designed around your schedule, interests, and travel style.",
      icon: "user",
    },
    {
      label: "Group Tours",
      description:
        "Perfect for families, friends, schools, churches, corporate organizations, and social groups.",
      icon: "users",
    },
  ],
  supportServices: [
    {
      label: "Hotel Reservations & Accommodation",
      description:
        "We arrange luxury hotels, boutique stays, beach resorts, apartments, guest houses, and budget-friendly accommodation matched to your preferences and budget.",
      icon: "building",
      details: [
        "Hotels and resorts",
        "Beachfront accommodations",
        "Luxury and budget-friendly stays",
        "Family-friendly lodging",
        "Business travel accommodations",
      ],
    },
    {
      label: "Transportation Services",
      description:
        "Travel safely and comfortably wherever your journey takes you with modern vehicles and professional drivers.",
      icon: "car",
      details: [
        "Airport pick-up and drop-off",
        "Private car hire with drivers",
        "Tour transportation",
        "Corporate transportation",
        "Group bus services",
        "Intercity transfers",
      ],
    },
    {
      label: "Airport Transfers",
      description:
        "From the moment you arrive, we provide timely and comfortable transportation between airports, hotels, and tour locations.",
      icon: "plane",
    },
    {
      label: "Customized Travel Planning",
      description:
        "Every traveler is unique. We create personalized experiences for relaxing holidays, cultural immersion, adventure, or family vacations.",
      icon: "route",
    },
  ],
  popularDestinations: [
    "Accra City Tour",
    "Cape Coast Castle",
    "Elmina Castle",
    "Kakum National Park",
    "Akosombo Boat Cruise",
    "Aburi Botanical Gardens",
    "Wli Waterfalls",
    "Boti Falls",
    "Shai Hills Resource Reserve",
    "Ada Foah",
    "Nzulezu Stilt Village",
    "Mole National Park",
    "Kumasi Cultural Tour",
    "Volta Region Adventure",
    "Tafi Atome Monkey Sanctuary",
  ],
  whyTravelWithUs: [
    "Professional and friendly tour guides",
    "Comfortable and reliable transportation",
    "Customized travel experiences",
    "Affordable and competitive pricing",
    "Safe and secure travel",
    "Flexible itineraries",
    "Exceptional customer support",
    "Local expertise and authentic experiences",
  ],
  faqs: [
    {
      question: "How do I book a tour?",
      answer:
        "You can book directly through our website, contact us via WhatsApp, email us, or call our customer service team.",
    },
    {
      question: "Do you offer private tours?",
      answer: "Yes. We customize tours for individuals, couples, families, and groups.",
    },
    {
      question: "Can you arrange airport pickup?",
      answer: "Absolutely. We provide reliable airport transfer services throughout Ghana.",
    },
    {
      question: "Are your tours suitable for families?",
      answer: "Yes. Many of our tours are family-friendly and can be tailored for travelers of all ages.",
    },
    {
      question: "Can you customize an itinerary?",
      answer: "Yes. We create personalized travel plans based on your interests, budget, and schedule.",
    },
    {
      question: "Do you organize corporate trips?",
      answer:
        "Yes. We organize conferences, retreats, team-building activities, educational tours, and corporate travel services.",
    },
    {
      question: "Do you offer visa on arrival assistance?",
      answer:
        "Yes. We guide eligible travelers through Ghana's visa on arrival process, including required documents, fees, and airport procedures so your entry is smooth and stress-free.",
    },
  ],
  cta: {
    title: "Your Adventure Begins Here",
    subtitle:
      "Ready to discover the beauty, history, and culture of Ghana? Book your next unforgettable journey with 360 Tours and Investment Limited.",
    primary: { label: "Contact us", to: ROUTES.contact },
    secondary: { label: "Browse tours", to: ROUTES.tours },
  },
};

/** Full content for the dedicated Why Us page */
export const whyUsPage = {
  eyebrow: "Why Choose Us",
  title: "Why Travel With 360 Tours?",
  subtitle:
    "From airport pickup to your last day of touring, we handle every detail so you can focus on the experience.",
  intro:
    "360 Tours and Investment Limited is built on professionalism, local knowledge, and a genuine passion for showcasing Ghana. Here's what sets us apart.",
  reasons: [
    {
      title: "Professional tour guides",
      description:
        "Friendly, knowledgeable guides who bring Ghana's history, culture, and landscapes to life on every tour.",
      icon: "users",
    },
    {
      title: "Reliable transportation",
      description:
        "Modern vehicles and professional drivers for airport transfers, city travel, tour days, and intercity journeys.",
      icon: "car",
    },
    {
      title: "Customized experiences",
      description:
        "Private tours, group packages, and fully tailored itineraries designed around your preferences and travel style.",
      icon: "route",
    },
    {
      title: "Competitive pricing",
      description:
        "Affordable, transparent rates with excellent value, no hidden costs, just honest pricing you can trust.",
      icon: "badge",
    },
    {
      title: "Safe & secure travel",
      description:
        "Your safety is our priority. We plan carefully, partner with trusted providers, and support you throughout your trip.",
      icon: "shield",
    },
    {
      title: "Flexible itineraries",
      description:
        "Need to adjust dates, add a destination, or change pace? We adapt your plan to fit how you want to travel.",
      icon: "calendar",
    },
    {
      title: "Exceptional support",
      description:
        "Responsive customer service before, during, and after your trip, via phone, email, or WhatsApp.",
      icon: "headphones",
    },
    {
      title: "Authentic local experiences",
      description:
        "Go beyond sightseeing, connect with communities, taste local cuisine, and experience Ghana from a local perspective.",
      icon: "heart",
    },
  ],
  experienceTypes: [
    { label: "City & heritage tours", desc: "Accra, Cape Coast, Kumasi & historic landmarks" },
    { label: "Adventure & nature", desc: "Waterfalls, canopy walks, wildlife parks & eco tours" },
    { label: "Beach getaways", desc: "Coastal escapes, resorts & island excursions" },
    { label: "Corporate & group travel", desc: "Retreats, conferences, schools & organizations" },
  ],
  cta: {
    title: "Ready to explore Ghana?",
    subtitle: "Let our team plan your next unforgettable journey, from first enquiry to final transfer.",
    primary: { label: "Browse tours", to: ROUTES.tours },
    secondary: { label: "Contact us", to: ROUTES.contact },
  },
};
