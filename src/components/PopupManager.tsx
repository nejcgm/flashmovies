import React, { useEffect, useState } from 'react';

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (command: string, action: string, parameters?: Record<string, unknown>) => void;
  }
}

interface PopupManagerProps {
  popupUrl?: string;
  enabled?: boolean;
  minClicks?: number;
  minTimeOnSite?: number;
  minScrollDepth?: number;
  minPageViews?: number;
  popupDelay?: number;
  cooldownHours?: number;
}

interface UserEngagement {
  clicks: number;
  timeOnSite: number;
  pageViews: number;
  scrollDepth: number;
}

const PopupManager: React.FC<PopupManagerProps> = ({
  popupUrl = 'https://raptripeessentially.com/s950viwd5w?key=22e656243ca5f0a2aef1c31a7cf4a3a7',
  enabled = true,
  minClicks = 3,
  minTimeOnSite = 30,
  minScrollDepth = 25,
  minPageViews = 1,
  popupDelay = 5000,
  cooldownHours = 24
}) => {
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const [, setUserEngagement] = useState<UserEngagement>({
    clicks: 0,
    timeOnSite: 0,
    pageViews: 0,
    scrollDepth: 0
  });

  useEffect(() => {
    if (!enabled) return;

    // Check if popup was already shown this session
    const popupShown = sessionStorage.getItem('popup_shown');
    const lastPopupTime = localStorage.getItem('last_popup_time');
    
    if (popupShown) {
      setHasShownPopup(true);
      return;
    }

    // Don't show popup if shown within cooldown period
    if (lastPopupTime && Date.now() - parseInt(lastPopupTime) < cooldownHours * 60 * 60 * 1000) {
      setHasShownPopup(true);
      return;
    }

    // Track time on site
    const startTime = Date.now();
    const timeTracker = setInterval(() => {
      setUserEngagement(prev => ({
        ...prev,
        timeOnSite: Math.floor((Date.now() - startTime) / 1000)
      }));
    }, 1000);

    // Track scroll depth for engagement
    const handleScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      setUserEngagement(prev => ({
        ...prev,
        scrollDepth: Math.max(prev.scrollDepth, scrollDepth || 0)
      }));
    };

    // Track page views
    const handleRouteChange = () => {
      setUserEngagement(prev => ({
        ...prev,
        pageViews: prev.pageViews + 1
      }));
    };

    // OPTIMIZED POPUP LOGIC: High-engagement users only
    const handleUserInteraction = (eventType: string) => {
      if (hasShownPopup) return;
      
      setUserEngagement(prev => {
        const newEngagement = {
          ...prev,
          clicks: eventType === 'click' ? prev.clicks + 1 : prev.clicks
        };

        // SMART ENGAGEMENT DETECTION
        const isHighlyEngaged = (
          newEngagement.clicks >= minClicks &&
          newEngagement.timeOnSite >= minTimeOnSite &&
          newEngagement.scrollDepth >= minScrollDepth &&
          newEngagement.pageViews >= minPageViews
        );

        // Show popup only for highly engaged users
        if (isHighlyEngaged && !hasShownPopup) {
          // Delay popup to avoid interrupting user flow
          setTimeout(() => {
            if (!hasShownPopup) {
              // Track popup for analytics
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'popup_shown', {
                  event_category: 'monetization',
                  engagement_score: newEngagement.clicks + newEngagement.pageViews,
                  time_on_site: newEngagement.timeOnSite,
                  scroll_depth: newEngagement.scrollDepth
                });
              }

              // Open popup
              window.open(
                popupUrl,
                '_blank',
                'noopener,noreferrer'
              );
              
              setHasShownPopup(true);
              sessionStorage.setItem('popup_shown', 'true');
              localStorage.setItem('last_popup_time', Date.now().toString());

              // Optional: Track successful popup opening
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'popup_opened', {
                  event_category: 'monetization',
                  popup_url: popupUrl
                });
              }
            }
          }, popupDelay);
        }

        return newEngagement;
      });
    };

    // Event listeners for engagement tracking
    const handleClick = () => handleUserInteraction('click');
    const handleKeydown = () => handleUserInteraction('keydown');
    
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('scroll', handleScroll);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      clearInterval(timeTracker);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [enabled, hasShownPopup, popupUrl, minClicks, minTimeOnSite, minScrollDepth, minPageViews, popupDelay, cooldownHours]);

  // This component doesn't render anything visible
  return null;
};

export default PopupManager; 