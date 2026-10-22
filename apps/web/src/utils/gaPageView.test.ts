import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ASYNC_TITLE_WAIT_MS,
  FAQ_PAGE_TITLE,
  HOME_PAGE_TITLE,
  NOT_FOUND_PAGE_TITLE,
  TERMS_PAGE_TITLE,
  createPageViewModel,
  dispatchPageView,
  fallbackPageTitle,
  gtagWillRunCommand,
  historyChangeEventName,
  isAsyncTitleRoute,
  isPageViewRedirect,
  normalizeRoutePath,
  readDetailTitle,
  routeKey,
  shouldFlushForPageExit,
  signalDetailTitle,
  suppressAutomaticHistoryPageViews,
  toPageLocation,
  withActivePageParams,
  type Pushable,
} from "./gaPageView.ts";

const ORIGIN = "https://flashmovies.xyz";

describe("gtag command shape", () => {
  it("does not treat an array as a command, even with callee set", () => {
    const plain = ["event", "page_view", { page_title: "Home" }];
    assert.equal(gtagWillRunCommand(plain), false);
    Object.defineProperty(plain, "callee", { value: function mark() {} });
    assert.equal(Object.prototype.hasOwnProperty.call(plain, "callee"), true);
    assert.equal(gtagWillRunCommand(plain), false);
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

describe("normalizeRoutePath", () => {
  it("strips trailing slashes, lowercases, and uses / when empty", () => {
    assert.equal(normalizeRoutePath("/Movie-Info/"), "/movie-info");
    assert.equal(normalizeRoutePath("/FULL-MOVIE///"), "/full-movie");
    assert.equal(normalizeRoutePath("/"), "/");
    assert.equal(normalizeRoutePath(""), "/");
    assert.equal(normalizeRoutePath("///"), "/");
    assert.equal(routeKey("/Movie-Info/", "?type=movie&id=550"), routeKey("/movie-info", "?type=movie&id=550"));
  });

  it("treats slash and case variants as the detail routes, not 404", () => {
    for (const pathname of ["/movie-info/", "/Movie-Info", "/FULL-MOVIE/"]) {
      assert.equal(isAsyncTitleRoute(pathname), true);
      const title = fallbackPageTitle(pathname, "?type=movie&id=550");
      assert.notEqual(title, NOT_FOUND_PAGE_TITLE);
    }
    assert.equal(fallbackPageTitle("/Movie-Info/", "?id=1"), "Movie — Flash Movies");
    assert.equal(fallbackPageTitle("/FULL-MOVIE/", ""), "Watch — Flash Movies");
    assert.equal(fallbackPageTitle("/List-Items/", "?title=most-popular-movies&type=movie&search=popular"), "Most Popular Movies - Flash Movies");
  });
});

describe("page exit flush", () => {
  it("flushes on pagehide and when the document is hidden", () => {
    assert.equal(ASYNC_TITLE_WAIT_MS >= 8000 && ASYNC_TITLE_WAIT_MS <= 10000, true);
    assert.equal(shouldFlushForPageExit("pagehide"), true);
    assert.equal(shouldFlushForPageExit("visibilitychange", "hidden"), true);
    assert.equal(shouldFlushForPageExit("visibilitychange", "visible"), false);
  });
});

describe("redirect locations", () => {
  it("marks parameter-less list routes, including slash and case variants", () => {
    assert.equal(isPageViewRedirect("/list-items", ""), true);
    assert.equal(isPageViewRedirect("/list-items/", ""), true);
    assert.equal(isPageViewRedirect("/LIST-ITEMS", "?type=movie"), true);
    assert.equal(
      isPageViewRedirect("/list-items", "?type=movie&search=popular&title=most-popular-movies"),
      false,
    );
    assert.equal(isPageViewRedirect("/movie-info", "?type=movie&id=1439112"), false);
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

  it("uses the same FAQ and Terms strings as those pages' Meta titles", () => {
    assert.equal(FAQ_PAGE_TITLE, "Frequently Asked Questions — Flash Movies");
    assert.equal(TERMS_PAGE_TITLE, "Terms and Conditions — Flash Movies");
    assert.equal(
      fallbackPageTitle("/frequently-asked-questions", ""),
      FAQ_PAGE_TITLE,
    );
    assert.equal(
      fallbackPageTitle("/Frequently-Asked-Questions/", ""),
      FAQ_PAGE_TITLE,
    );
    assert.equal(fallbackPageTitle("/terms-and-conditions", ""), TERMS_PAGE_TITLE);
    assert.equal(
      fallbackPageTitle("/Terms-And-Conditions/", ""),
      TERMS_PAGE_TITLE,
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

  it("keeps the real URL on a slashed detail path and does not send a second hit", () => {
    const model = createPageViewModel(ORIGIN);
    assert.deepEqual(
      model.onRoute("/Movie-Info/", "?type=movie&id=550", HOME_PAGE_TITLE),
      [],
    );
    assert.equal(model.isPending(), true);
    const settled = model.onTitle(
      "Fight Club (1999) — Watch Free Online | Flash Movies",
      "signal",
    );
    assert.equal(
      settled?.page_location,
      "https://flashmovies.xyz/Movie-Info/?type=movie&id=550",
    );
    assert.equal(
      settled?.page_title,
      "Fight Club (1999) — Watch Free Online | Flash Movies",
    );
    assert.deepEqual(
      model.onRoute("/movie-info", "?type=movie&id=550", settled?.page_title ?? ""),
      [],
    );
    assert.equal(model.flush(), null);
    assert.equal(
      model.onTitle("Fight Club (1999) — Watch Free Online | Flash Movies", "signal"),
      null,
    );
  });

  it("sends one not-found title for a bad id and ignores a later flush", () => {
    const model = createPageViewModel(ORIGIN);
    assert.deepEqual(
      model.onRoute("/movie-info", "?type=movie&id=1439112", NOT_FOUND_PAGE_TITLE),
      [],
    );
    assert.equal(model.onTitle(NOT_FOUND_PAGE_TITLE), null);
    const hit = model.onTitle(NOT_FOUND_PAGE_TITLE, "signal");
    assert.equal(hit?.page_title, NOT_FOUND_PAGE_TITLE);
    assert.equal(
      hit?.page_location,
      "https://flashmovies.xyz/movie-info?type=movie&id=1439112",
    );
    assert.equal(model.flush(), null);
    assert.equal(model.onTitle(NOT_FOUND_PAGE_TITLE, "signal"), null);
  });

  it("flushes a hidden detail page once and drops a title that arrives later", () => {
    const model = createPageViewModel(ORIGIN);
    model.onRoute("/full-movie/", "?type=tv&id=1396", "");
    assert.equal(model.isPending(), true);
    assert.equal(shouldFlushForPageExit("visibilitychange", "visible"), false);
    assert.equal(shouldFlushForPageExit("visibilitychange", "hidden"), true);
    const flushed = model.flush();
    assert.equal(flushed?.page_title, "Watch — Flash Movies");
    assert.equal(
      flushed?.page_location,
      "https://flashmovies.xyz/full-movie/?type=tv&id=1396",
    );
    assert.equal(model.flush(), null);
    assert.equal(
      model.onTitle("Watch Breaking Bad Free Online — Flash Movies", "signal"),
      null,
    );
    assert.equal(shouldFlushForPageExit("pagehide"), true);
    assert.equal(model.flush(), null);
  });

  it("does not emit the redirect source, so the destination is the only new hit", () => {
    const direct = createPageViewModel(ORIGIN);
    assert.deepEqual(direct.skipRedirect("/list-items/", ""), []);
    const home = direct.onRoute("/", "", "");
    assert.equal(home.length, 1);
    assert.equal(home[0].page_title, HOME_PAGE_TITLE);
    assert.equal(home[0].page_location, "https://flashmovies.xyz/");
    assert.deepEqual(direct.onRoute("/", "", HOME_PAGE_TITLE), []);
    assert.deepEqual(direct.skipRedirect("/list-items", ""), []);
    assert.deepEqual(direct.onRoute("/list-items", "", ""), []);

    const returning = createPageViewModel(ORIGIN);
    returning.onRoute("/", "", "");
    assert.deepEqual(returning.skipRedirect("/LIST-ITEMS", ""), []);
    assert.deepEqual(returning.onRoute("/", "", HOME_PAGE_TITLE), []);
  });

  it("reads a detail signal once for slash and case variants of the same route", () => {
    signalDetailTitle(
      "/Movie-Info/",
      "?type=movie&id=550",
      "Fight Club (1999) — Watch Free Online | Flash Movies",
    );
    assert.equal(
      readDetailTitle("/movie-info", "?type=movie&id=550"),
      "Fight Club (1999) — Watch Free Online | Flash Movies",
    );
    assert.equal(readDetailTitle("/movie-info", "?type=movie&id=551"), null);
    const model = createPageViewModel(ORIGIN);
    model.onRoute("/movie-info/", "?type=movie&id=550", "");
    const hit = model.onTitle(readDetailTitle("/MOVIE-INFO/", "?type=movie&id=550") ?? "", "signal");
    assert.equal(
      hit?.page_title,
      "Fight Club (1999) — Watch Free Online | Flash Movies",
    );
    assert.equal(hit?.page_location, "https://flashmovies.xyz/movie-info/?type=movie&id=550");
    assert.equal(model.flush(), null);
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
      title: "",
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

    const commands = queued.filter(gtagWillRunCommand) as unknown[][];
    assert.equal(commands.length, 3);
    for (const command of commands) {
      assert.equal(Array.isArray(command), false);
      assert.equal(
        Object.prototype.toString.call(command),
        "[object Arguments]",
      );
    }
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
    assert.equal(target.document.title, HOME_PAGE_TITLE);

    const gtag = (target.window as Window & { gtag?: (...args: unknown[]) => void })
      .gtag;
    assert.equal(typeof gtag, "function");
    gtag?.("event", "affiliate_click", { link_url: "https://example.test/a" });
    const after = queued.filter(gtagWillRunCommand) as unknown[][];
    assert.equal(after.length, 4);
    assert.equal(Array.isArray(after[3]), false);
    assert.equal(after[3][1], "affiliate_click");
    assert.deepEqual(after[3][2], {
      link_url: "https://example.test/a",
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
