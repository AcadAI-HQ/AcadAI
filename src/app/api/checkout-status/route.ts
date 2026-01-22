import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';
import { adminDb, getAdminInitStatus } from '@/lib/firebase-admin';

function getEnv(name: string, optional = false): string {
  const v = process.env[name];
  if (!v && !optional) {
    throw new Error(`${name} is not set`);
  }
  return v as string;
}

// Helper to safely extract nested values
function safeGet(obj: any, path: string[], defaultValue?: any) {
  return path.reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), obj) ?? defaultValue;
}

// Calculate subscription end date based on interval
function calculatePeriodEnd(interval: 'month' | 'year' | null): Date {
  const now = new Date();
  if (interval === 'year') {
    return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  }
  // Default to monthly
  return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
}

// Persist subscription to Firestore when checkout is successful
// Returns { success: boolean, error?: string } to indicate persistence status
async function persistSubscriptionOnSuccess(session: any, sessionId: string): Promise<{ success: boolean; error?: string; uid?: string }> {
  console.log('[checkout-status] persistSubscriptionOnSuccess called');
  console.log('[checkout-status] Firebase Admin initialized:', !!adminDb);
  console.log('[checkout-status] Session ID:', sessionId);

  if (!adminDb) {
    const status = getAdminInitStatus();
    console.error('[checkout-status] Firebase Admin not initialized, skipping subscription persistence');
    console.error('[checkout-status] Init error:', status.error);
    return { success: false, error: `Firebase Admin not initialized: ${status.error}` };
  }

  // CRITICAL FIX: DodoPayments doesn't return metadata on session retrieval
  // Look up the UID from our stored session mapping instead
  let uid: string | undefined;
  let storedInterval: string | undefined;
  let storedCurrency: string | undefined;

  try {
    const sessionDoc = await adminDb.collection('checkout_sessions').doc(sessionId).get();
    if (sessionDoc.exists) {
      const sessionData = sessionDoc.data();
      uid = sessionData?.uid;
      storedInterval = sessionData?.interval;
      storedCurrency = sessionData?.currency;
      console.log('[checkout-status] Found session mapping:', { uid, storedInterval, storedCurrency });
    } else {
      console.warn('[checkout-status] No session mapping found for:', sessionId);
    }
  } catch (err) {
    console.error('[checkout-status] Error looking up session mapping:', err);
  }

  // Fallback: try to extract from session metadata (in case DodoPayments API changes)
  if (!uid) {
    const metadata =
      session?.metadata ??
      session?.data?.metadata ??
      safeGet(session, ['data', 'object', 'metadata']) ??
      {};
    uid = metadata?.uid as string | undefined;
    storedInterval = storedInterval ?? metadata?.interval;
    storedCurrency = storedCurrency ?? metadata?.currency;
    console.log('[checkout-status] Fallback metadata extraction:', { uid, metadata: JSON.stringify(metadata) });
  }

  if (!uid) {
    console.error('[checkout-status] No UID found in session mapping or metadata', {
      sessionId,
      sessionKeys: Object.keys(session || {}),
    });
    return { success: false, error: 'No UID in session mapping or metadata' };
  }

  // Extract subscription and customer info from session response
  const customerId =
    session?.customer_id ??
    session?.customer?.id ??
    safeGet(session, ['data', 'customer_id']);

  const subscriptionId =
    session?.subscription_id ??
    session?.subscription?.id ??
    safeGet(session, ['data', 'subscription_id']);

  const intervalRaw = storedInterval;
  const currency = storedCurrency?.toLowerCase() ?? 'usd';

  // Normalize interval
  const interval: 'month' | 'year' | null =
    intervalRaw === 'yearly' ? 'year' :
    intervalRaw === 'monthly' ? 'month' :
    intervalRaw === 'year' ? 'year' :
    intervalRaw === 'month' ? 'month' :
    null;

  // Calculate subscription end date
  const currentPeriodEnd = calculatePeriodEnd(interval);

  // Extract amount from session if available
  const amount =
    session?.total_amount ??
    session?.amount ??
    safeGet(session, ['data', 'total_amount']);

  console.log('[checkout-status] Persisting subscription for user', {
    uid,
    customerId,
    subscriptionId,
    interval,
    intervalRaw,
    currency,
    currentPeriodEnd: currentPeriodEnd.toISOString(),
  });

  try {
    const userRef = adminDb.collection('users').doc(uid);

    const subscriptionData = {
      subscription: {
        tier: 'premium',
        status: 'active',
        customerId: customerId ?? null,
        subscriptionId: subscriptionId ?? null,
        interval: interval ?? 'month',
        amount: typeof amount === 'number' ? amount : null,
        currency: currency,
        currentPeriodEnd: currentPeriodEnd,
        cancelAtPeriodEnd: false,
        autoRenew: true,
        updatedAt: new Date(),
      },
    };

    console.log('[checkout-status] Writing to Firestore:', JSON.stringify(subscriptionData, null, 2));

    await userRef.set(subscriptionData, { merge: true });

    // Also persist reverse lookup for customerId -> uid
    if (customerId) {
      await adminDb.collection('dodo_customers').doc(String(customerId)).set(
        {
          uid,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    }

    console.log('[checkout-status] Successfully persisted subscription for user', uid);
    return { success: true, uid };
  } catch (error) {
    console.error('[checkout-status] Failed to persist subscription:', error);
    return { success: false, error: String(error), uid };
  }
}

type Outcome = 'success' | 'failed' | 'unknown';

function deriveOutcome(session: any): { outcome: Outcome; reason?: string; rawStatus?: string } {
  // Try multiple status fields that DodoPayments might use
  const status =
    session?.status ??
    session?.payment_status ??
    session?.checkout_status ??
    session?.state ??
    session?.result ??
    session?.payment?.status ??
    session?.data?.status;

  const norm = typeof status === 'string' ? status.toLowerCase() : undefined;

  // Expanded success statuses based on common payment gateway responses
  const successStatuses = new Set([
    'succeeded', 'paid', 'completed', 'success', 'complete', 'approved',
    'captured', 'settled', 'processed', 'confirmed', 'active'
  ]);
  const failedStatuses = new Set([
    'failed', 'canceled', 'cancelled', 'declined', 'expired', 'rejected',
    'error', 'void', 'voided', 'refunded'
  ]);
  // Pending statuses - treat as unknown, might still complete
  const pendingStatuses = new Set([
    'pending', 'processing', 'in_progress', 'requires_action', 'awaiting'
  ]);

  // Subscription contexts may carry nested status indicators
  const subStatus: string | undefined =
    session?.subscription?.status ??
    session?.subscription_status ??
    session?.data?.subscription?.status;

  const subNorm = typeof subStatus === 'string' ? subStatus.toLowerCase() : undefined;

  // Check for success
  if (norm && successStatuses.has(norm)) {
    return { outcome: 'success', rawStatus: status };
  }
  if (subNorm && (subNorm === 'active' || successStatuses.has(subNorm))) {
    return { outcome: 'success', rawStatus: subStatus };
  }

  // Check for explicit failure
  if (norm && failedStatuses.has(norm)) {
    return { outcome: 'failed', rawStatus: status };
  }

  // If explicit boolean or flags are present
  if (session?.paid === true) return { outcome: 'success', rawStatus: 'paid:true' };
  if (session?.is_paid === true) return { outcome: 'success', rawStatus: 'is_paid:true' };
  if (session?.payment_successful === true) return { outcome: 'success', rawStatus: 'payment_successful:true' };

  if (session?.paid === false) return { outcome: 'failed', rawStatus: 'paid:false' };

  // Check if there's a subscription or customer ID created - this usually indicates success
  if (session?.subscription_id || session?.subscription?.id) {
    return { outcome: 'success', rawStatus: 'has_subscription_id' };
  }

  // Check pending - not failed but not confirmed either
  if (norm && pendingStatuses.has(norm)) {
    return { outcome: 'unknown', rawStatus: `pending:${status}` };
  }

  return { outcome: 'unknown', rawStatus: norm ?? subNorm ?? 'no_status_found' };
}

export async function GET(req: NextRequest) {
  try {
    // Note: This endpoint doesn't require authentication because:
    // 1. It only returns success/failed/unknown status (not sensitive)
    // 2. Session IDs are random UUIDs that are hard to guess
    // 3. Auth state may not be ready when returning from payment gateway
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id') || searchParams.get('sessionId') || searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json(
        { outcome: 'unknown', error: 'Missing session_id' },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        }
      );
    }

    const client = new DodoPayments({
      bearerToken: getEnv('DODO_PAYMENTS_API_KEY'),
      environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') || 'test_mode',
    });

    const session = await client.checkoutSessions.retrieve(sessionId as string);

    // Log the full session for debugging
    console.log('[checkout-status] DodoPayments session retrieved:', {
      sessionId,
      sessionKeys: Object.keys(session || {}),
      status: (session as any)?.status,
      payment_status: (session as any)?.payment_status,
      checkout_status: (session as any)?.checkout_status,
      state: (session as any)?.state,
      metadata: (session as any)?.metadata,
      subscription: (session as any)?.subscription,
    });

    const { outcome, rawStatus } = deriveOutcome(session as any);
    console.log('[checkout-status] Derived outcome:', { outcome, rawStatus });

    // If checkout was successful, persist the subscription to Firestore immediately
    // This ensures the user has access even before the webhook fires
    let persistenceResult: { success: boolean; error?: string; uid?: string } | null = null;
    if (outcome === 'success') {
      persistenceResult = await persistSubscriptionOnSuccess(session, sessionId as string);

      // Update the checkout session status
      if (adminDb) {
        try {
          await adminDb.collection('checkout_sessions').doc(sessionId as string).update({
            status: 'completed',
            completedAt: new Date(),
          });
        } catch (err) {
          console.warn('[checkout-status] Could not update session status:', err);
        }
      }
    }

    return NextResponse.json(
      {
        outcome,
        rawStatus: rawStatus ?? null,
        // Include persistence status so frontend knows if subscription was saved
        subscriptionPersisted: persistenceResult?.success ?? false,
        persistenceError: persistenceResult?.error ?? null,
        uid: persistenceResult?.uid ?? null,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err: any) {
    console.error('[checkout-status] Error retrieving session:', {
      message: err?.message,
      response: err?.response?.data,
    });

    return NextResponse.json(
      {
        outcome: 'unknown',
        error: 'Failed to retrieve checkout session',
        details:
          (process.env.DODO_PAYMENTS_ENVIRONMENT === 'test_mode' || process.env.NODE_ENV !== 'production')
            ? err?.message
            : undefined,
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
}