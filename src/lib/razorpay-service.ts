import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { SubscriptionData } from '@/types';

// Client-side Razorpay integration
export interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_subscription_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

/**
 * Load Razorpay script dynamically
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if already loaded
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Create a subscription on server-side
 * @deprecated Use api-client.ts createSubscription instead
 */
export async function createSubscription(
  userId: string,
  planId: string,
  currency: 'USD' | 'INR'
): Promise<{ subscriptionId: string; customerId: string }> {
  // This function is deprecated. Use the backend API client instead.
  // Import from '@/lib/api-client' and use createSubscription
  throw new Error('This function is deprecated. Use createSubscription from @/lib/api-client instead.');
}

/**
 * Open Razorpay checkout modal
 */
export async function openRazorpayCheckout(
  subscriptionId: string,
  userEmail: string,
  userName: string,
  razorpayKeyId: string,
  onSuccess: (response: RazorpayResponse) => void,
  onDismiss: () => void
): Promise<void> {
  const loaded = await loadRazorpayScript();

  if (!loaded) {
    throw new Error('Failed to load Razorpay SDK');
  }

  const options: RazorpayOptions = {
    key: razorpayKeyId,
    subscription_id: subscriptionId,
    name: 'Acad AI Premium',
    description: 'Monthly Premium Subscription',
    handler: onSuccess,
    prefill: {
      name: userName,
      email: userEmail,
    },
    theme: {
      color: '#29ABE2',
    },
    modal: {
      ondismiss: onDismiss,
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
}

/**
 * Verify payment signature on server-side
 * @deprecated Use api-client.ts verifyPayment instead
 */
export async function verifyPayment(
  razorpaySubscriptionId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  userId: string
): Promise<boolean> {
  // This function is deprecated. Use the backend API client instead.
  // Import from '@/lib/api-client' and use verifyPayment
  throw new Error('This function is deprecated. Use verifyPayment from @/lib/api-client instead.');
}

/**
 * Update user's subscription status in Firestore
 */
export async function updateUserSubscription(
  userId: string,
  subscriptionData: Partial<SubscriptionData>
): Promise<void> {
  const userDocRef = doc(db, 'users', userId);

  // Clean up undefined values
  const cleanData = Object.fromEntries(
    Object.entries(subscriptionData).filter(([_, value]) => value !== undefined)
  );

  await updateDoc(userDocRef, {
    subscription: cleanData,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Cancel subscription
 * @deprecated Use api-client.ts cancelSubscription instead
 */
export async function cancelSubscription(
  userId: string,
  subscriptionId: string
): Promise<void> {
  // This function is deprecated. Use the backend API client instead.
  // Import from '@/lib/api-client' and use cancelSubscription
  throw new Error('This function is deprecated. Use cancelSubscription from @/lib/api-client instead.');
}

/**
 * Get user's current subscription tier
 */
export async function getUserSubscriptionTier(
  userId: string
): Promise<'free' | 'premium'> {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    return 'free';
  }

  const userData = userDoc.data();
  const subscription = userData?.subscription as SubscriptionData | undefined;

  if (!subscription || subscription.tier === 'free') {
    return 'free';
  }

  // Check if subscription is active
  if (subscription.status === 'active') {
    // Additional check for expiry
    if (subscription.subscriptionEndDate) {
      const endDate = subscription.subscriptionEndDate instanceof Date
        ? subscription.subscriptionEndDate
        : new Date(subscription.subscriptionEndDate);

      if (endDate > new Date()) {
        return 'premium';
      }
    } else {
      // No end date means active subscription
      return 'premium';
    }
  }

  return 'free';
}

/**
 * Check if user has access to a specific feature
 */
export async function checkFeatureAccess(
  userId: string,
  feature: 'hyperpersonalization' | 'chat' | 'prioritySupport'
): Promise<boolean> {
  const tier = await getUserSubscriptionTier(userId);

  const featureMap = {
    hyperpersonalization: tier === 'premium',
    chat: tier === 'premium',
    prioritySupport: tier === 'premium',
  };

  return featureMap[feature];
}
