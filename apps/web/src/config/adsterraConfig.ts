export const ADSTERRA_CONFIG = {
  url: 'https://raptripeessentially.com/s950viwd5w?key=22e656243ca5f0a2aef1c31a7cf4a3a7',
  affiliateUrl: ['https://www.amazon.com/s?k=movie+posters&tag=flashmovies0b-20','https://s.click.aliexpress.com/e/_c458hOb9'],
  
  enabled: true,
  
  //AdsterraRedirect Component Settings
  adsterraRedirect: {
    enabled: true,           // Enable/disable the component
    useLocalCooldown: true,          // Whether to use local cooldown in addition to global
    localCooldownMinutes: 1.5,         // Custom local cooldown duration in minutes
    minTimeBeforeFirstRedirect: 30,   // Initial delay before becoming active (seconds)
    description: "Settings for AdsterraRedirect component"
  },
  

  
  // Analytics & Tracking
  analytics: {
    enabled: true,
    trackRevenue: true
  }
};

// Get current Adsterra configuration
export const getAdsterraConfig = () => {
  return {
    url: ADSTERRA_CONFIG.url,
    affiliateUrl: ADSTERRA_CONFIG.affiliateUrl,
    enabled: ADSTERRA_CONFIG.enabled,
    adsterraRedirect: ADSTERRA_CONFIG.adsterraRedirect,
    analytics: ADSTERRA_CONFIG.analytics
  };
}; 