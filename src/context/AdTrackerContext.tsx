import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdTrackerState {
  globalClickCount: number;
  isInCooldown: boolean;
  cooldownEndTime: number;
}

interface AdTrackerContextType {
  state: AdTrackerState;
  incrementClick: () => boolean;
  isInCooldown: () => boolean;
  getCooldownRemaining: () => number;
  reset: () => void;
  setVideoAd: () => void;
}

const AdTrackerContext = createContext<AdTrackerContextType | undefined>(undefined);

interface AdTrackerProviderProps {
  children: ReactNode;
  clicksBeforeCooldown?: number;
  cooldownDuration?: number; 
}

export const AdTrackerProvider: React.FC<AdTrackerProviderProps> = ({
  children,
  clicksBeforeCooldown = 5,
  cooldownDuration = 30 * 60 * 1000 
}) => {
  const [state, setState] = useState<AdTrackerState>({
    globalClickCount: 0,
    isInCooldown: false,
    cooldownEndTime: 0
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
    setState({
      globalClickCount: 0,
      isInCooldown: false,
      cooldownEndTime: 0
    });
  };

  const setVideoAd = () => {
    setState({
      globalClickCount: 0,
      isInCooldown: true,
      cooldownEndTime: Date.now() + 30 * 60 * 1000
    });
  };

  const value: AdTrackerContextType = {
    state,
    incrementClick,
    isInCooldown,
    getCooldownRemaining,
    reset,
    setVideoAd,
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