import React from "react";

interface ProviderButtonProps {
  provider: string;
  url?: string;
  updateProvider?: (url: string) => void;
  style?: React.CSSProperties;
  className?: string;
  isPremium?: boolean;
  isLocked?: boolean;
}

const ProviderButton = ({
  provider,
  url = '',
  updateProvider = () => {},
  style,
  className,
  isPremium = false,
  isLocked = false,
}: ProviderButtonProps) => {
  return (
    <button
      className={`${className} bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1.5 px-2 sm:py-2 sm:px-4 text-sm sm:text-base rounded shadow flex items-center gap-1.5`}
      style={{...style }}
      key={provider}
      onClick={() => updateProvider(url)}
      value={url}
      type="button"
    >
      {isPremium && (
        <span className="text-xs sm:text-sm">
          {isLocked ? '🔒' : '👑'}
        </span>
      )}
      {provider}
    </button>
  );
};

export default ProviderButton;
