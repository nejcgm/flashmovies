import React from 'react';
interface SectionDividerProps {
  title?: string;
  icon?: 'movie' | 'tv' | 'actor';
}

const SectionDivider: React.FC<SectionDividerProps> = ({ title, icon }) => {
  const getIcon = () => {
    switch (icon) {
      case 'movie':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 4v1h-2V4c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v1H6V4c0-.55-.45-1-1-1s-1 .45-1 1v16c0 .55.45 1 1 1s1-.45 1-1v-1h2v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1h2v1c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1s-1 .45-1 1zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
          </svg>
        );
      case 'tv':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1h5c1.1 0 1.99-.9 1.99-2L23 5a2 2 0 0 0-2-2zm-1 14H4c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h16c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1z"/>
          </svg>
        );
      case 'actor':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="my-8 sm:my-12 px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#333] to-[#333]" />
        {(title || icon) && (
          <div className="flex items-center gap-2 text-[#f5c518]">
            {getIcon()}
            {title && (
              <span className="text-sm sm:text-lg font-semibold tracking-wide uppercase">
                {title}
              </span>
            )}
          </div>
        )}
        <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#333] to-[#333]" />
      </div>
    </div>
  );
};

export default SectionDivider;
