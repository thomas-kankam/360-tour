export const TOUR_CATEGORY_OPTIONS = [
  { id: "heritage", label: "Heritage", description: "Historic sites, monuments, and UNESCO landmarks." },
  { id: "cultural", label: "Cultural", description: "Festivals, crafts, cuisine, and living traditions." },
  { id: "safari", label: "Safari", description: "Wildlife parks, game drives, and nature reserves." },
  { id: "adventure", label: "Adventure", description: "Hiking, canopy walks, and active exploration." },
  { id: "beach", label: "Beach", description: "Coastal escapes, resorts, and water activities." },
  { id: "hotel-stay", label: "Hotel stay", description: "Comfortable hotel accommodations and premium lodging experiences." },
  { id: "relaxation", label: "Relaxation", description: "Spa, leisure time, and unhurried rest-focused itineraries." },
  { id: "group", label: "Groups", description: "Shared departures ideal for families and teams." },
];

export const GHANA_PACKAGE_LINE_OPTIONS = [
  {
    id: "accra",
    label: "Accra",
    iconKey: "building",
    tagline: "Arts & city culture",
    description: "Markets, crafts, and vibrant capital experiences — Arts Centre, Aburi, and more.",
    photoHints: {
      cover: "Arts Centre, Aburi Arts market, or craft stalls in Accra.",
      gallery: "Artisans at work, market scenes, city culture, and coastal day trips.",
    },
  },
  {
    id: "kumasi",
    label: "Kumasi",
    iconKey: "crown",
    tagline: "Ashanti heritage",
    description: "Royal history, kente weaving, and the cultural heart of the Ashanti Kingdom.",
    photoHints: {
      cover: "Manhyia Palace or kente weaving at Bonwire.",
      gallery: "Palace grounds, craft villages, traditional ceremonies, and Ashanti landmarks.",
    },
  },
  {
    id: "volta",
    label: "Volta",
    iconKey: "mountain",
    tagline: "Mountains & waterfalls",
    description: "Highland treks, Wli Falls, and nature-forward journeys in Ghana's Volta Region.",
    photoHints: {
      cover: "Wli Falls, Volta mountains, or waterfall hiking trails.",
      gallery: "Forest canopy, mountain vistas, village stops, and outdoor adventure.",
    },
  },
  {
    id: "end-of-year",
    label: "End of Year",
    iconKey: "party",
    tagline: "Detty December",
    description: "Festival season energy — concerts, Afrochella vibes, and December celebrations.",
    photoHints: {
      cover: "Detty December crowds, festival stage, or December nightlife in Accra.",
      gallery: "Concerts, street parties, festival fashion, and celebratory group moments.",
    },
  },
];

export const GHANA_PACKAGE_LINE_IDS = GHANA_PACKAGE_LINE_OPTIONS.map((option) => option.id);

export function isGhanaPackageLineId(id) {
  return GHANA_PACKAGE_LINE_IDS.includes(id);
}

export function getGhanaPackageLineOption(id) {
  return GHANA_PACKAGE_LINE_OPTIONS.find((option) => option.id === id) || null;
}

export function extractPackageLineId(categories = []) {
  return (categories || []).find(isGhanaPackageLineId) || "";
}

export function getPackageLinePhotoHints(packageLineId) {
  return getGhanaPackageLineOption(packageLineId)?.photoHints || null;
}

