import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

/**
 * Admin endpoint to manually activate a subscription for a user
 * This is a fallback for when automated processes fail
 *
 * POST /api/admin/activate-subscription
 * Body: { uid: string, interval?: 'month' | 'year' }
 * Header: Authorization: Bearer <admin-user-id-token>
 *
 * Only users with roles.admin === true can use this endpoint
 */
export async function POST(req: NextRequest) {
  try {
    if (!adminDb || !adminAuth) {
      return NextResponse.json(
        { error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    // Verify the caller is an admin
    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.replace('Bearer ', '').trim();
    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if caller is admin
    const callerDoc = await adminDb.collection('users').doc(decoded.uid).get();
    const callerData = callerDoc.data();
    if (!callerData?.roles?.admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get the target user from request body
    const body = await req.json().catch(() => ({}));
    const targetUid = body?.uid;
    const interval = body?.interval || 'month';

    if (!targetUid) {
      return NextResponse.json({ error: 'Missing uid in request body' }, { status: 400 });
    }

    // Calculate subscription end date
    const now = new Date();
    const currentPeriodEnd = interval === 'year'
      ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Update the target user's subscription
    const userRef = adminDb.collection('users').doc(targetUid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await userRef.set({
      subscription: {
        tier: 'premium',
        status: 'active',
        interval: interval,
        currentPeriodEnd: currentPeriodEnd,
        cancelAtPeriodEnd: false,
        autoRenew: true,
        updatedAt: new Date(),
        activatedBy: decoded.uid,
        activatedAt: new Date(),
        note: 'Manually activated by admin',
      },
    }, { merge: true });

    console.log('[admin/activate-subscription] Subscription activated:', {
      targetUid,
      activatedBy: decoded.uid,
      interval,
      currentPeriodEnd: currentPeriodEnd.toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Subscription activated for user ${targetUid}`,
      subscription: {
        tier: 'premium',
        status: 'active',
        interval,
        currentPeriodEnd: currentPeriodEnd.toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[admin/activate-subscription] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err?.message },
      { status: 500 }
    );
  }
}
