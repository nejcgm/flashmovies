import React, { useState } from 'react';
import { createCheckoutSession } from '../../client/payments';

interface StripeBuyButtonProps {
  className?: string;
  planCode?: string;
}

export default function StripeBuyButton({
  className = '',
  planCode = 'pro_lifetime',
}: StripeBuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { url } = await createCheckoutSession(planCode);
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className={className}>
        <div className="text-center py-3 text-red-400 text-sm mb-2">
          {error}
        </div>
        <button
          onClick={handleCheckout}
          className="w-full py-3 px-4 bg-[#f5c518] hover:bg-yellow-600 text-black 
                     font-semibold rounded-lg text-center transition-all duration-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full py-3 px-4 bg-[#f5c518] hover:bg-yellow-600 text-black 
                   font-semibold rounded-lg text-center transition-all duration-300
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Starting checkout...' : 'Get Pro'}
      </button>
    </div>
  );
}
