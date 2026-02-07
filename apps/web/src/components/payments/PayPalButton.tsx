import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPayPalOrder, capturePayPalOrder, getPayPalClientToken, isPayPalSandbox } from '../../client/payments';
import Spinner from '../Spinner';

interface PayPalButtonProps {
  planCode: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

// PayPal SDK v6 types
interface PayPalSDKInstance {
  findEligibleMethods: (options: { currencyCode: string }) => Promise<PaymentMethods>;
  createPayPalOneTimePaymentSession: (options: PaymentSessionOptions) => PaymentSession;
}

type PayPalWindow = Window & {
  paypal?: {
    createInstance: (options: {
      clientToken: string;
      components?: string[];
      pageType?: string;
    }) => Promise<PayPalSDKInstance>;
  };
};

const paypalWindow = window as PayPalWindow;

interface PaymentMethods {
  isEligible: (method: string) => boolean;
}

interface PaymentSessionOptions {
  onApprove: (data: { orderId: string }) => Promise<void>;
  onCancel: (data: unknown) => void;
  onError: (error: Error) => void;
}

interface PaymentSession {
  start: (
    options: { presentationMode: 'auto' | 'popup' | 'modal' | 'redirect' },
    orderPromise: Promise<{ orderId: string }>
  ) => Promise<void>;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  planCode,
  onSuccess,
  onError,
  disabled = false,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to avoid stale closures and infinite loops
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const initializedRef = useRef(false);
  
  // Keep refs updated
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  // Create order function for PayPal SDK v6
  const createOrder = useCallback(async (): Promise<{ orderId: string }> => {
    const response = await createPayPalOrder(planCode);
    return { orderId: response.orderId };
  }, [planCode]);

  // Initialize PayPal SDK v6 - only once
  useEffect(() => {
    // Prevent double initialization
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    let mounted = true;

    const initializePayPal = async () => {
      try {
        // Get client token from backend
        const { clientToken } = await getPayPalClientToken();

        if (!clientToken) {
          setError('PayPal is not configured');
          setLoading(false);
          return;
        }

        // Load PayPal SDK v6 script if not already loaded
        if (!paypalWindow.paypal) {
          const script = document.createElement('script');
          const sdkUrl = isPayPalSandbox()
            ? 'https://www.sandbox.paypal.com/web-sdk/v6/core'
            : 'https://www.paypal.com/web-sdk/v6/core';
          
          script.src = sdkUrl;
          script.async = true;

          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
            document.body.appendChild(script);
          });
        }

        if (!mounted || !paypalWindow.paypal) return;

        // Create PayPal SDK instance
        const sdkInstance = await paypalWindow.paypal.createInstance({
          clientToken,
          components: ['paypal-payments'],
          pageType: 'checkout',
        });

        // Check eligibility
        const paymentMethods = await sdkInstance.findEligibleMethods({
          currencyCode: 'USD',
        });

        if (!paymentMethods.isEligible('paypal')) {
          setError('PayPal is not available in your region');
          setLoading(false);
          return;
        }

        // Create payment session
        const session = sdkInstance.createPayPalOneTimePaymentSession({
          onApprove: async (data) => {
            try {
              setIsProcessing(true);
              const response = await capturePayPalOrder(data.orderId);
              if (response.status === 'COMPLETED') {
                onSuccessRef.current(response.orderId);
              } else {
                onErrorRef.current('Payment was not completed');
              }
            } catch (err) {
              const error = err as { response?: { data?: { message?: string } } };
              const message = error.response?.data?.message || 'Failed to capture payment';
              onErrorRef.current(message);
            } finally {
              setIsProcessing(false);
            }
          },
          onCancel: () => {
            // User cancelled - no error needed
            setIsProcessing(false);
          },
          onError: (err) => {
            onErrorRef.current(err.message || 'PayPal error occurred');
            setIsProcessing(false);
          },
        });

        if (mounted) {
          setPaymentSession(session);
          setSdkReady(true);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error('PayPal initialization error:', err);
          setError('Failed to initialize PayPal. Please check if the API is running.');
          setLoading(false);
        }
      }
    };

    initializePayPal();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - initialize only once

  // Handle button click
  const handleClick = async () => {
    if (!paymentSession || isProcessing || disabled) return;

    try {
      setIsProcessing(true);
      await paymentSession.start(
        { presentationMode: 'auto' },
        createOrder()
      );
    } catch (error) {
      const err = error as Error;
      // Don't show error for user cancellation
      if (!err.message?.includes('cancel')) {
        onError(err.message || 'Payment failed');
      }
      setIsProcessing(false);
    }
  };

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

  if (error || !sdkReady) {
    return (
      <div className="text-center text-red-400 py-4">
        {error || 'PayPal unavailable. Please try again later.'}
      </div>
    );
  }

  return (
    <div ref={buttonRef} className="w-full">
      <button
        onClick={handleClick}
        disabled={isProcessing}
        className="w-full py-3 px-4 bg-[#FFC439] hover:bg-[#f0b82e] text-[#003087] font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Spinner />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.645h6.334c2.108 0 3.635.405 4.537 1.203.862.765 1.2 1.906.996 3.389-.021.148-.047.3-.077.454a6.034 6.034 0 0 1-.182.752c-.747 2.456-2.533 3.713-5.305 3.738H9.627l-1.63 8.726h-.92z"/>
              <path d="M19.093 7.945c-.028.177-.063.355-.104.535-.866 3.448-3.179 4.648-6.323 4.648h-.598l-.785 4.978h-2.52l.094-.587.878-5.567.012-.078.138-.875.091-.573h1.416c3.144 0 5.457-1.2 6.323-4.648.395-1.572.17-2.867-.622-3.833z"/>
            </svg>
            <span>Pay with PayPal</span>
          </>
        )}
      </button>
    </div>
  );
};

export default PayPalButton;
