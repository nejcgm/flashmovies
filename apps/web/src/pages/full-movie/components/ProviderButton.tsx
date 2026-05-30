import React from "react";
import { PRO_COMPARE_AT, PRO_PRICE } from "../../../config/proCheckoutPaths";

interface ProviderButtonProps {
  provider: string;
  url?: string;
  updateProvider?: (url: string) => void;
  style?: React.CSSProperties;
  className?: string;
  isPremium?: boolean;
  isLocked?: boolean;
  /** Tiny strike + sale price for non‑Pro users (matches plans promo). */
  showDiscountCallout?: boolean;
}

const ProviderButton = ({
  provider,
  url = '',
  updateProvider = () => {},
  style,
  className,
  isPremium = false,
  isLocked = false,
  showDiscountCallout = false,
}: ProviderButtonProps) => {
  return (
    <button
      className={`${className} bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1.5 px-2 sm:py-2 sm:px-4 text-sm sm:text-base rounded shadow flex flex-wrap items-center gap-1 sm:gap-1.5`}
      style={{...style }}
      key={provider}
      onClick={() => updateProvider(url)}
      value={url}
      type="button"
    >
      {isPremium && (
        <span className="text-xs sm:text-sm shrink-0">
          {isLocked ? '🔒' : '👑'}
        </span>
      )}
      <span className="min-w-0 leading-tight">{provider}</span>
      {showDiscountCallout && (
        <span className="inline-flex items-baseline gap-0.5 rounded border border-amber-500/50 bg-black/35 px-1 py-0.5 sm:px-1.5 shrink-0">
          <span className="text-[8px] sm:text-[9px] font-semibold tabular-nums text-gray-200 line-through decoration-red-500/90 decoration-1">
            ${PRO_COMPARE_AT.toFixed(2)}
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold tabular-nums text-amber-200">
            ${PRO_PRICE.toFixed(2)}
          </span>
        </span>
      )}
    </button>
  );
};

export default ProviderButton;
