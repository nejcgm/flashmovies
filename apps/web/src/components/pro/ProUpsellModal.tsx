import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../../client/auth';
import { PRO_COMPARE_AT, PRO_PRICE, PLANS_AUTO_CHECKOUT_REGISTER } from '../../config/proCheckoutPaths';
import StripeBuyButton from '../payments/StripeBuyButton';
import { trackPlansAuthIntent } from '../../utils/analytics';

export type ProUpsellReason = 'premium_server' | 'ad_redirect';

interface ProUpsellModalProps {
  open: boolean;
  reason: ProUpsellReason;
  onClose: () => void;
}

const copyByReason: Record<
  ProUpsellReason,
  { title: string; subtitle: string }
> = {
  premium_server: {
    title: 'Premium server is Pro-only',
    subtitle: 'Ad-free playback and best quality — unlock with Pro.',
  },
  ad_redirect: {
    title: 'Tired of ads?',
    subtitle: 'Watch ad-free forever with a one-time Pro upgrade.',
  },
};

const ProUpsellModal: React.FC<ProUpsellModalProps> = ({
  open,
  reason,
  onClose,
}) => {
  if (!open) return null;

  const { title, subtitle } = copyByReason[reason];
  const loggedIn = isAuthenticated();

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-upsell-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-[#f5c518]/35 bg-[#1a1a1a] p-6 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1.5 text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <h2
          id="pro-upsell-title"
          className="pr-8 text-xl font-bold text-white sm:text-2xl"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-gray-400">{subtitle}</p>

        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Was
            </span>
            <span className="ml-2 text-lg font-bold tabular-nums text-gray-400 line-through decoration-red-500/80">
              ${PRO_COMPARE_AT.toFixed(2)}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tabular-nums text-[#f5c518]">
              ${PRO_PRICE.toFixed(2)}
            </span>
            <span className="text-sm text-gray-400">lifetime</span>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          One-time payment, not a subscription.
        </p>

        <div className="mt-6 space-y-3">
          {loggedIn ? (
            <StripeBuyButton className="w-full" />
          ) : (
            <>
              <Link
                to={`/auth/register?redirect=${PLANS_AUTO_CHECKOUT_REGISTER}`}
                className="block w-full rounded-lg bg-[#f5c518] py-3 px-4 text-center font-semibold text-black transition-colors hover:bg-yellow-600"
                onClick={() => {
                  trackPlansAuthIntent('register');
                  onClose();
                }}
              >
                Get Pro — ${PRO_PRICE.toFixed(2)} lifetime
              </Link>
              <p className="text-center text-xs text-gray-500">
                Create a free account — checkout takes about 30 seconds.
              </p>
            </>
          )}

          <Link
            to="/payments/plans"
            className="block text-center text-sm text-[#f5c518] hover:underline"
            onClick={onClose}
          >
            Compare all plans
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ProUpsellModal;
