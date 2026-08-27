/**
 * Crawler / preview User-Agents that should receive first-party HTML
 * instead of the empty Vite SPA shell.
 *
 * Matching is case-insensitive substring. Keep this list explicit —
 * do not match the generic word "bot" (too many false positives).
 */
export const BOT_UA_PATTERNS = [
  // Search
  "googlebot",
  "google-inspectiontool",
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
  "bingbot",
  "bingpreview",
  "msnbot",
  "adidxbot",
  "slurp",
  "duckduckbot",
  "duckassistbot",
  "baiduspider",
  "yandexbot",
  "yandeximages",
  "seznambot",
  "qwantify",
  "sogou",
  "exabot",
  "mojeekbot",
  "applebot",
  "applenewsbot",

  // Social / unfurl
  "facebookexternalhit",
  "facebot",
  "facebookbot",
  "facebookcatalog",
  "meta-externalagent",
  "meta-externalfetcher",
  "instagram",
  "twitterbot",
  "linkedinbot",
  "slackbot",
  "slack-imgproxy",
  "discordbot",
  "whatsapp",
  "telegrambot",
  "skypeuripreview",
  "vkshare",
  "pinterestbot",
  "pinterest/",
  "redditbot",
  "tumblr",
  "embedly",
  "iframely",
  "quora link preview",
  "outbrain",
  "pocketparser",
  "viber",
  "line/",
  "kakaotalk",
  "snapchat",

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
  "norton",
  "mcafee",
  "bitdefender",
  "quttera",
  "urlvoid",
  "gridinsoft",
  "mywot",
  "builtwith",
  "wappalyzer",
  "zoominfobot",
  "censys",
  "securitytrails",

  // Preview / lighthouse-style (still need real meta, not the SPA stub)
  "chrome-lighthouse",
  "pagespeed",
  "gtmetrix",
  "pingdom",
  "uptimerobot",
  "statuscake",
  "w3c_validator",
  "prerender",
];

/**
 * @param {string | null | undefined} userAgent
 * @returns {boolean}
 */
export function isBotUserAgent(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_UA_PATTERNS.some((pattern) => ua.includes(pattern));
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
 * @param {Request} request
 * @returns {boolean}
 */
export function isCrawlerRequest(request) {
  const url = new URL(request.url);
  if (hasEscapedFragment(url)) return true;
  return isBotUserAgent(request.headers.get("user-agent"));
}
