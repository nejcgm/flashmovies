import { getAdsterraConfig } from '../config/adsterraConfig';
import { ClickTypeEnum } from './types';

interface AdRedirectOptions {
  eventLabel: string;
  movieTitle?: string;
  movieId?: string | null;
  clickType: ClickTypeEnum;
  forceFire?: boolean;
}

// Track call counts for each unique function call
const functionCallCounts = new Map<string, number>();
// Track global call count
let globalCallCount = 0;
let globalCallCountAd = 0;

export const triggerAdRedirect = (options: AdRedirectOptions): void => {
  const adsterraConfig = getAdsterraConfig();
  
  const functionKey = options.eventLabel;
  const currentCount = functionCallCounts.get(functionKey) || 0;
  const newCount = currentCount + 1;
  
  globalCallCount += 1;
  const shouldFireAd = options.forceFire ? true : globalCallCount % 2 === 1;
  
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
  movieId: string | null
): void => {
  triggerAdRedirect({
    eventLabel: `${clickType}_movie_click`,
    movieTitle,
    movieId,
    clickType
  });
};

/**
 * Higher-level wrapper for navigation clicks
 */
export const redirectForNavigation = (
  linkName: string,
  linkType: ClickTypeEnum.MENU_LINK | ClickTypeEnum.NAVIGATION = ClickTypeEnum.MENU_LINK
): void => {
  triggerAdRedirect({
    eventLabel: `${linkType}_${linkName}`,
    clickType: linkType
  });
}; 