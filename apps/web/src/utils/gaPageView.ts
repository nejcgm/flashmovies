import { formatTitle } from "./helpers.ts";

/** Same string as `Meta`'s default title. Sent on `/` so the hit is not blank. */
export const HOME_PAGE_TITLE =
  "Flash Movies — Watch Free Movies & TV Shows Online";

export const GA_MEASUREMENT_ID = "G-RNJNNRHPJ0";

/** Detail pages set `<title>` only after TMDB returns. */
export const ASYNC_TITLE_WAIT_MS = 2000;

const ASYNC_TITLE_PATHS = new Set(["/movie-info", "/full-movie"]);

export interface GaPageView {
  page_title: string;
  page_location: string;
  page_referrer?: string;
}

export interface ActivePage {
  page_title: string;
  page_location: string;
}

interface PendingRoute {
  key: string;
  pathname: string;
  search: string;
  startedTitle: string;
}

export interface Pushable {
  length: number;
  push: (...args: unknown[]) => number;
  __fmHistoryFiltered?: boolean;
}

export function routeKey(pathname: string, search: string): string {
  return `${pathname}${normalizeSearch(search)}`;
}

function normalizeSearch(search: string): string {
  if (!search) return "";
  const hash = search.indexOf("#");
  const withoutHash = hash >= 0 ? search.slice(0, hash) : search;
  if (!withoutHash) return "";
  return withoutHash.startsWith("?") ? withoutHash : `?${withoutHash}`;
}

