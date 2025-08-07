import React from "react";

interface ProviderButtonProps {
  provider: string;
  url?: string;
  updateProvider?: (url: string) => void;
  style?: React.CSSProperties;
  className?: string;
}

const ProviderButton = ({
  provider,
  url = '',
  updateProvider = () => {},
  style,
  className,
}: ProviderButtonProps) => {
  return (
    <button
      className={`${className} bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1.5 px-2 sm:py-2 sm:px-4 text-sm sm:text-base rounded shadow`}
      style={{...style }}
      key={provider}
      data-testid={`provider-button-${provider}`}
      onClick={() => updateProvider(url)}
      value={url}
      type="button"
    >
      {provider}
    </button>
  );
};

export default ProviderButton;
