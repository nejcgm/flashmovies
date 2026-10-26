import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { decodeXmlEntities } from "./indexnow.js";

export const SITEMAP_HOST = "flashmovies.xyz";
export const LIVE_SITEMAP_INDEX = `https://${SITEMAP_HOST}/sitemap.xml`;

/**
 * @param {string} value
 */
export function normalizeLastmod(value) {
  const trimmed = String(value || "").trim();
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(trimmed);
  return match ? match[1] : trimmed;
}

/**
 * @param {Iterable<string>} values
 * @param {string} [fallback]
 */
export function newestLastmod(values, fallback = "") {
  let max = "";
  for (const value of values) {
    const normalized = normalizeLastmod(value);
    if (!normalized) continue;
    if (!max || normalized > max) max = normalized;
  }
  return max || fallback;
}

/**
 * Pathname + query, so a previous absolute loc matches a generator path.
 * @param {string} loc
 */
export function sitemapLocKey(loc) {
  const value = decodeXmlEntities(String(loc || "").trim());
  if (!value) return "";
  if (value.startsWith("/")) return value;
  try {
    const url = new URL(value);
    return `${url.pathname}${url.search}`;
  } catch {
    return value;
  }
}

/**
 * Explicit lastmod wins. Otherwise keep the previous date. New URLs use today.
 * @param {{ path?: string, lastmod?: string }} url
 * @param {Map<string, string> | undefined} previousLastmods
 * @param {string} today
 */
export function resolveUrlLastmod(url, previousLastmods, today) {
  const explicit = normalizeLastmod(url?.lastmod || "");
  if (explicit) return explicit;
  const key = sitemapLocKey(url?.path || "");
  const previous = key && previousLastmods ? previousLastmods.get(key) : "";
  if (previous) return normalizeLastmod(previous);
  return today;
}

/**
 * @param {string} xml
 * @returns {{ loc: string, lastmod: string }[]}
 */
export function parseSitemapEntries(xml) {
  const entries = [];
  const blockRe = /<(url|sitemap)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  for (const match of String(xml || "").matchAll(blockRe)) {
    const body = match[2];
    const locMatch = /<loc>([^<]*)<\/loc>/.exec(body);
    if (!locMatch) continue;
    const lastmodMatch = /<lastmod>([^<]*)<\/lastmod>/.exec(body);
    entries.push({
      loc: decodeXmlEntities(locMatch[1].trim()),
      lastmod: normalizeLastmod(lastmodMatch ? lastmodMatch[1] : ""),
    });
  }
  return entries;
}

/**
 * @param {string} xml
 */
export function summarizeSitemap(xml) {
  const entries = parseSitemapEntries(xml);
  return {
    urlCount: entries.length,
    maxLastmod: newestLastmod(entries.map((entry) => entry.lastmod)),
  };
}

/**
 * Page URL lastmods. Sitemap-index locs are ignored.
 * @param {Map<string, string>} map
 * @param {string} xml
 */
export function mergePageLastmods(map, xml) {
  for (const entry of parseSitemapEntries(xml)) {
    if (!entry.lastmod) continue;
    const key = sitemapLocKey(entry.loc);
    if (!key || key.startsWith("/sitemaps/")) continue;
    const existing = map.get(key);
    if (!existing || entry.lastmod > existing) map.set(key, entry.lastmod);
  }
  return map;
}

/**
 * @param {string} publicDir
 */
export function readLastmodsFromDir(publicDir) {
  const map = new Map();
  const sitemapsDir = path.join(publicDir, "sitemaps");
  if (!existsSync(sitemapsDir)) return map;
  for (const name of readdirSync(sitemapsDir)) {
    if (!name.endsWith(".xml")) continue;
    mergePageLastmods(map, readFileSync(path.join(sitemapsDir, name), "utf8"));
  }
  return map;
}

/**
 * Child sitemaps referenced by an index. Off-host and non-file locs are dropped.
 * @param {string} indexXml
 * @param {string} [origin]
 * @returns {{ url: string, relPath: string, filename: string }[]}
 */
export function childSitemapRefs(indexXml, origin = `https://${SITEMAP_HOST}`) {
  const refs = [];
  const seen = new Set();
  for (const entry of parseSitemapEntries(indexXml)) {
    let url;
    try {
      url = new URL(entry.loc, origin);
    } catch {
      continue;
    }
    if (url.protocol !== "https:" || url.hostname !== SITEMAP_HOST) continue;
    const match = /^\/sitemaps\/([A-Za-z0-9._-]+\.xml)$/.exec(url.pathname);
    if (!match) continue;
    const filename = match[1];
    if (filename.includes("..")) continue;
    const relPath = `sitemaps/${filename}`;
    if (seen.has(relPath)) continue;
    seen.add(relPath);
    refs.push({
      url: `${url.origin}${url.pathname}`,
      relPath,
      filename,
    });
  }
  return refs;
}
