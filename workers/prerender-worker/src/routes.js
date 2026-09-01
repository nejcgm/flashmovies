
import { LIST_FILTER_PARAM_ORDER, parseListFilters } from "./list-filters.js";

export const IGNORE_EXTENSIONS = [
  ".js",
  ".css",
  ".xml",
  ".less",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".pdf",
  ".doc",
  ".txt",
  ".ico",
  ".rss",
  ".zip",
  ".mp3",
  ".rar",
  ".exe",
  ".wmv",
  ".avi",
  ".ppt",
  ".mpg",
  ".mpeg",
  ".tif",
  ".wav",
  ".mov",
  ".psd",
  ".ai",
  ".xls",
  ".mp4",
  ".m4a",
  ".swf",
  ".dat",
  ".dmg",
  ".iso",
  ".flv",
  ".m4v",
  ".torrent",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".eot",
  ".svg",
  ".webp",
  ".avif",
  ".webmanifest",
  ".map",
  ".json",
];

const BYPASS_PREFIXES = ["/assets/", "/sitemaps/", "/src/", "/api/"];

const BYPASS_EXACT = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/flash-movies-logo.png",
  "/verify.html",
]);

export const BLOCKED_MOVIE_ID = "1439112";

/**
 * @param {string | null | undefined} type
 * @param {string | number | null | undefined} id
 */
export function isBlockedTitle(type, id) {
  return type === "movie" && String(id) === BLOCKED_MOVIE_ID;
}

const DETAIL_PATHS = new Set(["/movie-info", "/full-movie"]);
const LIST_PATHS = new Set(["/list-items"]);
const STATIC_PAGES = {
  "/": "home",
  "/terms-and-conditions": "terms",
  "/pro-plan-terms-and-conditions": "pro-terms",
  "/frequently-asked-questions": "faq",
  "/auth/login": "auth",
  "/auth/register": "auth",
  "/auth/logout": "auth",
  "/payments/plans": "payments",
  "/payments/remove-pro": "payments",
};

/**
 * @param {string} pathname
 */
function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

/**
 * Trailing-slash sitemap URLs must 301 to the real XML file.
 * Firebase Hosting has no file at `/sitemap.xml/`, so the SPA rewrite
 * would serve index.html; the old XML Content-Type glob still matched,
 * producing HTML labeled application/xml (GSC "Couldn't fetch").
 *
 * @param {URL} url
 * @param {string} siteOrigin
 * @returns {string | null} absolute Location, or null if not a slash sitemap
 */
export function trailingSlashSitemapRedirect(url, siteOrigin) {
  const origin = String(siteOrigin || "").replace(/\/+$/, "");
  const path = url.pathname;
  const search = url.search || "";
  if (/^\/sitemap\.xml\/+$/i.test(path)) {
    return `${origin}/sitemap.xml${search}`;
  }
  const child = path.match(/^\/sitemaps\/([^/]+\.xml)\/+$/i);
  if (child) {
    return `${origin}/sitemaps/${child[1]}${search}`;
  }
  return null;
}

/**
 * Static files and sitemaps must never be replaced with crawler HTML.
 * @param {URL} url
 */
export function shouldBypass(url) {
  const path = normalizePath(url.pathname).toLowerCase();
  const rawPath = url.pathname.toLowerCase();
  if (BYPASS_EXACT.has(path) || BYPASS_EXACT.has(rawPath)) {
    return true;
  }
  if (BYPASS_PREFIXES.some((prefix) => rawPath.startsWith(prefix))) {
    return true;
  }
  if (IGNORE_EXTENSIONS.some((ext) => rawPath.endsWith(ext))) {
    return true;
  }
  if (/^\/google[a-z0-9]+\.html$/i.test(path)) return true;
  return false;
}

/**
 * @param {string | null} value
 */
function isTmdbId(value) {
  return Boolean(value && /^\d+$/.test(value));
}

/**
 * @param {string | null} value
 * @returns {"movie" | "tv" | "person" | null}
 */
function asMediaType(value) {
  if (value === "movie" || value === "tv" || value === "person") return value;
  return null;
}

/**
 * @typedef {object} ParsedRoute
 * @property {"home" | "detail" | "list" | "terms" | "pro-terms" | "faq" | "auth" | "payments" | "not-found"} kind
 * @property {string} pathname
 * @property {"movie" | "tv" | "person" | null} [type]
 * @property {string | null} [id]
 * @property {string | null} [listSearch]
 * @property {string | null} [listTitle]
 * @property {import("./list-filters.js").ListFilters} [listFilters]
 */

/**
 * `/full-movie` is a first-class catalog page (sitemap + SPA). The live
 * prerender-worker 404'd any bot URL containing `/full-movie` — do not
 * restore that. Valid movie/TV ids here are detail pages, same as /movie-info.
 *
 * @param {URL} url
 * @returns {ParsedRoute}
 */
export function parseRoute(url) {
  const pathname = normalizePath(url.pathname);

  if (DETAIL_PATHS.has(pathname)) {
    const type = asMediaType(url.searchParams.get("type"));
    const id = url.searchParams.get("id");
    if (!type || !isTmdbId(id)) {
      return { kind: "not-found", pathname };
    }
    if (isBlockedTitle(type, id)) {
      return { kind: "not-found", pathname };
    }
    if (pathname === "/full-movie" && type === "person") {
      return { kind: "not-found", pathname };
    }
    return { kind: "detail", pathname, type, id };
  }

  if (LIST_PATHS.has(pathname)) {
    const type = asMediaType(url.searchParams.get("type"));
    const listSearch = url.searchParams.get("search");
    const listTitle = url.searchParams.get("title");
    if (!type || !listSearch) {
      return { kind: "not-found", pathname };
    }
    return {
      kind: "list",
      pathname,
      type,
      listSearch,
      listTitle,
      listFilters: parseListFilters(url),
    };
  }

  const staticKind = STATIC_PAGES[pathname];
  if (staticKind) {
    return { kind: staticKind, pathname };
  }

  return { kind: "not-found", pathname };
}

/**
 * Canonical URL on the production host, without `_escaped_fragment_`.
 * @param {URL} requestUrl
 * @param {string} siteOrigin
 */
export function canonicalUrl(requestUrl, siteOrigin) {
  const origin = siteOrigin.replace(/\/+$/, "");
  const path = normalizePath(requestUrl.pathname);
  const params = new URLSearchParams(requestUrl.searchParams);
  params.delete("_escaped_fragment_");

  if (DETAIL_PATHS.has(path) && params.has("type") && params.has("id")) {
    const type = params.get("type");
    const id = params.get("id");
    return `${origin}${path}?type=${encodeURIComponent(type || "")}&id=${encodeURIComponent(id || "")}`;
  }

  if (LIST_PATHS.has(path)) {
    const ordered = new URLSearchParams();
    const type = params.get("type");
    const search = params.get("search");
    const title = params.get("title");
    if (type) ordered.set("type", type);
    if (search) ordered.set("search", search);
    for (const key of LIST_FILTER_PARAM_ORDER) {
      if (params.has(key)) ordered.set(key, params.get(key) || "");
    }
    if (title) ordered.set("title", title);
    return `${origin}${path}?${ordered.toString()}`;
  }

  const qs = params.toString();
  return qs ? `${origin}${path}?${qs}` : `${origin}${path === "/" ? "/" : path}`;
}
