import fs from "node:fs/promises";
import path from "node:path";

const UA = "360ToursGhana/1.0 (https://360toursghana.com; gallery setup)";
const OUT_DIR = path.resolve("public/images/gallery/optimized");

const DESTINATIONS = {
  accraCityTour: ["Jamestown_Lighthouse,_Accra.jpg", "Black_Star_Square,_Accra.jpg"],
  capeCoastCastle: ["Cape_Coast_Castle,_Ghana.jpg"],
  elminaCastle: ["Elmina_Castle.jpg"],
  kakumNationalPark: ["Kakum_National_Park_Canopy_Walkway.jpg"],
  akosomboBoatCruise: ["Lake_Volta,_Ghana.jpg", "Akosombo_Dam,_Ghana.jpg"],
  aburiBotanicalGardens: ["Aburi_Botanical_Gardens.jpg"],
  wliWaterfalls: ["Wli_Waterfalls,_Ghana.jpg", "Wli_falls.jpg"],
  botiFalls: ["Boti_Falls,_Ghana.jpg", "Boti_Falls.jpg"],
  shaiHills: ["Shai_Hills_Resource_Reserve.jpg", "Shai_Hills.jpg"],
  adaFoah: ["Ada,_Ghana.jpg", "Ada_Foah.jpg"],
  nzulezuStiltVillage: ["Nzulezu.jpg", "Nzulezu,_Ghana.jpg"],
  moleNationalPark: ["Mole_National_Park.jpg", "Elephants_at_Mole_National_Park.jpg"],
  kumasiCulturalTour: ["Manhyia_Palace,_Kumasi.jpg", "Manhyia_Palace.jpg"],
  voltaRegionAdventure: ["Afadjato.jpg", "Tagbo_Falls.jpg", "Mount_Afadja.jpg"],
  tafiAtomeMonkeySanctuary: ["Mona_monkey.jpg", "Tafi_Atome_Monkey_Sanctuary.jpg"],
};

const SLUGS = {
  accraCityTour: "accra-city-tour",
  capeCoastCastle: "cape-coast-castle",
  elminaCastle: "elmina-castle",
  kakumNationalPark: "kakum-national-park",
  akosomboBoatCruise: "akosombo-boat-cruise",
  aburiBotanicalGardens: "aburi-botanical-gardens",
  wliWaterfalls: "wli-waterfalls",
  botiFalls: "boti-falls",
  shaiHills: "shai-hills",
  adaFoah: "ada-foah",
  nzulezuStiltVillage: "nzulezu-stilt-village",
  moleNationalPark: "mole-national-park",
  kumasiCulturalTour: "kumasi-cultural-tour",
  voltaRegionAdventure: "volta-region-adventure",
  tafiAtomeMonkeySanctuary: "tafi-atome-monkey-sanctuary",
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveThumb(fileName) {
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}` +
    "&prop=imageinfo&iiprop=url&iiurlwidth=1280&format=json";
  const response = await fetch(api, { headers: { "User-Agent": UA } });
  const json = await response.json();
  const page = Object.values(json.query?.pages ?? {})[0];
  return page?.imageinfo?.[0]?.thumburl ?? page?.imageinfo?.[0]?.url ?? null;
}

async function resolveDestination(key, candidates) {
  for (const candidate of candidates) {
    await sleep(1200);
    const url = await resolveThumb(candidate);
    if (url) return { key, url, source: candidate };
  }
  return { key, url: null, source: null };
}

async function download(url, filePath) {
  const response = await fetch(url, { headers: { "User-Agent": UA } });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(filePath, buffer);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const manifest = {};

  for (const [key, candidates] of Object.entries(DESTINATIONS)) {
    const slug = SLUGS[key];
    const resolved = await resolveDestination(key, candidates);
    if (!resolved.url) {
      console.warn(`SKIP ${key}: no Wikimedia match`);
      continue;
    }

    const pngPath = path.join(OUT_DIR, `${slug}.png`);
    const webpPath = path.join(OUT_DIR, `${slug}.webp`);
    await download(resolved.url.split("?")[0], pngPath);
    await fs.copyFile(pngPath, webpPath);
    manifest[slug] = {
      webp: `/images/gallery/optimized/${slug}.webp`,
      png: `/images/gallery/optimized/${slug}.png`,
      source: resolved.source,
    };
    console.log(`OK ${key} <= ${resolved.source}`);
  }

  await fs.writeFile(path.join(OUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
