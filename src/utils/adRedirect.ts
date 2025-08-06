interface AdRedirectOptions {
  eventLabel: string;
  movieTitle?: string;
  movieId?: string | null;
  clickType: 'hero_card' | 'movie_card' | 'upnext_card' | 'menu_link' | 'navigation';
}

/**
 * Analytics tracking for clicks - works with official Adsterra popunder script
 * The popunder script handles the actual ads automatically
 */
export const triggerAdRedirect = (options: AdRedirectOptions): void => {
  // Track the click for CTR analysis
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'click_with_popunder', {
      event_category: 'monetization',
      event_label: options.eventLabel,
      click_type: options.clickType,
      movie_title: options.movieTitle || 'N/A',
      movie_id: options.movieId || 'N/A',
      ad_type: 'official_adsterra_popunder'
    });
  }

  // Note: No manual redirect needed - official Adsterra script handles popunders automatically
  // This function now only tracks user interactions for analytics
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