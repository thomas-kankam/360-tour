/**
 * Generates favicon sizes + social share image (og-image) from public/images/logo.png
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd());
const LOGO = path.join(ROOT, "public/images/logo.png");
const OUT = path.join(ROOT, "public/images/seo");

const BRAND_GREEN = { r: 45, g: 90, b: 71 };

async function main() {
  if (!fs.existsSync(LOGO)) {
    console.error("Missing logo at public/images/logo.png");
    process.exit(1);
  }

  fs.mkdirSync(OUT, { recursive: true });

  await sharp(LOGO).resize(32, 32, { fit: "contain", background: { ...BRAND_GREEN, alpha: 0 } }).png().toFile(path.join(OUT, "favicon-32x32.png"));
  await sharp(LOGO).resize(192, 192, { fit: "contain", background: { ...BRAND_GREEN, alpha: 0 } }).png().toFile(path.join(OUT, "favicon-192x192.png"));
  await sharp(LOGO).resize(180, 180, { fit: "contain", background: { ...BRAND_GREEN, alpha: 0 } }).png().toFile(path.join(OUT, "apple-touch-icon.png"));

  const ogWidth = 1200;
  const ogHeight = 630;
  const logoBuffer = await sharp(LOGO)
    .resize(420, 420, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: ogWidth,
      height: ogHeight,
      channels: 3,
      background: BRAND_GREEN,
    },
  })
    .composite([{ input: logoBuffer, gravity: "centre" }])
    .png()
    .toFile(path.join(OUT, "og-image.png"));

  console.log("SEO assets written to public/images/seo/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
