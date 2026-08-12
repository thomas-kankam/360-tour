/**
 * Replace em/en dashes in guest-facing JSX/JS (preserves code hyphens in class names).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "src");

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(js|jsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function clean(content) {
  return (
    content
      .replace(/\|\|\s*"—"/g, '|| "Not set"')
      .replace(/\|\|\s*'—'/g, "|| 'Not set'")
      .replace(/\{([^}]+)\}–\{([^}]+)\}/g, "{$1} to {$2}")
      .replace(/(\d+)–(\d+)/g, "$1 to $2")
      .replace(/\s[—–]\s/g, ", ")
      .replace(/[—–]/g, ", ")
      .replace(/,\s*,/g, ",")
  );
}

const dirs = [
  path.join(ROOT, "pages", "guest"),
  path.join(ROOT, "components", "home"),
  path.join(ROOT, "components", "tours", "TourBookingFlow.jsx"),
  path.join(ROOT, "components", "payments", "PaymentRegionNotice.jsx"),
];

const files = new Set();
for (const dir of dirs) {
  if (dir.endsWith(".jsx")) files.add(dir);
  else walk(dir, []).forEach((f) => files.add(f));
}

for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  const next = clean(original);
  if (next !== original) {
    fs.writeFileSync(file, next);
    console.log("✓", path.relative(ROOT, file));
  }
}

console.log("Done.");
