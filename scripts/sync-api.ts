// Sync check: installed astro-ascendant exports vs curated api-reference pages.
// Curated MDX stays the source of truth; this script only reports drift.
// Usage: bun run scripts/sync-api.ts [--check]
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const docsRoot = join(import.meta.dir, "..");
const require = createRequire(join(docsRoot, "package.json"));
const pkg = require("astro-ascendant/package.json") as {
  version: string;
  exports: Record<string, unknown>;
};
// Map package subpaths to curated doc pages (without extension).
const SUBPATH_TO_PAGE: Record<string, string> = {
  ".": "index",
  "./chart": "chart",
  "./chart/divisional-mapping": "chart",
  "./astro-params": "astro-params",
  "./ephemeris": "ephemeris",
  "./swisseph": "swisseph",
  "./dasha": "dasha",
  "./dasha/chara": "dasha",
  "./dasha/sthira": "dasha",
  "./dasha/vimshottari": "dasha",
  "./transit": "transit",
  "./sav": "sav",
  "./argala": "jaimini",
  "./arudha-pada": "jaimini",
  "./chara-karakas": "jaimini",
  "./karakamsha": "jaimini",
  "./rashi-drishti": "jaimini",
  "./upapada": "jaimini",
  "./provenance": "provenance",
  "./package.json": "(skip)",
};

const subpaths = Object.keys(pkg.exports);
const missing = new Set<string>();
const rows: Array<{ subpath: string; page: string; exists: boolean }> = [];

for (const subpath of subpaths) {
  const page = SUBPATH_TO_PAGE[subpath] ?? "(unmapped)";
  if (page === "(skip)") continue;
  const docPath =
    page === "index"
      ? join(docsRoot, "content", "index.mdx")
      : join(docsRoot, "content", "api-reference", `${page}.mdx`);
  const documented = page.startsWith("(") ? false : existsSync(docPath);
  if (!documented) missing.add(subpath);
  rows.push({ subpath, page, exists: documented });
}

// Also verify meta.json lists every referenced page.
const metaPath = join(docsRoot, "content", "api-reference", "meta.json");
const meta = JSON.parse(readFileSync(metaPath, "utf8")) as { pages: string[] };
const unlisted = new Set(
  rows
    .filter((r) => r.exists && r.page !== "index" && !meta.pages.includes(r.page))
    .map((r) => r.page),
);

console.log(
  `astro-ascendant ${pkg.version}: ${rows.filter((r) => r.exists).length}/${rows.length} exports covered`,
);
for (const r of rows)
  console.log(`  ${r.exists ? "ok     " : "MISSING"} ${r.subpath} -> ${r.page}`);
if (unlisted.size > 0)
  console.log(`Pages present but not in meta.json: ${[...unlisted].join(", ")}`);

if (missing.size > 0) {
  console.log(`\nUndocumented exports: ${[...missing].join(", ")}`);
  if (process.argv.includes("--check")) process.exit(1);
} else {
  console.log("\nAll exports covered.");
}
