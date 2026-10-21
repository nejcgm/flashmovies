/** Firebase Hosting for moviestream-14d2b. Not the Cloudflare-cached custom domain. */
export const DEFAULT_ASSET_ORIGIN = "https://moviestream-14d2b.web.app";

/**
 * Hashed Vite output. The SPA rewrite must not apply here; this is also the
 * path the worker refuses to answer with index.html.
 * @param {string | null | undefined} pathname
 */
export function isAssetPath(pathname) {
  return String(pathname || "").toLowerCase().startsWith("/assets/");
}

/**
 * @param {object | undefined} env
 */
export function assetOrigin(env) {
  const raw = String(env?.ASSET_ORIGIN || DEFAULT_ASSET_ORIGIN).trim();
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return DEFAULT_ASSET_ORIGIN;
    return url.origin;
  } catch {
    return DEFAULT_ASSET_ORIGIN;
  }
}

/**
 * @param {Uint8Array | string | null | undefined} prefix
 */
export function looksLikeHtml(prefix) {
  let text = "";
  if (typeof prefix === "string") text = prefix;
  else if (prefix && prefix.length) {
    text = new TextDecoder("utf-8", { fatal: false }).decode(prefix);
  }
  text = text.replace(/^\uFEFF/, "").trimStart().slice(0, 64).toLowerCase();
  return text.startsWith("<!doctype") || text.startsWith("<html");
}

/**
 * A cached /assets response is unsafe when it is an error or when the body
 * is the SPA shell. Redirects and 304s are left alone.
 * @param {number} status
 * @param {string | null | undefined} contentType
 * @param {Uint8Array | string | null | undefined} prefix
 */
export function assetNeedsHeal(status, contentType, prefix) {
  if (status === 200) {
    if (String(contentType || "").toLowerCase().includes("text/html")) return true;
    return looksLikeHtml(prefix);
  }
  return status >= 400;
}

/**
 * @param {Response} response
 * @param {number} maxBytes
 */
async function readPrefix(response, maxBytes) {
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  /** @type {Uint8Array[]} */
  const chunks = [];
  let total = 0;
  try {
    while (total < maxBytes) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      chunks.push(value);
      total += value.byteLength;
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      // The stream may already be closed.
    }
  }
  const prefix = new Uint8Array(Math.min(total, maxBytes));
  let offset = 0;
  for (const chunk of chunks) {
    const take = Math.min(chunk.byteLength, prefix.byteLength - offset);
    if (take <= 0) break;
    prefix.set(chunk.subarray(0, take), offset);
    offset += take;
  }
  return prefix;
}

/**
 * @param {Response} response
 */
export async function classifyAssetResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const htmlType = contentType.toLowerCase().includes("text/html");
  let prefix = new Uint8Array();
  if (response.status === 200 && response.body && !htmlType) {
    prefix = await readPrefix(response.clone(), 64);
  }
  return {
    heal: assetNeedsHeal(response.status, contentType, prefix),
    response,
  };
}

export function assetNotFoundResponse() {
  return new Response("Not Found", {
    status: 404,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "cdn-cache-control": "no-store",
      "cloudflare-cdn-cache-control": "no-store",
      "x-assets-guard": "rejected-html",
    },
  });
}

/**
 * Load the same path from Firebase Hosting, skipping the Cloudflare cache
 * key that includes the browser Origin header.
 * @param {Request} request
 * @param {object} env
 * @param {typeof fetch} fetchImpl
 */
export function fetchAssetOrigin(request, env, fetchImpl) {
  const url = new URL(request.url);
  const headers = new Headers(request.headers);
  headers.set("X-Prerender", "1");
  headers.delete("host");
  return fetchImpl(
    new Request(`${assetOrigin(env)}${url.pathname}${url.search}`, {
      method: "GET",
      headers,
      redirect: "manual",
    }),
  );
}

/**
 * Pass real JS/CSS through. If the edge cached index.html under an asset
 * URL, load the file from Firebase instead of serving or storing that HTML.
 * If Firebase also has no file, return a no-store 404.
 *
 * @param {Request} request
 * @param {object} env
 * @param {typeof fetch} fetchImpl
 * @param {(request: Request, env: object, fetchImpl: typeof fetch) => Promise<Response>} fetchOriginImpl
 */
export async function fetchGuardedAsset(request, env, fetchImpl, fetchOriginImpl) {
  if (request.method === "HEAD") {
    const getRequest = new Request(request.url, {
      method: "GET",
      headers: request.headers,
      redirect: "manual",
    });
    const full = await fetchGuardedAsset(getRequest, env, fetchImpl, fetchOriginImpl);
    try {
      await full.body?.cancel();
    } catch {
      // HEAD only needs the headers.
    }
    return new Response(null, { status: full.status, headers: full.headers });
  }

  const initial = await classifyAssetResponse(await fetchOriginImpl(request, env, fetchImpl));
  if (!initial.heal) return initial.response;

  let healed;
  try {
    healed = await classifyAssetResponse(await fetchAssetOrigin(request, env, fetchImpl));
  } catch {
    return assetNotFoundResponse();
  }
  if (!healed.heal) return healed.response;
  try {
    await healed.response.body?.cancel();
  } catch {
    // Drop the HTML body.
  }
  return assetNotFoundResponse();
}
