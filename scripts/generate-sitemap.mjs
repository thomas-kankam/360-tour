/**
 * Fetches published tour slugs from the API and writes public/sitemap.xml at build time.
 * Run: npm run generate:sitemap
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const SITE = (process.env.REACT_APP_WEBSITE_URL || "https://360toursghana.com").replace(/\/+$/, "");
const API = (process.env.REACT_APP_API_URL || "https://api.360toursghana.com/api").replace(/\/+$/, "");

const STATIC_PATHS = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/tours", changefreq: "daily", priority: "0.9" },
  { loc: "/about", changefreq: "monthly", priority: "0.8" },
  { loc: "/why-us", changefreq: "monthly", priority: "0.7" },
  { loc: "/experiences", changefreq: "monthly", priority: "0.7" },
  { loc: "/stories", changefreq: "weekly", priority: "0.6" },
  { loc: "/contact", changefreq: "monthly", priority: "0.8" },
];

function urlNode(loc, lastmod, changefreq, priority) {
  let node = `  <url>\n    <loc>${loc}</loc>\n`;
  if (lastmod) node += `    <lastmod>${lastmod}</lastmod>\n`;
  node += `    <changefreq>${changefreq}</changefreq>\n`;
  node += `    <priority>${priority}</priority>\n`;
  node += "  </url>\n";
  return node;
}

async function fetchTourSlugs() {
  try {
    const response = await fetch(`${API}/sitemap.xml`, {
      headers: { Accept: "application/xml, application/json" },
    });
    if (!response.ok) return [];

    const xml = await response.text();
    const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
    return matches
      .map((match) => match[1])
      .filter((loc) => loc.includes("/tours/") && !loc.endsWith("/tours"))
      .map((loc) => ({ loc: loc.replace(SITE, ""), lastmod: null }));
  } catch {
    return [];
  }
}

function readStorySlugsFromSource() {
  try {
    const sourcePath = path.join(ROOT, "src", "data", "storiesContent.js");
    const source = fs.readFileSync(sourcePath, "utf8");
    return [...source.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
  } catch {
    return [];
  }
}

async function main() {
  const tourUrls = await fetchTourSlugs();
  const storySlugs = readStorySlugsFromSource();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const item of STATIC_PATHS) {
    xml += urlNode(`${SITE}${item.loc}`, null, item.changefreq, item.priority);
  }

  for (const item of tourUrls) {
    xml += urlNode(`${SITE}${item.loc}`, item.lastmod, "weekly", "0.8");
  }

  for (const slug of storySlugs) {
    xml += urlNode(`${SITE}/stories/${slug}`, null, "monthly", "0.7");
  }

  xml += "</urlset>\n";

  const outPath = path.join(ROOT, "public", "sitemap.xml");
  await fs.promises.writeFile(outPath, xml, "utf8");
  console.log(
    `Sitemap written to public/sitemap.xml (${STATIC_PATHS.length + tourUrls.length + storySlugs.length} URLs)`,
  );
}

main().catch((error) => {
  console.warn("Sitemap generation skipped:", error.message);
  process.exit(0);
});
