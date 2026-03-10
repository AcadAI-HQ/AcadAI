import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

const DAILY_LIMIT = 50;
const MONTHLY_LIMIT = 1500;

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!adminAuth) {
      return NextResponse.json({ error: 'Server auth not configured' }, { status: 500 });
    }

    let uid: string;
    let isPremium = false;
    try {
      const decoded = await adminAuth.verifyIdToken(authHeader.substring(7));
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (adminDb) {
      const userSnap = await adminDb.collection('users').doc(uid).get();
      const userData = userSnap.data() as Record<string, any> | undefined;
      isPremium =
        (userData?.subscription?.tier === 'premium' &&
          userData?.subscription?.status === 'active') ||
        userData?.roles?.admin === true ||
        userData?.flags?.bypassPremium === true;
    }

    // Read usage
    let dailyUsed = 0;
    let monthlyUsed = 0;
    if (adminDb) {
      const usageSnap = await adminDb
        .collection('users')
        .doc(uid)
        .collection('usage')
        .doc('ai-mentor')
        .get();
      if (usageSnap.exists) {
        const data = usageSnap.data() as Record<string, any>;
        const today = new Date().toISOString().slice(0, 10);
        const thisMonth = today.slice(0, 7);
        dailyUsed = data.dailyDate === today ? (data.dailyCount || 0) : 0;
        monthlyUsed = data.monthlyMonth === thisMonth ? (data.monthlyCount || 0) : 0;
      }
    }

    return NextResponse.json({
      isPremium,
      dailyUsed,
      dailyLimit: DAILY_LIMIT,
      dailyRemaining: Math.max(0, DAILY_LIMIT - dailyUsed),
      monthlyUsed,
      monthlyLimit: MONTHLY_LIMIT,
      monthlyRemaining: Math.max(0, MONTHLY_LIMIT - monthlyUsed),
    });
  } catch (error: any) {
    console.error('[ai-mentor/status]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
