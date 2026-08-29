import { images } from "../config/images";
import { brand, signatureTours2025 } from "./brandContent";

export const stories = [
  {
    slug: "cultural-immersion-newsletter-issue-01",
    title: "Cultural Immersion Newsletter, Issue 01: Connecting Africa to the World",
    excerpt:
      "Welcome to the 360 Tours inaugural Cultural Immersion Newsletter. Discover our African Cultural Travel Series and join a community of travelers, explorers, and cultural ambassadors.",
    category: "Newsletter",
    country: "Pan-African",
    author: "360 Tours",
    authorRole: "Editorial Team",
    date: "November 2025",
    readTime: "8 min read",
    image: images.home.hero,
    body: [
      {
        type: "lead",
        text: brand.tagline,
      },
      {
        type: "heading",
        text: "Who We Are",
      },
      {
        type: "paragraph",
        text: brand.intro,
      },
      {
        type: "paragraph",
        text: brand.movementLine,
      },
      {
        type: "quote",
        text: brand.mission,
      },
      {
        type: "paragraph",
        text: brand.operations,
      },
      {
        type: "heading",
        text: "We Are Excited!",
      },
      {
        type: "paragraph",
        text: brand.launch2025,
      },
      {
        type: "paragraph",
        text: "Whether you're a university planning a global exchange, a company seeking an adventure retreat, or an individual ready to discover Africa's heartbeat, 360 Tours is your trusted partner.",
      },
      {
        type: "quote",
        text: brand.transformationLine,
      },
      {
        type: "heading",
        text: "Our African Story",
      },
      {
        type: "paragraph",
        text: brand.originStory,
      },
      {
        type: "paragraph",
        text: brand.feelAfricaLine,
      },
      {
        type: "heading",
        text: "Upcoming Destinations for 2025",
      },
      {
        type: "list",
        items: signatureTours2025.map((t) => `${t.emoji} ${t.name}`),
      },
      {
        type: "heading",
        text: "Join the Movement",
      },
      {
        type: "paragraph",
        text: "Become part of the 360 Tours community of travelers, explorers, and cultural ambassadors. Follow our stories, join our programs, and let's explore Africa together, one journey at a time.",
      },
    ],
  },
  {
    slug: "cape-coast-castle-reflection",
    title: "Standing Inside Cape Coast Castle: A Reflection on Memory and Healing",
    excerpt:
      "Our group of 22 students stood in the dungeons of Cape Coast Castle, a silence fell that no guide's words could fill. This is what happened next.",
    category: "Heritage",
    country: "Ghana",
    author: "Dr. Amara Williams",
    authorRole: "University program coordinator",
    date: "March 18, 2025",
    readTime: "6 min read",
    image: images.home.destinations.ghana,
    body: [
      {
        type: "paragraph",
        text: "Our group of 22 students stood in the dungeons of Cape Coast Castle, a silence fell that no guide's words could fill. The weight of history pressed against the stone walls, and for a moment, the Atlantic itself seemed to hold its breath.",
      },
      {
        type: "paragraph",
        text: "360 Tours local guides didn't rush us through. They gave us space to feel, to reflect, and to connect with a past that shaped nations. That is what cultural immersion means, not observation, but presence.",
      },
    ],
  },
  {
    slug: "maasai-mara-dawn-drive",
    title: "Dawn on the Mara: Why the First Game Drive Changes Everything",
    excerpt:
      "The alarm says 5:30am. You groan. Then the Land Cruiser crests a ridge and ten thousand wildebeest appear below you in the morning mist.",
    category: "Safari",
    country: "Kenya",
    author: "James Okonkwo",
    authorRole: "Travel writer",
    date: "April 2, 2025",
    readTime: "5 min read",
    image: images.home.destinations.kenya,
    body: [
      {
        type: "paragraph",
        text: "The alarm says 5:30am. You groan. Then the Land Cruiser crests a ridge and ten thousand wildebeest appear below you in the morning mist, and every complaint disappears.",
      },
    ],
  },
  {
    slug: "kente-weaving-bonwire",
    title: "Threads of Identity: Learning to Weave Kente in Bonwire",
    excerpt:
      "Each pattern in Kente cloth carries a proverb, a lineage, a belief. Sitting at a loom in Bonwire, I learned that fabric can be a language.",
    category: "Culture",
    country: "Ghana",
    author: "Patricia Mensah",
    authorRole: "Heritage educator",
    date: "February 10, 2025",
    readTime: "4 min read",
    image: images.home.ghana,
    body: [
      {
        type: "paragraph",
        text: "Each pattern in Kente cloth carries a proverb, a lineage, a belief. Sitting at a loom in Bonwire with a master weaver, I learned that fabric can be a language, and Africa speaks fluently to those who listen.",
      },
    ],
  },
  {
    slug: "soweto-walking-tour-perspective",
    title: "Soweto on Foot: What No Bus Tour Can Show You",
    excerpt:
      "Walking through Vilakazi Street, the only street in the world to have housed two Nobel Peace Prize winners, you feel the weight of courage underfoot.",
    category: "Heritage",
    country: "South Africa",
    author: "Nathan Reed",
    authorRole: "Faculty lead",
    date: "May 5, 2025",
    readTime: "7 min read",
    image: images.home.destinations.southAfrica,
    body: [
      {
        type: "paragraph",
        text: "Walking through Vilakazi Street, the only street in the world to have housed two Nobel Peace Prize winners, you feel the weight of courage underfoot. Soweto on foot is history made tangible.",
      },
    ],
  },
  {
    slug: "table-mountain-sunrise",
    title: "Table Mountain at Sunrise: Africa's Most Spectacular First Hour",
    excerpt:
      "We started our hike at 4am, headlamps cutting the fynbos. By the time the sun rose over Cape Town, every breathless step made sense.",
    category: "Adventure",
    country: "South Africa",
    author: "Sarah Mitchell",
    authorRole: "Group travel organizer",
    date: "January 22, 2025",
    readTime: "4 min read",
    image: images.home.southAfrica,
    body: [
      {
        type: "paragraph",
        text: "We started our hike at 4am, headlamps cutting the fynbos. By the time the sun rose over Cape Town, every breathless step made sense.",
      },
    ],
  },
  {
    slug: "accra-food-scene",
    title: "Eating Accra: A Guide to Ghana's Most Underrated Culinary Capital",
    excerpt:
      "Jollof rice debates aside, Accra's food scene, from Labadi beach grills to the Oxford Street chop bars, is one of West Africa's best-kept secrets.",
    category: "Culture",
    country: "Ghana",
    author: "Emily Kariuki",
    authorRole: "Food & culture writer",
    date: "March 30, 2025",
    readTime: "5 min read",
    image: images.home.hero,
    body: [
      {
        type: "paragraph",
        text: "Jollof rice debates aside, Accra's food scene, from Labadi beach grills to the Oxford Street chop bars, is one of West Africa's best-kept secrets.",
      },
    ],
  },
  {
    slug: "nairobi-beyond-safari",
    title: "Nairobi Beyond the Safari: A City That Rewards Slow Travel",
    excerpt:
      "Most visitors treat Nairobi as a layover. Those who stay discover a creative, culinary, and cultural capital that rivals any African city.",
    category: "Culture",
    country: "Kenya",
    author: "James Okonkwo",
    authorRole: "Travel writer",
    date: "April 15, 2025",
    readTime: "6 min read",
    image: images.home.kenya,
    body: [
      {
        type: "paragraph",
        text: "Most visitors treat Nairobi as a layover. Those who stay discover a creative, culinary, and cultural capital that rivals any African city.",
      },
    ],
  },
  {
    slug: "corporate-retreat-kenya",
    title: "How a Kenya Retreat Reset Our Entire Leadership Team",
    excerpt:
      "We came for the game drives. We left with a shared language, a deeper trust, and a clarity about what we were building, together.",
    category: "Corporate",
    country: "Kenya",
    author: "Sarah Mitchell",
    authorRole: "Group travel organizer",
    date: "February 28, 2025",
    readTime: "5 min read",
    image: images.home.destinations.kenya,
    body: [
      {
        type: "paragraph",
        text: "We came for the game drives. We left with a shared language, a deeper trust, and a clarity about what we were building, together.",
      },
    ],
  },
  {
    slug: "kruger-big five",
    title: "The Big Five in 48 Hours: Is It Really Possible?",
    excerpt:
      "Our Kruger guide laughed when we asked. Then, in two extraordinary days, we checked all five off the list, and understood why every single one matters.",
    category: "Safari",
    country: "South Africa",
    author: "Nathan Reed",
    authorRole: "Faculty lead",
    date: "May 12, 2025",
    readTime: "4 min read",
    image: images.home.destinations.southAfrica,
    body: [
      {
        type: "paragraph",
        text: "Our Kruger guide laughed when we asked. Then, in two extraordinary days, we checked all five off the list, and understood why every single one matters.",
      },
    ],
  },
];

export function getStoryBySlug(slug) {
  return stories.find((s) => s.slug === slug) ?? null;
}
