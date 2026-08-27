/**
 * First-party crawler HTML for Flash Movies.
 *
 * Replaces the live prerender-worker script that proxied bots to
 * service.prerender.io. That script also 404'd any bot URL containing
 * `/full-movie` — this worker does not.
 *
 * Loop protection: origin subrequests set `X-Prerender`; incoming requests
 * with that header pass through to origin.
 */
import { hasPrerenderLoopHeader, isCrawlerRequest } from "./bots.js";
import { HOME_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "./copy.js";
import { fetchHomeSections } from "./home-sections.js";
import {
  detailPage,
  genericPage,
  homePage,
  listPage,
  notFoundPage,
  renderHtml,
} from "./html.js";
import { canonicalUrl, parseRoute, shouldBypass } from "./routes.js";
import { fetchTmdbDetails, fetchTmdbList } from "./tmdb.js";

const CACHE_HOST = "https://crawler-html.flashmovies.xyz";

function siteOrigin(env) {
  return String(env.SITE_ORIGIN || "https://flashmovies.xyz").replace(/\/+$/, "");
}

function ttlFor(page, env) {
  if (Number.isFinite(page.ttl)) return page.ttl;
  if (page.status >= 400) return 120;
  if (page.kind === "detail" || page.kind === "list") {
    return Number.parseInt(env.CACHE_TTL_SECONDS || "21600", 10) || 21600;
  }
  return Number.parseInt(env.HOME_CACHE_TTL_SECONDS || "86400", 10) || 86400;
}

/**
 * Cache key is a dedicated hostname so crawler HTML never collides with
 * the origin SPA document in Cloudflare's cache.
 * @param {URL} url
 */
export function crawlerCacheKey(url) {
  const copy = new URL(url.toString());
  copy.searchParams.delete("_escaped_fragment_");
  return new Request(`${CACHE_HOST}${copy.pathname}${copy.search}`, {
    method: "GET",
  });
}

function htmlResponse(page, env, cacheStatus) {
  const origin = siteOrigin(env);
  const html = renderHtml(page, origin);
  const ttl = ttlFor(page, env);
  const headers = {
    "content-type": "text/html; charset=utf-8",
    "cache-control": `public, max-age=${ttl}`,
    "x-flash-crawler": "1",
    "x-crawler-cache": cacheStatus,
    "x-robots-tag": page.robots,
  };
  return new Response(html, { status: page.status, headers });
}

function withoutBody(response) {
  return new Response(null, { status: response.status, headers: response.headers });
}

function withKind(page, kind) {
  return { ...page, kind };
}

/**
 * @param {URL} url
 * @param {object} env
 * @param {typeof fetch} fetchImpl
 */
export async function buildCrawlerPage(url, env, fetchImpl = fetch) {
  const origin = siteOrigin(env);
  const canonical = canonicalUrl(url, origin);
  const route = parseRoute(url);

  if (route.kind === "home") {
    let featuredSections = [];
    try {
      featuredSections = await fetchHomeSections(env.TMDB_API_KEY, fetchImpl);
    } catch {
      featuredSections = [];
    }
    const page = homePage({ canonical, siteOrigin: origin, featuredSections });
    if (!featuredSections.length) page.ttl = 120;
    return withKind(page, "home");
  }

  if (route.kind === "terms") {
    return withKind(
      genericPage({
        title: `Terms and Conditions — ${SITE_NAME}`,
        description: `Terms for using ${SITE_NAME}, a free movie and TV streaming website.`,
        canonical,
        siteOrigin: origin,
        heading: "Terms and Conditions",
        paragraphs: [SITE_TAGLINE, "By using the site you agree to the terms published on this page."],
        links: [{ href: "/", text: "Flash Movies home" }],
      }),
      "terms",
    );
  }

  if (route.kind === "pro-terms") {
    return withKind(
      genericPage({
        title: `Pro plan terms — ${SITE_NAME}`,
        description: `Pro plan terms for ${SITE_NAME} — ad-free streaming and premium servers.`,
        canonical,
        siteOrigin: origin,
        heading: "Pro plan terms",
        paragraphs: ["Terms that apply to the Flash Movies Pro plan."],
        links: [{ href: "/", text: "Flash Movies home" }],
      }),
      "pro-terms",
    );
  }

  if (route.kind === "faq") {
    return withKind(
      genericPage({
        title: `Frequently asked questions — ${SITE_NAME}`,
        description: `FAQ about ${SITE_NAME} — free movies and TV shows online in HD.`,
        canonical,
        siteOrigin: origin,
        heading: "Frequently asked questions",
        paragraphs: [
          SITE_TAGLINE,
          "Browse and watch movies and TV shows online for free. Upgrade to Pro for an ad-free experience and premium streaming servers.",
        ],
        links: [{ href: "/", text: "Flash Movies home" }],
      }),
      "faq",
    );
  }

  if (route.kind === "auth" || route.kind === "payments") {
    const title =
      route.kind === "auth"
        ? `Account — ${SITE_NAME}`
        : `Plans — ${SITE_NAME}`;
    return withKind(
      genericPage({
        title,
        description: HOME_DESCRIPTION,
        canonical,
        siteOrigin: origin,
        robots: "noindex, nofollow",
        heading: title,
        paragraphs: [
          "Sign in, register, or manage your Flash Movies account and Pro plan.",
        ],
        links: [{ href: "/", text: "Flash Movies home" }],
      }),
      route.kind,
    );
  }

  if (route.kind === "detail") {
    try {
      const result = await fetchTmdbDetails(
        route.type,
        route.id,
        env.TMDB_API_KEY,
        fetchImpl,
      );
      if (result.data) {
        return withKind(
          detailPage({ route, data: result.data, canonical, siteOrigin: origin }),
          "detail",
        );
      }
      if (result.status === 404) {
        return withKind(notFoundPage({ canonical, siteOrigin: origin }), "not-found");
      }
    } catch {
      // Fall through to a short generic page rather than the SPA stub.
    }
    const fallback = genericPage({
      title: `${route.type === "movie" ? "Movie" : route.type === "tv" ? "TV show" : "Title"} ${route.id} — ${SITE_NAME}`,
      description: `Watch this ${route.type} free online on Flash Movies — free movies and TV in HD.`,
      canonical,
      siteOrigin: origin,
      heading: "Watch free on Flash Movies",
      paragraphs: [
        SITE_TAGLINE,
        "Title details are loaded from TMDB for search engines. Open the page in your browser to start watching.",
      ],
      links: [{ href: "/", text: "Flash Movies home" }],
    });
    fallback.status = 200;
    fallback.ttl = 120;
    return withKind(fallback, "detail");
  }

  if (route.kind === "list") {
    let data = null;
    let listFailed = false;
    try {
      const result = await fetchTmdbList(
        route.type,
        route.listSearch,
        env.TMDB_API_KEY,
        fetchImpl,
        route.listFilters || {},
      );
      if (result.status === 204) {
        data = null;
      } else if (!result.data) {
        listFailed = true;
      } else {
        data = result.data;
      }
    } catch {
      listFailed = true;
    }
    const page = listPage({ route, data, canonical, siteOrigin: origin });
    if (listFailed) page.ttl = 120;
    return withKind(page, "list");
  }

  return withKind(notFoundPage({ canonical, siteOrigin: origin }), "not-found");
}

function isFlashMoviesHost(hostname) {
  const host = String(hostname || "").toLowerCase();
  return host === "flashmovies.xyz" || host === "www.flashmovies.xyz";
}

/**
 * Pass human (and static-asset) traffic to the SPA origin unchanged.
 * Sets `X-Prerender` so a loop back into this worker skips crawler HTML
 * (same header the live prerender-worker used).
 *
 * On `*.workers.dev` (no zone route yet) fetch the real SPA origin instead
 * of workers.dev, which 404s.
 *
 * @param {Request} request
 * @param {object} env
 * @param {typeof fetch} fetchImpl
 */
export function fetchOrigin(request, env, fetchImpl = fetch) {
  const headers = new Headers(request.headers);
  headers.set("X-Prerender", "1");

  const url = new URL(request.url);
  if (isFlashMoviesHost(url.hostname)) {
    return fetchImpl(new Request(request, { headers, redirect: "manual" }));
  }

  return fetchImpl(
    new Request(`${siteOrigin(env)}${url.pathname}${url.search}`, {
      method: request.method,
      headers,
      redirect: "manual",
    }),
  );
}

/**
 * @param {Request} request
 * @param {object} env
 * @param {object} ctx
 * @param {object} [deps]
 */
export async function handleRequest(request, env, ctx, deps = {}) {
  const fetchImpl = deps.fetch || fetch;
  const cache = deps.cache || (typeof caches !== "undefined" ? caches.default : null);

  if (request.method !== "GET" && request.method !== "HEAD") {
    return fetchOrigin(request, env, fetchImpl);
  }

  // Loop protection: this is already a worker→origin subrequest.
  // Pass the request through as-is (same as the live prerender-worker).
  if (hasPrerenderLoopHeader(request)) {
    return fetchImpl(request);
  }

  const url = new URL(request.url);
  if (shouldBypass(url) || !isCrawlerRequest(request)) {
    return fetchOrigin(request, env, fetchImpl);
  }

  const cacheKey = crawlerCacheKey(url);
  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) {
      const headers = new Headers(hit.headers);
      headers.set("x-crawler-cache", "HIT");
      if (request.method === "HEAD") {
        return new Response(null, { status: hit.status, headers });
      }
      return new Response(hit.body, { status: hit.status, headers });
    }
  }

  const page = await buildCrawlerPage(url, env, fetchImpl);
  const response = htmlResponse(page, env, "MISS");

  if (cache && ctx?.waitUntil) {
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
  } else if (cache) {
    await cache.put(cacheKey, response.clone());
  }

  if (request.method === "HEAD") {
    return withoutBody(response);
  }

  return response;
}

export default {
  /**
   * @param {Request} request
   * @param {object} env
   * @param {object} ctx
   */
  async fetch(request, env, ctx) {
    return handleRequest(request, env, ctx);
  },
};
