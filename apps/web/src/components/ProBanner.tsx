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
          const fiveMinutes = 5 * 60 * 1000; // 5 minutes
          
          if (now - timestamp < fiveMinutes) {
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

  const compareAtDisplay = '$15';
  const priceDisplay = '$9.99';

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
              to="/payments/plans"
              className={`block bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] border border-[#f5c518]/30 hover:border-[#f5c518]/60 transition-colors ${
                isSticky ? 'rounded-lg shadow-2xl shadow-[#f5c518]/10' : 'rounded-lg'
              }`}
            >
              <div className="relative px-4 py-3 sm:px-5 sm:py-3.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-3">
                <div className="flex flex-1 min-w-0 items-center gap-3 sm:gap-4">
                  <div
                    className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#f5c518]/45 bg-black/25 text-[#f5c518] sm:h-12 sm:w-12"
                    aria-hidden
                  >
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 18V14.5l3-5.5 3.5 3L12 7l3.5 5 3.5-3 3 5.5V18H2Z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-bold text-sm sm:text-base">
                        {isLoggedIn ? 'Upgrade to Pro' : 'Go Ad-Free with Pro'}
                      </h3>
                      <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide rounded-full bg-emerald-600 text-white">
                        Limited offer
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm mt-0.5 line-clamp-2 sm:line-clamp-none">
                      No ads, premium servers, full comment viewing, best quality
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-500">
                      <svg
                        className="h-3.5 w-3.5 shrink-0 text-emerald-500/90"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        Secure checkout — payments handled by{' '}
                        <span className="font-semibold text-gray-400">Stripe</span>
                      </span>
                    </p>
                  </div>
                </div>

                {/* Price block — aligned with plans / PlanCard */}
                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="rounded-lg border border-[#f5c518]/35 bg-black/40 px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-inner shadow-black/20">
                    <span className="mb-1.5 block text-[10px] sm:text-xs font-semibold tracking-wide text-[#f5c518]">
                      Best deal
                    </span>
                    <div className="flex flex-row flex-wrap items-end gap-3 sm:gap-4">
                      <div className="inline-flex flex-col gap-0.5">
                        <div className="text-right">
                          <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                            Was
                          </span>
                        </div>
                        <span
                          className="relative inline-block text-base sm:text-lg font-bold tabular-nums text-gray-200 leading-none"
                          aria-label={`Previously ${compareAtDisplay}`}
                        >
                          {compareAtDisplay}
                          <span
                            className="pointer-events-none absolute left-1/2 top-1/2 h-[0.09em] w-[125%] -translate-x-1/2 -translate-y-1/2 rotate-[14deg] rounded-full bg-red-500/90"
                            aria-hidden
                          />
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
                        <span className="text-2xl sm:text-3xl font-bold tabular-nums text-[#f5c518] leading-none">
                          {priceDisplay}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-400">Lifetime</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#f5c518] hover:bg-[#d4a516] text-black font-bold text-sm rounded-lg transition-colors shadow-md shadow-black/20">
                      Get Pro
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="sm:hidden text-[#f5c518] font-bold text-xs whitespace-nowrap">
                      Get Pro →
                    </span>
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="absolute top-2 right-2 z-10 p-1.5 text-gray-500 hover:text-white transition-colors rounded-md hover:bg-white/5 sm:static sm:top-auto sm:right-auto sm:z-auto"
                      aria-label="Dismiss banner"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProBanner;
