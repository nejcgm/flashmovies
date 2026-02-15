import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProBanner: React.FC = () => {
  const { isPro, isLoggedIn, isLoading } = useUser();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const checkDismissStatus = () => {
      const dismissedData = sessionStorage.getItem('proBannerDismissed');
      if (dismissedData) {
        try {
          const { timestamp } = JSON.parse(dismissedData);
          const now = Date.now();
          const fifteenMinutes = 15 * 60 * 1000;
          
          if (now - timestamp < fifteenMinutes) {
            setIsDismissed(true);
          } else {
            sessionStorage.removeItem('proBannerDismissed');
            setIsDismissed(false);
          }
        } catch {
          sessionStorage.removeItem('proBannerDismissed');
          setIsDismissed(false);
        }
      }
    };

    checkDismissStatus();

    const intervalId = setInterval(checkDismissStatus, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!placeholderRef.current) return;
      
      const placeholderRect = placeholderRef.current.getBoundingClientRect();
      
      if (placeholderRect.top <= 0) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    handleScroll();

    setTimeout(handleScroll, 50);
    setTimeout(handleScroll, 150);
    setTimeout(handleScroll, 300);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [location.pathname]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDismissed(true);
    
    const dismissData = {
      timestamp: Date.now()
    };
    sessionStorage.setItem('proBannerDismissed', JSON.stringify(dismissData));
  };

  if (isLoading || isPro || isDismissed) {
    return null;
  }

  return (
    <>
      <div ref={placeholderRef} className="mx-2 mb-2 sm:mx-0 mt-1 sm:mt-2">
        <div 
          ref={bannerRef}
          className={`transition-all duration-200 ${
            isSticky 
              ? 'fixed top-0 left-0 right-0 z-50 px-2 sm:px-8 bg-black/95 backdrop-blur-sm py-2' 
              : ''
          }`}
        >
          <div className={isSticky ? 'max-w-[1314px] mx-auto' : ''}>
            <Link
              to="payments/plans"
              className={`block bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] border border-[#f5c518]/30 hover:border-[#f5c518]/60 transition-colors ${
                isSticky ? 'rounded-lg shadow-2xl shadow-[#f5c518]/10' : 'rounded-lg'
              }`}
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
        </div>
      </div>
    </>
  );
};

export default ProBanner;