export function formatTourCategoryLabel(categoryId) {
  const packageLine = getGhanaPackageLineOption(categoryId);
  if (packageLine) return packageLine.label;

  const theme = TOUR_CATEGORY_OPTIONS.find((option) => option.id === categoryId);
  if (theme) return theme.label;

  return String(categoryId || "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export {
  COUNTRY_OPTIONS,
  findCountryOption,
  isCountryCategoryId,
  resolveCountryOption,
} from "./countryOptions";

export const BADGE_VARIANTS = [
  { id: "orange", label: "Orange" },
  { id: "gold", label: "Gold" },
  { id: "green", label: "Green" },
];

export const TOUR_CURRENCY = {
  code: "GHS",
  label: "Ghana Cedis",
  symbol: "GH₵",
};

export const TOUR_CURRENCY_USD = {
  code: "USD",
  label: "US Dollars",
  symbol: "$",
};

export const TOUR_CURRENCY_OPTIONS = [TOUR_CURRENCY, TOUR_CURRENCY_USD];

export const UNLIMITED_TOUR_SLOTS = 9999;

export function getTourCurrencyOption(currencyCode = TOUR_CURRENCY.code) {
  return TOUR_CURRENCY_OPTIONS.find((currency) => currency.code === currencyCode) || TOUR_CURRENCY;
}

export function formatTourPriceLabel(amount, currencyCode = TOUR_CURRENCY.code) {
  const currency = getTourCurrencyOption(currencyCode);
  const numericAmount = Number(amount || 0);
  const formatted = numericAmount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `From ${currency.symbol}${formatted}`;
}

export function parseTourPriceAmount(value) {
  if (value === "" || value === null || value === undefined) return 0;
  const parsed = parseFloat(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function isUnlimitedTourSlots(totalSlots) {
  return Number(totalSlots) >= UNLIMITED_TOUR_SLOTS;
}

export function formatTourSlotsLabel(slots, { withWord = true } = {}) {
  if (isUnlimitedTourSlots(slots)) return "Unlimited";
  const count = Number(slots) || 0;
  if (!withWord) return String(count);
  return `${count} slot${count === 1 ? "" : "s"}`;
}

export function formatDepartureAvailability(spotsLeft, spotsTotal) {
  if (isUnlimitedTourSlots(spotsTotal) || isUnlimitedTourSlots(spotsLeft)) {
    return "Unlimited";
  }
  return `${spotsLeft} / ${spotsTotal} left`;
}

export function formatDepartureSpotsLeftLabel(spotsLeft, spotsTotal) {
  if (isUnlimitedTourSlots(spotsTotal) || isUnlimitedTourSlots(spotsLeft)) {
    return "Unlimited";
  }
  const count = Number(spotsLeft ?? spotsTotal) || 0;
  return `${count} spot${count === 1 ? "" : "s"} left`;
}

export function isDepartureLowAvailability(spotsLeft, spotsTotal) {
  if (isUnlimitedTourSlots(spotsTotal) || isUnlimitedTourSlots(spotsLeft)) return false;
  return (Number(spotsLeft ?? spotsTotal) || 0) <= 3;
}

export function isUnlimitedDeparture(departure) {
  if (!departure) return false;
  return isUnlimitedTourSlots(departure.spotsTotal) || isUnlimitedTourSlots(departure.spotsLeft);
}

export function summarizeOperatorOpenSpots(tours = []) {
  let finiteTotal = 0;
  let unlimitedListings = 0;
  let listingsWithNextDeparture = 0;

  tours.forEach((tour) => {
    const nextDeparture = tour.departureDates?.[0];
    if (!nextDeparture?.date && !nextDeparture?.endDate) return;

    listingsWithNextDeparture += 1;

    if (isUnlimitedDeparture(nextDeparture)) {
      unlimitedListings += 1;
      return;
    }

    finiteTotal += Number(nextDeparture.spotsLeft) || 0;
  });

  if (listingsWithNextDeparture === 0) {
    return { value: "—", sub: "No upcoming departures" };
  }

  if (unlimitedListings === listingsWithNextDeparture) {
    return {
      value: "Unlimited",
      sub: unlimitedListings === 1
        ? "1 listing with unlimited capacity"
        : `${unlimitedListings} listings with unlimited capacity`,
    };
  }

  if (unlimitedListings > 0) {
    const value = finiteTotal > 0 ? `${finiteTotal.toLocaleString()} + Unlimited` : "Unlimited";
    const sub = finiteTotal > 0
      ? `${finiteTotal.toLocaleString()} open spots · ${unlimitedListings} unlimited`
      : `${unlimitedListings} listing${unlimitedListings === 1 ? "" : "s"} with unlimited capacity`;

    return { value, sub };
  }

  return {
    value: finiteTotal,
    sub: "Across next departures",
  };
}

export const DEPARTURE_SCHEDULE_DATE_RANGE = "date-range";
export const DEPARTURE_SCHEDULE_SPECIFIC = "specific-dates";

export const DEPARTURE_SCHEDULE_OPTIONS = [
  {
    id: DEPARTURE_SCHEDULE_DATE_RANGE,
    label: "Date range",
    description: "Set duration, start and end dates, and available slots for one continuous window.",
  },
  {
    id: DEPARTURE_SCHEDULE_SPECIFIC,
    label: "Specific dates",
    description: "Add individual departure dates, each with its own slot count.",
  },
];

export function createEmptyDateRangeDeparture(spotsTotal = 18) {
  return {
    date: "",
    endDate: "",
    dateLabel: "",
    endDateLabel: "",
    spotsTotal,
    label: "",
  };
}

export function createEmptySpecificDeparture(spotsTotal = 18) {
  return {
    date: "",
    dateLabel: "",
    spotsTotal,
    label: "",
  };
}

export function createEmptyTourListing() {
  return {
    name: "",
    locations: [],
    country: "Ghana",
    countryId: "ghana",
    countryCode: "233",
    packageLineId: "",
    categories: ["ghana", "heritage", "cultural"],
    status: "draft",
    featured: false,
    durationDays: 10,
    durationLabel: "10 days",
    groupSizeMin: 1,
    groupSizeMax: 18,
    priceAmount: 1850,
    priceAmountGhs: 1850,
    priceAmountUsd: "",
    audienceScope: "local",
    priceCurrency: "GHS",
    priceLabel: "From GH₵1,850",
    totalSlots: 18,
    rating: 5,
    reviewCount: 0,
    badge: "",
    badgeVariant: "orange",
    coverImage: { uri: "", data: "", mimeType: "image/jpeg" },
    coverImageUrl: "",
    featureImages: [],
    description: "",
    highlights: ["", "", "", ""],
    itinerary: [],
    included: [
      "Airport transfers — Pickup on arrival and drop-off on departure",
      "Accommodation — 3–4 star hotels and lodges for the full trip",
      "Meals — Daily breakfast and selected meals on activity days",
      "Local guide — Licensed guide with you throughout the journey",
    ],
    notIncluded: [
      "Flights — International airfare to and from your destination",
      "Travel insurance — Not included but strongly recommended",
      "Personal spending — Souvenirs, tips, and extras you choose",
    ],
    departureScheduleType: DEPARTURE_SCHEDULE_DATE_RANGE,
    departureDates: [
      createEmptyDateRangeDeparture(18),
    ],
    bookingSettings: {
      depositPercent: 30,
      payOnSiteAllowed: true,
      onlinePaymentAllowed: true,
      maxGroupSize: 200,
      minGroupSize: 2,
    },
  };
}
