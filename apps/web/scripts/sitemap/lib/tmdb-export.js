import { createGunzip } from "node:zlib";
import { createReadStream, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BLOCKED_MOVIE_ID } from "./tmdb-ids.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, "../../..");
const EXPORT_BASE = "https://files.tmdb.org/p/exports";

/** @typedef {{ id: number, popularity: number }} ExportEntry */

/**
 * @param {Date} [date]
 */
export function exportDateLabel(date = new Date()) {
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${month}_${day}_${year}`;
}

/**
 * @param {"movie" | "tv" | "person"} kind
 * @param {Date} [date]
 */
export function exportFileName(kind, date = new Date()) {
  const label = exportDateLabel(date);
  if (kind === "movie") return `movie_ids_${label}.json.gz`;
  if (kind === "tv") return `tv_series_ids_${label}.json.gz`;
  return `person_ids_${label}.json.gz`;
}

/**
 * @param {"movie" | "tv" | "person"} kind
 * @param {Date} [date]
 */
export function exportDownloadUrl(kind, date = new Date()) {
  return `${EXPORT_BASE}/${exportFileName(kind, date)}`;
}

/**
 * @param {object} [options]
 * @param {Date} [options.date]
 * @param {string} [options.cacheDir]
 */
export function exportCachePath(kind, options = {}) {
  const cacheDir = options.cacheDir || path.resolve(WEB_ROOT, ".cache", "tmdb-exports");
  return path.join(cacheDir, exportFileName(kind, options.date));
}

/**
 * @param {ExportEntry[]} entries
 * @param {number} limit
 */
export function topIdsByPopularity(entries, limit) {
  if (limit <= 0) return [];
  return entries
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit)
    .map((entry) => entry.id);
}

/**
 * @param {object} row
 * @param {object} options
 * @param {number} options.minPopularity
 */
export function movieExportRowPasses(row, { minPopularity }) {
  if (!row?.id || row.id === BLOCKED_MOVIE_ID) return false;
  if (row.adult === true) return false;
  if (row.video === true) return false;
  return Number(row.popularity) >= minPopularity;
}

/**
 * @param {object} row
 * @param {object} options
 * @param {number} options.minPopularity
 */
export function tvExportRowPasses(row, { minPopularity }) {
  if (!row?.id) return false;
  if (row.adult === true) return false;
  return Number(row.popularity) >= minPopularity;
}

/**
 * @param {object} row
 * @param {object} options
 * @param {number} options.minPopularity
 */
export function personExportRowPasses(row, { minPopularity }) {
  if (!row?.id) return false;
  if (row.adult === true) return false;
  return Number(row.popularity) >= minPopularity;
}

/**
 * @param {string} filePath
 * @param {(row: object) => boolean} passes
 */
export async function readExportEntries(filePath, passes) {
  /** @type {ExportEntry[]} */
  const entries = [];
  const input = createReadStream(filePath).pipe(createGunzip());
  const lines = createInterface({ input, crlfDelay: Infinity });

  for await (const line of lines) {
    if (!line.trim()) continue;
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      continue;
    }
    if (!passes(row)) continue;
    entries.push({ id: row.id, popularity: Number(row.popularity) || 0 });
  }

  return entries;
}

/**
 * @param {string} url
 * @param {string} cachePath
 * @param {typeof fetch} [fetchImpl]
 */
export async function downloadExportToCache(url, cachePath, fetchImpl = fetch) {
  mkdirSync(path.dirname(cachePath), { recursive: true });
  if (existsSync(cachePath)) {
    return cachePath;
  }

  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`TMDB export download failed (${response.status}): ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(cachePath, buffer);
  return cachePath;
}

/**
 * Resolve export date — try today, then step back up to 3 days.
 * @param {Date} start
 */
export function exportDatesToTry(start = new Date()) {
  const dates = [];
  for (let offset = 0; offset < 4; offset += 1) {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() - offset);
    dates.push(date);
  }
  return dates;
}

/**
 * @param {"movie" | "tv" | "person"} kind
 * @param {object} options
 * @param {typeof fetch} [options.fetchImpl]
 * @param {string} [options.cacheDir]
 * @param {Date} [options.date]
 * @param {Date[]} [options.datesToTry]
 */
