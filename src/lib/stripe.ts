/**
 * Stripe Configuration
 * Client and server-side Stripe setup
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe.js with publishable key
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error('Stripe publishable key is not configured');
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// Stripe product configuration
export const STRIPE_PRODUCTS = {
  premium: {
    monthly: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
      amount: 9.99,
      currency: 'USD',
      interval: 'month',
    },
    yearly: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID || '',
      amount: 99.99,
      currency: 'USD',
      interval: 'year',
    },
  },
} as const;

// Pricing plan details
export const PRICING_PLANS = {
  free: {
    name: 'Free',
    description: 'Get started with basic features',
    price: 0,
    interval: null,
    features: [
      'Access to all roadmap domains',
      'Basic roadmap content',
      'Monthly learning resources',
      'Community support',
    ],
  },
  premium: {
    name: 'Premium',
    description: 'Unlock AI-powered personalization',
    price: 9.99,
    yearlyPrice: 99.99,
    interval: 'month',
    features: [
      'Everything in Free',
      'AI Hyperpersonalization',
      'Personalized learning paths',
      'AI Chat Assistant',
      'Weekly curated resources',
      'Priority support',
      'Progress tracking',
      'Custom learning goals',
    ],
    popular: true,
  },
} as const;

// Helper function to format price
export const formatPrice = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Helper function to get price ID based on interval
export const getPriceId = (interval: 'month' | 'year'): string => {
  if (interval === 'month') {
    return STRIPE_PRODUCTS.premium.monthly.priceId;
  } else {
    return STRIPE_PRODUCTS.premium.yearly.priceId;
  }
};
