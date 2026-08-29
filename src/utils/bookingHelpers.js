import { buildWebsiteUrl } from "../config/env";
import { PAYMENT_REGION } from "../constants/paymentRegions";
import { getBookingStatus } from "./bookingStorage";
import { resolvePublicMediaUrl } from "./mediaUrl";
import { computeChargeSubtotal, resolveTourDisplayPricing } from "./tourPricing";

export const DEFAULT_MIN_GROUP_TRAVELERS = 2;
export const DEFAULT_MAX_GROUP_TRAVELERS = 200;

export function getGroupTravelerLimits(tour) {
  const settings = tour?.bookingSettings || {};
  return {
    min: Number(settings.minGroupSize) || DEFAULT_MIN_GROUP_TRAVELERS,
    max: Number(settings.maxGroupSize) || DEFAULT_MAX_GROUP_TRAVELERS,
  };
}

export function clampGroupTravelers(count, tour) {
  const { min, max } = getGroupTravelerLimits(tour);
  const parsed = Number.parseInt(String(count), 10);
  if (Number.isNaN(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

export function computeBookingAmount(pricePerPerson, travelers) {
  const unit = Number(pricePerPerson) || 0;
  const count = Number(travelers) || 0;
  return Number((unit * count).toFixed(2));
}

export function parseAmountFromPriceLabel(priceLabel) {
  if (!priceLabel) return null;
  const match = String(priceLabel).replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

export function resolveTourUnitPrice(tour) {
  if (!tour) return 0;

  const amount = Number(tour.priceAmount ?? tour.priceNum) || 0;
  const fromLabel = parseAmountFromPriceLabel(tour.priceLabel);

  if (fromLabel != null) {
    if (amount <= 0) return fromLabel;
    if (fromLabel > amount * 10) return fromLabel;
  }

  return amount;
}

export function computeBookingSubtotal(tour, travelers) {
  return computeBookingAmount(resolveTourUnitPrice(tour), travelers);
}

export function resolveBookingPricing(tour, travelers, region = null) {
  if (region?.paymentRegion) {
    const charge = computeChargeSubtotal(tour, travelers, region.paymentRegion);
    return {
      unitPrice: charge.unitPrice,
      currency: charge.currency,
      subtotal: charge.subtotal,
      audienceScope: charge.audienceScope,
    };
  }

  const display = resolveTourDisplayPricing(tour);
  return {
    ...display,
    subtotal: computeBookingAmount(display.unitPrice, travelers),
  };
}

export function parseApiBookingAmount(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function resolveBookingCurrency(apiBooking) {
  if (apiBooking?.currency) return apiBooking.currency;
  if (apiBooking?.paymentRegion === PAYMENT_REGION.INTERNATIONAL) return "USD";
  return "GHS";
}

export function resolveBookingAmount(apiBooking, tour) {
  const storedAmount = parseApiBookingAmount(apiBooking?.amount);
  if (storedAmount != null && storedAmount > 0) {
    return storedAmount;
  }

  const travelers = Number(apiBooking?.travelers) || 1;
  const tourSource = tour || mapTourFromApiBooking(apiBooking?.tour) || {};

  if (apiBooking?.paymentRegion) {
    const pricing = resolveBookingPricing(
      { ...tourSource, ...(apiBooking.tour || {}) },
      travelers,
      { paymentRegion: apiBooking.paymentRegion },
    );
    if (pricing.subtotal > 0) return pricing.subtotal;
  }

  const computed = computeBookingSubtotal(
    {
      ...tourSource,
      priceAmount: apiBooking?.tour?.priceAmount ?? tourSource.priceNum,
      priceLabel: apiBooking?.tour?.priceLabel ?? tourSource.priceLabel,
    },
    travelers,
  );

  if (computed > 0) return computed;

  return 0;
}

export function mapUserToBookingLeadFields(user) {
  if (!user) {
    return {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      nationality: "",
    };
  }

  return {
    firstName: (user.firstName || "").trim(),
    lastName: (user.lastName || "").trim(),
    email: (user.email || "").trim(),
    phone: (user.phone || "").trim(),
    nationality: (user.nationality || "").trim(),
  };
}

export function mergeUserIntoBookingLeadFields(current, user) {
  const profile = mapUserToBookingLeadFields(user);
  if (!user) return current;

  return {
    ...current,
    firstName: profile.firstName || current.firstName,
    lastName: profile.lastName || current.lastName,
    email: profile.email || current.email,
    phone: profile.phone || current.phone,
    nationality: profile.nationality || current.nationality,
  };
}

export function createInitialBookingForm(user, overrides = {}) {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationality: "",
    bookingType: null,
    selectedDate: "",
    travelers: DEFAULT_MIN_GROUP_TRAVELERS,
    groupName: "",
    groupType: "",
    organization: "",
    specialRequests: "",
    dietaryNeeds: "",
    paymentMode: null,
    ...mapUserToBookingLeadFields(user),
    ...overrides,
  };
}

export function formatBookingCurrency(amount, currency = "GHS") {
  const code = currency || "GHS";
  const locale = code === "USD" ? "en-US" : "en-GH";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch {
    return `${code} ${Number(amount || 0).toFixed(2)}`;
  }
}

function applyUserRegionToPayload(payload, region) {
  if (!region) return payload;

  return {
    ...payload,
    countryCode: region.countryCode ?? null,
    paymentRegion: region.paymentRegion,
  };
}

export function buildCreateBookingPayload(form, tour, region = null) {
  const travelers =
    form.bookingType === "group"
      ? clampGroupTravelers(form.travelers, tour)
      : 1;

  const pricing = resolveBookingPricing(tour, travelers, region);

  const payload = {
    bookingType: form.bookingType,
    tourSlug: tour.slug,
    selectedDate: form.selectedDate,
    travelers,
    paymentMode: form.paymentMode === "online" ? "online" : "onsite",
    leadTraveler: {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      ...(form.nationality?.trim() ? { nationality: form.nationality.trim() } : {}),
    },
    specialRequests: form.specialRequests?.trim() || "",
    dietaryNeeds: form.dietaryNeeds?.trim() || "",
    additionalTravelers: [],
    amount: pricing.subtotal,
    currency: pricing.currency,
  };

  if (form.bookingType === "group") {
    payload.groupDetails = {
      groupName: form.groupName.trim(),
      groupType: form.groupType,
      ...(form.organization?.trim() ? { organization: form.organization.trim() } : {}),
    };
  } else {
    payload.groupDetails = [];
  }

  payload.frontend_url = buildWebsiteUrl();
  payload.callback_url = buildWebsiteUrl();
  payload.success_url = buildWebsiteUrl("/payment/success");
  payload.cancel_url = buildWebsiteUrl("/payment/failure");

  return applyUserRegionToPayload(payload, region);
}

/**
 * Build the POST body for POST /client/payments/{paymentSlug}/retry from stored booking data.
 */
export function buildRetryPaymentPayload(booking) {
  if (!booking) return null;

  const bookingType = booking.bookingType || "individual";
  const lead = booking.leadTraveler || {};
  const amount = parseApiBookingAmount(booking.amount ?? booking.subtotal);

  const payload = {
    bookingType,
    selectedDate: booking.selectedDate || "",
    travelers: Number(booking.travelers) || 1,
    paymentMode: booking.paymentMode === "online" ? "online" : "onsite",
    leadTraveler: {
      firstName: (lead.firstName || "").trim(),
      lastName: (lead.lastName || "").trim(),
      email: (lead.email || "").trim(),
      phone: (lead.phone || "").trim(),
      ...(lead.nationality?.trim?.() ? { nationality: lead.nationality.trim() } : {}),
    },
    specialRequests: booking.specialRequests?.trim?.() || booking.specialRequests || "",
    dietaryNeeds: booking.dietaryNeeds?.trim?.() || booking.dietaryNeeds || "",
    additionalTravelers: Array.isArray(booking.additionalTravelers) ? booking.additionalTravelers : [],
    amount,
  };

  if (bookingType === "group") {
    const group = booking.groupDetails && !Array.isArray(booking.groupDetails)
      ? booking.groupDetails
      : {};

    payload.groupDetails = {
      groupName: (group.groupName || "").trim(),
      groupType: group.groupType || "",
      ...(group.organization?.trim?.() ? { organization: group.organization.trim() } : {}),
    };
  } else {
    payload.groupDetails = [];
  }

  return payload;
}

export function mapApiBooking(data) {
  if (!data) return null;

  return {
    bookingSlug: data.bookingSlug,
    bookingCode: data.bookingCode || null,
    clientSlug: data.clientSlug,
    bookedByType: data.bookedByType,
    bookedBySlug: data.bookedBySlug,
    bookingType: data.bookingType,
    tourSlug: data.tourSlug,
    selectedDate: data.selectedDate,
    travelers: Number(data.travelers) || 1,
    paymentMode: data.paymentMode,
    paymentStatus: data.paymentStatus,
    amount: parseApiBookingAmount(data.amount),
    currency:
      data.currency
      || (data.paymentRegion === PAYMENT_REGION.INTERNATIONAL ? "USD" : "GHS"),
    countryCode: data.countryCode ?? null,
    paymentRegion: data.paymentRegion || null,
    status: data.status,
    leadTraveler: data.leadTraveler || {},
    groupDetails: data.groupDetails || null,
    specialRequests: data.specialRequests || "",
    dietaryNeeds: data.dietaryNeeds || "",
    additionalTravelers: data.additionalTravelers || [],
    operatorSlug: data.operatorSlug,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    tour: data.tour || null,
    paymentUrl: data.paymentUrl || data.checkoutUrl || null,
  };
}

function mapTourFromApiBooking(apiTour) {
  if (!apiTour) return null;
  const locations = Array.isArray(apiTour.locations) ? apiTour.locations.filter(Boolean) : [];

  return {
    name: apiTour.name || "",
    slug: apiTour.slug || "",
    location: locations.join(" · ") || apiTour.country || "",
    country: apiTour.country || "",
    duration: apiTour.durationLabel || `${apiTour.durationDays || 1} days`,
    priceLabel: apiTour.priceLabel || "",
    priceNum: resolveTourUnitPrice(apiTour),
    priceAmountGhs: apiTour.priceAmountGhs,
    priceAmountUsd: apiTour.priceAmountUsd,
    audienceScope: apiTour.audienceScope,
    priceCurrency: apiTour.priceCurrency,
    image: resolvePublicMediaUrl(apiTour.coverImageUrl || ""),
    depositPercent: apiTour.bookingSettings?.depositPercent ?? 30,
  };
}

export function getBookingApiRef(booking) {
  return booking?.bookingCode || booking?.bookingRef || booking?.bookingSlug || "";
}

export function getBookingDisplayRef(booking) {
  return booking?.bookingCode || booking?.bookingSlug || booking?.bookingRef || "";
}

export function buildBookingSuccessPath(bookingRef, paymentMode = "onsite") {
  const params = new URLSearchParams({
    ref: bookingRef,
    payment: paymentMode,
  });
  return `/booking/success?${params.toString()}`;
}

export function buildPaymentSuccessPath(bookingCode) {
  if (!bookingCode) return "/payment/success";
  const params = new URLSearchParams({ ref: bookingCode });
  return `/payment/success?${params.toString()}`;
}

export function buildPaymentFailurePath(bookingCode, reason) {
  const params = new URLSearchParams();
  if (bookingCode) params.set("ref", bookingCode);
  if (reason) params.set("reason", reason);
  const query = params.toString();
  return query ? `/payment/failure?${query}` : "/payment/failure";
}

export function canViewBookingReceipt(booking) {
  if (!booking) return false;

  const status = booking.status || getBookingStatus(booking);

  // Online checkout not completed yet
  if (status === "reserved") return false;

  return (
    status === "paid" ||
    status === "deposit_paid" ||
    status === "pay_onsite" ||
    booking.paymentMode === "onsite"
  );
}

export function mapApiBookingToLocalRecord(apiBooking, form, tour) {
  const tourSource = tour || mapTourFromApiBooking(apiBooking.tour) || {};
  const departure = (tourSource.departureDates || tour?.departureDates || []).find(
    (dep) => dep.date === apiBooking.selectedDate,
  );

  const displayRef = apiBooking.bookingCode || apiBooking.bookingSlug;
  const amount = parseApiBookingAmount(apiBooking.amount);
  const subtotal = amount != null && amount > 0 ? amount : resolveBookingAmount(apiBooking, tourSource);

  return {
    bookingRef: displayRef,
    bookingCode: apiBooking.bookingCode || null,
    bookingSlug: apiBooking.bookingSlug,
    bookingType: apiBooking.bookingType,
    tourSlug: apiBooking.tourSlug || tourSource.slug,
    tour: {
      name: tourSource.name,
      slug: tourSource.slug,
      location: tourSource.location,
      country: tourSource.country,
      duration: tourSource.duration,
      priceNum: tourSource.priceNum,
      image: tourSource.image,
    },
    selectedDate: departure?.dateLabel || apiBooking.selectedDate,
    selectedDateRaw: apiBooking.selectedDate,
    travelers: Number(apiBooking.travelers) || 1,
    paymentMode: apiBooking.paymentMode,
    payType: apiBooking.paymentMode === "online" ? "full" : "onsite",
    payNowAmount: apiBooking.paymentMode === "online" ? subtotal : 0,
    amount,
    subtotal,
    depositAmount: Math.round(subtotal * ((tourSource.depositPercent || tour?.depositPercent || 30) / 100)),
    depositPercent: tourSource.depositPercent || tour?.depositPercent || 30,
    currency: resolveBookingCurrency(apiBooking),
    paymentRegion: apiBooking.paymentRegion || null,
    countryCode: apiBooking.countryCode ?? null,
    paymentStatus: apiBooking.paymentStatus,
    apiStatus: apiBooking.status,
    leadTraveler: apiBooking.leadTraveler,
    groupDetails: apiBooking.groupDetails,
    specialRequests: apiBooking.specialRequests,
    dietaryNeeds: apiBooking.dietaryNeeds,
    additionalTravelers: apiBooking.additionalTravelers || [],
    issuedAt: apiBooking.createdAt || new Date().toISOString(),
    paymentUrl: apiBooking.paymentUrl || null,
  };
}

export function buildUpdateBookingPayload(form, tour, region = null) {
  const travelers =
    form.bookingType === "group"
      ? clampGroupTravelers(form.travelers, tour)
      : 1;

  const pricing = resolveBookingPricing(tour, travelers, region);

  const payload = {
    bookingType: form.bookingType,
    tourSlug: tour.slug,
    selectedDate: form.selectedDate,
    travelers,
    paymentMode: form.paymentMode === "online" ? "online" : "onsite",
    leadTraveler: {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      ...(form.nationality?.trim() ? { nationality: form.nationality.trim() } : {}),
    },
    specialRequests: form.specialRequests?.trim() || "",
    dietaryNeeds: form.dietaryNeeds?.trim() || "",
    additionalTravelers: form.additionalTravelers || [],
    amount: pricing.subtotal,
    currency: pricing.currency,
  };

  if (form.bookingType === "group") {
    payload.groupDetails = {
      groupName: form.groupName.trim(),
      groupType: form.groupType,
      ...(form.organization?.trim() ? { organization: form.organization.trim() } : {}),
    };
  } else {
    payload.groupDetails = [];
  }

  return applyUserRegionToPayload(payload, region);
}

export function mapBookingToEditForm(apiBooking) {
  const lead = apiBooking?.leadTraveler || {};
  const group = apiBooking?.groupDetails || {};

  return {
    firstName: lead.firstName || "",
    lastName: lead.lastName || "",
    email: lead.email || "",
    phone: lead.phone || "",
    nationality: lead.nationality || "",
    bookingType: apiBooking?.bookingType || "individual",
    selectedDate: apiBooking?.selectedDate || "",
    travelers: Number(apiBooking?.travelers) || 1,
    groupName: group.groupName || "",
    groupType: group.groupType || "",
    organization: group.organization || "",
    specialRequests: apiBooking?.specialRequests || "",
    dietaryNeeds: apiBooking?.dietaryNeeds || "",
    paymentMode: apiBooking?.paymentMode === "online" ? "online" : "onsite",
    additionalTravelers: apiBooking?.additionalTravelers || [],
  };
}

export function canEditBooking(booking) {
  if (!booking) return false;

  const status = booking.status || getBookingStatus(booking);

  if (status === "paid" || status === "deposit_paid" || status === "reserved") return false;
  if (booking.paymentMode === "online") return false;

  return status === "pay_onsite" || booking.paymentMode === "onsite";
}

export function mapApiBookingToListRecord(raw) {
  const apiBooking = mapApiBooking(raw);
  if (!apiBooking) return null;

  const tourMeta = mapTourFromApiBooking(apiBooking.tour);
  const departure = (apiBooking.tour?.departureDates || []).find(
    (dep) => dep.date === apiBooking.selectedDate,
  );

  const record = mapApiBookingToLocalRecord(apiBooking, {}, tourMeta);
  const amount = parseApiBookingAmount(raw.amount ?? apiBooking.amount);
  const currency = resolveBookingCurrency({
    ...apiBooking,
    currency: raw.currency ?? apiBooking.currency,
    paymentRegion: raw.paymentRegion ?? apiBooking.paymentRegion,
  });
  const subtotal = amount != null && amount > 0 ? amount : record.subtotal;

  return {
    ...record,
    amount,
    subtotal,
    currency,
    paymentRegion: raw.paymentRegion ?? apiBooking.paymentRegion ?? record.paymentRegion,
    selectedDate: departure?.dateLabel || record.selectedDate,
    savedAt: apiBooking.createdAt || record.issuedAt,
    paymentUrl: apiBooking.paymentUrl,
    status: getBookingStatus({ ...record, amount, subtotal, currency }),
  };
}
