import countries from "world-countries";

/** Legacy hub countries — pinned to the top of operator pickers. */
export const PRIORITY_COUNTRY_IDS = ["ghana", "kenya", "southafrica"];

function slugifyCountryId(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getDialCode(entry) {
  const { root, suffixes } = entry.idd || {};
  if (!root) return "";
  const base = root.replace("+", "");
  if (!suffixes?.length) return base;
  if (suffixes.length === 1) return `${base}${suffixes[0]}`;
  return base;
}

function mapCountryEntry(entry) {
  const country = entry.name?.common || "";
  return {
    id: slugifyCountryId(country),
    label: country,
    country,
    isoCode: entry.cca2,
    dialCode: getDialCode(entry),
  };
}

const ALL_COUNTRIES = countries
  .filter((entry) => entry.name?.common && entry.cca2 && entry.status !== "reserved")
  .map(mapCountryEntry)
  .sort((a, b) => a.label.localeCompare(b.label));

function buildCountryOptions() {
  const byId = new Map(ALL_COUNTRIES.map((country) => [country.id, country]));
  const priority = PRIORITY_COUNTRY_IDS.map((id) => byId.get(id)).filter(Boolean);
  const rest = ALL_COUNTRIES.filter((country) => !PRIORITY_COUNTRY_IDS.includes(country.id));
  return [...priority, ...rest];
}

export const COUNTRY_OPTIONS = buildCountryOptions();

export function findCountryOption(countryId) {
  return COUNTRY_OPTIONS.find((country) => country.id === countryId) || null;
}

export function resolveCountryOption(countryCode, countryName) {
  const normalizedCode = String(countryCode || "").trim();
  const normalizedId = normalizedCode.toLowerCase().replace(/[^a-z0-9]/g, "");

  const byId = findCountryOption(normalizedId);
  if (byId) return byId;

  const dialCode = normalizedCode.replace(/^\+/, "");
  const byDial = COUNTRY_OPTIONS.find((country) => country.dialCode === dialCode);
  if (byDial) return byDial;

  const normalizedName = String(countryName || "").trim().toLowerCase();
  if (normalizedName) {
    const byName = COUNTRY_OPTIONS.find(
      (country) =>
        country.country.toLowerCase() === normalizedName ||
        country.label.toLowerCase() === normalizedName,
    );
    if (byName) return byName;
  }

  return findCountryOption("ghana") || COUNTRY_OPTIONS[0];
}

export function isCountryCategoryId(id) {
  return COUNTRY_OPTIONS.some((option) => option.id === id);
}

export function filterCountryOptions(query = "") {
  const value = String(query || "").trim().toLowerCase();
  if (!value) return COUNTRY_OPTIONS;

  return COUNTRY_OPTIONS.filter((country) => {
    return (
      country.label.toLowerCase().includes(value) ||
      country.isoCode.toLowerCase().includes(value) ||
      country.dialCode.includes(value.replace(/^\+/, ""))
    );
  });
}
