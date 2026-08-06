import { X } from "lucide-react";
import { CUSTOM_CITY_VALUE } from "../../data/ghanaRegions";

const inputClass =
  "w-full rounded-xl border-2 border-brand-border bg-white px-4 py-2.5 text-sm font-medium text-brand-ink outline-none transition-all focus:border-brand-green focus:ring-2 focus:ring-brand-green/15";

export default function CitySelectField({
  cities,
  value,
  customCity,
  cityIsCustom,
  onSelectCity,
  onCustomCityChange,
  onEnterCustomMode,
  onExitCustomMode,
  disabled = false,
  placeholder = "Select city…",
}) {
  if (cityIsCustom) {
    return (
      <div className="relative">
        <input
          type="text"
          value={customCity}
          onChange={(e) => onCustomCityChange(e.target.value)}
          placeholder="Enter city name"
          disabled={disabled}
          className={`${inputClass} pr-10`}
        />
        <button
          type="button"
          onClick={onExitCustomMode}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-brand-muted transition-colors hover:bg-brand-cream hover:text-brand-ink"
          aria-label="Back to city list"
          title="Back to city list"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <select
      className={inputClass}
      value={value}
      onChange={(e) => {
        if (e.target.value === CUSTOM_CITY_VALUE) {
          onEnterCustomMode();
          return;
        }
        onSelectCity(e.target.value);
      }}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {cities.map((city) => (
        <option key={city} value={city}>
          {city}
        </option>
      ))}
      <option value={CUSTOM_CITY_VALUE}>Custom city…</option>
    </select>
  );
}
