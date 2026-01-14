import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';
import { getClientIP, detectCurrencyFromIP } from '@/lib/server-geo';
import { adminAuth } from '@/lib/firebase-admin';

type Interval = 'monthly' | 'yearly';

function getEnv(name: string, optional = false): string {
  const v = process.env[name];
  if (!v && !optional) {
    throw new Error(`${name} is not set`);
  }
  return v as string;
}

export async function POST(req: NextRequest) {
  // Debug context for error reporting in catch
  const dbg: {
    uid?: string;
    email?: string;
    interval?: Interval;
    currency?: 'USD' | 'INR';
    key?: string;
    productEnv?: string;
    productId?: string;
    allowed_payment_method_types?: string[];
  } = {};
  try {
    const envMode = (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') || 'test_mode';
    const devBypass = process.env.DODO_DEV_AUTH_BYPASS === 'true';
    const isBypassEnabled = envMode === 'test_mode' && devBypass;
    console.log('[Checkout] Environment', { envMode, devBypass, isBypassEnabled });

    console.log('[Checkout] Starting checkout process', { envMode, devBypass, isBypassEnabled });

    const authHeader = req.headers.get('authorization') || '';
    let decoded: any = null;

    if (authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.replace('Bearer ', '').trim();
      if (adminAuth) {
        try {
          decoded = await adminAuth.verifyIdToken(idToken);
        } catch (e) {
          if (!isBypassEnabled) {
            return NextResponse.json({ error: 'Unauthorized: invalid token' }, { status: 401 });
          }
        }
      } else if (!isBypassEnabled) {
        return NextResponse.json({ error: 'Server auth not configured' }, { status: 500 });
      }
    } else if (!isBypassEnabled) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uid =
      decoded?.uid ||
      req.headers.get('x-dev-uid') ||
      'dev_test_user';
    const email =
      (decoded?.email as string | undefined) ||
      req.headers.get('x-dev-email') ||
      undefined;
    const name =
      (decoded?.name as string | undefined) ||
      req.headers.get('x-dev-name') ||
      undefined;

    // Capture for debug
    dbg.uid = uid;
    dbg.email = email;

    const body = await req.json().catch(() => ({}));
    const interval: Interval = body?.interval === 'yearly' ? 'yearly' : 'monthly';
    dbg.interval = interval;

    console.log('[Checkout] User info', { uid, email, name, interval });

    const ip = getClientIP(req.headers);
    const currency = await detectCurrencyFromIP(ip);
    dbg.currency = currency;

    console.log('[Checkout] Detected currency', { ip, currency });

    const productEnvMap: Record<string, string> = {
      USD_monthly: 'DODO_PRODUCT_PREMIUM_MONTHLY_USD',
      USD_yearly: 'DODO_PRODUCT_PREMIUM_YEARLY_USD',
      INR_monthly: 'DODO_PRODUCT_PREMIUM_MONTHLY_INR',
      INR_yearly: 'DODO_PRODUCT_PREMIUM_YEARLY_INR',
    };
    const key = `${currency}_${interval}`;
    const productEnv = productEnvMap[key];
    const productId = getEnv(productEnv);

    // Capture for debug
    dbg.key = key;
    dbg.productEnv = productEnv;
    dbg.productId = productId;

    console.log('[Checkout] Product selection', { key, productEnv, productId });

    // Note: UPI is currently limited to one-time purchases (see Dodo changelog v0.19.0).
    // For subscription checkout in INR, only card methods are allowed.
    const allowed_payment_method_types =
      currency === 'INR'
        ? ['credit', 'debit']
        : ['credit', 'debit', 'apple_pay', 'google_pay'];
    dbg.allowed_payment_method_types = allowed_payment_method_types;

    const client = new DodoPayments({
      bearerToken: getEnv('DODO_PAYMENTS_API_KEY'),
      environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') || 'test_mode',
    });
    console.log('[Checkout] Dodo client configured', {
      environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') || 'test_mode',
    });

    console.log('[Checkout] Creating DodoPayments session with', {
      productId,
      currency,
      allowed_payment_method_types,
      email,
      name
    });

    const requestBody: any = {
      product_cart: [
        { product_id: productId, quantity: 1 },
      ],
      allowed_payment_method_types,
      billing_currency: currency,
      return_url: getEnv('DODO_PAYMENTS_RETURN_URL'),
      metadata: {
        uid,
        interval,
        currency,
        app: 'acad-ai',
      },
    };

    // Include customer only when email or name exists; empty customer object causes 422
    if (email || name) {
      requestBody.customer = {
        ...(email ? { email } : {}),
        ...(name ? { name } : {}),
      };
    }

    console.log('[Checkout] Final request body customer present:', !!requestBody.customer);

    const session = await client.checkoutSessions.create(requestBody as any);

    console.log('[Checkout] Session created successfully', {
      session_id: (session as any).session_id,
      checkout_url: (session as any).checkout_url
    });

    return NextResponse.json({ checkout_url: (session as any).checkout_url, session_id: (session as any).session_id });
  } catch (err: any) {
    console.error('Checkout error:', err);
    console.error('Error details:', {
      message: err?.message,
      response: err?.response?.data,
      stack: err?.stack
    });

    const envMode = (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') || 'test_mode';
    const devMode = process.env.NODE_ENV === 'development';
    const includeDebug = envMode === 'test_mode' || devMode;

    const debugContext = includeDebug
      ? {
          envMode,
          ...dbg,
          error: {
            message: err?.message,
            response: err?.response?.data,
          },
        }
      : undefined;

    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: includeDebug ? (err?.message || 'Unknown error') : undefined,
        context: debugContext,
      },
      { status: 500 }
    );
  }
}