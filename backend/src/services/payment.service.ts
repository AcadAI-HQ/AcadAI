import DodoPayments from 'dodopayments';
import { db } from '../config/firebase';
import { PRICING_CONFIG, Currency, Interval } from '../config/env';

let dodoClient: DodoPayments | null = null;

function getClient(): DodoPayments {
  if (!dodoClient) {
    dodoClient = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
      environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') || 'test_mode',
    });
  }
  return dodoClient;
}

// Get product ID based on currency and interval (server-side lookup)
function getProductId(currency: Currency, interval: Interval): string {
  const envMap: Record<string, string> = {
    USD_monthly: 'DODO_PRODUCT_PREMIUM_MONTHLY_USD',
    USD_yearly: 'DODO_PRODUCT_PREMIUM_YEARLY_USD',
    INR_monthly: 'DODO_PRODUCT_PREMIUM_MONTHLY_INR',
    INR_yearly: 'DODO_PRODUCT_PREMIUM_YEARLY_INR',
  };

  const key = `${currency}_${interval}`;
  const envName = envMap[key];
  const productId = process.env[envName];

  if (!productId) {
    throw new Error(`Product ID not configured for ${key}`);
  }

  return productId;
}

// Validate and get server-side pricing (prevents client from sending fake prices)
export function getValidatedPricing(currency: Currency, interval: Interval) {
  const pricing = PRICING_CONFIG[currency];
  if (!pricing) {
    throw new Error(`Invalid currency: ${currency}`);
  }

  const plan = pricing[interval];
  if (!plan) {
    throw new Error(`Invalid interval: ${interval}`);
  }

  return {
    amount: plan.amount,
    display: plan.display,
    currency,
    interval,
    productId: getProductId(currency, interval),
  };
}

export interface CreateCheckoutParams {
  uid: string;
  email?: string;
  name?: string;
  interval: Interval;
  currency: Currency;
  idempotencyKey?: string;
}

export interface CheckoutResult {
  checkoutUrl: string;
  sessionId: string;
}

export async function createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult> {
  const { uid, email, name, interval, currency, idempotencyKey } = params;

  // Validate pricing server-side (ignore any client-sent amounts)
  const pricing = getValidatedPricing(currency, interval);

  // Check for existing pending session with same idempotency key
  if (idempotencyKey && db) {
    const existingRef = db.collection('checkout_sessions')
      .where('idempotencyKey', '==', idempotencyKey)
      .where('status', '==', 'pending')
      .limit(1);

    const existing = await existingRef.get();
    if (!existing.empty) {
      const doc = existing.docs[0];
      const data = doc.data();
      if (data.checkoutUrl && data.createdAt) {
        // Return existing session if created within last 30 minutes
        const createdAt = data.createdAt.toDate();
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
        if (createdAt > thirtyMinsAgo) {
          console.log('[Payment] Returning existing session for idempotency key:', idempotencyKey);
          return {
            checkoutUrl: data.checkoutUrl,
            sessionId: doc.id,
          };
        }
      }
    }
  }

  // Build allowed payment methods (UPI not supported for subscriptions)
  const allowedPaymentMethods = currency === 'INR'
    ? ['credit', 'debit']
    : ['credit', 'debit', 'apple_pay', 'google_pay'];

  // Build return URL with interval for fallback
  const baseReturnUrl = process.env.DODO_PAYMENTS_RETURN_URL!;
  const returnUrl = `${baseReturnUrl}${baseReturnUrl.includes('?') ? '&' : '?'}interval=${interval}`;

  const client = getClient();

  const requestBody: any = {
    product_cart: [{ product_id: pricing.productId, quantity: 1 }],
    allowed_payment_method_types: allowedPaymentMethods,
    billing_currency: currency,
    return_url: returnUrl,
    metadata: {
      uid,
      interval,
      currency,
      app: 'acad-ai',
    },
  };

  // Include customer only when email or name exists
  if (email || name) {
    requestBody.customer = {
      ...(email ? { email } : {}),
      ...(name ? { name } : {}),
    };
  }

  const session = await client.checkoutSessions.create(requestBody);
  const sessionId = (session as any).session_id;
  const checkoutUrl = (session as any).checkout_url;

  // Store session mapping for webhook resilience
  if (db && sessionId) {
    await db.collection('checkout_sessions').doc(sessionId).set({
      uid,
      email: email ?? null,
      interval,
      currency,
      checkoutUrl,
      idempotencyKey: idempotencyKey ?? null,
      status: 'pending',
      createdAt: new Date(),
    });
  }

  return { checkoutUrl, sessionId };
}

export interface CheckoutStatusResult {
  outcome: 'success' | 'failed' | 'unknown';
  rawStatus?: string;
  subscriptionPersisted: boolean;
  persistenceError?: string;
  uid?: string;
}

