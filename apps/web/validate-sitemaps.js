/**
 * Validates sitemap index + child urlsets (structure, counts, limits).
 * Usage: node validate-sitemaps.js [publicDir]
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, process.argv[2] || "public");
const sitemapsDir = path.join(publicDir, "sitemaps");
const indexPath = path.join(publicDir, "sitemap.xml");

const MAX_URLS_PER_SITEMAP = 50000;
const MAX_SITEMAP_BYTES = 50 * 1024 * 1024;
const MAX_LOC_LENGTH = 2048;
const SITE_ORIGIN = "https://flashmovies.xyz";

/** @type {string[]} */
const errors = [];
/** @type {string[]} */
const warnings = [];

function err(msg) {
  errors.push(msg);
}

function warn(msg) {
  warnings.push(msg);
}

/**
 * @param {string} xml
 * @param {string} label
 */
function basicXmlChecks(xml, label) {
  if (!xml.startsWith("<?xml")) {
    err(`${label}: missing XML declaration`);
  }
  if (xml.includes("\0")) {
    err(`${label}: contains null bytes`);
  }
}

/**
 * @param {string} xml
 * @param {string} filePath
 */
function validateUrlset(xml, filePath) {
  basicXmlChecks(xml, path.basename(filePath));

  if (!/<urlset[\s>]/.test(xml)) {
    err(`${filePath}: missing <urlset> root`);
  }
  if (!xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
    warn(`${filePath}: missing standard sitemap xmlns`);
  }
  if (!/<\/urlset>\s*$/.test(xml)) {
    err(`${filePath}: missing closing </urlset>`);
  }

  const locMatches = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)];
  const locs = new Set();

  for (const match of locMatches) {
    const loc = match[1].trim();
    if (!loc) {
      err(`${filePath}: empty <loc>`);
      continue;
    }
    if (loc.length > MAX_LOC_LENGTH) {
      err(`${filePath}: loc too long (${loc.length} chars)`);
    }
    if (!loc.startsWith(`${SITE_ORIGIN}/`)) {
      warn(`${filePath}: loc off-domain — ${loc.slice(0, 80)}`);
    }
    if (loc.includes("&") && !loc.includes("&amp;")) {
      err(`${filePath}: unescaped & in loc — ${loc.slice(0, 100)}`);
    }
    if (locs.has(loc)) {
      err(`${filePath}: duplicate loc — ${loc}`);
    }
    locs.add(loc);
  }

  const openUrl = (xml.match(/<url>/g) || []).length;
  const closeUrl = (xml.match(/<\/url>/g) || []).length;
  if (openUrl !== closeUrl) {
    err(`${filePath}: mismatched <url> tags (${openUrl} open, ${closeUrl} close)`);
  }
  if (openUrl !== locMatches.length) {
    err(`${filePath}: ${openUrl} <url> blocks but ${locMatches.length} <loc> tags`);
  }

  const count = locMatches.length;
  if (count > MAX_URLS_PER_SITEMAP) {
    err(`${filePath}: ${count} URLs exceeds ${MAX_URLS_PER_SITEMAP} limit`);
  }

  const bytes = statSync(filePath).size;
  if (bytes > MAX_SITEMAP_BYTES) {
    err(`${filePath}: ${bytes} bytes exceeds 50MB limit`);
  }

  return { count, locs };
}

function validateIndex(xml) {
  basicXmlChecks(xml, "sitemap.xml");

  if (!/<sitemapindex[\s>]/.test(xml)) {
    err("sitemap.xml: root must be <sitemapindex>");
  }
  if (!/<\/sitemapindex>\s*$/.test(xml)) {
    err("sitemap.xml: missing closing </sitemapindex>");
  }

  return [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1].trim());
}

function main() {
  const indexXml = readFileSync(indexPath, "utf8");
  const indexedLocs = validateIndex(indexXml);
  const expectedBase = `${SITE_ORIGIN}/sitemaps/`;

  for (const loc of indexedLocs) {
    if (!loc.startsWith(expectedBase)) {
      warn(`sitemap.xml: child not under /sitemaps/ — ${loc}`);
    }
  }

  const diskFiles = readdirSync(sitemapsDir)
    .filter((f) => f.endsWith(".xml"))
    .sort();
  const indexedFiles = indexedLocs.map((loc) => loc.replace(expectedBase, ""));

  for (const file of diskFiles) {
    if (!indexedFiles.includes(file)) {
      err(`sitemaps/${file} on disk but missing from sitemap.xml index`);
    }
  }
  for (const file of indexedFiles) {
    if (file && !diskFiles.includes(file)) {
      err(`sitemap.xml references missing file sitemaps/${file}`);
    }
  }

  /** @type {Record<string, number>} */
  const counts = {};
  /** @type {Set<string>} */
  const allLocs = new Set();
  let totalUrls = 0;

  for (const file of diskFiles) {
    const filePath = path.join(sitemapsDir, file);
    const xml = readFileSync(filePath, "utf8");
    const { count, locs } = validateUrlset(xml, filePath);
    counts[file] = count;
    totalUrls += count;

    for (const loc of locs) {
      if (allLocs.has(loc)) {
        err(`Cross-file duplicate loc: ${loc}`);
      }
      allLocs.add(loc);
    }
  }

  const robotsPath = path.join(publicDir, "robots.txt");
  try {
    const robots = readFileSync(robotsPath, "utf8");
    if (!robots.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`)) {
      warn("robots.txt does not reference main sitemap.xml");
    }
  } catch {
    warn("robots.txt not found");
  }

  printReport({
    indexedLocs: indexedLocs.length,
    diskFiles: diskFiles.length,
    counts,
    totalUrls,
    uniqueUrls: allLocs.size,
  });

  process.exit(errors.length ? 1 : 0);
}

/**
 * @param {object} summary
 */
function printReport(summary) {
  console.log("\n=== Sitemap validation ===\n");
  console.log(`Index entries: ${summary.indexedLocs}`);
  console.log(`Child files:   ${summary.diskFiles}`);
  console.log(`Total URLs:    ${summary.totalUrls}`);
  console.log(`Unique URLs:   ${summary.uniqueUrls}`);
  console.log("");

  for (const [file, n] of Object.entries(summary.counts).sort()) {
    const mb = (statSync(path.join(sitemapsDir, file)).size / (1024 * 1024)).toFixed(2);
    console.log(`  ${file}: ${n} URLs (${mb} MB)`);
  }
  console.log("");

  if (warnings.length) {
    console.log(`Warnings (${warnings.length}):`);
    warnings.forEach((w) => console.log(`  ⚠️  ${w}`));
    console.log("");
  }

  if (errors.length) {
    console.log(`Errors (${errors.length}):`);
    errors.forEach((e) => console.log(`  ❌ ${e}`));
    console.log("\nResult: FAIL\n");
  } else {
    console.log("Result: PASS — structure valid for Google/Bing sitemap protocol.\n");
  }
}

main();
