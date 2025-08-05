import React, { useEffect, useState } from 'react';

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (command: string, action: string, parameters?: Record<string, unknown>) => void;
  }
}

interface AdsterraRedirectProps {
  adsterraUrl?: string;
  enabled?: boolean;
  clicksBeforeRedirect?: number;
  minTimeBeforeFirstRedirect?: number;
  redirectCooldownMinutes?: number;
  maxRedirectsPerSession?: number;
}

const AdsterraRedirect: React.FC<AdsterraRedirectProps> = ({
  adsterraUrl = 'https://raptripeessentially.com/s950viwd5w?key=22e656243ca5f0a2aef1c31a7cf4a3a7',
  enabled = true,
  clicksBeforeRedirect = 1, // Redirect on first click for max money
  minTimeBeforeFirstRedirect = 3, // Just 3 seconds
  redirectCooldownMinutes = 15, // 15 minutes between redirects
  maxRedirectsPerSession = 8 // Max 8 redirects per session
}) => {
  const [, setClickCount] = useState(0);
  const [sessionRedirects, setSessionRedirects] = useState(0);
  const [lastRedirectTime, setLastRedirectTime] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Get session data
    const sessionData = sessionStorage.getItem('adsterra_session');
    const redirectData = sessionData ? JSON.parse(sessionData) : { count: 0, lastTime: 0 };
    
    setSessionRedirects(redirectData.count);
    setLastRedirectTime(redirectData.lastTime);

    // Wait minimum time before becoming ready
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, minTimeBeforeFirstRedirect * 1000);

    // AGGRESSIVE CLICK HANDLER - Maximum revenue focus
    const handleClick = () => {
      // Don't redirect if max session limit reached
      if (sessionRedirects >= maxRedirectsPerSession) return;
      
      // Don't redirect if still in cooldown
      const timeSinceLastRedirect = Date.now() - lastRedirectTime;
      if (timeSinceLastRedirect < redirectCooldownMinutes * 60 * 1000) return;
      
      // Don't redirect if not ready yet
      if (!isReady) return;

      setClickCount(prev => {
        const newCount = prev + 1;
        
        // Redirect based on click threshold
        if (newCount >= clicksBeforeRedirect) {
          // Track for analytics
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'adsterra_redirect', {
              event_category: 'monetization',
              click_count: newCount,
              session_redirects: sessionRedirects + 1,
              revenue_type: 'click_redirect'
            });
          }

          // Open Adsterra redirect
          window.open(adsterraUrl, '_blank', 'noopener,noreferrer');
          
          // Update session tracking
          const newSessionCount = sessionRedirects + 1;
          const currentTime = Date.now();
          
          setSessionRedirects(newSessionCount);
          setLastRedirectTime(currentTime);
          
          // Store in session
          sessionStorage.setItem('adsterra_session', JSON.stringify({
            count: newSessionCount,
            lastTime: currentTime
          }));
          
          // Reset click count
          return 0;
        }
        
        return newCount;
      });
    };

    // Add click listener to entire document for maximum coverage
    document.addEventListener('click', handleClick, true); // Use capture phase for earlier detection

    return () => {
      clearTimeout(readyTimer);
      document.removeEventListener('click', handleClick, true);
    };
  }, [enabled, adsterraUrl, clicksBeforeRedirect, minTimeBeforeFirstRedirect, redirectCooldownMinutes, maxRedirectsPerSession, sessionRedirects, lastRedirectTime, isReady]);

  // This component doesn't render anything visible
  return null;
};

export default AdsterraRedirect; 