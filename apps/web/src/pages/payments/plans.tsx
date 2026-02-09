import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common';
import { PlanCard, PaymentButtons, PaymentStatus } from '../../components/payments';
import { isAuthenticated } from '../../client/auth';
import { getSubscriptionStatus, SubscriptionStatus } from '../../client/user';
import Spinner from '../../components/Spinner';
import { useUser } from '../../context/UserContext';

const PlansPage: React.FC = () => {
  const { refreshUser } = useUser();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<{
    status: 'success' | 'error' | 'processing';
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      
      if (authenticated) {
        try {
          const status = await getSubscriptionStatus();
          setSubscription(status);
          setIsPro(status.isPro);
        } catch (err) {
          console.error('Failed to get subscription status:', err);
        }
      }
      
      setLoading(false);
    };
    
    checkStatus();
  }, []);

  const handlePaymentSuccess = () => {
    setPaymentStatus({
      status: 'success',
      message: 'Payment successful! Your account has been upgraded to Pro. Enjoy premium streaming!',
    });
    setIsPro(true);
      refreshUser();
  };

  const handlePaymentError = (error: string) => {
    setPaymentStatus({
      status: 'error',
      message: error,
    });
  };

  const lifetimeFeatures = [
    { text: 'Remove all on site ads forever', included: true },
    { text: 'Access to premium streaming servers', included: true },
    { text: 'Unlimited HD streaming', included: true },
    { text: 'Early access to new features', included: true },
    { text: 'No recurring payments', included: true },
    { text: 'Cleaner experience', included: true },
  ];

  const freeFeatures = [
    { text: 'Access to all content', included: true },
    { text: 'HD streaming', included: true },
    { text: 'Ad-supported viewing', included: true },
    { text: 'No ads', included: false },
    { text: 'Access to premium streaming servers', included: false },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Choose Your Plan"
          subtitle="Upgrade to Pro for an ad-free experience. One payment, lifetime access."
        />

        {/* Payment Status */}
        {paymentStatus && (
          <div className="mb-8 max-w-md mx-auto">
            <PaymentStatus
              status={paymentStatus.status}
              message={paymentStatus.message}
              onDismiss={() => setPaymentStatus(null)}
            />
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <PlanCard
            name="Free"
            price={0}
            description="Basic access with ads"
            features={freeFeatures}
          >
            {!isPro ? (
              <div className="text-center py-3 text-gray-400 border border-gray-700 rounded-lg">
                Current Plan
              </div>
            ) : (
              <div className="text-center py-3 text-gray-500 border border-gray-800 rounded-lg bg-gray-900/50">
                Free Tier
              </div>
            )}
          </PlanCard>

          {/* Pro Lifetime Plan */}
          <PlanCard
            name="Pro"
            price={15}
            description="Removes all ads"
            features={lifetimeFeatures}
            isLifetime
            highlighted={!isPro}
          >
            {isPro ? (
              <div className="space-y-3">
                <div className="text-center py-3 text-green-400 border border-green-600 rounded-lg bg-green-900/20">
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Current Plan
                  </span>
                </div>
                {subscription?.subscription && (
                  <p className="text-center text-gray-400 text-sm">
                    {subscription.subscription.isLifetime ? 'Lifetime access' : `Expires: ${new Date(subscription.subscription.expiresAt!).toLocaleDateString()}`}
                  </p>
                )}
              </div>
            ) : isLoggedIn ? (
              <PaymentButtons
                planCode="pro_lifetime"
                planPrice={15}
                planName="Pro Lifetime"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            ) : (
              <div className="space-y-3">
                <Link
                  to="/auth/login"
                  className="block w-full py-3 px-4 bg-[#f5c518] hover:bg-yellow-600 text-black 
                           font-semibold rounded-lg text-center transition-all duration-300"
                >
                  Login to Purchase
                </Link>
                <p className="text-center text-gray-500 text-sm">
                  Don&apos;t have an account?{' '}
                  <Link to="/auth/register" className="text-[#f5c518] hover:underline">
                    Register
                  </Link>
                </p>
              </div>
            )}
          </PlanCard>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure payment via PayPal, Credit/Debit Card, or Google Pay</span>
          </div>
          <p className="text-gray-500 text-sm">
            By purchasing Pro, you agree to our{' '}
            <Link to="/pro-plan-terms-and-conditions" className="text-[#f5c518] hover:underline">
              Pro Plan Terms &amp; Conditions
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlansPage;
