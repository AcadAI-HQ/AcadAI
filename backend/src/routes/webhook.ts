import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../config/firebase';

const router = Router();

// Webhook signature verification
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  // Timing-safe comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

// Extract common fields from webhook payload
async function extractPayloadInfo(payload: any) {
  const type = payload?.type as string;
  const data = payload?.data ?? {};
  const subscription = data.subscription ?? data.object ?? data;

  // Try to get UID from metadata
  let uid = payload?.data?.metadata?.uid ?? payload?.metadata?.uid;

  // Fallback: lookup from checkout session
  if (!uid && db) {
    const sessionId = data.checkout_session_id ?? data.session_id ?? payload.checkout_session_id ?? subscription?.checkout_session_id;
    if (sessionId) {
      const sessionDoc = await db.collection('checkout_sessions').doc(sessionId).get();
      if (sessionDoc.exists) {
        uid = sessionDoc.data()?.uid;
      }
    }
  }

  // Fallback: lookup from customer ID
  // DodoPayments sends customer as an object with customer_id inside
  const customerObj = data?.customer ?? subscription?.customer;
  const customerId = customerObj?.customer_id ?? subscription?.customer_id ?? subscription?.customerId ?? data.customer_id;
  if (!uid && customerId && db) {
    const customerDoc = await db.collection('dodo_customers').doc(String(customerId)).get();
    if (customerDoc.exists) {
      uid = customerDoc.data()?.uid;
    }
  }

  // DodoPayments uses subscription_id directly in data
  const subscriptionId = data?.subscription_id ?? subscription?.id ?? subscription?.subscription_id;

  // Plan details - DodoPayments uses recurring_pre_tax_amount and payment_frequency_interval
  const plan = subscription?.plan ?? subscription?.price ?? {};
  const amount = data?.recurring_pre_tax_amount ?? data?.total_amount ?? plan?.amount ?? data?.amount;
  const currency = (data?.currency ?? plan?.currency ?? 'usd').toLowerCase();

  // DodoPayments uses payment_frequency_interval (e.g., 'month', 'year')
  const intervalRaw = data?.payment_frequency_interval ?? plan?.interval ?? subscription?.interval ?? data?.interval;
  const interval: 'month' | 'year' | undefined =
    typeof intervalRaw === 'string'
      ? intervalRaw.startsWith('month') ? 'month'
      : intervalRaw.startsWith('year') ? 'year'
      : undefined
      : undefined;

  // Period end - DodoPayments uses next_billing_date or expires_at
  const periodEndRaw = data?.next_billing_date ?? data?.expires_at ?? subscription?.current_period_end ?? subscription?.currentPeriodEnd ?? data?.current_period_end;
  let currentPeriodEnd: Date | null = null;
  if (typeof periodEndRaw === 'number') {
    currentPeriodEnd = new Date(periodEndRaw * 1000);
  } else if (typeof periodEndRaw === 'string') {
    currentPeriodEnd = new Date(periodEndRaw);
  }

  const cancelAtPeriodEnd = Boolean(
    data?.cancel_at_next_billing_date ?? subscription?.cancel_at_period_end ?? subscription?.cancelAtPeriodEnd ?? data?.cancel_at_period_end
  );

  return {
    type,
    uid,
    customerId,
    subscriptionId,
    amount,
    currency,
    interval,
    currentPeriodEnd,
    cancelAtPeriodEnd,
  };
}

// Helper to remove undefined values from an object
function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as Partial<T>;
}

// Upsert subscription data
async function upsertSubscription(uid: string, data: {
  status: string;
  customerId?: string;
  subscriptionId?: string;
  interval?: 'month' | 'year';
  amount?: number;
  currency?: string;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}) {
  if (!db) return;

  const userRef = db.collection('users').doc(uid);
  const snap = await userRef.get();
  const existing = snap.exists ? (snap.data() as any)?.subscription ?? {} : {};

  // Normalize status
  let status = data.status;
  if (status === 'on_hold') status = 'payment_failed';
  if (status === 'renewed') status = 'active';

  // Build subscription object, filtering out undefined values
  const subscriptionData = removeUndefined({
    tier: 'premium',
    status,
    customerId: data.customerId ?? existing.customerId,
    subscriptionId: data.subscriptionId ?? existing.subscriptionId,
    interval: data.interval ?? existing.interval,
    amount: typeof data.amount === 'number' ? data.amount : existing.amount,
    currency: data.currency ?? existing.currency,
    currentPeriodEnd: data.currentPeriodEnd ?? existing.currentPeriodEnd,
    cancelAtPeriodEnd: typeof data.cancelAtPeriodEnd === 'boolean'
      ? data.cancelAtPeriodEnd
      : existing.cancelAtPeriodEnd ?? false,
    autoRenew: status !== 'cancelled',
    updatedAt: new Date(),
  });

  const update = {
    subscription: subscriptionData,
  };

  await userRef.set(update, { merge: true });

  // Update customer lookup
  if (data.customerId) {
    await db.collection('dodo_customers').doc(String(data.customerId)).set(
      { uid, updatedAt: new Date() },
      { merge: true }
    );
  }
}

