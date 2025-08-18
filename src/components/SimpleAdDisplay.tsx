import React, { useState, useEffect } from 'react';
import { useAdTracker } from '../context/AdTrackerContext';

const SimpleAdDisplay: React.FC = () => {
  const { state, getCooldownRemaining } = useAdTracker();
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    // Update cooldown timer
    const timer = setInterval(() => {
      setCooldownRemaining(getCooldownRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, [getCooldownRemaining]);

  const formatTime = (ms: number): string => {
    if (ms <= 0) return '0s';
    const seconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="fixed top-4 right-4 bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 p-3 min-w-[180px] z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">💰 Ad Tracker</h3>
        <div className={`w-2 h-2 rounded-full ${state.isInCooldown ? 'bg-red-500' : 'bg-green-500'}`}></div>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Global Clicks:</span>
          <span className="text-blue-400">{state.globalClickCount}/3</span>
        </div>
        
        <div className="flex justify-between">
          <span>Status:</span>
          <span className={state.isInCooldown ? 'text-red-400' : 'text-green-400'}>
            {state.isInCooldown ? 'Cooldown' : 'Active'}
          </span>
        </div>
        
        {state.isInCooldown && (
          <div className="flex justify-between">
            <span>Cooldown:</span>
            <span className="text-red-400">{formatTime(cooldownRemaining)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleAdDisplay;
