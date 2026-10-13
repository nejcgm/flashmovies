import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  ASYNC_TITLE_WAIT_MS,
  GA_MEASUREMENT_ID,
  dispatchPageView,
  ensureGaConfig,
  getPageViewModel,
} from "../utils/gaPageView.ts";

interface AnalyticsProps {
  measurementId?: string;
}

/**
 * Sends one GA4 page_view per location after the route title is known.
 * The gtag snippet used to run from Helmet on the first commit, while
 * index.html has no <title> and lazy routes had not mounted, so the hit
 * stored an empty page_title. History page views from the GA4 stream are
 * suppressed once gtag.js loads so those are not counted twice.
 */
export function Analytics({
  measurementId = GA_MEASUREMENT_ID,
}: AnalyticsProps) {
  const { pathname, search } = useLocation();

  useEffect(() => {
    ensureGaConfig(measurementId);
    const model = getPageViewModel();
    for (const command of model.onRoute(pathname, search, document.title)) {
      dispatchPageView(command, measurementId);
    }

    if (!model.isPending()) return;

    let timer = 0;
    const observer = new MutationObserver(() => {
      const command = model.onTitle(document.title);
      if (!command) return;
      dispatchPageView(command, measurementId);
      observer.disconnect();
      window.clearTimeout(timer);
    });
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    timer = window.setTimeout(() => {
      observer.disconnect();
      const command = model.flush();
      if (command) dispatchPageView(command, measurementId);
    }, ASYNC_TITLE_WAIT_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [measurementId, pathname, search]);

  return null;
}