// Event handlers
const eventHandlers: Record<string, (info: Awaited<ReturnType<typeof extractPayloadInfo>>) => Promise<void>> = {
  'subscription.active': async (info) => {
    if (!info.uid) {
      console.warn('[Webhook] subscription.active without UID');
      return;
    }
    await upsertSubscription(info.uid, {
      status: 'active',
      customerId: info.customerId,
      subscriptionId: info.subscriptionId,
      interval: info.interval,
      amount: info.amount,
      currency: info.currency,
      currentPeriodEnd: info.currentPeriodEnd,
      cancelAtPeriodEnd: info.cancelAtPeriodEnd,
    });
  },

  'subscription.cancelled': async (info) => {
    if (!info.uid) {
      console.warn('[Webhook] subscription.cancelled without UID');
      return;
    }
    await upsertSubscription(info.uid, {
      status: 'cancelled',
      customerId: info.customerId,
      subscriptionId: info.subscriptionId,
      interval: info.interval,
      amount: info.amount,
      currency: info.currency,
      currentPeriodEnd: info.currentPeriodEnd,
      cancelAtPeriodEnd: true,
    });
  },

  'subscription.expired': async (info) => {
    if (!info.uid) {
      console.warn('[Webhook] subscription.expired without UID');
      return;
    }
    await upsertSubscription(info.uid, {
      status: 'expired',
      customerId: info.customerId,
      subscriptionId: info.subscriptionId,
      interval: info.interval,
      amount: info.amount,
      currency: info.currency,
      currentPeriodEnd: info.currentPeriodEnd,
      cancelAtPeriodEnd: true,
    });
  },

  'subscription.failed': async (info) => {
    if (!info.uid) {
      console.warn('[Webhook] subscription.failed without UID');
      return;
    }
    await upsertSubscription(info.uid, {
      status: 'payment_failed',
      customerId: info.customerId,
      subscriptionId: info.subscriptionId,
      interval: info.interval,
      amount: info.amount,
      currency: info.currency,
      currentPeriodEnd: info.currentPeriodEnd,
      cancelAtPeriodEnd: info.cancelAtPeriodEnd,
    });
  },

  'subscription.renewed': async (info) => {
    if (!info.uid) {
      console.warn('[Webhook] subscription.renewed without UID');
      return;
    }
    await upsertSubscription(info.uid, {
      status: 'active',
      customerId: info.customerId,
      subscriptionId: info.subscriptionId,
      interval: info.interval,
      amount: info.amount,
      currency: info.currency,
      currentPeriodEnd: info.currentPeriodEnd,
      cancelAtPeriodEnd: false,
    });
  },
};

/**
 * POST /api/webhook/dodo-payments
 * Handles DodoPayments webhooks
 */
router.post('/dodo-payments', async (req: Request, res: Response) => {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  const signature = req.headers['x-webhook-signature'] as string ?? req.headers['x-dodo-signature'] as string;

  // Get raw body for signature verification
  const rawBody = (req as any).rawBody;

  if (!rawBody) {
    console.error('[Webhook] Raw body not available');
    res.status(400).json({ error: 'Raw body required' });
    return;
  }

  // Verify signature
  if (secret && !verifyWebhookSignature(rawBody, signature, secret)) {
    console.error('[Webhook] Signature verification failed');
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  try {
    const payload = JSON.parse(rawBody);
    const info = await extractPayloadInfo(payload);

    console.log('[Webhook] Received:', info.type, { uid: info.uid, subscriptionId: info.subscriptionId });

    const handler = eventHandlers[info.type];
    if (handler) {
      await handler(info);
      console.log('[Webhook] Processed:', info.type);
    } else {
      console.log('[Webhook] Unhandled event type:', info.type);
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('[Webhook] Processing error:', error);
    // Still return 200 to prevent retries for parsing errors
    res.status(200).json({ received: true, error: 'Processing failed' });
  }
});

export default router;