async function resolveExportFile(kind, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const cacheDir = options.cacheDir || path.resolve(WEB_ROOT, ".cache", "tmdb-exports");
  const dates = options.datesToTry || (options.date ? [options.date] : exportDatesToTry());

  let lastError;
  for (const date of dates) {
    const url = exportDownloadUrl(kind, date);
    const cachePath = exportCachePath(kind, { date, cacheDir });
    try {
      await downloadExportToCache(url, cachePath, fetchImpl);
      return { cachePath, date, url };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error(`Unable to download TMDB ${kind} export`);
}

/**
 * Phase 1 catalog ids from TMDB daily exports (popularity-ranked, capped).
 *
 * Env:
 * - SITEMAP_MAX_MOVIES (default 15000)
 * - SITEMAP_MAX_TV (default 5000)
 * - SITEMAP_MAX_PEOPLE (default 2500)
 * - SITEMAP_MIN_POPULARITY (default 1)
 * - SITEMAP_EXPORT_CACHE_DIR (optional)
 * - SITEMAP_EXPORT_DATE=MM_DD_YYYY (optional pin)
 *
 * @param {object} [options]
 * @param {typeof fetch} [options.fetchImpl]
 * @param {number} [options.maxMovies]
 * @param {number} [options.maxTv]
 * @param {number} [options.maxPeople]
 * @param {number} [options.minPopularity]
 * @param {Date} [options.date]
 */
export async function resolveCatalogIdsFromExports(options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const maxMovies = options.maxMovies ?? intEnv("SITEMAP_MAX_MOVIES", 15000);
  const maxTv = options.maxTv ?? intEnv("SITEMAP_MAX_TV", 5000);
  const maxPeople = options.maxPeople ?? intEnv("SITEMAP_MAX_PEOPLE", 2500);
  const minPopularity = options.minPopularity ?? Number(process.env.SITEMAP_MIN_POPULARITY || 1);
  const cacheDir = options.cacheDir || process.env.SITEMAP_EXPORT_CACHE_DIR;
  const pinnedDate = parsePinnedExportDate(process.env.SITEMAP_EXPORT_DATE);
  const datesToTry = pinnedDate ? [pinnedDate] : exportDatesToTry();

  const filterOpts = { minPopularity };

  const [movieFile, tvFile, personFile] = await Promise.all([
    resolveExportFile("movie", { fetchImpl, cacheDir, datesToTry }),
    resolveExportFile("tv", { fetchImpl, cacheDir, datesToTry }),
    resolveExportFile("person", { fetchImpl, cacheDir, datesToTry }),
  ]);

  const [movieEntries, tvEntries, personEntries] = await Promise.all([
    readExportEntries(movieFile.cachePath, (row) => movieExportRowPasses(row, filterOpts)),
    readExportEntries(tvFile.cachePath, (row) => tvExportRowPasses(row, filterOpts)),
    readExportEntries(personFile.cachePath, (row) => personExportRowPasses(row, filterOpts)),
  ]);

  const movieIds = topIdsByPopularity(movieEntries, maxMovies);
  const tvIds = topIdsByPopularity(tvEntries, maxTv);
  const personIds = topIdsByPopularity(personEntries, maxPeople);

  if (movieIds.length < 1000 || tvIds.length < 500 || personIds.length < 500) {
    throw new Error(
      `TMDB export produced too few ids (${movieIds.length} movies, ${tvIds.length} TV, ${personIds.length} people)`,
    );
  }

  return {
    source: "export",
    exportDate: exportDateLabel(movieFile.date),
    movieIds,
    tvIds,
    personIds,
    stats: {
      movieCandidates: movieEntries.length,
      tvCandidates: tvEntries.length,
      personCandidates: personEntries.length,
    },
  };
}

/**
 * @param {string} name
 * @param {number} fallback
 */
function intEnv(name, fallback) {
  const raw = Number.parseInt(process.env[name] || "", 10);
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
}

/**
 * @param {string | undefined} raw
 */
function parsePinnedExportDate(raw) {
  if (!raw) return null;
  const match = /^(\d{2})_(\d{2})_(\d{4})$/.exec(String(raw).trim());
  if (!match) return null;
  const [, month, day, year] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}
