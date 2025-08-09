import { getAdsterraConfig } from '../config/adsterraConfig';

interface AdRedirectOptions {
  eventLabel: string;
  movieTitle?: string;
  movieId?: string | null;
  clickType: 'hero_card' | 'movie_card' | 'upnext_card' | 'menu_link' | 'navigation';
  forceFire?: boolean;
}

// Track call counts for each unique function call
const functionCallCounts = new Map<string, number>();


export const triggerAdRedirect = (options: AdRedirectOptions): void => {
  const adsterraConfig = getAdsterraConfig();
  
  
  const functionKey = options.eventLabel;
  
  const currentCount = functionCallCounts.get(functionKey) || 0;
  const newCount = currentCount + 1;
  
  functionCallCounts.set(functionKey, newCount);
  
  const shouldFireAd = options.forceFire ? true : newCount % 2 === 1;
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'ad_redirect_click', {
      event_category: 'monetization',
      event_label: options.eventLabel,
      click_type: options.clickType,
      movie_title: options.movieTitle || 'N/A',
      movie_id: options.movieId || 'N/A',
      ad_url: adsterraConfig.url,
      function_call_count: newCount,
      ad_fired: shouldFireAd
    });
  }

  if (shouldFireAd) {
    window.open(adsterraConfig.url, '_blank', 'noopener');
  }
};

/**
 * Higher-level wrapper for movie-related clicks
 */
export const redirectForMovie = (
  clickType: 'hero_card' | 'movie_card' | 'upnext_card',
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
  linkType: 'menu_link' | 'navigation' = 'menu_link'
): void => {
  triggerAdRedirect({
    eventLabel: `${linkType}_${linkName}`,
    clickType: linkType
  });
}; 