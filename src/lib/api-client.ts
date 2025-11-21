/**
 * API Client for Backend Communication
 * Handles all HTTP requests to the FastAPI backend
 */

import { auth } from './firebase';

// Backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Get Firebase ID token for authentication
 */
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
}

/**
 * Make authenticated API request
 */
async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

// ===== Authentication APIs =====

/**
 * Verify Firebase token with backend
 */
export async function verifyToken(idToken: string) {
  const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Token verification failed');
  }

  return await response.json();
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile() {
  const response = await authenticatedFetch('/auth/me');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get user profile');
  }

  return await response.json();
}

// ===== Roadmap APIs =====

/**
 * Customize roadmap with AI based on user profile
 * Now uses Next.js API route instead of backend
 */
export async function customizeRoadmap(
  roadmapData: any,
  userProfile: any,
  domain: string
) {
  // Call Next.js API route (not backend)
  const response = await fetch('/api/roadmap/customize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ roadmapData, userProfile, domain }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to customize roadmap' }));
    throw new Error(error.message || 'Failed to customize roadmap');
  }

  return await response.json();
}

/**
 * Get available roadmap domains
 */
export async function getAvailableDomains() {
  const response = await fetch(`${API_BASE_URL}/roadmap/domains`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get available domains');
  }

  return await response.json();
}

// ===== Payment APIs =====

/**
 * Create subscription for user
 */
export async function createSubscription(
  userId: string,
  planId: string = 'monthly',
  currency: 'USD' | 'INR' = 'INR'
) {
  const response = await authenticatedFetch('/payment/create-subscription', {
    method: 'POST',
    body: JSON.stringify({ userId, planId, currency }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create subscription');
  }

  return await response.json();
}

/**
 * Verify payment after Razorpay success
 */
export async function verifyPayment(
  razorpay_subscription_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  userId: string
) {
  const response = await authenticatedFetch('/payment/verify-payment', {
    method: 'POST',
    body: JSON.stringify({
      razorpay_subscription_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to verify payment');
  }

  return await response.json();
}

/**
 * Cancel active subscription
 */
export async function cancelSubscription(userId: string, subscriptionId: string) {
  const response = await authenticatedFetch('/payment/cancel-subscription', {
    method: 'POST',
    body: JSON.stringify({ userId, subscriptionId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to cancel subscription');
  }

  return await response.json();
}

// ===== Health Check =====

/**
 * Check backend health
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    if (!response.ok) {
      return { status: 'unhealthy', connected: false };
    }
    const data = await response.json();
    return { ...data, connected: true };
  } catch (error) {
    return { status: 'unhealthy', connected: false, error: String(error) };
  }
}
