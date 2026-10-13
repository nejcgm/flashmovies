import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  HOME_PAGE_TITLE,
  createPageViewModel,
  dispatchPageView,
  fallbackPageTitle,
  historyChangeEventName,
  isLegacyGtagCommand,
  markGtagCommand,
  suppressAutomaticHistoryPageViews,
  toPageLocation,
  withActivePageParams,
  type Pushable,
} from "./gaPageView.ts";

const ORIGIN = "https://flashmovies.xyz";

describe("gtag command shape", () => {
  it("marks arrays so gtag.js will not ignore them", () => {
    const plain = ["event", "page_view", { page_title: "Home" }];
    assert.equal(isLegacyGtagCommand(plain), false);
    const command = markGtagCommand(plain);
    assert.equal(isLegacyGtagCommand(command), true);
    assert.equal(command[0], "event");
    assert.equal((command[2] as { page_title: string }).page_title, "Home");
  });
});

describe("toPageLocation", () => {
  it("builds an absolute URL and drops the fragment", () => {
    assert.equal(
      toPageLocation(ORIGIN, "/list-items", "?type=movie&search=popular#hero"),
      "https://flashmovies.xyz/list-items?type=movie&search=popular",
    );
  });

  it("omits a question mark when there is no query", () => {
    assert.equal(toPageLocation(`${ORIGIN}/`, "/", ""), "https://flashmovies.xyz/");
  });
});

describe("fallbackPageTitle", () => {
  it("never returns a blank title", () => {
    const routes: Array<[string, string]> = [
      ["/", ""],
      ["/list-items", "?type=movie&search=popular&title=most-popular-movies"],
      ["/list-items", ""],
      ["/movie-info", "?type=movie&id=550"],
      ["/full-movie", "?type=tv&id=1396"],
      ["/watchlist", ""],
      ["/terms-and-conditions", ""],
      ["/no-such-page", ""],
    ];
    for (const [pathname, search] of routes) {
      assert.ok(fallbackPageTitle(pathname, search).trim().length > 0);
    }
  });

  it("matches the titles the SPA already sets for home, lists, watchlist, and 404", () => {
    assert.equal(fallbackPageTitle("/", ""), HOME_PAGE_TITLE);
    assert.equal(
      fallbackPageTitle(
        "/list-items",
        "?type=movie&search=trending_week&title=trending-movies-this-week",
      ),
      "Trending Movies This Week - Flash Movies",
    );
    assert.equal(
      fallbackPageTitle("/watchlist", ""),
      "My Watchlist - Flash Movies",
    );
    assert.equal(
      fallbackPageTitle("/missing", ""),
      "404 - Page Not Found | Flash Movies",
    );
  });
});

describe("createPageViewModel", () => {
  it("sends one page_view immediately for a route whose title is known", () => {
    const model = createPageViewModel(ORIGIN);
    const first = model.onRoute("/", "", "");
    assert.equal(first.length, 1);
    assert.equal(first[0].page_title, HOME_PAGE_TITLE);
    assert.equal(first[0].page_location, "https://flashmovies.xyz/");
    assert.equal(first[0].page_referrer, undefined);
    assert.equal(model.isPending(), false);
    assert.deepEqual(model.onRoute("/", "", HOME_PAGE_TITLE), []);
    assert.equal(model.flush(), null);
  });

  it("waits for a detail title and does not send a second hit when it arrives", () => {
    const model = createPageViewModel(ORIGIN);
    assert.deepEqual(
      model.onRoute("/movie-info", "?type=movie&id=550", ""),
      [],
    );
    assert.equal(model.isPending(), true);
    const settled = model.onTitle(
      "Fight Club (1999) — Watch Free Online | Flash Movies",
    );
    assert.ok(settled);
    assert.equal(
      settled?.page_title,
      "Fight Club (1999) — Watch Free Online | Flash Movies",
    );
    assert.equal(
      settled?.page_location,
      "https://flashmovies.xyz/movie-info?type=movie&id=550",
    );
    assert.equal(model.onTitle("Fight Club (1999) — Watch Free Online | Flash Movies"), null);
    assert.equal(model.flush(), null);
  });

  it("flushes a non-empty fallback once when the detail title never arrives", () => {
    const model = createPageViewModel(ORIGIN);
    model.onRoute("/full-movie", "?type=tv&id=1396", HOME_PAGE_TITLE);
    assert.equal(model.onTitle(HOME_PAGE_TITLE), null);
    const flushed = model.flush();
    assert.equal(flushed?.page_title, "Watch — Flash Movies");
    assert.equal(
      flushed?.page_location,
      "https://flashmovies.xyz/full-movie?type=tv&id=1396",
    );
    assert.equal(model.onTitle("Watch Breaking Bad Free Online — Flash Movies"), null);
  });

  it("counts a route change once and sets the previous location as referrer", () => {
    const model = createPageViewModel(ORIGIN);
    model.onRoute("/", "", "");
    const next = model.onRoute(
      "/list-items",
      "?type=movie&search=popular&title=most-popular-movies",
      HOME_PAGE_TITLE,
    );
    assert.equal(next.length, 1);
    assert.equal(next[0].page_title, "Most Popular Movies - Flash Movies");
    assert.equal(next[0].page_referrer, "https://flashmovies.xyz/");
    assert.deepEqual(
      model.onRoute(
        "/list-items",
        "?type=movie&search=popular&title=most-popular-movies",
        "Most Popular Movies - Flash Movies",
      ),
      [],
    );
  });

  it("flushes a pending detail page once when navigating away", () => {
    const model = createPageViewModel(ORIGIN);
    model.onRoute("/movie-info", "?type=movie&id=550", "");
    const commands = model.onRoute("/watchlist", "", "");
    assert.equal(commands.length, 2);
    assert.equal(commands[0].page_title, "Movie — Flash Movies");
    assert.equal(
      commands[0].page_location,
      "https://flashmovies.xyz/movie-info?type=movie&id=550",
    );
    assert.equal(commands[1].page_title, "My Watchlist - Flash Movies");
    assert.equal(
      commands[1].page_referrer,
      "https://flashmovies.xyz/movie-info?type=movie&id=550",
    );
    assert.equal(model.isPending(), false);
  });
});

