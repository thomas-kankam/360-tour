/**
 * Re-encode gallery optimized assets that were saved with wrong extensions (JPEG labeled as WebP).
 * Run: node scripts/fix-gallery-formats.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public/images/gallery/optimized");
const WIDTH = 1280;
const HEIGHT = 800;

async function fixOne(slug) {
  const webpPath = path.join(OUT_DIR, `${slug}.webp`);
  const pngPath = path.join(OUT_DIR, `${slug}.png`);
  const webpTmp = `${webpPath}.tmp`;
  const pngTmp = `${pngPath}.tmp`;

  const input = await fs.readFile(webpPath);
  const pipeline = sharp(input, { failOn: "none" })
    .rotate()
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" });

  await pipeline.clone().webp({ quality: 82, effort: 4 }).toFile(webpTmp);
  await pipeline
    .clone()
    .png({ compressionLevel: 9, palette: true, colors: 256, effort: 10 })
    .toFile(pngTmp);

  await fs.rename(webpTmp, webpPath);
  await fs.rename(pngTmp, pngPath);
  console.log(`Fixed ${slug}`);
}

const entries = await fs.readdir(OUT_DIR);
const slugs = entries.filter((name) => name.endsWith(".webp")).map((name) => name.replace(/\.webp$/, ""));

for (const slug of slugs) {
  await fixOne(slug);
}

console.log(`Done — ${slugs.length} gallery images re-encoded.`);
