import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPayPalOrder, capturePayPalOrder, getPayPalClientToken, isPayPalSandbox } from '../../client/payments';
import Spinner from '../Spinner';

interface PaymentButtonsProps {
  planCode: string;
  planPrice: number;
  planName: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

type PaymentWindow = Window & {
  paypal?: {
    createInstance: (options: {
      clientToken: string;
      components?: string[];
      pageType?: string;
    }) => Promise<PayPalSDKInstance>;
  };
  google?: {
    payments: {
      api: {
        PaymentsClient: new (config: GooglePayClientConfig) => GooglePaymentsClient;
      };
    };
  };
};

const paymentWindow = window as PaymentWindow;

interface PayPalSDKInstance {
  findEligibleMethods: (options: { currencyCode: string }) => Promise<PaymentMethods>;
  createPayPalOneTimePaymentSession: (options: PaymentSessionOptions) => PaymentSession;
  createGooglePayOneTimePaymentSession: () => GooglePaySession;
  createPayPalGuestOneTimePaymentSession: (options: GuestPaymentSessionOptions) => GuestPaymentSession;
}

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

interface GuestPaymentSessionOptions {
  onApprove: (data: { orderId: string }) => Promise<void>;
  onCancel: (data: unknown) => void;
  onComplete: (data: unknown) => void;
  onError: (error: Error) => void;
  onWarn: (data: { message: string; name: string; code: string }) => void;
}

interface GuestPaymentSession {
  start: (
    options: { 
      presentationMode: 'auto' | 'popup' | 'modal' | 'redirect';
      targetElement?: Element;
    },
    orderPromise: Promise<{ orderId: string }>
  ) => Promise<void>;
}

interface GooglePaySession {
  getGooglePayConfig: () => Promise<GooglePayConfig>;
  confirmOrder: (options: {
    orderId: string;
    paymentMethodData: unknown;
  }) => Promise<{ status: string }>;
}

interface GooglePayConfig {
  allowedPaymentMethods: unknown[];
  merchantInfo: unknown;
  apiVersion: number;
  apiVersionMinor: number;
  countryCode: string;
}

interface GooglePayClientConfig {
  environment: 'TEST' | 'PRODUCTION';
  paymentDataCallbacks?: {
    onPaymentAuthorized: (paymentData: GooglePaymentData) => Promise<GooglePayAuthResult>;
  };
}

interface GooglePaymentsClient {
  isReadyToPay: (request: unknown) => Promise<{ result: boolean }>;
  createButton: (options: { onClick: () => void; buttonType?: string; buttonColor?: string }) => HTMLElement;
  loadPaymentData: (request: unknown) => Promise<GooglePaymentData>;
}

interface GooglePaymentData {
  paymentMethodData: unknown;
}

interface GooglePayAuthResult {
  transactionState: 'SUCCESS' | 'ERROR';
  error?: { message: string };
}

const PaymentButtons: React.FC<PaymentButtonsProps> = ({
  planCode,
  planPrice,
  planName,
  onSuccess,
  onError,
  disabled = false,
}) => {
  const googlePayContainerRef = useRef<HTMLDivElement>(null);
  const cardButtonContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // PayPal state
  const [paypalReady, setPaypalReady] = useState(false);
  const [paypalSession, setPaypalSession] = useState<PaymentSession | null>(null);
  const [paypalProcessing, setPaypalProcessing] = useState(false);
  
  // Credit Card state
  const [cardReady, setCardReady] = useState(false);
  const [cardProcessing, setCardProcessing] = useState(false);
  
  // Google Pay state
  const [googlePayReady, setGooglePayReady] = useState(false);
  const [googlePayProcessing, setGooglePayProcessing] = useState(false);
  
  // Refs to avoid stale closures
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const initializedRef = useRef(false);
  const googlePaySessionRef = useRef<GooglePaySession | null>(null);
  const googlePayConfigRef = useRef<GooglePayConfig | null>(null);
  const paymentsClientRef = useRef<GooglePaymentsClient | null>(null);
  const cardSessionRef = useRef<GuestPaymentSession | null>(null);
  const createOrderRef = useRef<() => Promise<{ orderId: string }>>(() => Promise.resolve({ orderId: '' }));
  
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  // Create order function
  const createOrder = useCallback(async (): Promise<{ orderId: string }> => {
    const response = await createPayPalOrder(planCode);
    return { orderId: response.orderId };
  }, [planCode]);

  // Keep createOrderRef updated
  useEffect(() => {
    createOrderRef.current = createOrder;
  }, [createOrder]);

  // Initialize payment methods
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    let mounted = true;

    const loadGooglePayScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (paymentWindow.google?.payments) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://pay.google.com/gp/p/js/pay.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Pay SDK'));
        document.body.appendChild(script);
      });
    };

    const initializePayments = async () => {
      try {
        // Get client token from backend
        const { clientToken } = await getPayPalClientToken();

        if (!clientToken) {
          setError('Payment system is not configured');
          setLoading(false);
          return;
        }

        await Promise.all([
          (async () => {
            if (!paymentWindow.paypal) {
              const script = document.createElement('script');
              script.src = isPayPalSandbox()
                ? 'https://www.sandbox.paypal.com/web-sdk/v6/core'
                : 'https://www.paypal.com/web-sdk/v6/core';
              script.async = true;
              await new Promise<void>((resolve, reject) => {
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
                document.body.appendChild(script);
              });
            }
          })(),
          loadGooglePayScript().catch(() => {}),
        ]);

        if (!mounted || !paymentWindow.paypal) return;

        // Create PayPal SDK instance with all payment components
        const sdkInstance = await paymentWindow.paypal.createInstance({
          clientToken,
          components: ['paypal-payments', 'paypal-guest-payments', 'googlepay-payments'],
          pageType: 'checkout',
        });

        // Check eligibility
        const paymentMethods = await sdkInstance.findEligibleMethods({
          currencyCode: 'USD',
        });

        // Setup PayPal
        if (paymentMethods.isEligible('paypal')) {
          const session = sdkInstance.createPayPalOneTimePaymentSession({
            onApprove: async (data) => {
              try {
                setPaypalProcessing(true);
                const response = await capturePayPalOrder(data.orderId);
                if (response.status === 'COMPLETED') {
                  onSuccessRef.current(response.orderId);
                } else {
                  onErrorRef.current('Payment was not completed');
                }
              } catch (err) {
                const error = err as { response?: { data?: { message?: string } } };
                onErrorRef.current(error.response?.data?.message || 'Failed to capture payment');
              } finally {
                setPaypalProcessing(false);
              }
            },
            onCancel: () => setPaypalProcessing(false),
            onError: (err) => {
              onErrorRef.current(err.message || 'PayPal error occurred');
              setPaypalProcessing(false);
            },
          });

          if (mounted) {
            setPaypalSession(session);
            setPaypalReady(true);
          }
        }

        // Setup Credit/Debit Card (Guest Checkout)
        
        try {
          if (typeof sdkInstance.createPayPalGuestOneTimePaymentSession !== 'function') {
            throw new Error('Guest payments not available');
          }
          
          const guestSession = sdkInstance.createPayPalGuestOneTimePaymentSession({
            onApprove: async (data) => {
              try {
                setCardProcessing(true);
                const response = await capturePayPalOrder(data.orderId);
                if (response.status === 'COMPLETED') {
                  onSuccessRef.current(response.orderId);
                } else {
                  onErrorRef.current('Payment was not completed');
                }
              } catch (err) {
                const error = err as { response?: { data?: { message?: string } } };
                onErrorRef.current(error.response?.data?.message || 'Failed to capture payment');
              } finally {
                setCardProcessing(false);
              }
            },
            onCancel: () => setCardProcessing(false),
            onComplete: () => setCardProcessing(false),
            onError: (err) => {
              onErrorRef.current(err.message || 'Card payment error occurred');
              setCardProcessing(false);
            },
            onWarn: (data) => {
              console.warn('Card payment warning:', data.message);
            },
          });

          cardSessionRef.current = guestSession;

          if (mounted) {
            setCardReady(true);
          }
        } catch (err) {
          console.error('Guest card payments error:', err);
        }

        // Setup Google Pay
        if (paymentMethods.isEligible('googlepay') && paymentWindow.google?.payments) {
          try {
            const googlePaySession = sdkInstance.createGooglePayOneTimePaymentSession();
            googlePaySessionRef.current = googlePaySession;
            
            const googlePayConfig = await googlePaySession.getGooglePayConfig();
            googlePayConfigRef.current = googlePayConfig;

            const paymentsClient = new paymentWindow.google.payments.api.PaymentsClient({
              environment: isPayPalSandbox() ? 'TEST' : 'PRODUCTION',
            });
            paymentsClientRef.current = paymentsClient;

            const isReadyToPay = await paymentsClient.isReadyToPay({
              allowedPaymentMethods: googlePayConfig.allowedPaymentMethods,
              apiVersion: googlePayConfig.apiVersion,
              apiVersionMinor: googlePayConfig.apiVersionMinor,
            });

            if (isReadyToPay.result && mounted) {
              setGooglePayReady(true);
            }
          } catch (err) {
            console.warn('Google Pay setup failed:', err);
          }
        }

        if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error('Payment initialization error:', err);
          setError('Failed to initialize payments. Please try again later.');
          setLoading(false);
        }
      }
    };

    initializePayments();

    return () => {
      mounted = false;
    };
  }, []);

  // Handle PayPal click
  const handlePayPalClick = async () => {
    if (!paypalSession || paypalProcessing || disabled) return;

    try {
      setPaypalProcessing(true);
      await paypalSession.start(
        { presentationMode: 'auto' },
        createOrder()
      );
    } catch (err) {
      const error = err as Error;
      if (!error.message?.includes('cancel')) {
        onError(error.message || 'Payment failed');
      }
      setPaypalProcessing(false);
    }
  };

  // Render the PayPal card button web component when ready
  const cardProcessingRef = useRef(false);
  const disabledRef = useRef(disabled);
  
  useEffect(() => {
    cardProcessingRef.current = cardProcessing;
    disabledRef.current = disabled;
  }, [cardProcessing, disabled]);
  
  useEffect(() => {
    
    if (loading || !cardReady || !cardSessionRef.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const container = cardButtonContainerRef.current;
      if (!container) {
        return;
      }

      if (container.querySelector('paypal-basic-card-button')) {
        return;
      }

      container.innerHTML = '';

      const cardContainer = document.createElement('paypal-basic-card-container');
      const cardButton = document.createElement('paypal-basic-card-button');
      cardButton.id = 'paypal-basic-card-button';
      
      cardContainer.style.width = '100%';
      cardContainer.style.display = 'block';
      
      // Add click handler to start the payment session
      cardButton.addEventListener('click', async () => {
        if (cardProcessingRef.current || disabledRef.current || !cardSessionRef.current) return;
        
        try {
          await cardSessionRef.current.start(
            { 
              presentationMode: 'auto',
              targetElement: cardButton,
            },
            createOrderRef.current()
          );
        } catch (err) {
          const error = err as Error;
          if (!error.message?.includes('cancel')) {
            onErrorRef.current(error.message || 'Card payment failed');
          }
        }
      });

      cardContainer.appendChild(cardButton);
      container.appendChild(cardContainer);
    }, 50);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [cardReady, loading]);

  // Handle Google Pay click
  const handleGooglePayClick = async () => {
    if (!googlePaySessionRef.current || !googlePayConfigRef.current || !paymentsClientRef.current || googlePayProcessing || disabled) return;

    try {
      setGooglePayProcessing(true);

      const { allowedPaymentMethods, merchantInfo, apiVersion, apiVersionMinor, countryCode } = googlePayConfigRef.current;

      const paymentDataRequest = {
        apiVersion,
        apiVersionMinor,
        allowedPaymentMethods,
        merchantInfo,
        transactionInfo: {
          displayItems: [
            {
              label: planName,
              type: 'LINE_ITEM',
              price: planPrice.toFixed(2),
            },
          ],
          countryCode,
          currencyCode: 'USD',
          totalPriceStatus: 'FINAL',
          totalPrice: planPrice.toFixed(2),
          totalPriceLabel: 'Total',
        },
      };

      // Load payment data (opens Google Pay sheet)
      const paymentData = await paymentsClientRef.current.loadPaymentData(paymentDataRequest);

      // Create PayPal order
      const orderResponse = await createPayPalOrder(planCode);
      const orderId = orderResponse.orderId;

      // Confirm order with Google Pay payment data
      const { status } = await googlePaySessionRef.current.confirmOrder({
        orderId,
        paymentMethodData: paymentData.paymentMethodData,
      });

      if (status !== 'PAYER_ACTION_REQUIRED') {
        // Capture the order
        const captureResponse = await capturePayPalOrder(orderId);
        if (captureResponse.status === 'COMPLETED') {
          onSuccessRef.current(captureResponse.orderId);
        } else {
          onErrorRef.current('Payment was not completed');
        }
      }
    } catch (err) {
      const error = err as { statusCode?: string; message?: string };
      // Google Pay cancellation
      if (error.statusCode === 'CANCELED' || error.message?.includes('cancel')) {
        // User cancelled - no error needed
      } else {
        console.error('Google Pay error:', err);
        onError(error.message || 'Google Pay payment failed');
      }
    } finally {
      setGooglePayProcessing(false);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Spinner />
        <span className="ml-2 text-gray-400">Loading payment options...</span>
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

  if (error || (!paypalReady && !cardReady && !googlePayReady)) {
    return (
      <div className="text-center text-red-400 py-4">
        {error || 'Payment options unavailable. Please try again later.'}
      </div>
    );
  }

  const isProcessing = paypalProcessing || cardProcessing || googlePayProcessing;

  return (
    <div className="w-full space-y-3">
      {/* PayPal Button */}
      {paypalReady && (
        <button
          onClick={handlePayPalClick}
          disabled={isProcessing}
          className="w-full py-3 px-4 bg-[#FFC439] hover:bg-[#f0b82e] text-[#003087] font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {paypalProcessing ? (
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
      )}

      {/* Credit/Debit Card Button - PayPal Web Component */}
      <div className={`relative ${cardReady ? '' : 'hidden'}`}>
        {cardProcessing && (
          <div className="absolute inset-0 bg-gray-800/80 rounded-lg flex items-center justify-center z-10">
            <Spinner />
            <span className="ml-2 text-white">Processing...</span>
          </div>
        )}
        <div 
          ref={cardButtonContainerRef} 
          className={`w-full ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        />
      </div>

      {/* Google Pay Button */}
      {googlePayReady && (
        <button
          onClick={handleGooglePayClick}
          disabled={isProcessing}
          className="w-full py-3 px-4 bg-black hover:bg-gray-900 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {googlePayProcessing ? (
            <>
              <Spinner />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
              </svg>
              <span>Pay with Google Pay</span>
            </>
          )}
        </button>
      )}

      {/* Divider if both are available */}
      {paypalReady && googlePayReady && (
        <div ref={googlePayContainerRef} className="hidden" />
      )}
    </div>
  );
};

export default PaymentButtons;
