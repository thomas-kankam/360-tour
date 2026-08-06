export const GHANA_REGIONS = [
  { id: "ahafo", label: "Ahafo" },
  { id: "ashanti", label: "Ashanti" },
  { id: "bono", label: "Bono" },
  { id: "bono-east", label: "Bono East" },
  { id: "central", label: "Central" },
  { id: "eastern", label: "Eastern" },
  { id: "greater-accra", label: "Greater Accra" },
  { id: "north-east", label: "North East" },
  { id: "northern", label: "Northern" },
  { id: "oti", label: "Oti" },
  { id: "savannah", label: "Savannah" },
  { id: "upper-east", label: "Upper East" },
  { id: "upper-west", label: "Upper West" },
  { id: "volta", label: "Volta" },
  { id: "western", label: "Western" },
  { id: "western-north", label: "Western North" },
];

export const GHANA_TOURIST_CITIES = {
  ahafo: ["Goaso", "Tepa", "Hwidiem", "Bechem"],
  ashanti: ["Kumasi", "Obuasi", "Ejisu", "Mampong", "Konongo"],
  bono: ["Sunyani", "Berekum", "Dormaa Ahenkro", "Wenchi"],
  "bono-east": ["Techiman", "Kintampo", "Nkoranza", "Atebubu"],
  central: ["Cape Coast", "Elmina", "Kakum", "Winneba", "Kasoa"],
  eastern: ["Koforidua", "Aburi", "Akosombo", "Mpraeso", "Nkawkaw"],
  "greater-accra": ["Accra", "Tema", "Ada Foah", "Labadi", "Teshie"],
  "north-east": ["Nalerigu", "Walewale", "Gambaga", "Bunkpurugu"],
  northern: ["Tamale", "Yendi", "Salaga", "Damongo"],
  oti: ["Dambai", "Jasikan", "Kete Krachi", "Nkwanta"],
  savannah: ["Damongo", "Bole", "Salaga", "Buipe"],
  "upper-east": ["Bolgatanga", "Navrongo", "Paga", "Bawku"],
  "upper-west": ["Wa", "Lawra", "Tumu", "Jirapa"],
  volta: ["Ho", "Hohoe", "Wli", "Tafi Atome", "Keta"],
  western: ["Takoradi", "Sekondi", "Axim", "Elubo", "Busua"],
  "western-north": ["Sefwi Wiawso", "Bibiani", "Enchi", "Juaboso"],
};

export const CUSTOM_CITY_VALUE = "__custom__";

export function getCitiesForRegion(regionId) {
  if (!regionId) return [];
  return GHANA_TOURIST_CITIES[regionId] || [];
}

export function getRegionLabel(regionId) {
  return GHANA_REGIONS.find((r) => r.id === regionId)?.label || "";
}

export function buildGhanaLocationLabel({ region, city, cityIsCustom, customCity }) {
  const regionLabel = getRegionLabel(region);
  const cityName = cityIsCustom ? String(customCity || "").trim() : city;
  if (cityName && regionLabel) return `${cityName}, ${regionLabel}`;
  return cityName || regionLabel || "";
}
