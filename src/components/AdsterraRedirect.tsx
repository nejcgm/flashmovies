import React, { useEffect, useState } from 'react';
import { useAdTracker } from '../context/AdTrackerContext';
import { getAdsterraConfig } from '../config/adsterraConfig';

declare global {
  interface Window {
    gtag?: (command: string, action: string, parameters?: Record<string, unknown>) => void;
  }
}

interface AdsterraRedirectProps {
  enabled?: boolean;
}

const AdsterraRedirect: React.FC<AdsterraRedirectProps> = ({
  enabled = true
}) => {
  const { incrementClick, isInCooldown } = useAdTracker();
  const [isReady, setIsReady] = useState(false);
  const [localCooldownEndTime, setLocalCooldownEndTime] = useState(0);
  const adsterraConfig = getAdsterraConfig();

  useEffect(() => {
    if (!enabled) return;

    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, adsterraConfig.adsterraRedirect.minTimeBeforeFirstRedirect * 1000);

    const cooldownTimer = setInterval(() => {
      if (localCooldownEndTime > 0 && Date.now() > localCooldownEndTime) {
        setLocalCooldownEndTime(0);
      }
    }, 1000);

    const handleClick = () => {
      if (!isReady) return;
      
      if (isInCooldown()) return;
      
      if (adsterraConfig.adsterraRedirect.useLocalCooldown && 
          localCooldownEndTime > 0 && Date.now() < localCooldownEndTime) return;

      const shouldFireAd = incrementClick();

      if (shouldFireAd) {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'adsterra_redirect', {
            event_category: 'monetization',
            revenue_type: 'context_redirect',
            ad_url: adsterraConfig.url
          });
        }

        window.open(adsterraConfig.url, '_blank', 'noopener');
        
        if (adsterraConfig.adsterraRedirect.useLocalCooldown) {
          const localCooldownDuration = adsterraConfig.adsterraRedirect.localCooldownMinutes * 60 * 1000;
          setLocalCooldownEndTime(Date.now() + localCooldownDuration);
        }
      }
    };

    document.addEventListener('click', handleClick, true); 

    return () => {
      clearTimeout(readyTimer);
      clearInterval(cooldownTimer);
      document.removeEventListener('click', handleClick, true);
    };
  }, [enabled, isReady, incrementClick, isInCooldown, adsterraConfig, localCooldownEndTime]);

  return null;
};

export default AdsterraRedirect; 