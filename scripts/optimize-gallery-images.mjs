/**
 * Converts gallery HEIC/JPG sources into optimized WebP + PNG for the landing page.
 * Run: npm run optimize:gallery
 */
import fs from "node:fs/promises";
import path from "node:path";
import convert from "heic-convert";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd());
const GALLERY_DIR = path.join(ROOT, "public/images/gallery");
const OUT_DIR = path.join(GALLERY_DIR, "optimized");

/** 16:10 spotlight — retina-friendly without oversized payloads */
const WIDTH = 1280;
const HEIGHT = 800;
const WEBP_QUALITY = 82;
const PNG_COLORS = 256;

/** Destination slug → source filename in public/images/gallery */
const SOURCE_MAP = {
  "accra-city-tour": "31E5578C-917D-4B52-A851-DAB9BC540C6C.JPG",
  "cape-coast-castle": "1F5DCFCD-B185-4B5F-B77D-85EA3A80ED74.JPG",
  "elmina-castle": "IMG_0686.HEIC",
  "kakum-national-park": "IMG_0689.HEIC",
  "akosombo-boat-cruise": "IMG_1441.HEIC",
  "aburi-botanical-gardens": "IMG_1444.HEIC",
  "wli-waterfalls": "IMG_1570.HEIC",
  "boti-falls": "IMG_1571.HEIC",
  "shai-hills": "IMG_1594.HEIC",
  "ada-foah": "IMG_1711.HEIC",
  "nzulezu-stilt-village": "IMG_1875.HEIC",
  "mole-national-park": "IMG_1878.HEIC",
  "kumasi-cultural-tour": "IMG_2326.HEIC",
  "volta-region-adventure": "IMG_2336.HEIC",
  "tafi-atome-monkey-sanctuary": "IMG_4383.HEIC",
};

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function loadImageBuffer(sourceFile) {
  const inputPath = path.join(GALLERY_DIR, sourceFile);
  const ext = path.extname(sourceFile).toLowerCase();

  if (ext === ".heic" || ext === ".heif") {
    const input = await fs.readFile(inputPath);
    return convert({ buffer: input, format: "JPEG", quality: 0.92 });
  }

  return fs.readFile(inputPath);
}

async function optimizeOne(slug, sourceFile) {
  const webpPath = path.join(OUT_DIR, `${slug}.webp`);
  const pngPath = path.join(OUT_DIR, `${slug}.png`);

  const inputBuffer = await loadImageBuffer(sourceFile);
  const pipeline = sharp(inputBuffer, { unlimited: true, failOn: "none" })
    .rotate()
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" });

  await pipeline.clone().webp({ quality: WEBP_QUALITY, effort: 4 }).toFile(webpPath);
  await pipeline
    .clone()
    .png({ compressionLevel: 9, palette: true, colors: PNG_COLORS, effort: 10 })
    .toFile(pngPath);

  const [webpStat, pngStat] = await Promise.all([fs.stat(webpPath), fs.stat(pngPath)]);

  return {
    slug,
    source: sourceFile,
    webp: formatBytes(webpStat.size),
    png: formatBytes(pngStat.size),
  };
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const results = [];
  let failed = 0;

  for (const [slug, sourceFile] of Object.entries(SOURCE_MAP)) {
    try {
      const result = await optimizeOne(slug, sourceFile);
      results.push(result);
      console.log(`✓ ${slug}: webp ${result.webp}, png ${result.png}`);
    } catch (err) {
      failed += 1;
      console.error(`✗ ${slug} (${sourceFile}):`, err.message);
    }
  }

  const manifest = Object.fromEntries(
    Object.keys(SOURCE_MAP).map((slug) => [
      slug,
      {
        webp: `/images/gallery/optimized/${slug}.webp`,
        png: `/images/gallery/optimized/${slug}.png`,
      },
    ]),
  );

  await fs.writeFile(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`\nOptimized ${results.length}/${Object.keys(SOURCE_MAP).length} images → public/images/gallery/optimized/`);

  await optimizeHero();
  console.log("✓ hero: webp + png for landing banner");

  if (failed > 0) process.exitCode = 1;
}

async function optimizeHero() {
  const sourceJpg = path.join(GALLERY_DIR, "31E5578C-917D-4B52-A851-DAB9BC540C6C.JPG");
  const fallbackWebp = path.join(OUT_DIR, "accra-city-tour.webp");
  let input = sourceJpg;

  try {
    await fs.access(sourceJpg);
  } catch {
    input = fallbackWebp;
  }

  const pipeline = sharp(input, { unlimited: true, failOn: "none" })
    .rotate()
    .resize(1920, 900, { fit: "cover", position: "centre" });

  await pipeline.clone().webp({ quality: 84, effort: 4 }).toFile(path.join(OUT_DIR, "hero.webp"));
  await pipeline
    .clone()
    .png({ compressionLevel: 9, palette: true, colors: 256, effort: 10 })
    .toFile(path.join(OUT_DIR, "hero.png"));
}

main();
