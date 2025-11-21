"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PRICING_PLANS, formatPrice, getPriceId } from '@/lib/stripe';
import { getStripe } from '@/lib/stripe';
import { toast } from 'sonner';

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/login?redirect=/pricing');
      return;
    }

    setLoading(true);

    try {
      // Get Firebase auth token
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      const idToken = await currentUser.getIdToken();

      // Get the price ID based on interval
      const priceId = getPriceId(isYearly ? 'year' : 'month');

      if (!priceId) {
        throw new Error('Stripe price ID not configured. Please check your environment variables.');
      }

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          priceId,
          interval: isYearly ? 'year' : 'month',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout');
      setLoading(false);
    }
  };

  const currentTier = user?.subscription?.tier || 'free';
  const isCurrentlyPremium = currentTier === 'premium' && user?.subscription?.status === 'active';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-headline font-bold mb-4">
            Choose Your Learning Path
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start for free or unlock AI-powered personalization with Premium
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              disabled={loading}
            />
            <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge variant="secondary" className="ml-2">
                Save 17%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl">{PRICING_PLANS.free.name}</CardTitle>
              <CardDescription>{PRICING_PLANS.free.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="text-4xl font-bold">
                  {formatPrice(PRICING_PLANS.free.price)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Forever free</p>
              </div>

              <ul className="space-y-3">
                {PRICING_PLANS.free.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant="outline"
                disabled={currentTier === 'free'}
              >
                {currentTier === 'free' ? 'Current Plan' : 'Downgrade to Free'}
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-primary shadow-lg">
            {PRICING_PLANS.premium.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                {PRICING_PLANS.premium.name}
                <Sparkles className="h-5 w-5 text-primary" />
              </CardTitle>
              <CardDescription>{PRICING_PLANS.premium.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="text-4xl font-bold">
                  {formatPrice(isYearly ? PRICING_PLANS.premium.yearlyPrice : PRICING_PLANS.premium.price)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  per {isYearly ? 'year' : 'month'}
                </p>
                {isYearly && (
                  <p className="text-xs text-primary mt-1">
                    ${((PRICING_PLANS.premium.price * 12 - PRICING_PLANS.premium.yearlyPrice)).toFixed(2)} savings
                  </p>
                )}
              </div>

              <ul className="space-y-3">
                {PRICING_PLANS.premium.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleSubscribe}
                disabled={loading || isCurrentlyPremium}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : isCurrentlyPremium ? (
                  'Current Plan'
                ) : (
                  'Upgrade to Premium'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-headline font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes! You can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What's included in hyperpersonalization?</h3>
              <p className="text-muted-foreground">
                Our AI analyzes your background, goals, and learning pace to customize every roadmap specifically for you. You'll get personalized recommendations, priority topics, and a realistic timeline based on your availability.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">
                While we don't offer a free trial for premium features, our free plan gives you full access to all roadmap content. You can upgrade anytime to unlock AI personalization and advanced features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
