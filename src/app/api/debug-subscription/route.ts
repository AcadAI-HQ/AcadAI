import { NextRequest, NextResponse } from 'next/server';
import { adminDb, getAdminInitStatus } from '@/lib/firebase-admin';

/**
 * Debug endpoint to check subscription status and diagnose issues
 * Usage: GET /api/debug-subscription?uid=USER_ID
 *
 * This endpoint helps diagnose why subscriptions aren't being persisted.
 * Should be removed or protected in production.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');

  const adminStatus = getAdminInitStatus();

  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    firebaseAdmin: {
      initialized: adminStatus.initialized,
      error: adminStatus.error,
      hasAdminDb: !!adminDb,
    },
    environment: {
      hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT,
      serviceAccountLength: process.env.FIREBASE_SERVICE_ACCOUNT?.length ?? 0,
      serviceAccountStart: process.env.FIREBASE_SERVICE_ACCOUNT?.substring(0, 20) ?? null,
      hasDodoApiKey: !!process.env.DODO_PAYMENTS_API_KEY,
      dodoEnvironment: process.env.DODO_PAYMENTS_ENVIRONMENT ?? 'not set',
    },
  };

  if (uid && adminDb) {
    try {
      const userDoc = await adminDb.collection('users').doc(uid).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        diagnostics.user = {
          exists: true,
          subscription: data?.subscription ?? null,
          email: data?.email ?? null,
          displayName: data?.displayName ?? null,
        };
      } else {
        diagnostics.user = { exists: false };
      }
    } catch (err: any) {
      diagnostics.user = { error: err?.message ?? String(err) };
    }
  } else if (uid && !adminDb) {
    diagnostics.user = { error: 'Cannot fetch user - adminDb not initialized' };
  }

  return NextResponse.json(diagnostics, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
