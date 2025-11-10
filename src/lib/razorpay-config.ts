// Razorpay configuration and pricing
// Note: Key secret is now stored securely in the backend
export const RAZORPAY_CONFIG = {
  keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, // Public key for checkout UI only
};

// Pricing configuration with localized pricing
export const SUBSCRIPTION_PRICING = {
  USD: {
    monthly: {
      amount: 999, // $9.99 in cents
      currency: 'USD',
      display: '$9.99',
      period: 'month',
    },
  },
  INR: {
    monthly: {
      amount: 29900, // ₹299 in paise
      currency: 'INR',
      display: '₹299',
      period: 'month',
    },
  },
} as const;

// Feature access configuration
export const FEATURE_ACCESS = {
  free: {
    roadmapGeneration: true,
    hyperpersonalization: false,
    chat: false,
    learningResources: 'monthly',
    prioritySupport: false,
  },
  premium: {
    roadmapGeneration: true,
    hyperpersonalization: true,
    chat: true,
    learningResources: 'weekly',
    prioritySupport: true,
  },
} as const;

// Helper to get pricing based on user's currency
export function getPricing(currency: 'USD' | 'INR' = 'USD') {
  return SUBSCRIPTION_PRICING[currency].monthly;
}

// Helper to check feature access
export function hasFeatureAccess(
  tier: 'free' | 'premium',
  feature: keyof typeof FEATURE_ACCESS.free
): boolean {
  return FEATURE_ACCESS[tier][feature] as boolean;
}
