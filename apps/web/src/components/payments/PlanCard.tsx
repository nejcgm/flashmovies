import React from 'react';
import { Card, Badge } from '../common';

interface PlanFeature {
  text: string;
  included: boolean;
  emphasized?: boolean;
}

interface PlanCardProps {
  name: string;
  price: number;
  compareAtPrice?: number;
  currency?: string;
  description?: string;
  features: PlanFeature[];
  isLifetime?: boolean;
  highlighted?: boolean;
  children?: React.ReactNode;
}

const PlanCard: React.FC<PlanCardProps> = ({
  name,
  price,
  compareAtPrice,
  currency = 'USD',
  description,
  features,
  isLifetime = false,
  highlighted = false,
  children,
}) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card highlighted={highlighted} className="flex flex-col h-full">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
          <h3 className="text-xl font-bold text-white">{name}</h3>
          {isLifetime && <Badge variant="primary">Lifetime</Badge>}
          {compareAtPrice != null && compareAtPrice > price && (
            <Badge variant="success">Limited offer</Badge>
          )}
        </div>
        {description && <p className="text-gray-400 text-sm">{description}</p>}
      </div>

      {/* Price */}
      <div className="mb-6 flex justify-center">
        <div
          className={`flex flex-col ${
            compareAtPrice != null && compareAtPrice > price
              ? 'items-start gap-3 text-left w-max'
              : 'items-center text-center'
          }`}
        >
          {compareAtPrice != null && compareAtPrice > price && (
            <div className="inline-flex flex-col gap-0.5 self-center">
              <div className="text-right">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Was
                </span>
              </div>
              <div className="text-center">
                <span
                  className="relative inline-block text-4xl sm:text-5xl font-bold tabular-nums text-gray-200"
                  aria-label={`Previously ${formatPrice(compareAtPrice)}`}
                >
                  {formatPrice(compareAtPrice)}
                  <span
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[0.09em] w-[125%] -translate-x-1/2 -translate-y-1/2 rotate-[14deg] rounded-full bg-red-500/90"
                    aria-hidden
                  />
                </span>
              </div>
            </div>
          )}
          <div
            className={`flex flex-col gap-1 ${
              compareAtPrice != null && compareAtPrice > price ? 'items-start' : 'items-center'
            }`}
          >
            {compareAtPrice != null && compareAtPrice > price && (
              <span className="text-sm font-semibold tracking-wide text-[#f5c518]">
                Best deal
              </span>
            )}
            <div
              className={`flex flex-wrap items-baseline gap-x-1 gap-y-0 ${
                compareAtPrice != null && compareAtPrice > price
                  ? 'justify-start'
                  : 'justify-center'
              }`}
            >
              <span className="text-4xl sm:text-5xl font-bold text-[#f5c518] tabular-nums">
                {formatPrice(price)}
              </span>
              {isLifetime && <span className="text-gray-400 text-sm">one-time</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-0 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            {feature.included ? (
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
            <span
              className={
                feature.emphasized
                  ? feature.included
                    ? 'text-[calc(1em+2px)] font-semibold text-white leading-snug'
                    : 'text-[calc(1em+2px)] font-semibold text-gray-500 line-through leading-snug'
                  : feature.included
                    ? 'text-gray-300'
                    : 'text-gray-500 line-through'
              }
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-3 pt-2">
        {children}
        {isLifetime && (
          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] sm:text-xs text-gray-500">
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
        )}
      </div>
    </Card>
  );
};

export default PlanCard;
