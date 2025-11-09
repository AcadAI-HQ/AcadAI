"use client";

import { useState } from 'react';
import { Check, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_PRICING } from '@/lib/razorpay-config';

interface PricingCardProps {
  currency: 'USD' | 'INR';
  onSubscribe: () => void;
  currentTier?: 'free' | 'premium';
  loading?: boolean;
}

export function PricingCard({ currency, onSubscribe, currentTier = 'free', loading = false }: PricingCardProps) {
  const pricing = SUBSCRIPTION_PRICING[currency].monthly;

  const freeTierFeatures = [
    'Comprehensive Roadmap Generation',
    'Monthly Learning Resources',
    'Basic Profile Management',
    'Progress Tracking',
  ];

  const premiumTierFeatures = [
    'Everything in Free',
    'AI Hyperpersonalization',
    'Interactive Chat Assistant',
    'Weekly Learning Resources',
    'Priority Support',
    'Early Access to New Features',
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {/* Free Tier */}
      <Card className="relative border-gray-700 bg-gray-900/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Free</CardTitle>
            {currentTier === 'free' && (
              <Badge variant="secondary">Current Plan</Badge>
            )}
          </div>
          <CardDescription>Perfect for getting started</CardDescription>
          <div className="mt-4">
            <span className="text-4xl font-bold">$0</span>
            <span className="text-gray-400 ml-2">/month</span>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {freeTierFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-[#29ABE2] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{feature}</span>
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
            {currentTier === 'free' ? 'Current Plan' : 'Downgrade'}
          </Button>
        </CardFooter>
      </Card>

      {/* Premium Tier */}
      <Card className="relative border-[#29ABE2] bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg shadow-[#29ABE2]/20">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-[#29ABE2] to-[#8E2DE2] text-white px-4 py-1">
            <Crown className="h-3 w-3 mr-1 inline" />
            Most Popular
          </Badge>
        </div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              Premium
              <Zap className="h-5 w-5 text-[#29ABE2]" />
            </CardTitle>
            {currentTier === 'premium' && (
              <Badge variant="secondary">Current Plan</Badge>
            )}
          </div>
          <CardDescription>Unlock your full learning potential</CardDescription>
          <div className="mt-4">
            <span className="text-4xl font-bold">{pricing.display}</span>
            <span className="text-gray-400 ml-2">/month</span>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {premiumTierFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-[#29ABE2] flex-shrink-0 mt-0.5" />
                <span className="text-gray-100 font-medium">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-gradient-to-r from-[#29ABE2] to-[#8E2DE2] hover:opacity-90 text-white"
            onClick={onSubscribe}
            disabled={currentTier === 'premium' || loading}
          >
            {loading ? 'Processing...' : currentTier === 'premium' ? 'Current Plan' : 'Upgrade to Premium'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
