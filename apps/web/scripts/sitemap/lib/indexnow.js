import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const INDEXNOW_HOST = "flashmovies.xyz";
/** IndexNow rejects a urlList longer than this. */
export const INDEXNOW_BATCH_LIMIT = 10000;

const KEY_FILENAME = /^[A-Za-z0-9-]{8,128}\.txt$/;
const TRUTHY = new Set(["1", "true", "yes"]);

/**
 * @param {string | undefined} value
 */
export function isTruthyEnv(value) {
  return TRUTHY.has(String(value || "").trim().toLowerCase());
}

/**
 * Dry-run and skip are the same switch: log the batches, do not POST.
 * @param {NodeJS.ProcessEnv} [env]
 */
export function isIndexNowDryRun(env = process.env) {
  return isTruthyEnv(env.INDEXNOW_DRY_RUN) || isTruthyEnv(env.INDEXNOW_SKIP);
}

/**
 * @param {string} value
 */
export function decodeXmlEntities(value) {
  return String(value)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 * Page URLs from a sitemap urlset. Sitemap index files contribute nothing.
 * @param {string} xml
 * @returns {string[]}
 */
export function extractUrlsetLocs(xml) {
  if (!/<urlset[\s>]/.test(xml)) return [];
  const locs = [];
  for (const match of xml.matchAll(/<loc>([^<]*)<\/loc>/g)) {
    const loc = decodeXmlEntities(match[1].trim());
    if (loc) locs.push(loc);
  }
  return locs;
}

/**
 * @param {string} loc
 * @param {string} [host]
 */
export function isHostUrl(loc, host = INDEXNOW_HOST) {
  try {
    const url = new URL(loc);
    return url.protocol === "https:" && url.hostname === host;
  } catch {
    return false;
  }
}

/**
 * @param {string[]} urls
 * @param {number} [limit]
 * @returns {string[][]}
 */
export function batchUrls(urls, limit = INDEXNOW_BATCH_LIMIT) {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("IndexNow batch limit must be a positive integer");
  }
  const batches = [];
  for (let index = 0; index < urls.length; index += limit) {
    batches.push(urls.slice(index, index + limit));
  }
  return batches;
}

/**
 * The key file in `public/` is the source of truth. Its body is the key
 * and nothing else, and the filename is `<key>.txt`.
 * @param {string} publicDir
 */
export function loadIndexNowKey(publicDir) {
  let names;
  try {
    names = readdirSync(publicDir)
      .filter((name) => KEY_FILENAME.test(name))
      .sort();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`expected one IndexNow key file in ${publicDir} (${message})`);
  }
  if (names.length !== 1) {
    throw new Error(
      `expected one IndexNow key file in ${publicDir}, found ${names.length}`,
    );
  }
  const filename = names[0];
  const key = filename.slice(0, -4);
  const body = readFileSync(path.join(publicDir, filename), "utf8");
  if (body !== key) {
    throw new Error(
      `${filename} must contain only the key (no whitespace or extra lines)`,
    );
  }
  return {
    key,
    filename,
    keyLocation: `https://${INDEXNOW_HOST}/${filename}`,
  };
}

/**
 * Child sitemap page URLs, de-duplicated, host-filtered. Does not rewrite
 * sitemap files.
 * @param {string} publicDir
 * @param {(message: string) => void} [warn]
 */
export function collectSitemapUrls(publicDir, warn = console.error) {
  const sitemapsDir = path.join(publicDir, "sitemaps");
  const files = readdirSync(sitemapsDir)
    .filter((name) => name.endsWith(".xml"))
    .sort();
  /** @type {string[]} */
  const urls = [];
  const seen = new Set();
  let skipped = 0;

  for (const file of files) {
    const xml = readFileSync(path.join(sitemapsDir, file), "utf8");
    for (const loc of extractUrlsetLocs(xml)) {
      if (!isHostUrl(loc)) {
        skipped += 1;
        continue;
      }
      if (seen.has(loc)) continue;
      seen.add(loc);
      urls.push(loc);
    }
  }

  if (skipped > 0) {
    warn(`IndexNow skipped ${skipped} sitemap locs outside https://${INDEXNOW_HOST}`);
  }
  return urls;
}

