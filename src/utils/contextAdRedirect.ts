import { getAdsterraConfig } from '../config/adsterraConfig';
import { ClickTypeEnum } from './types';

interface ContextAdRedirectOptions {
  eventLabel: string;
  movieTitle?: string;
  movieId?: string | null;
  clickType: ClickTypeEnum;
  forceFire?: boolean;
  incrementClick: () => boolean; // Passed from useAdTracker hook
}

// Track call counts for each unique function call
const functionCallCounts = new Map<string, number>();
let globalCallCountAd = 0;

export const triggerContextAdRedirect = (options: ContextAdRedirectOptions): void => {
  const adsterraConfig = getAdsterraConfig();
  
  const functionKey = options.eventLabel;
  const currentCount = functionCallCounts.get(functionKey) || 0;
  const newCount = currentCount + 1;
  functionCallCounts.set(functionKey, newCount);
  
  const shouldTriggerMain = options.forceFire || newCount % 2 === 1;
  
  const shouldFireAd = shouldTriggerMain ? options.incrementClick() : false;
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'ad_redirect_click', {
      event_category: 'monetization',
      event_label: options.eventLabel,
      click_type: options.clickType,
      movie_title: options.movieTitle || 'N/A',
      movie_id: options.movieId || 'N/A',
      ad_url: adsterraConfig.url,
      function_call_count: newCount,
      ad_fired: shouldFireAd,
      global_call_ad_count: globalCallCountAd
    });
  }

  if (shouldFireAd) {
    globalCallCountAd += 1;
    window.open(adsterraConfig.url, '_blank', 'noopener');
  }
};

/**
 * Higher-level wrapper for movie-related clicks
 */
export const redirectForMovie = (
  clickType: ClickTypeEnum.HERO_CARD | ClickTypeEnum.MOVIE_CARD | ClickTypeEnum.UPNEXT_CARD,
  movieTitle: string,
  movieId: string | null,
  incrementClick: () => boolean
): void => {
  triggerContextAdRedirect({
    eventLabel: `${clickType}_movie_click`,
    movieTitle,
    movieId,
    clickType,
    incrementClick
  });
};

/**
 * Higher-level wrapper for navigation clicks
 */
export const redirectForNavigation = (
  linkName: string,
  linkType: ClickTypeEnum.MENU_LINK | ClickTypeEnum.NAVIGATION = ClickTypeEnum.MENU_LINK,
  incrementClick: () => boolean
): void => {
  triggerContextAdRedirect({
    eventLabel: `${linkType}_${linkName}`,
    clickType: linkType,
    incrementClick
  });
};

/**
 * Context-aware version of triggerAdRedirect for direct use
 */
export const triggerContextAdRedirectDirect = (
  options: {
    eventLabel: string;
    movieTitle?: string;
    movieId?: string | null;
    clickType: ClickTypeEnum;
    forceFire?: boolean;
  },
  incrementClick: () => boolean
): void => {
  triggerContextAdRedirect({
    ...options,
    incrementClick
  });
};
