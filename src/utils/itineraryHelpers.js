import { getImagePreviewSrc } from "./tourImageUtils";
import { resolvePublicMediaUrl } from "./mediaUrl";

export function getItineraryDayImageSrc(day) {
  if (!day) return "";
  return resolvePublicMediaUrl(getImagePreviewSrc(day.image) || day.imageUrl || "");
}

export function getItineraryAccommodationImageSrc(accommodation) {
  if (!accommodation) return "";
  return resolvePublicMediaUrl(
    getImagePreviewSrc(accommodation.image) || accommodation.imageUrl || accommodation.image_url || "",
  );
}

export function getItineraryMealImageSrc(meal) {
  if (!meal) return "";
  return resolvePublicMediaUrl(getImagePreviewSrc(meal.image) || meal.imageUrl || meal.image_url || "");
}

export function dayHasItineraryContent(day) {
  if (!day) return false;
  if (day.title?.trim() || day.description?.trim() || getItineraryDayImageSrc(day)) return true;

  const accommodation = day.accommodation;
  if (
    accommodation &&
    (accommodation.name?.trim() || accommodation.location?.trim() || getItineraryAccommodationImageSrc(accommodation))
  ) {
    return true;
  }

  return (day.meals || []).some((meal) => meal?.name?.trim() || getItineraryMealImageSrc(meal));
}
