/**
 * Payment Client - Frontend service for interacting with the payment backend
 *
 * SECURITY: All sensitive operations (checkout creation, subscription management)
 * are handled by the backend. This client only provides the interface.
 */

import { auth } from './firebase';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export type Interval = 'monthly' | 'yearly';
export type Currency = 'USD' | 'INR';

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}

export interface CheckoutStatusResponse {
  outcome: 'success' | 'failed' | 'unknown';
  rawStatus?: string;
  subscriptionPersisted: boolean;
  persistenceError?: string;
  uid?: string;
}

export interface CancelResponse {
  ok: boolean;
  subscription_id?: string;
  cancel_at_next_billing_date?: boolean;
  next_billing_date?: string;
  error?: string;
}

async function getAuthToken(): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  return currentUser.getIdToken();
}

/**
 * Creates a checkout session via the backend
 * The backend validates pricing and creates the DodoPayments session
 */
export async function createCheckout(params: {
  interval: Interval;
  currency: Currency;
  idempotencyKey?: string;
}): Promise<CheckoutResponse> {
  const token = await getAuthToken();

  const res = await fetch(`${API_URL}/api/payment/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to create checkout session');
  }

  return data;
}

/**
 * Checks checkout status and triggers server-side subscription persistence
 */
export async function getCheckoutStatus(sessionId: string): Promise<CheckoutStatusResponse> {
  const res = await fetch(
    `${API_URL}/api/payment/checkout-status?session_id=${encodeURIComponent(sessionId)}`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  );

  const data = await res.json();

  if (!res.ok && data.outcome === undefined) {
    throw new Error(data.error || 'Failed to get checkout status');
  }

  return data;
}

/**
 * Cancels subscription at period end via the backend
 */
export async function cancelSubscription(): Promise<CancelResponse> {
  const token = await getAuthToken();

  const res = await fetch(`${API_URL}/api/payment/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ cancel_at_period_end: true }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { ok: false, error: data.error || 'Failed to cancel subscription' };
  }

  return data;
}

/**
 * Fetches server-validated pricing
 */
export async function getPricing(currency: Currency): Promise<{
  currency: string;
  symbol: string;
  monthly: { price: string };
  annual: { price: string; monthlyEquivalent: string; savingsPercent: string };
}> {
  const res = await fetch(`${API_URL}/api/payment/pricing?currency=${currency}`);

  if (!res.ok) {
    throw new Error('Failed to fetch pricing');
  }

  return res.json();
}

/**
 * Generates an idempotency key for checkout requests
 * Prevents duplicate charges if user double-clicks or network issues occur
 */
export function generateIdempotencyKey(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `checkout_${timestamp}_${random}`;
}