describe("history page views", () => {
  it("recognizes enhanced-measurement history messages only", () => {
    assert.equal(
      historyChangeEventName({ event: "gtm.historyChange-v2" }),
      "gtm.historyChange-v2",
    );
    assert.equal(historyChangeEventName({ event: "page_view" }), null);
    assert.equal(historyChangeEventName(["event", "page_view", {}]), null);
  });

  it("drops history messages and still forwards other commands", () => {
    const forwarded: unknown[] = [];
    const layer: Pushable = [];
    layer.push = (...args: unknown[]) => {
      forwarded.push(args[0]);
      return forwarded.length;
    };
    suppressAutomaticHistoryPageViews(layer);
    layer.push({ event: "gtm.historyChange-v2", "gtm.newUrl": "https://flashmovies.xyz/list-items" });
    layer.push({ 0: "event", 1: "page_view" });
    assert.equal(forwarded.length, 1);
    assert.deepEqual(forwarded[0], { 0: "event", 1: "page_view" });
  });
});

describe("dispatchPageView", () => {
  it("queues a manual page_view after config with send_page_view disabled", () => {
    const queued: unknown[] = [];
    const target = globalThis as typeof globalThis & {
      window: Window;
      document: Document;
    };
    target.window = {
      dataLayer: queued,
      location: { origin: ORIGIN },
      addEventListener() {},
    } as unknown as Window;
    target.document = {
      createElement() {
        return { addEventListener() {} };
      },
      head: { appendChild() {} },
    } as unknown as Document;

    dispatchPageView(
      {
        page_title: HOME_PAGE_TITLE,
        page_location: "https://flashmovies.xyz/",
      },
      "G-TEST",
    );

    const commands = queued.filter(isLegacyGtagCommand) as unknown[][];
    assert.deepEqual(
      commands.map((command) => command[0]),
      ["js", "config", "event"],
    );
    assert.equal(
      (commands[1][2] as { send_page_view?: boolean }).send_page_view,
      false,
    );
    assert.equal(commands[2][1], "page_view");
    assert.deepEqual(commands[2][2], {
      page_title: HOME_PAGE_TITLE,
      page_location: "https://flashmovies.xyz/",
    });
  });
});

describe("withActivePageParams", () => {
  const page = {
    page_title: "Home",
    page_location: "https://flashmovies.xyz/",
  };

  it("fills a blank location and title on custom events", () => {
    assert.deepEqual(
      withActivePageParams("LCP", { value: 1, page_title: "" }, page),
      {
        value: 1,
        page_title: "Home",
        page_location: "https://flashmovies.xyz/",
      },
    );
  });

  it("does not overwrite a page_view or an explicit location", () => {
    assert.deepEqual(
      withActivePageParams("page_view", { page_title: "Keep" }, page),
      { page_title: "Keep" },
    );
    assert.deepEqual(
      withActivePageParams(
        "affiliate_click",
        { page_location: "https://flashmovies.xyz/watchlist" },
        page,
      ),
      {
        page_location: "https://flashmovies.xyz/watchlist",
        page_title: "Home",
      },
    );
  });
});
