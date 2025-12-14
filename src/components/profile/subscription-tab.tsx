"use client";

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar } from 'lucide-react';
import Link from 'next/link';

export function SubscriptionTab() {
  const { user } = useAuth();

  const subscription = user?.subscription;
  const tier = subscription?.tier || 'free';
  const status = subscription?.status || 'inactive';
  const isPremium = tier === 'premium' && status === 'active';

  // Format price
  const formatPrice = (amount: number, currency: string = 'USD') => {
    const symbol = currency === 'USD' ? '$' : '₹';
    return `${symbol}${amount.toFixed(2)}`;
  };

  // Format dates
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Current Plan
                {isPremium && <Sparkles className="h-5 w-5 text-primary" />}
              </CardTitle>
              <CardDescription>
                {isPremium
                  ? 'You have access to all premium features'
                  : 'Upgrade to unlock AI-powered personalization'}
              </CardDescription>
            </div>
            <Badge
              variant={isPremium ? 'default' : 'secondary'}
              className="text-sm px-3 py-1"
            >
              {tier === 'premium' ? 'Premium' : 'Free'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPremium ? (
            <>
              {/* Subscription Details */}
              <div className="space-y-3">
                {subscription?.interval && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Billing Cycle</span>
                    <span className="font-medium capitalize">{subscription.interval}ly</span>
                  </div>
                )}

                {subscription?.amount && subscription?.currency && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">
                      {formatPrice(subscription.amount / 100, subscription.currency.toUpperCase())}
                      /{subscription.interval}
                    </span>
                  </div>
                )}

                {subscription?.currentPeriodEnd && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {subscription?.cancelAtPeriodEnd ? 'Expires On' : 'Renews On'}
                    </span>
                    <span className="font-medium">
                      {formatDate(subscription.currentPeriodEnd)}
                    </span>
                  </div>
                )}

                {subscription?.cancelAtPeriodEnd && (
                  <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      Your subscription will be cancelled at the end of the current billing period.
                      You'll continue to have access to premium features until then.
                    </p>
                  </div>
                )}
              </div>

              {/* Subscription Status */}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  Thank you for being a premium member!
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Free Plan Features */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  You're currently on the free plan with access to:
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• All roadmap domains</li>
                  <li>• Basic roadmap content</li>
                  <li>• Monthly learning resources</li>
                  <li>• Community support</li>
                </ul>
              </div>

              {/* Upgrade Button */}
              <div className="pt-4 border-t">
                <Button asChild className="w-full">
                  <Link href="/pricing">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Unlock AI hyperpersonalization, chat assistant, and more
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Premium Features Card */}
      {!isPremium && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Premium Features
            </CardTitle>
            <CardDescription>
              What you'll get with a premium subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs text-primary">✓</span>
                </div>
                <div>
                  <div className="font-medium">AI Hyperpersonalization</div>
                  <div className="text-muted-foreground">Roadmaps tailored to your experience and goals</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs text-primary">✓</span>
                </div>
                <div>
                  <div className="font-medium">AI Chat Assistant</div>
                  <div className="text-muted-foreground">Get help and guidance as you learn</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs text-primary">✓</span>
                </div>
                <div>
                  <div className="font-medium">Weekly Resources</div>
                  <div className="text-muted-foreground">Curated learning materials delivered weekly</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs text-primary">✓</span>
                </div>
                <div>
                  <div className="font-medium">Priority Support</div>
                  <div className="text-muted-foreground">Get faster responses to your questions</div>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
