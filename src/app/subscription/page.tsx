"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { PricingCard } from '@/components/pricing/pricing-card';
import { useDetectCurrency } from '@/components/pricing/currency-selector';
import {
  createSubscription,
  openRazorpayCheckout,
  verifyPayment,
  updateUserSubscription,
} from '@/lib/razorpay-service';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const currency = useDetectCurrency(); // Auto-detect, no manual selection

  const [loading, setLoading] = useState(false);
  const [currentTier, setCurrentTier] = useState<'free' | 'premium'>('free');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }

    if (user?.subscription) {
      setCurrentTier(user.subscription.tier);
    }
  }, [user, authLoading, router]);

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to subscribe',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Create subscription on server with auto-detected currency
      const { subscriptionId } = await createSubscription(
        user.uid,
        'monthly',
        currency
      );

      // Open Razorpay checkout
      await openRazorpayCheckout(
        subscriptionId,
        user.email || '',
        user.displayName || 'User',
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        async (response) => {
          // Payment successful, verify on server
          try {
            const verified = await verifyPayment(
              response.razorpay_subscription_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              user.uid
            );

            if (verified) {
              toast({
                title: 'Subscription Activated!',
                description: 'Welcome to Acad AI Premium! Your subscription is now active.',
              });

              // Refresh the page to show updated subscription status
              window.location.reload();
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast({
              title: 'Verification Failed',
              description: 'Payment received but verification failed. Please contact support.',
              variant: 'destructive',
            });
          } finally {
            setLoading(false);
          }
        },
        () => {
          // Payment dismissed
          setLoading(false);
          toast({
            title: 'Payment Cancelled',
            description: 'You can try again anytime.',
          });
        }
      );
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast({
        title: 'Subscription Failed',
        description: error.message || 'Failed to create subscription. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#29ABE2]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#29ABE2] to-[#8E2DE2] bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Start for free or unlock premium features to supercharge your learning journey
          </p>
        </div>

        {/* Pricing Cards - Single currency based on location */}
        <PricingCard
          currency={currency}
          onSubscribe={handleSubscribe}
          currentTier={currentTier}
          loading={loading}
        />

        {/* FAQ or Additional Info */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#29ABE2] mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-400">
                Yes! You can cancel your subscription at any time. You'll continue to have access
                to premium features until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#29ABE2] mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-400">
                We accept all major credit cards, debit cards, UPI, net banking, and digital wallets
                through Razorpay's secure payment gateway.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#29ABE2] mb-2">
                What's hyperpersonalization?
              </h3>
              <p className="text-gray-400">
                Our AI analyzes your profile, experience, and learning goals to customize roadmaps
                specifically for you, making them more relevant and efficient for your journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
