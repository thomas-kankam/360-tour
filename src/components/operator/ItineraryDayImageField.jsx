import TourImageField from "./TourImageField";

export default function ItineraryDayImageField({ value, onChange, dayNumber }) {
  return (
    <TourImageField
      label={`Day ${dayNumber} image`}
      hint="Optional — one photo per itinerary day (max 1). Shown on the public tour page."
      value={value || { uri: "", data: "", mimeType: "image/jpeg" }}
      onChange={onChange}
      uriPlaceholder={`tours/itinerary/day-${dayNumber}.jpg`}
      showUriField={false}
    />
  );
}
