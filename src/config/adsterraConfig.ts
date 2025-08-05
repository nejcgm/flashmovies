// 💰 Adsterra Configuration - Maximum Money Settings
export const ADSTERRA_CONFIG = {
  // 🔗 Your Adsterra redirect URL
  url: 'https://raptripeessentially.com/s950viwd5w?key=22e656243ca5f0a2aef1c31a7cf4a3a7',
  
  // ⚡ Enable/Disable Adsterra redirects
  enabled: true,
  
  // 🎯 Revenue Modes - Choose your aggression level
  modes: {
    // 🚀 ULTRA AGGRESSIVE - Maximum clicks = Maximum money
    ultra_money: {
      clicksBeforeRedirect: 1,        // Every single click
      minTimeBeforeFirstRedirect: 2,  // 2 seconds only
      redirectCooldownMinutes: 10,    // 10 minutes between
      maxRedirectsPerSession: 12,     // 12 per session
      description: "Maximum revenue - redirect on every click"
    },
    
    // 💰 HIGH REVENUE - Balanced aggression
    high_revenue: {
      clicksBeforeRedirect: 1,        // Every click
      minTimeBeforeFirstRedirect: 3,  // 3 seconds
      redirectCooldownMinutes: 15,    // 15 minutes between
      maxRedirectsPerSession: 8,      // 8 per session  
      description: "High revenue with some user experience"
    },
    
    // 🎯 MONEY FOCUSED - 70% revenue, 30% SEO (NEW)
    money_focused: {
      clicksBeforeRedirect: 1,        // Every click for max revenue
      minTimeBeforeFirstRedirect: 4,  // 4 seconds (minimal SEO protection)
      redirectCooldownMinutes: 0.5,   // 30 seconds (optimized for 10min sessions)
      maxRedirectsPerSession: 15,     // 15 per session (higher for short cooldown)
      description: "70% revenue focus, 30% SEO protection - optimized for short sessions"
    },
    
    // ⚖️ BALANCED - Revenue vs UX
    balanced_money: {
      clicksBeforeRedirect: 2,        // Every 2nd click
      minTimeBeforeFirstRedirect: 5,  // 5 seconds
      redirectCooldownMinutes: 20,    // 20 minutes between
      maxRedirectsPerSession: 6,      // 6 per session
      description: "Good revenue with better user experience"
    },
    
    // 🛡️ SEO SAFE - Minimal SEO impact
    seo_safe: {
      clicksBeforeRedirect: 3,        // Every 3rd click
      minTimeBeforeFirstRedirect: 15, // 15 seconds (shows user engagement)
      redirectCooldownMinutes: 45,    // 45 minutes between (less intrusive)
      maxRedirectsPerSession: 3,      // Only 3 per session (Google-friendly)
      description: "SEO-protected revenue with good user experience"
    }
  },
  
  // 📊 Analytics & Tracking
  analytics: {
    enabled: true,
    trackClickPatterns: true,
    trackRevenue: true,
    trackUserBehavior: true
  },
  
  // 🎯 Revenue Optimization
  optimization: {
    detectBots: true,           // Skip bots for better stats
    requireUserInteraction: true, // Wait for real user interaction
    respectDoNotTrack: false,   // Ignore DNT for max revenue
    mobileOptimized: true       // Optimize for mobile clicks
  }
};

// 🚀 ACTIVE MODE - Change this for different revenue levels
export const ACTIVE_ADSTERRA_MODE = 'money_focused'; // 70% revenue, 30% SEO - maximum payout!

// 🎯 Get current Adsterra configuration
export const getAdsterraConfig = () => {
  const mode = ADSTERRA_CONFIG.modes[ACTIVE_ADSTERRA_MODE as keyof typeof ADSTERRA_CONFIG.modes];
  
  return {
    url: ADSTERRA_CONFIG.url,
    enabled: ADSTERRA_CONFIG.enabled,
    ...mode,
    analytics: ADSTERRA_CONFIG.analytics,
    optimization: ADSTERRA_CONFIG.optimization
  };
};

// 💰 Revenue Projections by Mode
export const REVENUE_PROJECTIONS = {
  ultra_money: {
    dailyClicks: 50,
    revenue: '$8-15/day',
    seoRisk: 'High',
    userExperience: 'Poor'
  },
  money_focused: {
    dailyClicks: 60,
    revenue: '$10-18/day',
    seoRisk: 'Medium-High',
    userExperience: 'Fair'
  },
  high_revenue: {
    dailyClicks: 35,
    revenue: '$6-12/day', 
    seoRisk: 'Medium',
    userExperience: 'Fair'
  },
  balanced_money: {
    dailyClicks: 20,
    revenue: '$4-8/day',
    seoRisk: 'Low',
    userExperience: 'Good'
  },
  seo_safe: {
    dailyClicks: 10,
    revenue: '$2-4/day',
    seoRisk: 'Minimal',
    userExperience: 'Excellent'
  }
}; 