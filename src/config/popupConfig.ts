// 🎯 Popup Configuration - Easy to adjust for optimization
export const POPUP_CONFIG = {
  // 🔗 Popup URL - Your monetization link
  url: 'https://raptripeessentially.com/s950viwd5w?key=22e656243ca5f0a2aef1c31a7cf4a3a7',
  
  // ⚡ Enable/Disable popup system
  enabled: true,
  
  // 📊 Engagement Requirements (adjust based on analytics)
  engagement: {
    minClicks: 3,        // Minimum clicks before popup eligibility
    minTimeOnSite: 30,   // Minimum seconds on site
    minScrollDepth: 25,  // Minimum scroll percentage (0-100)
    minPageViews: 1      // Minimum pages viewed
  },
  
  // ⏱️ Timing Settings
  timing: {
    popupDelay: 5000,    // Delay in milliseconds before showing popup
    cooldownHours: 24    // Hours between popup shows (across sessions)
  },
  
  // 🎯 A/B Testing Configurations (easy to switch)
  profiles: {
    conservative: {
      minClicks: 5,
      minTimeOnSite: 60,
      minScrollDepth: 50,
      minPageViews: 2,
      popupDelay: 10000,
      cooldownHours: 48
    },
    aggressive: {
      minClicks: 2,
      minTimeOnSite: 15,
      minScrollDepth: 15,
      minPageViews: 1,
      popupDelay: 3000,
      cooldownHours: 12
    },
    balanced: {
      minClicks: 3,
      minTimeOnSite: 30,
      minScrollDepth: 25,
      minPageViews: 1,
      popupDelay: 5000,
      cooldownHours: 24
    },
    // 💰 ADSTERRA OPTIMIZED - Maximum redirects while avoiding bot detection
    adsterra_max: {
      minClicks: 1,        // Show on first click!
      minTimeOnSite: 5,    // Just 5 seconds
      minScrollDepth: 0,   // No scroll requirement
      minPageViews: 1,     // Just 1 page
      popupDelay: 1000,    // 1 second delay
      cooldownHours: 4     // Every 4 hours (more frequent)
    },
    // 🚀 ULTRA AGGRESSIVE - Maximum money mode
    money_mode: {
      minClicks: 1,        // Every click counts
      minTimeOnSite: 3,    // 3 seconds only
      minScrollDepth: 0,   // No scroll needed
      minPageViews: 1,     // 1 page
      popupDelay: 500,     // Half second delay
      cooldownHours: 2     // Every 2 hours
    }
  },
  
  // 📱 Analytics Settings
  analytics: {
    enabled: true,
    trackEngagement: true,
    trackConversions: true
  }
};

// 🚀 Active profile - change this to test different configurations
export const ACTIVE_PROFILE = 'balanced'; // Better revenue with acceptable SEO risk

// 🎯 Get current popup configuration
export const getPopupConfig = () => {
  const profile = POPUP_CONFIG.profiles[ACTIVE_PROFILE as keyof typeof POPUP_CONFIG.profiles];
  
  return {
    url: POPUP_CONFIG.url,
    enabled: POPUP_CONFIG.enabled,
    ...profile,
    analytics: POPUP_CONFIG.analytics
  };
}; 