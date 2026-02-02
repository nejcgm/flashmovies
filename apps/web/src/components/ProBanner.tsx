import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProBanner: React.FC = () => {
  const { isPro, isLoggedIn, isLoading } = useUser();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if banner was dismissed in this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('proBannerDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDismissed(true);
    sessionStorage.setItem('proBannerDismissed', 'true');
  };

  // Don't show if loading, user is pro, or banner is dismissed
  if (isLoading || isPro || isDismissed) {
    return null;
  }

  return (
    <div className="mx-2 mb-2 sm:mx-0 mt-1 sm:mt-2">
      <Link
        to="/plans"
        className="block rounded-lg bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] border border-[#f5c518]/30 hover:border-[#f5c518]/60 transition-colors"
      >
        <div className="px-3 py-2 sm:py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Crown icon */}
            <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#f5c518] to-[#d4a516] flex items-center justify-center">
              <span className="text-base sm:text-lg">👑</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-white font-semibold text-xs sm:text-sm">
                  {isLoggedIn ? 'Upgrade to Pro' : 'Go Ad-Free with Pro'}
                </h3>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold bg-[#f5c518] text-black rounded-full">
                  $15 Lifetime
                </span>
              </div>
              <p className="text-gray-400 text-[10px] sm:text-xs truncate">
                No ads, premium servers, best quality
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-[#f5c518] hover:bg-[#d4a516] text-black font-semibold text-xs rounded-md transition-colors">
              Get Pro
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="sm:hidden text-[#f5c518] font-semibold text-[10px]">
              Get Pro →
            </span>
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="p-1 text-gray-500 hover:text-white transition-colors"
            aria-label="Dismiss banner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </Link>
    </div>
  );
};

export default ProBanner;
