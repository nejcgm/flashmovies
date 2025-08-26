import React, { useState, useEffect } from 'react';
import { useAdTracker } from '../context/AdTrackerContext';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';

const SimpleAdDisplay: React.FC = () => {
  const { state, getCooldownRemaining } = useAdTracker();
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 767 });

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
    isMobile ? (
      <>
      <div className="fixed bottom-5 left-4 bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 p-2 min-w-[120px] z-50">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[12px] font-semibold">{state.isInCooldown ? 'No Ads' : 'Remove Ads'}</div>
          {state.isInCooldown && (
            <span className="text-green-400 text-[10px]">{formatTime(cooldownRemaining)}</span>
          )}
          <div className={`w-2 h-2 rounded-full ${state.isInCooldown ? 'bg-green-500' : 'bg-red-500'}`}></div> 
        </div>
        {!state.isInCooldown && (
          <button className="bg-yellow-500 mt-1 text-black font-semibold px-2 py-1 text-[11px] rounded-md" onClick={() => navigate('/ad-video-player')}>Watch Video</button>
        )}
      </div>
    </>
    ) : (
      <>
      <div className="fixed bottom-4 left-4 bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 p-3 min-w-[150px] z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Remove Ads</h3>
        <div className={`w-2 h-2 rounded-full ${state.isInCooldown ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>
      
      <div className="space-y-2 text-xs">
      {state.isInCooldown ? (
        <div className="flex justify-between">
        <span>No Ads For:</span>
        <span className="text-green-400">{formatTime(cooldownRemaining)}</span>
      </div>
      ) : (
          
          <button className="bg-yellow-500 text-black font-semibold px-5 py-[6px] text-[14px]" onClick={() => navigate('/ad-video-player')}>Watch Video</button>
        )}
      </div>
    </div>
      </>
    )
  );
};

export default SimpleAdDisplay;
