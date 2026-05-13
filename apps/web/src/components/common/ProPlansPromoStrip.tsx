import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const linkClassDefault =
  'group flex w-full max-w-none flex-row flex-wrap items-center justify-center gap-x-2 gap-y-2 rounded-lg border border-[#f5c518]/35 bg-black/35 px-3 py-2.5 text-center transition-all hover:border-[#f5c518]/60 hover:bg-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5c518] sm:gap-x-3 sm:gap-y-1 sm:rounded-xl sm:px-5 sm:py-3 sm:bg-gradient-to-r sm:from-black/45 sm:via-amber-400/10 sm:to-black/45 md:gap-x-3 md:px-6 md:py-3 md:shadow-md md:shadow-black/20';

const linkClassProminent =
  'group flex w-full max-w-none flex-row flex-wrap items-center justify-center gap-x-3 gap-y-2.5 rounded-xl border-2 border-[#f5c518]/45 bg-black/40 px-4 py-3.5 text-center transition-all hover:border-[#f5c518]/75 hover:bg-black/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5c518] sm:gap-x-4 sm:gap-y-2 sm:rounded-2xl sm:px-8 sm:py-5 sm:bg-gradient-to-r sm:from-black/45 sm:via-amber-400/12 sm:to-black/45 md:gap-x-5 md:px-10 md:py-5 md:shadow-lg md:shadow-black/30';

interface ProPlansPromoStripProps {
  className?: string;
  onClick?: () => void;
  /** When false, nothing is rendered (e.g. hide on person pages). */
  when?: boolean;
  /** Larger padding and type (e.g. home page hero-adjacent). */
  prominent?: boolean;
}

/**
 * Compact CTA linking to Pro plans; hidden for Pro users and when `when` is false.
 */
export const ProPlansPromoStrip: React.FC<ProPlansPromoStripProps> = ({
  className = '',
  onClick,
  when = true,
  prominent = false,
}) => {
  const { isPro } = useUser();
  if (!when || isPro) return null;

  const linkBase = prominent ? linkClassProminent : linkClassDefault;

  return (
    <Link
      to="/payments/plans"
      onClick={onClick}
      className={[linkBase, className].filter(Boolean).join(' ')}
    >
      <span
        className={
          prominent
            ? 'text-sm font-semibold text-[#f5c518] sm:text-base md:text-lg lg:text-xl md:font-bold'
            : 'text-[11px] font-semibold text-[#f5c518] sm:text-sm md:text-sm md:font-bold'
        }
      >
        No Ads with pro
      </span>
      <span
        className={
          prominent
            ? 'hidden text-gray-600 sm:inline sm:text-lg md:text-xl'
            : 'hidden text-gray-600 sm:inline md:text-base'
        }
      >
        |
      </span>
      <span
        className={
          prominent
            ? 'text-sm text-gray-300 sm:text-base md:text-lg'
            : 'text-[11px] text-gray-300 sm:text-sm md:text-sm'
        }
      >
        <span
          className={
            prominent
              ? 'text-gray-500 line-through decoration-red-500/80 decoration-2 sm:decoration-[3px]'
              : 'text-gray-500 line-through decoration-red-500/80 decoration-2 sm:decoration-2'
          }
        >
          $15
        </span>{' '}
        <span
          className={
            prominent
              ? 'text-xl font-bold text-white sm:text-2xl md:text-3xl lg:text-[2rem]'
              : 'text-base font-bold text-white sm:text-lg md:text-lg'
          }
        >
          $9.99
        </span>
        <span className={prominent ? 'text-gray-400 sm:text-lg md:text-xl' : 'text-gray-500'}>
          {' '}
          lifetime
        </span>
      </span>
      <span
        className={
          prominent
            ? 'hidden h-5 w-px bg-gray-600 sm:block md:h-6'
            : 'hidden h-4 w-px bg-gray-600 sm:block md:h-4'
        }
        aria-hidden
      />
      <span
        className={
          prominent
            ? 'text-xs text-gray-400 sm:text-sm md:text-base'
            : 'text-[10px] text-gray-400 sm:text-xs md:text-xs'
        }
      >
        Secure checkout · <span className="font-semibold text-gray-300">Stripe</span>
      </span>
      <span
        className={
          prominent
            ? 'text-[#f5c518] text-lg font-bold transition-transform group-hover:translate-x-0.5 sm:text-xl md:text-2xl'
            : 'text-[#f5c518] text-sm font-bold transition-transform group-hover:translate-x-0.5 sm:text-base md:text-base'
        }
        aria-hidden
      >
        →
      </span>
    </Link>
  );
};