function deriveOutcome(session: any): { outcome: 'success' | 'failed' | 'unknown'; rawStatus?: string } {
  const status = session?.status ?? session?.payment_status ?? session?.checkout_status;
  const norm = typeof status === 'string' ? status.toLowerCase() : undefined;

  const successStatuses = new Set([
    'succeeded', 'paid', 'completed', 'success', 'complete', 'approved',
    'captured', 'settled', 'processed', 'confirmed', 'active'
  ]);
  const failedStatuses = new Set([
    'failed', 'canceled', 'cancelled', 'declined', 'expired', 'rejected',
    'error', 'void', 'voided', 'refunded'
  ]);

  // Check subscription status
  const subStatus = session?.subscription?.status ?? session?.subscription_status;
  const subNorm = typeof subStatus === 'string' ? subStatus.toLowerCase() : undefined;

  if (norm && successStatuses.has(norm)) return { outcome: 'success', rawStatus: status };
  if (subNorm && (subNorm === 'active' || successStatuses.has(subNorm))) return { outcome: 'success', rawStatus: subStatus };
  if (norm && failedStatuses.has(norm)) return { outcome: 'failed', rawStatus: status };

  // Check boolean flags
  if (session?.paid === true) return { outcome: 'success', rawStatus: 'paid:true' };
  if (session?.subscription_id) return { outcome: 'success', rawStatus: 'has_subscription_id' };
  if (session?.paid === false) return { outcome: 'failed', rawStatus: 'paid:false' };

  return { outcome: 'unknown', rawStatus: norm ?? subNorm ?? 'no_status_found' };
}

function calculatePeriodEnd(interval: 'month' | 'year' | null): Date {
  const now = new Date();
  if (interval === 'year') {
    return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  }
  return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
}

export async function getCheckoutStatus(sessionId: string): Promise<CheckoutStatusResult> {
  const client = getClient();
  const session = await client.checkoutSessions.retrieve(sessionId);

  const { outcome, rawStatus } = deriveOutcome(session);

  if (outcome !== 'success' || !db) {
    return { outcome, rawStatus, subscriptionPersisted: false };
  }

  // Look up UID from session mapping
  let uid: string | undefined;
  let storedInterval: string | undefined;
  let storedCurrency: string | undefined;

  const sessionDoc = await db.collection('checkout_sessions').doc(sessionId).get();
  if (sessionDoc.exists) {
    const data = sessionDoc.data();
    uid = data?.uid;
    storedInterval = data?.interval;
    storedCurrency = data?.currency;
  }

  if (!uid) {
    return {
      outcome: 'success',
      rawStatus,
      subscriptionPersisted: false,
      persistenceError: 'No UID found in session mapping',
    };
  }

  // Normalize interval
  const interval: 'month' | 'year' | null =
    storedInterval === 'yearly' || storedInterval === 'year' ? 'year' :
    storedInterval === 'monthly' || storedInterval === 'month' ? 'month' : null;

  const currentPeriodEnd = calculatePeriodEnd(interval);

  // Persist subscription
  const userRef = db.collection('users').doc(uid);
  await userRef.set({
    subscription: {
      tier: 'premium',
      status: 'active',
      customerId: (session as any)?.customer_id ?? null,
      subscriptionId: (session as any)?.subscription_id ?? null,
      interval: interval ?? 'month',
      amount: (session as any)?.total_amount ?? null,
      currency: storedCurrency?.toLowerCase() ?? 'usd',
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
      autoRenew: true,
      updatedAt: new Date(),
    },
  }, { merge: true });

  // Update session status
  await db.collection('checkout_sessions').doc(sessionId).update({
    status: 'completed',
    completedAt: new Date(),
  });

  // Persist customer lookup
  const customerId = (session as any)?.customer_id;
  if (customerId) {
    await db.collection('dodo_customers').doc(String(customerId)).set(
      { uid, updatedAt: new Date() },
      { merge: true }
    );
  }

  return {
    outcome: 'success',
    rawStatus,
    subscriptionPersisted: true,
    uid,
  };
}

export async function cancelSubscription(uid: string, cancelAtPeriodEnd = true): Promise<{
  ok: boolean;
  subscriptionId?: string;
  nextBillingDate?: string;
  error?: string;
}> {
  if (!db) {
    return { ok: false, error: 'Database not configured' };
  }

  const userRef = db.collection('users').doc(uid);
  const snap = await userRef.get();

  if (!snap.exists) {
    return { ok: false, error: 'User not found' };
  }

  const sub = (snap.data() as any)?.subscription;
  const subscriptionId = sub?.subscriptionId;

  if (!subscriptionId) {
    return { ok: false, error: 'No active subscription to cancel' };
  }

  if (!cancelAtPeriodEnd) {
    return { ok: false, error: 'Immediate cancellation not supported. Use cancel_at_period_end=true' };
  }

  const client = getClient();
  const result = await client.subscriptions.update(subscriptionId, {
    cancel_at_next_billing_date: true,
  });

  const nextBillingDate = (result as any)?.next_billing_date ?? (result as any)?.expires_at;

  await userRef.set({
    subscription: {
      cancelAtPeriodEnd: true,
      ...(nextBillingDate ? { currentPeriodEnd: new Date(nextBillingDate) } : {}),
      updatedAt: new Date(),
    },
  }, { merge: true });

  return {
    ok: true,
    subscriptionId,
    nextBillingDate,
  };
}
