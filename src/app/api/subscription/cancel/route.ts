import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

type EnvMode = 'test_mode' | 'live_mode';

function getEnv(name: string, optional = false): string {
  const v = process.env[name];
  if (!v && !optional) {
    throw new Error(`${name} is not set`);
  }
  return v as string;
}

export async function POST(req: NextRequest) {
  const dbg: Record<string, any> = {};
  try {
    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.replace('Bearer ', '').trim();

    if (!adminAuth) {
      return NextResponse.json({ error: 'Server auth not configured' }, { status: 500 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;
    dbg.uid = uid;

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const userRef = adminDb.collection('users').doc(uid);
    const snap = await userRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sub = (snap.data() as any)?.subscription || {};
    const subscriptionId: string | undefined = sub.subscriptionId;
    dbg.subscriptionId = subscriptionId;

    if (!subscriptionId) {
      return NextResponse.json({ error: 'No active subscription to cancel' }, { status: 400 });
    }

    const envMode = (process.env.DODO_PAYMENTS_ENVIRONMENT as EnvMode) || 'test_mode';
    const client = new DodoPayments({
      bearerToken: getEnv('DODO_PAYMENTS_API_KEY'),
      environment: envMode,
    });

    const body = await req.json().catch(() => ({}));
    const cancelAtPeriodEnd = body?.cancel_at_period_end !== false; // default true

    if (!cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: 'Immediate cancellation not supported. Use cancel_at_period_end=true or Customer Portal.' },
        { status: 400 }
      );
    }

    const result: any = await client.subscriptions.update(subscriptionId, {
      cancel_at_next_billing_date: true,
    });

    const nextBillingIso: string | undefined = result?.next_billing_date || result?.expires_at || undefined;

    const update: any = {
      subscription: {
        cancelAtPeriodEnd: true,
        ...(nextBillingIso ? { currentPeriodEnd: new Date(nextBillingIso) } : {}),
        updatedAt: new Date(),
      },
    };
    await userRef.set(update, { merge: true });

    return NextResponse.json({
      ok: true,
      subscription_id: result?.subscription_id ?? subscriptionId,
      cancel_at_next_billing_date: result?.cancel_at_next_billing_date ?? true,
      next_billing_date: nextBillingIso ?? null,
    });
  } catch (err: any) {
    const envMode = (process.env.DODO_PAYMENTS_ENVIRONMENT as EnvMode) || 'test_mode';
    const devMode = process.env.NODE_ENV !== 'production';
    const includeDebug = envMode === 'test_mode' || devMode;
    console.error('[Subscription Cancel] Error:', err);
    return NextResponse.json(
      {
        error: 'Failed to request cancellation',
        details: includeDebug ? err?.message : undefined,
        context: includeDebug ? dbg : undefined,
      },
      { status: 500 }
    );
  }
}