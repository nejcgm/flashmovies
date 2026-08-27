/**
 * Crawler User-Agents that receive first-party HTML instead of the SPA shell.
 *
 * Starts from the live `prerender-worker` BOT_AGENTS list (prerender.io
 * Cloudflare worker) and keeps the extra AI / social / scanner agents
 * already needed for this catalog. Matching is case-insensitive substring.
 *
 * Do not match the generic word "bot" (too many false positives).
 */
export const BOT_AGENTS = [
  // Live prerender-worker / prerender.io Cloudflare list
  "googlebot",
  "yahoo! slurp",
  "bingbot",
  "yandex",
  "baiduspider",
  "facebookexternalhit",
  "twitterbot",
  "rogerbot",
  "linkedinbot",
  "embedly",
  "quora link preview",
  "showyoubot",
  "outbrain",
  "pinterest/0.",
  "developers.google.com/+/web/snippet",
  "slackbot",
  "vkshare",
  "w3c_validator",
  "redditbot",
  "applebot",
  "whatsapp",
  "flipboard",
  "tumblr",
  "bitlybot",
  "skypeuripreview",
  "nuzzel",
  "discordbot",
  "google page speed",
  "qwantify",
  "pinterestbot",
  "bitrix link preview",
  "xing-contenttabreceiver",
  "chrome-lighthouse",
  "telegrambot",
  "google-inspectiontool",

  // Additional search / preview agents
  "google-extended",
  "storebot-google",
  "adsbot-google",
  "mediapartners-google",
  "apis-google",
  "feedfetcher-google",
  "googleother",
  "duplexweb-google",
  "google-cloudvertexbot",
  "google-safety",
  "bingpreview",
  "msnbot",
  "adidxbot",
  "slurp",
  "duckduckbot",
  "duckassistbot",
  "yandexbot",
  "yandeximages",
  "seznambot",
  "sogou",
  "exabot",
  "mojeekbot",
  "applenewsbot",
  "pagespeed",

  // Social / unfurl crawlers only — do not use tokens that appear in
  // in-app browsers (Instagram, Snapchat, LINE, KakaoTalk, Viber).
  // Instagram link previews already match facebookexternalhit.
  "facebot",
  "facebookbot",
  "facebookcatalog",
  "meta-externalagent",
  "meta-externalfetcher",
  "slack-imgproxy",
  "iframely",
  "pocketparser",

  // AI crawlers
  "gptbot",
  "chatgpt-user",
  "oai-searchbot",
  "claudebot",
  "claude-web",
  "claude-searchbot",
  "claude-user",
  "anthropic-ai",
  "perplexitybot",
  "bytespider",
  "ccbot",
  "amazonbot",
  "youbot",

  // SEO / site-audit
  "ahrefsbot",
  "semrushbot",
  "mj12bot",
  "dotbot",
  "petalbot",
  "dataforseobot",
  "screaming frog",
  "siteauditbot",
  "blexbot",
  "seekport",
  "cincraw",

  // Archives
  "ia_archiver",
  "archive.org_bot",
  "wayback",

  // Reputation / safety scanners (Scamadviser-like)
  "scamadviser",
  "scam-adviser",
  "urlscan",
  "virustotal",
  "sucuri",
  "siteadvisor",
  "quttera",
  "urlvoid",
  "gridinsoft",
  "mywot",
  "builtwith",
  "wappalyzer",
  "zoominfobot",
  "censys",
  "securitytrails",

  // Preview / lighthouse-style
  "gtmetrix",
  "pingdom",
  "uptimerobot",
  "statuscake",
];

/**
 * @param {string | null | undefined} userAgent
 * @returns {boolean}
 */
export function isBotUserAgent(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_AGENTS.some((pattern) => ua.includes(pattern));
}

/**
 * Google's old AJAX crawling scheme. Honor it if a client still sends it.
 * @param {URL} url
 * @returns {boolean}
 */
export function hasEscapedFragment(url) {
  return url.searchParams.has("_escaped_fragment_");
}

/**
 * Incoming `X-Prerender` means this request is already a worker/origin
 * subrequest. Do not generate crawler HTML again (loop protection from
 * the live prerender-worker).
 * @param {Request} request
 */
export function hasPrerenderLoopHeader(request) {
  return Boolean(request.headers.get("X-Prerender"));
}

/**
 * @param {Request} request
 * @returns {boolean}
 */
export function isCrawlerRequest(request) {
  if (hasPrerenderLoopHeader(request)) return false;
  const url = new URL(request.url);
  if (hasEscapedFragment(url)) return true;
  return isBotUserAgent(request.headers.get("user-agent"));
}
