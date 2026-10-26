/**
 * Copy the published sitemap into dist/ after a build, byte for byte.
 * Vite has already copied the committed public/ sitemaps, which can be older
 * than production. Hosting deploys must publish the live files instead.
 */
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { fetchSitemapBody } from "./lib/fetch-sitemap.js";
import { childSitemapRefs, LIVE_SITEMAP_INDEX } from "./lib/sitemap-xml.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEB_ROOT = path.resolve(__dirname, "../..");

/**
 * @param {string} distDir
 * @param {string} relPath
 */
function destinationFor(distDir, relPath) {
  const sitemapsDir = path.resolve(distDir, "sitemaps");
  const dest = path.resolve(distDir, relPath);
  if (relPath === "sitemap.xml") return path.resolve(distDir, "sitemap.xml");
  if (!dest.startsWith(`${sitemapsDir}${path.sep}`)) {
    throw new Error(`Refusing to write sitemap outside dist/sitemaps: ${relPath}`);
  }
  return dest;
}

/**
 * @param {object} [options]
 * @param {string} [options.distDir]
 * @param {string} [options.liveIndexUrl]
 * @param {typeof fetch} [options.fetchImpl]
 * @param {(message: string) => void} [options.log]
 */
export async function syncLiveSitemaps(options = {}) {
  const log = options.log || console.log;
  const distDir = options.distDir || path.resolve(WEB_ROOT, "dist");
  const liveIndexUrl = options.liveIndexUrl || LIVE_SITEMAP_INDEX;
  const fetchImpl = options.fetchImpl || globalThis.fetch;

  const indexBody = await fetchSitemapBody(liveIndexUrl, fetchImpl);
  const refs = childSitemapRefs(indexBody.toString("utf8"));
  if (!refs.length) {
    throw new Error(`no child sitemaps listed in ${liveIndexUrl}`);
  }

  /** @type {{ relPath: string, body: Buffer }[]} */
  const files = [{ relPath: "sitemap.xml", body: indexBody }];
  for (const ref of refs) {
    files.push({
      relPath: ref.relPath,
      body: await fetchSitemapBody(ref.url, fetchImpl),
    });
  }

  mkdirSync(path.join(distDir, "sitemaps"), { recursive: true });
  for (const file of files) {
    const dest = destinationFor(distDir, file.relPath);
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, file.body);
    log(`Wrote dist/${file.relPath} (${file.body.length} bytes)`);
  }

  const keep = new Set(refs.map((ref) => ref.filename));
  const sitemapsDir = path.join(distDir, "sitemaps");
  if (existsSync(sitemapsDir)) {
    for (const name of readdirSync(sitemapsDir)) {
      if (!name.endsWith(".xml") || keep.has(name)) continue;
      unlinkSync(path.join(sitemapsDir, name));
      log(`Removed dist/sitemaps/${name} (not in the live index)`);
    }
  }

  log(`Synced live sitemap into dist (${refs.length} child sitemaps).`);
  return { childCount: refs.length };
}

function isMainModule() {
  const entry = process.argv[1];
  if (!entry) return false;
  return pathToFileURL(path.resolve(entry)).href === import.meta.url;
}

if (isMainModule()) {
  syncLiveSitemaps().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`sync:sitemap-live failed: ${message}`);
    process.exitCode = 1;
  });
}
