"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Calendar, CreditCard, AlertCircle, Zap } from 'lucide-react';
import { cancelSubscription } from '@/lib/razorpay-service';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function SubscriptionTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const subscription = user?.subscription;
  const isPremium = subscription?.tier === 'premium' && subscription?.status === 'active';

  const handleCancelSubscription = async () => {
    if (!user || !subscription?.razorpaySubscriptionId) return;

    setLoading(true);
    try {
      await cancelSubscription(user.uid, subscription.razorpaySubscriptionId);

      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription has been cancelled. You\'ll have access until the end of the billing period.',
      });

      // Refresh to show updated status
      window.location.reload();
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      toast({
        title: 'Cancellation Failed',
        description: error.message || 'Failed to cancel subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    router.push('/subscription');
  };

  if (!subscription || !isPremium) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-[#29ABE2]" />
            Subscription
          </CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Free Plan
              </Badge>
            </div>
            <p className="text-gray-400 mb-6">
              You're currently on the free plan. Upgrade to unlock premium features!
            </p>
            <div className="space-y-3 mb-6 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-[#29ABE2] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">AI Hyperpersonalization</p>
                  <p className="text-sm text-gray-400">Get roadmaps tailored to your background</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-[#29ABE2] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Interactive Chat</p>
                  <p className="text-sm text-gray-400">Ask questions and get instant help</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-[#29ABE2] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Weekly Learning Resources</p>
                  <p className="text-sm text-gray-400">Get fresh content every week</p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-[#29ABE2] to-[#8E2DE2] hover:opacity-90"
            >
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'active':
        return <Badge className="bg-green-600">Active</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'expired':
        return <Badge variant="outline">Expired</Badge>;
      case 'payment_failed':
        return <Badge variant="destructive">Payment Failed</Badge>;
      default:
        return <Badge variant="secondary">{subscription.status}</Badge>;
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-[#29ABE2]" />
            Premium Subscription
          </CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>Your current subscription details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subscription Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-[#29ABE2] mt-0.5" />
            <div>
              <p className="text-sm text-gray-400">Start Date</p>
              <p className="font-medium">{formatDate(subscription.subscriptionStartDate)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-[#29ABE2] mt-0.5" />
            <div>
              <p className="text-sm text-gray-400">Next Billing Date</p>
              <p className="font-medium">{formatDate(subscription.subscriptionEndDate)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-[#29ABE2] mt-0.5" />
            <div>
              <p className="text-sm text-gray-400">Amount</p>
              <p className="font-medium">
                {subscription.currency === 'USD' ? '$' : '₹'}
                {subscription.currency === 'USD'
                  ? (subscription.amount || 0) / 100
                  : (subscription.amount || 0) / 100}
                {' / month'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-[#29ABE2] mt-0.5" />
            <div>
              <p className="text-sm text-gray-400">Auto Renew</p>
              <p className="font-medium">{subscription.autoRenew ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
        </div>

        {/* Premium Features */}
        <div className="border-t border-gray-700 pt-6">
          <h3 className="font-medium mb-3">Premium Features</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#29ABE2]" />
              AI Hyperpersonalization
            </li>
            <li className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#29ABE2]" />
              Interactive Chat Assistant
            </li>
            <li className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#29ABE2]" />
              Weekly Learning Resources
            </li>
            <li className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#29ABE2]" />
              Priority Support
            </li>
          </ul>
        </div>

        {/* Actions */}
        {subscription.status === 'active' && subscription.autoRenew && (
          <div className="border-t border-gray-700 pt-6">
            <div className="flex items-start gap-3 mb-4 p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-500 mb-1">Cancel Subscription</p>
                <p className="text-gray-400">
                  You can cancel anytime. You'll continue to have access to premium features until{' '}
                  {formatDate(subscription.subscriptionEndDate)}.
                </p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={loading}>
                  {loading ? 'Processing...' : 'Cancel Subscription'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-900 border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will cancel your premium subscription. You'll continue to have access until{' '}
                    {formatDate(subscription.subscriptionEndDate)}, and no further charges will be made.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelSubscription}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Cancel Subscription
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
