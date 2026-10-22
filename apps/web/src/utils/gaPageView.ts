import { formatTitle } from "./helpers.ts";

/** Same string as `Meta`'s default title. Sent on `/` so the hit is not blank. */
export const HOME_PAGE_TITLE =
  "Flash Movies — Watch Free Movies & TV Shows Online";

export const GA_MEASUREMENT_ID = "G-RNJNNRHPJ0";

/** Detail pages set `<title>` only after TMDB returns. */
export const ASYNC_TITLE_WAIT_MS = 10000;

export const NOT_FOUND_PAGE_TITLE = "404 - Page Not Found | Flash Movies";

const ASYNC_TITLE_PATHS = new Set(["/movie-info", "/full-movie"]);

/**
 * Route matching ignores trailing slashes and case. The document location
 * sent to GA stays the raw URL.
 */
export function normalizeRoutePath(pathname: string): string {
  let path = pathname.trim().toLowerCase();
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/+$/, "");
  return path === "" ? "/" : path;
}

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
  return `${normalizeRoutePath(pathname)}${normalizeSearch(search)}`;
}

/**
 * Locations that leave the screen immediately. Analytics skips the page_view
 * so the destination is the only hit.
 */
export function isPageViewRedirect(pathname: string, search: string): boolean {
  if (normalizeRoutePath(pathname) !== "/list-items") return false;
  const params = new URLSearchParams(
    normalizeSearch(search).replace(/^\?/, ""),
  );
  return !params.get("type") || !params.get("search");
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
  return ASYNC_TITLE_PATHS.has(normalizeRoutePath(pathname));
}

/** `pagehide`, or a tab moving to the background, should send a pending hit once. */
export function shouldFlushForPageExit(
  type: "pagehide" | "visibilitychange",
  visibilityState?: string,
): boolean {
  if (type === "pagehide") return true;
  return visibilityState === "hidden";
}

/**
 * Title used when the document title is still empty or still belongs to the
 * previous route. Strings for screens that set `<Meta>` match those titles.
 */
export function fallbackPageTitle(pathname: string, search: string): string {
  const params = new URLSearchParams(
    normalizeSearch(search).replace(/^\?/, ""),
  );

  switch (normalizeRoutePath(pathname)) {
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
      return NOT_FOUND_PAGE_TITLE;
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
  let skippedKey: string | null = null;

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
    /**
     * The location is being replaced. Flush a different pending route, and
     * do not emit a page_view for this one.
     */
    skipRedirect(pathname: string, search: string): GaPageView[] {
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
      } else if (pending && pending.key === key) {
        pending = null;
      }
      skippedKey = key;
      return commands;
    },

    onRoute(
      pathname: string,
      search: string,
      documentTitle: string,
    ): GaPageView[] {
      const key = routeKey(pathname, search);
      const commands: GaPageView[] = [];

      if (skippedKey === key) {
        skippedKey = null;
        return commands;
      }
      skippedKey = null;

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

    onTitle(
      documentTitle: string,
      source: "document" | "signal" = "document",
    ): GaPageView | null {
      if (!pending) return null;
      const title = documentTitle.trim();
      if (!title) return null;
      // A document mutation can still be the previous route's title. An
      // explicit signal from the detail page is the title for this location.
      if (source !== "signal" && title === pending.startedTitle) return null;
      if (normalizeRoutePath(pending.pathname) !== "/" && title === HOME_PAGE_TITLE) {
        return null;
      }
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

export interface DetailTitleSignal {
  key: string;
  title: string;
}

let retainedDetailTitle: DetailTitleSignal | null = null;
const detailTitleListeners = new Set<(signal: DetailTitleSignal) => void>();

/** Detail pages call this when the real title is known, or the load has failed. */
export function signalDetailTitle(
  pathname: string,
  search: string,
  title: string,
): void {
  const trimmed = title.trim();
  if (!trimmed) return;
  const signal = { key: routeKey(pathname, search), title: trimmed };
  retainedDetailTitle = signal;
  for (const listener of detailTitleListeners) listener(signal);
}

export function readDetailTitle(pathname: string, search: string): string | null {
  if (!retainedDetailTitle) return null;
  if (retainedDetailTitle.key !== routeKey(pathname, search)) return null;
  return retainedDetailTitle.title;
}

export function subscribeDetailTitle(
  listener: (signal: DetailTitleSignal) => void,
): () => void {
  detailTitleListeners.add(listener);
  return () => {
    detailTitleListeners.delete(listener);
  };
}

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
 * True when gtag.js will execute this dataLayer entry as a command
 * (`js` / `config` / `event`). A real Array is not a command: the
 * library checks `Array.isArray` first and treats those entries as
 * function calls, even if a `callee` property was added to imitate
 * `arguments`.
 */
export function gtagWillRunCommand(value: unknown): boolean {
  if (Array.isArray(value) || value == null || typeof value !== "object") {
    return false;
  }
  const command = value as { length?: number; 0?: unknown };
  const isArguments =
    Object.prototype.toString.call(value) === "[object Arguments]" ||
    Object.prototype.hasOwnProperty.call(value, "callee");
  return Boolean(isArguments && command.length && typeof command[0] === "string");
}

/**
 * Queue one gtag command as this function's `arguments` object.
 * Built with `new Function` so the bundler cannot rewrite it into an
 * array push. gtag.js ignores arrays (the `callee` workaround included).
 */
const queueGtag = new Function(
  "window.dataLayer = window.dataLayer || []; window.dataLayer.push(arguments);",
) as (...parts: unknown[]) => void;

function installGtagFunction(): void {
  if (typeof window.gtag === "function") return;
  const gtag = (
    command: string,
    target?: string | Date,
    params?: Record<string, unknown>,
  ) => {
    if (
      command === "event" &&
      typeof target === "string" &&
      target !== "page_view"
    ) {
      queueGtag(
        "event",
        target,
        withActivePageParams(target, params, getActivePage()),
      );
      return;
    }
    if (params !== undefined) queueGtag(command, target, params);
    else if (target !== undefined) queueGtag(command, target);
    else queueGtag(command);
  };
  window.gtag = gtag;
}

function flushPendingPageView(measurementId: string): void {
  const command = getPageViewModel().flush();
  if (command) dispatchPageView(command, measurementId);
}

function bindPageHide(measurementId: string): void {
  if (pageHideBound) return;
  pageHideBound = true;
  window.addEventListener("pagehide", () => {
    if (shouldFlushForPageExit("pagehide")) flushPendingPageView(measurementId);
  });
  if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    document.addEventListener("visibilitychange", () => {
      if (shouldFlushForPageExit("visibilitychange", document.visibilityState)) {
        flushPendingPageView(measurementId);
      }
    });
  }
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
  queueGtag("js", new Date());
  queueGtag("config", measurementId, { send_page_view: false });
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
  // Enhanced measurement (scroll, for example) reads document.title. The
  // manual page_view already carries page_title, but those automatic hits
  // do not. Fill a blank title before gtag.js loads.
  if (typeof document !== "undefined" && !document.title.trim()) {
    document.title = command.page_title;
  }
  queueGtag("event", "page_view", params);
  // Load gtag.js only after the page_view is queued so it is processed before
  // enhanced-measurement events from this startup.
  armGaScript(measurementId);
}
