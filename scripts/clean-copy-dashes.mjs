/**
 * Removes em/en dashes from quoted copy only (safe for JS/JSX source).
 * Run: node scripts/clean-copy-dashes.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "src");

const FILES = [
  "data/homeContent.js",
  "data/aboutContent.js",
  "data/brandContent.js",
  "data/storiesContent.js",
  "data/toursData.js",
  "utils/landingCmsStorage.js",
  "pages/guest/ExperiencesPage.jsx",
  "pages/guest/WhyUsPage.jsx",
  "pages/guest/TourBookingPage.jsx",
  "pages/guest/ToursPage.jsx",
  "pages/guest/PaymentSuccessPage.jsx",
  "pages/guest/ContactPage.jsx",
  "components/tours/TourBookingFlow.jsx",
  "components/payments/PaymentRegionNotice.jsx",
  "components/home/HomeHubs.jsx",
  "components/home/HomeDestinations.jsx",
  "components/home/HomeFeaturedTours.jsx",
];

function cleanStringLiteral(literal) {
  const quote = literal[0];
  let inner = literal.slice(1, -1);

  inner = inner
    .replace(/(\d+)\s*[–—]\s*(\d+)/g, "$1 to $2")
    .replace(/\s+[—–]\s+/g, ", ")
    .replace(/[—–]/g, ", ")
    .replace(/\bEnd-to-end\b/gi, "End to end")
    .replace(/\bvisa-on-arrival\b/gi, "visa on arrival")
    .replace(/\bbig-five\b/gi, "big five")
    .replace(/\bco-design\b/gi, "co design")
    .replace(/\bBo-Kaap\b/g, "Bo Kaap")
    .replace(/(\d+)-Day\b/g, "$1 Day")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ");

  return quote + inner + quote;
}

function cleanFileContent(content) {
  return content.replace(/(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g, (match) => {
    if (!/[—–]/.test(match) && !/\b\w+-\w+\b/.test(match)) return match;
    return cleanStringLiteral(match);
  });
}

for (const rel of FILES) {
  const filePath = path.join(ROOT, rel);
  if (!fs.existsSync(filePath)) continue;
  const original = fs.readFileSync(filePath, "utf8");
  const cleaned = cleanFileContent(original);
  if (cleaned !== original) {
    fs.writeFileSync(filePath, cleaned);
    console.log("✓", rel);
  }
}

console.log("Done.");
