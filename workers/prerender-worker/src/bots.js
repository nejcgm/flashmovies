
export const BOT_AGENTS = [
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

  "facebot",
  "facebookbot",
  "facebookcatalog",
  "meta-externalagent",
  "meta-externalfetcher",
  "slack-imgproxy",
  "iframely",
  "pocketparser",

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

  "ia_archiver",
  "archive.org_bot",
  "wayback",

  "gtmetrix",
  "pingdom",
  "uptimerobot",
  "statuscake",
];

export const BLOCKED_BOT_AGENTS = [
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
];

/**
 * @param {string | null | undefined} userAgent
 * @returns {boolean}
 */
export function isBlockedBotUserAgent(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BLOCKED_BOT_AGENTS.some((pattern) => ua.includes(pattern));
}

/**
 * @param {string | null | undefined} userAgent
 * @returns {boolean}
 */
export function isBotUserAgent(userAgent) {
  if (!userAgent || isBlockedBotUserAgent(userAgent)) return false;
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
