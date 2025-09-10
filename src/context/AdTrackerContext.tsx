import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdTrackerState {
  globalClickCount: number;
  isInCooldown: boolean;
  cooldownEndTime: number;
  affiliateClickCount: number;
  affiliateIsInCooldown: boolean;
  affiliateCooldownEndTime: number;
}

interface AdTrackerContextType {
  state: AdTrackerState;
  incrementClick: () => boolean;
  isInCooldown: () => boolean;
  getCooldownRemaining: () => number;
  reset: () => void;
  setVideoAd: () => void;
  incrementAffiliateClick: () => boolean;
  isAffiliateInCooldown: () => boolean;
  getAffiliateCooldownRemaining: () => number;
  resetAffiliate: () => void;
}

const AdTrackerContext = createContext<AdTrackerContextType | undefined>(undefined);

interface AdTrackerProviderProps {
  children: ReactNode;
  clicksBeforeCooldown?: number;
  cooldownDuration?: number; 
  affiliateClicksBeforeCooldown?: number;
  affiliateCooldownDuration?: number;
}

export const AdTrackerProvider: React.FC<AdTrackerProviderProps> = ({
  children,
  clicksBeforeCooldown = 5,
  cooldownDuration = 30 * 60 * 1000,
  affiliateClicksBeforeCooldown = 1,
  affiliateCooldownDuration = 1000 * 60 * 1000

}) => {

  const [state, setState] = useState<AdTrackerState>({
    globalClickCount: 0,
    isInCooldown: false,
    cooldownEndTime: 0,
    affiliateClickCount: 0,
    affiliateIsInCooldown: false,
    affiliateCooldownEndTime: 0
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = sessionStorage.getItem('simple_ad_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setState(prev => ({ ...prev, ...parsed }));
        
        if (parsed.isInCooldown && Date.now() > parsed.cooldownEndTime) {
          setState(prev => ({
            ...prev,
            isInCooldown: false,
            cooldownEndTime: 0
          }));
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('simple_ad_state', JSON.stringify(state));
    }
  }, [state]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (state.isInCooldown && Date.now() > state.cooldownEndTime) {
        setState(prev => ({
          ...prev,
          isInCooldown: false,
          cooldownEndTime: 0
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isInCooldown, state.cooldownEndTime]);

  const incrementClick = (): boolean => {
    if (state.isInCooldown) {
      return false;
    }
    setState(prev => {
      const newClickCount = prev.globalClickCount + 1;
      
      if (newClickCount >= clicksBeforeCooldown && !prev.isInCooldown) {
        return {
          ...prev,
          globalClickCount: 0, 
          isInCooldown: true,
          cooldownEndTime: Date.now() + cooldownDuration
        };
      }
      
      return {
        ...prev,
        globalClickCount: newClickCount
      };
    });

    // Return true if ad should fire (when cooldown starts)
    return state.globalClickCount + 1 <= clicksBeforeCooldown && !state.isInCooldown;
  };

  const isInCooldown = (): boolean => {
    if (state.isInCooldown && Date.now() > state.cooldownEndTime) {
      setState(prev => ({
        ...prev,
        isInCooldown: false,
        cooldownEndTime: 0
      }));
      return false;
    }
    return state.isInCooldown;
  };

  const getCooldownRemaining = (): number => {
    if (!state.isInCooldown) return 0;
    const remaining = state.cooldownEndTime - Date.now();
    return Math.max(0, remaining);
  };

  const reset = () => {
    setState(prev => ({
      ...prev,
      globalClickCount: 0,
      isInCooldown: false,
      cooldownEndTime: 0
    }));
  };

  const setVideoAd = () => {
    setState(prev => ({
      ...prev,
      globalClickCount: 0,
      isInCooldown: true,
      cooldownEndTime: Date.now() + 30 * 60 * 1000
    }));
  };

  const incrementAffiliateClick = (): boolean => {
    if (state.affiliateIsInCooldown) {
      return false;
    }
    
    setState(prev => {
      const newClickCount = prev.affiliateClickCount + 1;
      
      if (newClickCount >= affiliateClicksBeforeCooldown && !prev.affiliateIsInCooldown) {
        return {
          ...prev,
          affiliateClickCount: 0,
          affiliateIsInCooldown: true,
          affiliateCooldownEndTime: Date.now() + affiliateCooldownDuration
        };
      }
      
      return {
        ...prev,
        affiliateClickCount: newClickCount
      };
    });

    return state.affiliateClickCount + 1 <= affiliateClicksBeforeCooldown && !state.affiliateIsInCooldown;
  };

  const isAffiliateInCooldown = (): boolean => {
    if (state.affiliateIsInCooldown && Date.now() > state.affiliateCooldownEndTime) {
      setState(prev => ({
        ...prev,
        affiliateIsInCooldown: false,
        affiliateCooldownEndTime: 0
      }));
      return false;
    }
    return state.affiliateIsInCooldown;
  };

  const getAffiliateCooldownRemaining = (): number => {
    if (!state.affiliateIsInCooldown) return 0;
    const remaining = state.affiliateCooldownEndTime - Date.now();
    return Math.max(0, remaining);
  };

  const resetAffiliate = () => {
    setState(prev => ({
      ...prev,
      affiliateClickCount: 0,
      affiliateIsInCooldown: false,
      affiliateCooldownEndTime: 0
    }));
  };

  const value: AdTrackerContextType = {
    state,
    incrementClick,
    isInCooldown,
    getCooldownRemaining,
    reset,
    setVideoAd,
    incrementAffiliateClick,
    isAffiliateInCooldown,
    getAffiliateCooldownRemaining,
    resetAffiliate,
  };

  return (
    <AdTrackerContext.Provider value={value}>
      {children}
    </AdTrackerContext.Provider>
  );
};

// Custom hook to use the ad tracker context
export const useAdTracker = (): AdTrackerContextType => {
  const context = useContext(AdTrackerContext);
  if (context === undefined) {
    throw new Error('useAdTracker must be used within an AdTrackerProvider');
  }
  return context;
};