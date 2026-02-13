'use client';

import { useState, useEffect } from 'react';
import Layout from '@/app/components/Layout';
import { useRouter } from 'next/navigation';
import ManageBillingButton from '@/app/components/ManageBillingButton';
import SubscriptionDetails from '@/app/components/SubscriptionDetails';
import UpgradePlanCTA from '@/app/components/UpgradePlanCTA';
import Image from 'next/image';

const PaymentSettingsPage = () => {
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [autoPaymentEnabled, setAutoPaymentEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasSubscription, setHasSubscription] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/stripe/manage-subscription');
        if (!res.ok) {
          if (res.status === 404) {
            setHasSubscription(false);
            setIsLoading(false);
            return;
          }
          const data = await res.json();
          throw new Error(data.message || 'Could not fetch subscription status.');
        } else {
          const data = await res.json();
          setAutoPaymentEnabled(data?.autoPaymentEnabled || false);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscriptionStatus();
  }, []);

  const handleManageBilling = async () => {
    // ... existing logic
    setIsPortalLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/create-portal-session');
      if (!res.ok) {
        throw new Error('Could not open billing portal. Do you have an active subscription?');
      }
      const { url } = await res.json();
      router.push(url);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsPortalLoading(false);
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Payment Settings</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Manage your billing information and subscription settings. Cortexcart Insight Dashboard uses stripe to handle billing and subscription services for security and peace of mind, the manage billing button below will take you to their site to securely manage all aspects of your subscription.
      </p>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!hasSubscription ? (
        <UpgradePlanCTA
          title="Active Subscription Required"
          description="You need an active subscription to manage payment settings. Upgrade now to unlock full access."
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Billing Information</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Here is a quick view of your existing plan with us, you can update your payment method and view your invoice history on our secure Stripe portal.
          </p>
          <SubscriptionDetails />
          <ManageBillingButton />
        </div>
      )}
    </Layout>
  );
};

export default PaymentSettingsPage;