import { getImagePreviewSrc } from "./tourImageUtils";

export function getItineraryDayImageSrc(day) {
  if (!day) return "";
  return getImagePreviewSrc(day.image) || day.imageUrl || "";
}
