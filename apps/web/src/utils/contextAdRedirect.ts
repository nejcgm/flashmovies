import type { ContextAdRedirectOptions } from "../interfaces/ads/index.ts";
import { getAdsterraConfig } from "../config/adsterraConfig";
import { ClickTypeEnum } from "../interfaces/analytics/index.ts";

let globalCallCountAd = 0;
let newCount = 0;

function triggerContextAdRedirect(
  options: ContextAdRedirectOptions
): void {
  if (options.isPro) {
    return;
  }

  const adsterraConfig = getAdsterraConfig();

  newCount += 1;

  const shouldTriggerMain =
    options.forceFire || (newCount - 1) % 3 !== 0;

  const shouldFireAd = shouldTriggerMain ? options.incrementClick() : false;

  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "ad_redirect_click", {
      event_category: "monetization",
      event_label: options.eventLabel,
      click_type: options.clickType,
      movie_title: options.movieTitle || "N/A",
      movie_id: options.movieId || "N/A",
      ad_url: adsterraConfig.url,
      ad_fired: shouldFireAd,
      global_call_ad_count: globalCallCountAd,
    });
  }

  if (shouldFireAd) {
    globalCallCountAd += 1;
    window.open(adsterraConfig.url, "_blank", "noopener");
  }
};

export const redirectForMovie = (
  clickType:
    | ClickTypeEnum.HERO_CARD
    | ClickTypeEnum.MOVIE_CARD
    | ClickTypeEnum.UPNEXT_CARD,
  movieTitle: string,
  movieId: string | null,
  incrementClick: () => boolean,
  isPro?: boolean
): void => {
  triggerContextAdRedirect({
    eventLabel: `${clickType}_movie_click`,
    movieTitle,
    movieId,
    clickType,
    incrementClick,
    isPro,
  });
};

export const redirectForNavigation = (
  linkName: string,
  linkType:
    | ClickTypeEnum.MENU_LINK
    | ClickTypeEnum.NAVIGATION = ClickTypeEnum.MENU_LINK,
  incrementClick: () => boolean,
  isPro?: boolean
): void => {
  triggerContextAdRedirect({
    eventLabel: `${linkType}_${linkName}`,
    clickType: linkType,
    incrementClick,
    isPro,
  });
};

export const triggerContextAdRedirectDirect = (
  options: {
    eventLabel: string;
    movieTitle?: string;
    movieId?: string | null;
    clickType: ClickTypeEnum;
    forceFire?: boolean;
    isPro?: boolean;
  },
  incrementClick: () => boolean
): void => {
  triggerContextAdRedirect({
    ...options,
    incrementClick,
  });
};
