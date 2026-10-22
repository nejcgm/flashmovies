import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  ASYNC_TITLE_WAIT_MS,
  GA_MEASUREMENT_ID,
  dispatchPageView,
  ensureGaConfig,
  getPageViewModel,
  isPageViewRedirect,
  readDetailTitle,
  routeKey,
  subscribeDetailTitle,
} from "../utils/gaPageView.ts";

interface AnalyticsProps {
  measurementId?: string;
}

/**
 * Sends one GA4 page_view per location after the route title is known.
 * The gtag snippet used to run from Helmet on the first commit, while
 * index.html has no <title> and lazy routes had not mounted, so the hit
 * stored an empty page_title. Commands are queued as `arguments` objects:
 * gtag.js does not execute real arrays, so an array page_view never
 * reaches collect. History page views from the GA4 stream are suppressed
 * once gtag.js loads so those are not counted twice.
 *
 * Detail routes wait for `signalDetailTitle` (or a `<title>` mutation) and
 * fall back after ASYNC_TITLE_WAIT_MS. `pagehide` and a hidden tab flush a
 * still-pending hit so a slow load is not dropped.
 */
export function Analytics({
  measurementId = GA_MEASUREMENT_ID,
}: AnalyticsProps) {
  const { pathname, search } = useLocation();

  useEffect(() => {
    ensureGaConfig(measurementId);
    const model = getPageViewModel();

    if (isPageViewRedirect(pathname, search)) {
      for (const command of model.skipRedirect(pathname, search)) {
        dispatchPageView(command, measurementId);
      }
      return;
    }

    for (const command of model.onRoute(pathname, search, document.title)) {
      dispatchPageView(command, measurementId);
    }

    if (!model.isPending()) return;

    let settled = false;
    let timer = 0;
    let unsubscribe = () => {};
    const observer = new MutationObserver(() => {
      settle(document.title);
    });

    const finish = () => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      unsubscribe();
      window.clearTimeout(timer);
    };

    const settle = (title: string, source: "document" | "signal" = "document") => {
      if (settled) return;
      const command = model.onTitle(title, source);
      if (!command) return;
      dispatchPageView(command, measurementId);
      finish();
    };

    const key = routeKey(pathname, search);
    unsubscribe = subscribeDetailTitle((signal) => {
      if (signal.key !== key) return;
      settle(signal.title, "signal");
    });
    const retained = readDetailTitle(pathname, search);
    if (retained) settle(retained, "signal");

    if (!settled) {
      observer.observe(document.head, {
        childList: true,
        subtree: true,
        characterData: true,
      });
      timer = window.setTimeout(() => {
        if (settled) return;
        observer.disconnect();
        unsubscribe();
        const command = model.flush();
        if (command) dispatchPageView(command, measurementId);
        settled = true;
      }, ASYNC_TITLE_WAIT_MS);
    }

    return () => {
      finish();
    };
  }, [measurementId, pathname, search]);

  return null;
}
