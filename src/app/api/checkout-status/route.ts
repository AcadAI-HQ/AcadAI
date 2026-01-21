import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';
import { adminDb } from '@/lib/firebase-admin';

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

// Persist subscription to Firestore when checkout is successful
async function persistSubscriptionOnSuccess(session: any) {
  if (!adminDb) {
    console.warn('[checkout-status] Firebase Admin not initialized, skipping subscription persistence');
    return;
  }

  // Extract metadata from the checkout session
  const metadata = session?.metadata ?? session?.data?.metadata ?? {};
  const uid = metadata?.uid as string | undefined;

  if (!uid) {
    console.warn('[checkout-status] No UID in session metadata, cannot persist subscription', {
      sessionId: session?.id ?? session?.session_id,
    });
    return;
  }

  // Extract subscription and customer info
  const customerId =
    session?.customer_id ??
    session?.customer?.id ??
    safeGet(session, ['data', 'customer_id']);

  const subscriptionId =
    session?.subscription_id ??
    session?.subscription?.id ??
    safeGet(session, ['data', 'subscription_id']);

  const intervalRaw = metadata?.interval as string | undefined;
  const currency = (metadata?.currency as string)?.toLowerCase() ?? 'usd';

  // Extract amount from session if available
  const amount =
    session?.total_amount ??
    session?.amount ??
    safeGet(session, ['data', 'total_amount']);

  console.log('[checkout-status] Persisting subscription for user', {
    uid,
    customerId,
    subscriptionId,
    interval: intervalRaw,
    currency,
  });

  try {
    const userRef = adminDb.collection('users').doc(uid);

    await userRef.set(
      {
        subscription: {
          tier: 'premium',
          status: 'active',
          customerId: customerId ?? null,
          subscriptionId: subscriptionId ?? null,
          interval: intervalRaw === 'yearly' ? 'year' : intervalRaw === 'monthly' ? 'month' : (intervalRaw as 'month' | 'year' | null) ?? null,
          amount: typeof amount === 'number' ? amount : null,
          currency: currency,
          cancelAtPeriodEnd: false,
          autoRenew: true,
          updatedAt: new Date(),
        },
      },
      { merge: true }
    );

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
  } catch (error) {
    console.error('[checkout-status] Failed to persist subscription:', error);
    // Don't throw - we still want to return success to the client
  }
}

type Outcome = 'success' | 'failed' | 'unknown';

function deriveOutcome(session: any): { outcome: Outcome; reason?: string; rawStatus?: string } {
  const status =
    session?.status ??
    session?.payment_status ??
    session?.checkout_status ??
    session?.state ??
    session?.result;

  const norm = typeof status === 'string' ? status.toLowerCase() : undefined;

  const successStatuses = new Set(['succeeded', 'paid', 'completed', 'success']);
  const failedStatuses = new Set(['failed', 'canceled', 'cancelled', 'declined', 'expired']);

  // Subscription contexts may carry nested status indicators
  const subStatus: string | undefined =
    session?.subscription?.status ??
    session?.subscription_status ??
    session?.data?.subscription?.status;

  const subNorm = typeof subStatus === 'string' ? subStatus.toLowerCase() : undefined;

  if (norm && successStatuses.has(norm)) {
    return { outcome: 'success', rawStatus: status };
  }
  if (subNorm === 'active') {
    return { outcome: 'success', rawStatus: subStatus };
  }
  if (norm && failedStatuses.has(norm)) {
    return { outcome: 'failed', rawStatus: status };
  }

  // If explicit boolean or flags are present
  if (session?.paid === true) return { outcome: 'success', rawStatus: 'paid:true' };
  if (session?.paid === false) return { outcome: 'failed', rawStatus: 'paid:false' };

  return { outcome: 'unknown', rawStatus: norm ?? subNorm };
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

    const { outcome, rawStatus } = deriveOutcome(session as any);

    // If checkout was successful, persist the subscription to Firestore immediately
    // This ensures the user has access even before the webhook fires
    if (outcome === 'success') {
      await persistSubscriptionOnSuccess(session);
    }

    return NextResponse.json(
      {
        outcome,
        rawStatus: rawStatus ?? null,
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