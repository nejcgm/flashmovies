import React, { useEffect, useState } from 'react';
import { useAdTracker } from '../context/AdTrackerContext';
import { getAdsterraConfig } from '../config/adsterraConfig';
import { useUser } from '../context/UserContext';
import { useProUpsell } from '../context/ProUpsellContext';

interface AdsterraRedirectProps {
  enabled?: boolean;
}

const AdsterraRedirect: React.FC<AdsterraRedirectProps> = ({
  enabled = true
}) => {
  const { incrementAffiliateClick, isAffiliateInCooldown, state } = useAdTracker();
  const { isPro, isLoading } = useUser();
  const { openProUpsell } = useProUpsell();
  const [isReady, setIsReady] = useState(false);
  const [localCooldownEndTime, setLocalCooldownEndTime] = useState(0);
  const adsterraConfig = getAdsterraConfig();

  useEffect(() => {
    if (!enabled || isPro || isLoading) return;

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
      
      if (isAffiliateInCooldown()) return;

      // Check local cooldown if this is after first click
      if (state.affiliateClickCount > 0 && 
          localCooldownEndTime > 0 && Date.now() < localCooldownEndTime) return;

      const shouldFireAd = incrementAffiliateClick();

      if (shouldFireAd) {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'adsterra_redirect', {
            event_category: 'monetization',
            revenue_type: 'affiliate_redirect',
            ad_url: adsterraConfig.affiliateUrl[state.affiliateClickCount],
            click_number: state.affiliateClickCount + 1
          });
        }

        window.open(adsterraConfig.affiliateUrl[state.affiliateClickCount], '_blank', 'noopener');

        openProUpsell('ad_redirect');

        // Set local cooldown after first click
        if (state.affiliateClickCount === 0) {
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
  }, [enabled, isReady, incrementAffiliateClick, isAffiliateInCooldown, adsterraConfig, state.affiliateClickCount, localCooldownEndTime, isPro, isLoading, openProUpsell]);

  return null;
};

export default AdsterraRedirect; 