import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const PersonPlaceholder = "/dark-mode-avatar-placeholder.png";

const UserMenu = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, user, isLoading, isPro } = useUser();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  if (isLoading) {
    return null;
  }

  return (
    <>
      {isLoggedIn ? (
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-1 sm:gap-2 py-1 px-1 sm:py-2 sm:px-3 hover:bg-white/10 rounded-full transition-colors"
          >
            <img
              src={PersonPlaceholder}
              alt="User avatar"
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
            />
            <span className="hidden sm:block text-white font-roboto text-[14px] max-w-[100px] truncate">
              {displayName}
            </span>
            <svg
              className={`hidden sm:block w-4 h-4 text-white transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1F1F1F] rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-white/10">
                <p className="text-white font-roboto text-[14px] truncate">{displayName}</p>
                <p className="text-gray-400 font-roboto text-[12px] truncate">{user?.email}</p>
              </div>
              {!isPro && (
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/payments/plans');
                  }}
                  className="w-full text-left px-4 py-2 text-[#F5C518] font-roboto text-[14px] hover:bg-white/10 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Get Pro
                </button>
              )}
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/auth/logout');
                }}
                className="w-full text-left px-4 py-2 text-white font-roboto text-[14px] hover:bg-white/10 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => navigate('/auth/login')}
          className="flex items-center gap-1 py-1 px-2 sm:py-2 sm:px-3 bg-[#F5C518] hover:bg-[#d4a815] rounded-full transition-colors"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="hidden sm:block text-black font-roboto font-medium text-[14px]">Sign In</span>
        </button>
      )}
    </>
  );
};

export default UserMenu;
