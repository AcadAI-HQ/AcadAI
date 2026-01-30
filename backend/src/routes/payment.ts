import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import {
  createCheckoutSession,
  getCheckoutStatus,
  cancelSubscription,
  getValidatedPricing,
} from '../services/payment.service';
import { PRICING_CONFIG, Currency, Interval } from '../config/env';

const router = Router();

// Error response helper - strips sensitive info in production
function errorResponse(error: any, includeDetails: boolean) {
  const base = { error: 'An error occurred' };
  if (includeDetails) {
    return { ...base, details: error?.message };
  }
  return base;
}

const isDevMode = () =>
  process.env.NODE_ENV !== 'production' ||
  process.env.DODO_PAYMENTS_ENVIRONMENT === 'test_mode';

/**
 * GET /api/payment/pricing
 * Returns server-validated pricing based on detected or provided currency
 * Does NOT expose product IDs to client
 */
router.get('/pricing', (req: Request, res: Response) => {
  const currencyParam = (req.query.currency as string)?.toUpperCase();
  const currency: Currency = currencyParam === 'INR' ? 'INR' : 'USD';

  const config = PRICING_CONFIG[currency];

  // Only return display values, never internal amounts or product IDs
  res.json({
    currency,
    symbol: currency === 'INR' ? '₹' : '$',
    monthly: {
      price: config.monthly.display,
    },
    annual: {
      price: config.yearly.display,
      monthlyEquivalent: currency === 'INR' ? '142' : '4.92',
      savingsPercent: currency === 'INR' ? '29' : '18',
    },
  });
});

/**
 * POST /api/payment/checkout
 * Creates a checkout session (requires auth)
 */
router.post('/checkout', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { interval, currency, idempotencyKey } = req.body;
    const user = req.user!;

    // Validate interval
    const validInterval: Interval = interval === 'yearly' ? 'yearly' : 'monthly';

    // Validate currency (server validates, doesn't trust client blindly)
    const validCurrency: Currency = currency === 'INR' ? 'INR' : 'USD';

    // Server-side price validation (ignore any amount from client)
    try {
      getValidatedPricing(validCurrency, validInterval);
    } catch (err) {
      res.status(400).json({ error: 'Invalid pricing configuration' });
      return;
    }

    const result = await createCheckoutSession({
      uid: user.uid,
      email: user.email,
      name: user.name,
      interval: validInterval,
      currency: validCurrency,
      idempotencyKey,
    });

    res.json({
      checkout_url: result.checkoutUrl,
      session_id: result.sessionId,
    });
  } catch (error: any) {
    console.error('[Checkout] Error:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      ...(isDevMode() ? { details: error?.message } : {}),
    });
  }
});

/**
 * GET /api/payment/checkout-status
 * Checks checkout status and persists subscription on success
 * No auth required - session ID acts as secure token
 */
router.get('/checkout-status', async (req: Request, res: Response) => {
  try {
    const sessionId = (req.query.session_id || req.query.sessionId || req.query.id) as string;

    if (!sessionId) {
      res.status(400).json({ outcome: 'unknown', error: 'Missing session_id' });
      return;
    }

    const result = await getCheckoutStatus(sessionId);

    res.set('Cache-Control', 'no-store, max-age=0');
    res.json(result);
  } catch (error: any) {
    console.error('[Checkout Status] Error:', error);
    res.status(500).json({
      outcome: 'unknown',
      error: 'Failed to retrieve checkout session',
      ...(isDevMode() ? { details: error?.message } : {}),
    });
  }
});

/**
 * POST /api/payment/cancel
 * Cancels subscription at period end (requires auth)
 */
router.post('/cancel', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { cancel_at_period_end } = req.body;

    // Only allow cancel at period end
    const cancelAtPeriodEnd = cancel_at_period_end !== false;

    const result = await cancelSubscription(user.uid, cancelAtPeriodEnd);

    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({
      ok: true,
      subscription_id: result.subscriptionId,
      cancel_at_next_billing_date: true,
      next_billing_date: result.nextBillingDate ?? null,
    });
  } catch (error: any) {
    console.error('[Cancel] Error:', error);
    res.status(500).json({
      error: 'Failed to cancel subscription',
      ...(isDevMode() ? { details: error?.message } : {}),
    });
  }
});

export default router;
