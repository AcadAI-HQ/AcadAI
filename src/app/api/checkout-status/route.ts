import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';

function getEnv(name: string, optional = false): string {
  const v = process.env[name];
  if (!v && !optional) {
    throw new Error(`${name} is not set`);
  }
  return v as string;
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