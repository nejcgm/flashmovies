import { childSitemapRefs, LIVE_SITEMAP_INDEX, mergePageLastmods } from "./sitemap-xml.js";

/**
 * @param {string} url
 * @param {typeof fetch} [fetchImpl]
 * @param {number} [timeoutMs]
 */
export async function fetchSitemapBody(url, fetchImpl = globalThis.fetch, timeoutMs = 120000) {
  if (typeof fetchImpl !== "function") {
    throw new Error("global fetch is not available");
  }
  const response = await fetchImpl(url, {
    redirect: "follow",
    headers: { accept: "application/xml, text/xml, */*" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response || !response.ok) {
    const status = response ? response.status : "no response";
    throw new Error(`HTTP ${status} for ${url}`);
  }
  if (typeof response.arrayBuffer !== "function") {
    throw new Error(`fetch did not return a body for ${url}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Lastmod for every page URL currently published in the live sitemap.
 * @param {object} [options]
 * @param {string} [options.indexUrl]
 * @param {typeof fetch} [options.fetchImpl]
 * @param {number} [options.timeoutMs]
 */
export async function fetchLiveLastmodMap(options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const indexUrl = options.indexUrl || LIVE_SITEMAP_INDEX;
  const indexBody = await fetchSitemapBody(indexUrl, fetchImpl, options.timeoutMs);
  const refs = childSitemapRefs(indexBody.toString("utf8"));
  if (!refs.length) {
    throw new Error(`no child sitemaps listed in ${indexUrl}`);
  }
  const map = new Map();
  for (const ref of refs) {
    const body = await fetchSitemapBody(ref.url, fetchImpl, options.timeoutMs);
    mergePageLastmods(map, body.toString("utf8"));
  }
  return map;
}
