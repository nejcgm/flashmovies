import React from 'react';
import { Card, Badge } from '../common';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanCardProps {
  name: string;
  price: number;
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
    }).format(amount);
  };

  return (
    <Card highlighted={highlighted} className="flex flex-col h-full">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-xl font-bold text-white">{name}</h3>
          {isLifetime && <Badge variant="primary">Lifetime</Badge>}
        </div>
        {description && <p className="text-gray-400 text-sm">{description}</p>}
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl sm:text-5xl font-bold text-white">{formatPrice(price)}</span>
          {isLifetime && <span className="text-gray-400 text-sm">one-time</span>}
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-grow">
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
            <span className={feature.included ? 'text-gray-300' : 'text-gray-500 line-through'}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* Action Button / PayPal */}
      <div className="mt-auto">
        {children}
      </div>
    </Card>
  );
};

export default PlanCard;
