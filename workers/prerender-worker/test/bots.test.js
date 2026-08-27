import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BOT_UA_PATTERNS, hasEscapedFragment, isBotUserAgent, isCrawlerRequest } from "../src/bots.js";

describe("bot user-agents", () => {
  const bots = [
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Twitterbot/1.0",
    "LinkedInBot/1.0",
    "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
    "WhatsApp/2.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15 Applebot/0.1",
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
    "Scamadviser.com/1.0",
    "Mozilla/5.0 (compatible; urlscan.io)",
  ];

  for (const ua of bots) {
    it(`detects ${ua.slice(0, 48)}`, () => {
      assert.equal(isBotUserAgent(ua), true);
    });
  }

  it("does not treat a normal Chrome UA as a crawler", () => {
    const chrome =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    assert.equal(isBotUserAgent(chrome), false);
    const request = new Request("https://flashmovies.xyz/movie-info?type=movie&id=550", {
      headers: { "user-agent": chrome },
    });
    assert.equal(isCrawlerRequest(request), false);
  });

  it("honors ?_escaped_fragment_ even without a bot UA", () => {
    const url = new URL("https://flashmovies.xyz/movie-info?id=550&type=movie&_escaped_fragment_=");
    assert.equal(hasEscapedFragment(url), true);
    const request = new Request(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    assert.equal(isCrawlerRequest(request), true);
  });

  it("includes the major crawlers called out in the product request", () => {
    const required = [
      "googlebot",
      "bingbot",
      "slackbot",
      "facebookexternalhit",
      "twitterbot",
      "linkedinbot",
      "discordbot",
      "whatsapp",
      "applebot",
      "gptbot",
      "claudebot",
      "scamadviser",
    ];
    for (const name of required) {
      assert.ok(
        BOT_UA_PATTERNS.includes(name),
        `missing ${name} in BOT_UA_PATTERNS`,
      );
    }
  });
});
