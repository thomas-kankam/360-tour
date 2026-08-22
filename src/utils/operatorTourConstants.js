/**
 * Listings are split into two flows:
 *   regular — fixed, published departures a traveller books straight away
 *   custom  — tailor-made itineraries priced from, agreed date by date on enquiry
 */
export const TOUR_TYPE = {
  REGULAR: "regular",
  CUSTOM: "custom",
};

export const TOUR_TYPE_OPTIONS = [
  {
    id: TOUR_TYPE.REGULAR,
    label: "Regular tour",
    shortLabel: "Scheduled",
    iconKey: "calendar",
    tagline: "Fixed departures",
    description: "Set departure dates and slot counts. Travellers book a published date instantly.",
  },
  {
    id: TOUR_TYPE.CUSTOM,
    label: "Customized tour",
    shortLabel: "Tailor-made",
    iconKey: "route",
    tagline: "Built on request",
    description: "No fixed dates. Publish a from-price and travellers send an enquiry to agree the plan.",
  },
];

export const TOUR_TYPE_IDS = TOUR_TYPE_OPTIONS.map((option) => option.id);

export function normalizeTourType(type) {
  const value = String(type || "").trim().toLowerCase();
  return TOUR_TYPE_IDS.includes(value) ? value : TOUR_TYPE.REGULAR;
}

export function isCustomTourType(type) {
  return normalizeTourType(type) === TOUR_TYPE.CUSTOM;
}

export function getTourTypeOption(type) {
  return TOUR_TYPE_OPTIONS.find((option) => option.id === normalizeTourType(type)) || TOUR_TYPE_OPTIONS[0];
}

export function getTourTypeLabel(type) {
  return getTourTypeOption(type).shortLabel;
}

/**
 * Category ids retired with the package-line and experience-theme editors.
 * Kept so legacy listings do not surface stale chips on public cards.
 */
export const LEGACY_CATEGORY_IDS = [
  "accra",
  "kumasi",
  "volta",
  "end-of-year",
  "heritage",
  "cultural",
  "safari",
  "adventure",
  "beach",
  "hotel-stay",
  "relaxation",
  "group",
];

export function isLegacyCategoryId(id) {
  return LEGACY_CATEGORY_IDS.includes(id);
}

export function formatTourCategoryLabel(categoryId) {
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
    tourType: TOUR_TYPE.REGULAR,
    categories: ["ghana"],
    status: "draft",
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
