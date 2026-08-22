/**
 * Builds every brand asset from public/images/logo-source.png:
 *   logo.png / logo-mark.png  → in-app logos
 *   seo/favicon-*, apple-touch-icon → browser + device icons
 *   seo/og-image.png → link preview card
 *
 * Run with: npm run brand:assets
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd());
const SOURCE = path.join(ROOT, "public/images/logo-source.png");
const IMAGES = path.join(ROOT, "public/images");
const SEO = path.join(IMAGES, "seo");

/** Ghana flag palette taken from the logo. */
const GHANA = {
  // Pure black so the tile matches the artwork field and leaves no visible seam.
  black: { r: 0, g: 0, b: 0 },
  red: "#CE1126",
  gold: "#FCD116",
  green: "#006B3F",
};

const OPAQUE_BLACK = { ...GHANA.black, alpha: 1 };
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

function roundedMask(size, radiusRatio) {
  const radius = Math.round(size * radiusRatio);
  return Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`,
  );
}

function circleMask(size) {
  return Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  );
}

/** Strips the flat black padding around the artwork so the emblem fills the frame. */
async function readEmblem() {
  const trimmed = await sharp(SOURCE).trim({ threshold: 18 }).png().toBuffer();
  const { width, height } = await sharp(trimmed).metadata();
  const side = Math.max(width, height);

  return sharp({
    create: { width: side, height: side, channels: 4, background: TRANSPARENT },
  })
    .composite([{ input: trimmed, gravity: "centre" }])
    .png()
    .toBuffer();
}

/** Black rounded tile with the emblem centred — the primary app logo. */
async function buildTile(emblem, size, { radiusRatio = 0.22, padding = 0.12 } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const artwork = await sharp(emblem).resize(inner, inner, { fit: "contain", background: TRANSPARENT }).png().toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: OPAQUE_BLACK },
  })
    .composite([
      { input: artwork, gravity: "centre" },
      { input: roundedMask(size, radiusRatio), blend: "dest-in" },
    ])
    .png()
    .toBuffer();
}

/** The Ghana flag roundel on its own — reads clearly at favicon sizes. */
async function buildMark(emblem, size) {
  const { width } = await sharp(emblem).metadata();
  const crop = Math.round(width * 0.48);
  const offset = Math.round((width - crop) / 2);

  const roundel = await sharp(emblem)
    .extract({ left: offset, top: offset, width: crop, height: crop })
    .resize(size, size, { fit: "cover" })
    .png()
    .toBuffer();

  return sharp(roundel)
    .composite([{ input: circleMask(size), blend: "dest-in" }])
    .png()
    .toBuffer();
}

/** 1200x630 share card: black field, kente stripe, emblem and wordmark. */
async function buildOgImage(emblem) {
  const width = 1200;
  const height = 630;
  const artwork = await sharp(emblem).resize(300, 300, { fit: "contain", background: TRANSPARENT }).png().toBuffer();

  const overlay = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${GHANA.green}" stop-opacity="0.32"/>
          <stop offset="55%" stop-color="#0C0C0C" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#glow)"/>
      <g>
        <rect x="0" y="0" width="${width}" height="10" fill="${GHANA.red}"/>
        <rect x="0" y="10" width="${width}" height="10" fill="${GHANA.gold}"/>
        <rect x="0" y="20" width="${width}" height="10" fill="${GHANA.green}"/>
        <rect x="0" y="${height - 30}" width="${width}" height="10" fill="${GHANA.green}"/>
        <rect x="0" y="${height - 20}" width="${width}" height="10" fill="${GHANA.gold}"/>
        <rect x="0" y="${height - 10}" width="${width}" height="10" fill="${GHANA.red}"/>
      </g>
      <text x="470" y="268" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="700" fill="${GHANA.gold}" letter-spacing="6">360 TOURS GHANA</text>
      <text x="470" y="336" font-family="Helvetica, Arial, sans-serif" font-size="52" font-weight="700" fill="#FFFFFF">Discover Africa.</text>
      <text x="470" y="396" font-family="Helvetica, Arial, sans-serif" font-size="52" font-weight="700" fill="#FFFFFF">Travel Without Limits.</text>
      <text x="470" y="452" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#CFC9BE">Guided tours · Stays · Transport across Ghana</text>
    </svg>
  `);

  return sharp({
    create: { width, height, channels: 4, background: OPAQUE_BLACK },
  })
    .composite([
      { input: overlay, top: 0, left: 0 },
      { input: artwork, top: 165, left: 120 },
    ])
    .png()
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error("Missing brand source artwork at public/images/logo-source.png");
    process.exit(1);
  }

  fs.mkdirSync(SEO, { recursive: true });

  const emblem = await readEmblem();

  await fs.promises.writeFile(path.join(IMAGES, "logo.png"), await buildTile(emblem, 1024));
  await fs.promises.writeFile(path.join(IMAGES, "logo-mark.png"), await buildMark(emblem, 512));

  await fs.promises.writeFile(path.join(SEO, "favicon-32x32.png"), await buildTile(emblem, 32, { radiusRatio: 0.24, padding: 0.06 }));
  await fs.promises.writeFile(path.join(SEO, "favicon-192x192.png"), await buildTile(emblem, 192, { radiusRatio: 0.24, padding: 0.08 }));
  await fs.promises.writeFile(path.join(SEO, "apple-touch-icon.png"), await buildTile(emblem, 180, { radiusRatio: 0.2, padding: 0.1 }));
  await fs.promises.writeFile(path.join(SEO, "og-image.png"), await buildOgImage(emblem));

  console.log("Brand assets written to public/images and public/images/seo");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
