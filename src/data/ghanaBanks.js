/** Licensed banks in Ghana, with common search names and SWIFT codes. */
export const GHANA_BANKS = [
  { id: "absa", name: "Absa Bank Ghana", swift: "BARCGHAC", aliases: ["Barclays"] },
  { id: "access", name: "Access Bank Ghana", swift: "ABNGGHAC", aliases: [] },
  { id: "adb", name: "Agricultural Development Bank", swift: "ADNTGHAC", aliases: ["ADB"] },
  { id: "boa", name: "Bank of Africa Ghana", swift: "AMAGGHAC", aliases: ["BOA"] },
  { id: "bog", name: "Bank of Ghana", swift: "BAGHGHAC", aliases: ["BoG"] },
  { id: "calbank", name: "CalBank", swift: "ACCCGHAC", aliases: ["CAL Bank"] },
  { id: "cbg", name: "Consolidated Bank Ghana", swift: "CBGHGHAC", aliases: ["CBG"] },
  { id: "ecobank", name: "Ecobank Ghana", swift: "ECOCGHAC", aliases: [] },
  { id: "fbn", name: "FBNBank Ghana", swift: "FBNGGHAC", aliases: ["First Bank", "FBN"] },
  { id: "fidelity", name: "Fidelity Bank Ghana", swift: "FBLIGHAC", aliases: [] },
  { id: "fab", name: "First Atlantic Bank", swift: "FAMCGHAC", aliases: ["FAB"] },
  { id: "fnb", name: "First National Bank Ghana", swift: "FIRNGHAC", aliases: ["FNB"] },
  { id: "gcb", name: "GCB Bank", swift: "GHCBGHAC", aliases: ["Ghana Commercial Bank"] },
  { id: "gtbank", name: "Guaranty Trust Bank Ghana", swift: "GTBIGHAC", aliases: ["GTBank", "GT Bank", "GTB"] },
  { id: "nib", name: "National Investment Bank", swift: "NIBGGHAC", aliases: ["NIB"] },
  { id: "omnibsic", name: "OmniBSIC Bank Ghana", swift: "OMNIGHAC", aliases: ["OmniBSIC", "BSIC", "Omni Bank"] },
  { id: "prudential", name: "Prudential Bank", swift: "PUBKGHAC", aliases: ["PBL"] },
  { id: "republic", name: "Republic Bank Ghana", swift: "HFCAGHAC", aliases: ["HFC"] },
  { id: "sg", name: "Societe Generale Ghana", swift: "SSEBGHAC", aliases: ["SG", "SocGen"] },
  { id: "stanbic", name: "Stanbic Bank Ghana", swift: "SBICGHAC", aliases: ["Standard Bank"] },
  { id: "scb", name: "Standard Chartered Bank Ghana", swift: "SCBLGHAC", aliases: ["Stanchart", "SCB"] },
  { id: "uba", name: "United Bank for Africa Ghana", swift: "STBGGHAC", aliases: ["UBA"] },
  { id: "zenith", name: "Zenith Bank Ghana", swift: "ZEBLGHAC", aliases: [] },
  { id: "arb", name: "ARB Apex Bank", swift: "AREXGHAC", aliases: ["Apex Bank", "Rural Bank"] },
];

export const INVOICE_CURRENCIES = ["GHS", "USD", "EUR", "GBP"];

export const MOBILE_MONEY_NETWORKS = ["MTN Mobile Money", "Telecel Cash", "AirtelTigo Money"];

export function findGhanaBank(name) {
  const needle = String(name || "").trim().toLowerCase();
  if (!needle) return null;
  return GHANA_BANKS.find((bank) => {
    const names = [bank.name, bank.swift, ...(bank.aliases || [])].map((value) => value.toLowerCase());
    return names.includes(needle);
  }) || null;
}

export function filterGhanaBanks(query) {
  const needle = String(query || "").trim().toLowerCase();
  if (!needle) return GHANA_BANKS;
  return GHANA_BANKS.filter((bank) => {
    const haystack = [bank.name, bank.swift, ...(bank.aliases || [])].join(" ").toLowerCase();
    return haystack.includes(needle);
  });
}
