import { getImagePreviewSrc } from "./tourImageUtils";
import { resolvePublicMediaUrl } from "./mediaUrl";

export function getItineraryDayImageSrc(day) {
  if (!day) return "";
  return resolvePublicMediaUrl(getImagePreviewSrc(day.image) || day.imageUrl || "");
}
