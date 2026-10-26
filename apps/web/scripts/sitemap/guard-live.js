/**
 * Fail a hosting deploy when dist sitemaps would regress the live site.
 *
 * Compares https://flashmovies.xyz/sitemap.xml and each child sitemap to dist/.
 * Older max lastmod or fewer URLs refuses the deploy. A failed live fetch fails
 * closed. Set SITEMAP_GUARD_SKIP=1 to bypass.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { fetchSitemapBody } from "./lib/fetch-sitemap.js";
import {
  childSitemapRefs,
  LIVE_SITEMAP_INDEX,
  summarizeSitemap,
} from "./lib/sitemap-xml.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEB_ROOT = path.resolve(__dirname, "../..");

const TRUTHY = new Set(["1", "true", "yes"]);

/**
 * @param {NodeJS.ProcessEnv} [env]
 */
export function isSitemapGuardSkip(env = process.env) {
  return TRUTHY.has(String(env?.SITEMAP_GUARD_SKIP || "").trim().toLowerCase());
}

/**
 * @param {string} label
 * @param {{ urlCount: number, maxLastmod: string }} dist
 * @param {{ urlCount: number, maxLastmod: string }} live
 */
export function regressionReasons(label, dist, live) {
  const reasons = [];
  if (dist.urlCount < live.urlCount) {
    reasons.push(`${label}: ${dist.urlCount} URLs is fewer than live ${live.urlCount}`);
  }
  if (live.maxLastmod && (dist.maxLastmod || "") < live.maxLastmod) {
    reasons.push(
      `${label}: max lastmod ${dist.maxLastmod || "(none)"} is older than live ${live.maxLastmod}`,
    );
  }
  return reasons;
}

/**
 * @param {string[]} reasons
 * @param {string} [liveIndexUrl]
 */
export function guardFailureMessage(reasons, liveIndexUrl = LIVE_SITEMAP_INDEX) {
  return [
    "Sitemap guard refused this hosting deploy.",
    ...reasons,
    "",
    `dist/ sitemaps would regress ${liveIndexUrl}.`,
    "Run `npm run sync:sitemap-live` after the build to copy the live sitemap into dist/ unchanged.",
    "`npm run deploy` runs build, then sync:sitemap-live, then the hosting deploy.",
    "Set SITEMAP_GUARD_SKIP=1 to bypass this check.",
  ].join("\n");
}

/**
 * @param {Record<string, string | undefined>} distFiles
 * @param {Record<string, string | undefined>} liveFiles
 * @param {object} [options]
 * @param {Record<string, string>} [options.liveErrors]
 * @param {string} [options.liveIndexUrl]
 */
export function compareSitemapFiles(distFiles, liveFiles, options = {}) {
  const liveIndexUrl = options.liveIndexUrl || LIVE_SITEMAP_INDEX;
  const liveErrors = options.liveErrors || {};
  const reasons = [];
  const liveIndex = liveFiles["sitemap.xml"];
  const distIndex = distFiles["sitemap.xml"];

  if (!liveIndex) {
    reasons.push("live sitemap.xml is unavailable; failing closed");
  } else if (!distIndex) {
    reasons.push("dist/sitemap.xml is missing");
  } else {
    reasons.push(
      ...regressionReasons(
        "dist/sitemap.xml",
        summarizeSitemap(distIndex),
        summarizeSitemap(liveIndex),
      ),
    );
  }

  for (const child of childSitemapRefs(liveIndex || "")) {
    if (liveErrors[child.relPath]) {
      reasons.push(`dist/${child.relPath}: ${liveErrors[child.relPath]}`);
      continue;
    }
    const liveXml = liveFiles[child.relPath];
    if (!liveXml) {
      reasons.push(`dist/${child.relPath}: live sitemap could not be read; failing closed`);
      continue;
    }
    const distXml = distFiles[child.relPath];
    if (!distXml) {
      const liveStats = summarizeSitemap(liveXml);
      reasons.push(
        `dist/${child.relPath}: missing from dist (live has ${liveStats.urlCount} URLs)`,
      );
      continue;
    }
    reasons.push(
      ...regressionReasons(
        `dist/${child.relPath}`,
        summarizeSitemap(distXml),
        summarizeSitemap(liveXml),
      ),
    );
  }

  const ok = reasons.length === 0;
  return {
    ok,
    reasons,
    message: ok ? "" : guardFailureMessage(reasons, liveIndexUrl),
  };
}

/**
 * @param {object} [options]
 * @param {NodeJS.ProcessEnv} [options.env]
 * @param {string} [options.distDir]
 * @param {string} [options.liveIndexUrl]
 * @param {typeof fetch} [options.fetchImpl]
 * @param {(message: string) => void} [options.log]
 * @param {(message: string) => void} [options.warn]
 */
export async function runSitemapGuard(options = {}) {
  const env = options.env || process.env;
  const log = options.log || console.log;
  const warn = options.warn || console.warn;
  const distDir = options.distDir || path.resolve(WEB_ROOT, "dist");
  const liveIndexUrl = options.liveIndexUrl || LIVE_SITEMAP_INDEX;
  const fetchImpl = options.fetchImpl || globalThis.fetch;

  if (isSitemapGuardSkip(env)) {
    const message = "Sitemap guard skipped (SITEMAP_GUARD_SKIP=1).";
    log(message);
    return { ok: true, skipped: true, message };
  }

  let liveIndexXml;
  try {
    liveIndexXml = (await fetchSitemapBody(liveIndexUrl, fetchImpl)).toString("utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const text = [
      `Sitemap guard: failed to fetch ${liveIndexUrl}: ${message}`,
      "Failing closed so a hosting deploy cannot replace the live sitemap unchecked.",
      "Set SITEMAP_GUARD_SKIP=1 to bypass this check.",
    ].join("\n");
    warn(text);
    return { ok: false, fetchFailed: true, message: text };
  }

  /** @type {Record<string, string>} */
  const liveFiles = { "sitemap.xml": liveIndexXml };
  /** @type {Record<string, string>} */
  const distFiles = {};
  /** @type {Record<string, string>} */
  const liveErrors = {};

  const distIndexPath = path.join(distDir, "sitemap.xml");
  if (existsSync(distIndexPath)) {
    distFiles["sitemap.xml"] = readFileSync(distIndexPath, "utf8");
  }

  for (const child of childSitemapRefs(liveIndexXml)) {
    try {
      liveFiles[child.relPath] = (await fetchSitemapBody(child.url, fetchImpl)).toString("utf8");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      liveErrors[child.relPath] = `failed to fetch ${child.url} (${message}); failing closed`;
      continue;
    }
    const distPath = path.join(distDir, child.relPath);
    if (existsSync(distPath)) {
      distFiles[child.relPath] = readFileSync(distPath, "utf8");
    }
  }

  const compared = compareSitemapFiles(distFiles, liveFiles, { liveErrors, liveIndexUrl });
  if (!compared.ok) {
    warn(compared.message);
    return { ok: false, message: compared.message, reasons: compared.reasons };
  }

  log("Sitemap guard: dist sitemaps are not older or smaller than live.");
  return { ok: true, message: "ok" };
}

function isMainModule() {
  const entry = process.argv[1];
  if (!entry) return false;
  return pathToFileURL(path.resolve(entry)).href === import.meta.url;
}

if (isMainModule()) {
  runSitemapGuard()
    .then((result) => {
      if (!result.ok) process.exitCode = 1;
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Sitemap guard failed: ${message}`);
      process.exitCode = 1;
    });
}
