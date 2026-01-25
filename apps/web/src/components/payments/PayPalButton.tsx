import React, { useEffect, useRef, useState } from 'react';
import { createPayPalOrder, capturePayPalOrder, getPayPalClientId } from '../../client/payments';
import Spinner from '../Spinner';

interface PayPalButtonProps {
  planCode: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: {
          layout?: string;
          color?: string;
          shape?: string;
          label?: string;
          height?: number;
        };
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError: (err: Error) => void;
        onCancel: () => void;
      }) => {
        render: (container: HTMLElement) => Promise<void>;
      };
    };
  }
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  planCode,
  onSuccess,
  onError,
  disabled = false,
}) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const clientId = getPayPalClientId();
    
    if (!clientId) {
      onError('PayPal is not configured');
      setLoading(false);
      return;
    }

    // Check if PayPal SDK is already loaded
    if (window.paypal) {
      setSdkReady(true);
      setLoading(false);
      return;
    }

    // Load PayPal SDK
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.async = true;
    
    script.onload = () => {
      setSdkReady(true);
      setLoading(false);
    };
    
    script.onerror = () => {
      onError('Failed to load PayPal SDK');
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup script if component unmounts before load
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [onError]);

  useEffect(() => {
    if (!sdkReady || !window.paypal || !paypalRef.current || disabled) {
      return;
    }

    // Clear previous buttons
    paypalRef.current.innerHTML = '';

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
        height: 45,
      },
      createOrder: async () => {
        try {
          const response = await createPayPalOrder(planCode);
          return response.orderId;
        } catch (error) {
          const err = error as { response?: { data?: { message?: string } } };
          const message = err.response?.data?.message || 'Failed to create order';
          onError(message);
          throw error;
        }
      },
      onApprove: async (data) => {
        try {
          const response = await capturePayPalOrder(data.orderID);
          if (response.status === 'COMPLETED') {
            onSuccess(response.orderId);
          } else {
            onError('Payment was not completed');
          }
        } catch (error) {
          const err = error as { response?: { data?: { message?: string } } };
          const message = err.response?.data?.message || 'Failed to capture payment';
          onError(message);
        }
      },
      onError: (err) => {
        onError(err.message || 'PayPal error occurred');
      },
      onCancel: () => {
        // User cancelled - no error needed
      },
    }).render(paypalRef.current);
  }, [sdkReady, planCode, onSuccess, onError, disabled]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Spinner />
        <span className="ml-2 text-gray-400">Loading PayPal...</span>
      </div>
    );
  }

  if (disabled) {
    return (
      <button
        disabled
        className="w-full py-3 px-4 bg-gray-600 text-gray-400 font-semibold rounded-lg cursor-not-allowed"
      >
        Login to Purchase
      </button>
    );
  }

  return <div ref={paypalRef} className="w-full" />;
};

export default PayPalButton;
