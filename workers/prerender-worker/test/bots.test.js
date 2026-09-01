import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BOT_AGENTS, BLOCKED_BOT_AGENTS, hasEscapedFragment, hasPrerenderLoopHeader, isBlockedBotUserAgent, isBotUserAgent, isCrawlerRequest } from "../src/bots.js";

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
  ];

  for (const ua of bots) {
    it(`detects ${ua.slice(0, 48)}`, () => {
      assert.equal(isBotUserAgent(ua), true);
    });
  }

  it("does not treat in-app browsers as crawlers", () => {
    const inApp = [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 300.0.0.20.109",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Snapchat/12.0.0.0",
      "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 Line/13.0.0",
      "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 KAKAOTALK/10.0.0",
      "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Viber/20.0.0.0",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Norton",
    ];
    for (const ua of inApp) {
      assert.equal(isBotUserAgent(ua), false, ua);
    }
  });

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
    ];
    for (const name of required) {
      assert.ok(
        BOT_AGENTS.includes(name),
        `missing ${name} in BOT_AGENTS`,
      );
    }
  });

  it("blocks security and reputation scanners", () => {
    const blocked = [
      "Scamadviser.com/1.0",
      "Mozilla/5.0 (compatible; urlscan.io)",
      "Mozilla/5.0 (compatible; VirusTotal/1.0)",
    ];
    for (const ua of blocked) {
      assert.equal(isBlockedBotUserAgent(ua), true, ua);
      assert.equal(isBotUserAgent(ua), false, ua);
      assert.equal(isCrawlerRequest(new Request("https://flashmovies.xyz/", { headers: { "user-agent": ua } })), false, ua);
    }
    for (const name of BLOCKED_BOT_AGENTS) {
      assert.ok(BLOCKED_BOT_AGENTS.includes(name), `missing ${name} in BLOCKED_BOT_AGENTS`);
    }
  });

  it("reuses the live prerender-worker BOT_AGENTS entries", () => {
    const fromLiveWorker = [
      "googlebot",
      "yahoo! slurp",
      "bingbot",
      "rogerbot",
      "showyoubot",
      "google-inspectiontool",
      "chrome-lighthouse",
      "pinterestbot",
    ];
    for (const name of fromLiveWorker) {
      assert.ok(BOT_AGENTS.includes(name), `missing live-list agent ${name}`);
    }
  });

  it("does not treat X-Prerender loop-protection requests as crawlers", () => {
    const request = new Request("https://flashmovies.xyz/full-movie?type=movie&id=550", {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "X-Prerender": "1",
      },
    });
    assert.equal(hasPrerenderLoopHeader(request), true);
    assert.equal(isCrawlerRequest(request), false);
  });
});