/** Full URL without a fragment. GA4 drops `page_location` values that are not absolute. */
export function toPageLocation(
  origin: string,
  pathname: string,
  search: string,
): string {
  const base = origin.replace(/\/+$/, "");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}${normalizeSearch(search)}`;
}

export function isAsyncTitleRoute(pathname: string): boolean {
  return ASYNC_TITLE_PATHS.has(pathname);
}

/**
 * Title used when the document title is still empty or still belongs to the
 * previous route. Strings for screens that set `<Meta>` match those titles.
 */
export function fallbackPageTitle(pathname: string, search: string): string {
  const params = new URLSearchParams(
    normalizeSearch(search).replace(/^\?/, ""),
  );

  switch (pathname) {
    case "/":
      return HOME_PAGE_TITLE;
    case "/list-items": {
      const formatted = formatTitle(params.get("title"))?.trim();
      return formatted
        ? `${formatted} - Flash Movies`
        : "Browse — Flash Movies";
    }
    case "/movie-info":
      return "Movie — Flash Movies";
    case "/full-movie":
      return "Watch — Flash Movies";
    case "/watchlist":
      return "My Watchlist - Flash Movies";
    case "/terms-and-conditions":
      return "Terms and Conditions — Flash Movies";
    case "/pro-plan-terms-and-conditions":
      return "Pro Plan Terms — Flash Movies";
    case "/frequently-asked-questions":
      return "Frequently Asked Questions — Flash Movies";
    case "/auth/login":
      return "Login — Flash Movies";
    case "/auth/register":
      return "Create Account — Flash Movies";
    case "/auth/logout":
      return "Logout — Flash Movies";
    case "/payments/plans":
      return "Plans — Flash Movies";
    case "/payments/remove-pro":
      return "Remove Pro — Flash Movies";
    default:
      return "404 - Page Not Found | Flash Movies";
  }
}

export function historyChangeEventName(payload: unknown): string | null {
  if (payload == null || typeof payload !== "object") return null;
  if (!("event" in payload)) return null;
  const name = (payload as { event?: unknown }).event;
  if (name === "gtm.historyChange" || name === "gtm.historyChange-v2") {
    return name;
  }
  return null;
}

/**
 * The live GA4 stream enables enhanced-measurement history page views.
 * Those fire on `pushState` before React sets the title, and they would
 * double-count the manual `page_view`. Drop only those dataLayer messages.
 */
export function suppressAutomaticHistoryPageViews(dataLayer: Pushable): void {
  if (dataLayer.__fmHistoryFiltered) return;
  const inner = dataLayer.push.bind(dataLayer);
  dataLayer.push = (...args: unknown[]) => {
    if (args.length === 1 && historyChangeEventName(args[0])) {
      return dataLayer.length;
    }
    return inner(...args);
  };
  dataLayer.__fmHistoryFiltered = true;
}

export function withActivePageParams(
  eventName: string,
  params: Record<string, unknown> | undefined,
  page: ActivePage | null,
): Record<string, unknown> {
  const next = { ...(params ?? {}) };
  if (eventName === "page_view" || !page) return next;
  if (next.page_location == null || next.page_location === "") {
    next.page_location = page.page_location;
  }
  if (next.page_title == null || next.page_title === "") {
    next.page_title = page.page_title;
  }
  return next;
}

export function createPageViewModel(origin: string) {
  let sentKey: string | null = null;
  let previousLocation: string | null = null;
  let pending: PendingRoute | null = null;

  function emit(pathname: string, search: string, title: string): GaPageView {
    const page_title = title.trim() || fallbackPageTitle(pathname, search);
    const page_location = toPageLocation(origin, pathname, search);
    const command: GaPageView = { page_title, page_location };
    if (previousLocation) command.page_referrer = previousLocation;
    previousLocation = page_location;
    sentKey = routeKey(pathname, search);
    pending = null;
    return command;
  }

  return {
    isPending(): boolean {
      return pending !== null;
    },

    /**
     * One command per location. Sync routes send immediately with the known
     * title. Detail routes wait until `onTitle` or `flush`.
     */
    onRoute(
      pathname: string,
      search: string,
      documentTitle: string,
    ): GaPageView[] {
      const key = routeKey(pathname, search);
      const commands: GaPageView[] = [];

      if (pending && pending.key !== key) {
        commands.push(
          emit(
            pending.pathname,
            pending.search,
            fallbackPageTitle(pending.pathname, pending.search),
          ),
        );
      }

      if (sentKey === key) return commands;

      if (!isAsyncTitleRoute(pathname)) {
        commands.push(emit(pathname, search, fallbackPageTitle(pathname, search)));
        return commands;
      }

      pending = {
        key,
        pathname,
        search,
        startedTitle: documentTitle.trim(),
      };
      return commands;
    },

    onTitle(documentTitle: string): GaPageView | null {
      if (!pending) return null;
      const title = documentTitle.trim();
      if (!title || title === pending.startedTitle) return null;
      if (pending.pathname !== "/" && title === HOME_PAGE_TITLE) return null;
      return emit(pending.pathname, pending.search, title);
    },

    flush(): GaPageView | null {
      if (!pending) return null;
      return emit(
        pending.pathname,
        pending.search,
        fallbackPageTitle(pending.pathname, pending.search),
      );
    },
  };
}

export type PageViewModel = ReturnType<typeof createPageViewModel>;

let activePage: ActivePage | null = null;
let configured = false;
let scriptRequested = false;
let pageHideBound = false;
let webVitalsStarted = false;
let singleton: PageViewModel | null = null;

export function getActivePage(): ActivePage | null {
  return activePage;
}

export function setActivePage(page: ActivePage): void {
  activePage = { page_title: page.page_title, page_location: page.page_location };
}

export function getPageViewModel(): PageViewModel {
  if (!singleton) singleton = createPageViewModel(window.location.origin);
  return singleton;
}

interface WebVitalMetric {
  name: string;
  delta: number;
  id: string;
}

interface WebVitalsModule {
  onCLS: (callback: (metric: WebVitalMetric) => void) => void;
  onFCP: (callback: (metric: WebVitalMetric) => void) => void;
  onLCP: (callback: (metric: WebVitalMetric) => void) => void;
  onTTFB: (callback: (metric: WebVitalMetric) => void) => void;
  onFID?: (callback: (metric: WebVitalMetric) => void) => void;
}

function dataLayer(): unknown[] {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

/**
 * gtag.js accepts a real array as a command only when it has a `callee`
 * property (the same check it uses for `arguments` objects). A plain array
 * is ignored and the hit never sends.
 */
export function markGtagCommand(args: unknown[]): unknown[] {
  Object.defineProperty(args, "callee", { value: markGtagCommand });
  return args;
}

export function isLegacyGtagCommand(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  return (
    Object.prototype.toString.call(value) === "[object Arguments]" ||
    Object.prototype.hasOwnProperty.call(value, "callee")
  );
}

function pushGtag(...args: unknown[]): void {
  dataLayer().push(markGtagCommand(args));
}

function installGtagFunction(): void {
  if (typeof window.gtag === "function") return;
  const gtag = (...args: unknown[]) => {
    const [command, target, params] = args;
    if (
      command === "event" &&
      typeof target === "string" &&
      target !== "page_view"
    ) {
      pushGtag(
        "event",
        target,
        withActivePageParams(
          target,
          params as Record<string, unknown> | undefined,
          getActivePage(),
        ),
      );
      return;
    }
    pushGtag(...args);
  };
  window.gtag = gtag as Window["gtag"];
}

function bindPageHide(measurementId: string): void {
  if (pageHideBound) return;
  pageHideBound = true;
  window.addEventListener("pagehide", () => {
    const command = getPageViewModel().flush();
    if (command) dispatchPageView(command, measurementId);
  });
}

function startWebVitals(): void {
  if (webVitalsStarted) return;
  webVitalsStarted = true;
  const specifier = "https://unpkg.com/web-vitals@3/dist/web-vitals.js";
  const load = new Function(
    "specifier",
    "return import(specifier)",
  ) as (specifier: string) => Promise<WebVitalsModule>;

  void load(specifier)
    .then((mod) => {
      const send = (metric: WebVitalMetric) => {
        const page = getActivePage();
        if (!page || typeof window.gtag !== "function") return;
        window.gtag(
          "event",
          metric.name,
          withActivePageParams(
            metric.name,
            {
              event_category: "Web Vitals",
              event_label: metric.id,
              value: Math.round(
                metric.name === "CLS" ? metric.delta * 1000 : metric.delta,
              ),
              non_interaction: true,
            },
            page,
          ),
        );
      };
      mod.onCLS(send);
      mod.onFCP(send);
      mod.onLCP(send);
      mod.onTTFB(send);
      mod.onFID?.(send);
    })
    .catch(() => {});
}

export function armGaScript(measurementId: string): void {
  if (scriptRequested || typeof document === "undefined") return;
  scriptRequested = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  script.addEventListener("load", () => {
    const layer = dataLayer() as unknown as Pushable;
    suppressAutomaticHistoryPageViews(layer);
    startWebVitals();
  });
  document.head.appendChild(script);
}

export function ensureGaConfig(measurementId: string = GA_MEASUREMENT_ID): void {
  installGtagFunction();
  bindPageHide(measurementId);
  if (configured) return;
  configured = true;
  // `js` then `config` must be queued before the library runs. Page views are
  // queued after this and before the script is inserted.
  pushGtag("js", new Date());
  pushGtag("config", measurementId, { send_page_view: false });
}

export function dispatchPageView(
  command: GaPageView,
  measurementId: string = GA_MEASUREMENT_ID,
): void {
  if (!command.page_title.trim() || !command.page_location) return;
  ensureGaConfig(measurementId);
  setActivePage(command);
  const params: Record<string, unknown> = {
    page_title: command.page_title,
    page_location: command.page_location,
  };
  if (command.page_referrer) params.page_referrer = command.page_referrer;
  pushGtag("event", "page_view", params);
  // Load gtag.js only after the page_view is queued so it is processed before
  // enhanced-measurement events from this startup.
  armGaScript(measurementId);
}