/**
 * @param {string} key
 * @param {string[]} urlList
 */
export function indexNowPayload(key, urlList) {
  return {
    host: INDEXNOW_HOST,
    key,
    keyLocation: `https://${INDEXNOW_HOST}/${key}.txt`,
    urlList,
  };
}

/**
 * POST each batch. Network and HTTP errors are captured, not thrown.
 * @param {object} options
 * @param {string} options.key
 * @param {string[]} options.urls
 * @param {typeof fetch} [options.fetchImpl]
 * @param {(message: string) => void} [options.log]
 * @param {(message: string) => void} [options.warn]
 * @param {boolean} [options.dryRun]
 */
export async function submitIndexNowBatches(options) {
  const log = options.log || console.log;
  const warn = options.warn || console.error;
  const fetchImpl = options.fetchImpl || fetch;
  const dryRun = Boolean(options.dryRun);
  const batches = batchUrls(options.urls);
  /** @type {object[]} */
  const results = [];

  if (batches.length === 0) {
    log("IndexNow: no sitemap URLs to submit");
    return { ok: true, dryRun, submitted: 0, batches: 0, results };
  }

  for (let index = 0; index < batches.length; index += 1) {
    const urlList = batches[index];
    const label = `batch ${index + 1}/${batches.length} (${urlList.length} URLs)`;
    if (dryRun) {
      log(`IndexNow dry run: skip POST ${label}`);
      results.push({ ok: true, dryRun: true, count: urlList.length });
      continue;
    }

    try {
      const response = await fetchImpl(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(indexNowPayload(options.key, urlList)),
      });
      const body = await response.text();
      const accepted = response.status === 200 || response.status === 202;
      if (accepted) {
        log(`IndexNow accepted ${label} (HTTP ${response.status})`);
      } else {
        warn(
          `IndexNow rejected ${label} (HTTP ${response.status}): ${body.slice(0, 300)}`,
        );
      }
      results.push({
        ok: accepted,
        status: response.status,
        count: urlList.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      warn(`IndexNow error ${label}: ${message}`);
      results.push({ ok: false, error: message, count: urlList.length });
    }
  }

  return {
    ok: results.every((result) => result.ok),
    dryRun,
    submitted: results.reduce((sum, result) => sum + result.count, 0),
    batches: results.length,
    results,
  };
}

/**
 * Read the key and sitemap URLs, then submit. Always resolves.
 * @param {object} [options]
 * @param {string} [options.publicDir]
 * @param {string[]} [options.urls]
 * @param {boolean} [options.dryRun]
 * @param {NodeJS.ProcessEnv} [options.env]
 * @param {typeof fetch} [options.fetchImpl]
 * @param {(message: string) => void} [options.log]
 * @param {(message: string) => void} [options.warn]
 */
export async function notifyIndexNow(options = {}) {
  const log = options.log || console.log;
  const warn = options.warn || console.error;
  const dryRun = options.dryRun ?? isIndexNowDryRun(options.env);
  const publicDir =
    options.publicDir || path.resolve(__dirname, "../../../public");

  try {
    const { key, keyLocation } = loadIndexNowKey(publicDir);
    const urls = options.urls || collectSitemapUrls(publicDir, warn);
    log(
      `IndexNow: ${urls.length} URLs, host ${INDEXNOW_HOST}, keyLocation ${keyLocation}`,
    );
    return await submitIndexNowBatches({
      key,
      urls,
      fetchImpl: options.fetchImpl,
      log,
      warn,
      dryRun,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    warn(`IndexNow failed (sitemap deploy still succeeds): ${message}`);
    return {
      ok: false,
      dryRun,
      submitted: 0,
      batches: 0,
      results: [],
      error: message,
    };
  }
}
