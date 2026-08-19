import fs from "node:fs";
import path from "node:path";

const cacheFile = path.join(process.cwd(), "node_modules", ".cache", ".eslintcache");

try {
  fs.rmSync(cacheFile, { force: true });
} catch {
  // Ignore missing cache during first install.
}
