/**
 * Development-only API route to grant premium access
 * Call this route while logged in to grant yourself premium access
 * DELETE THIS FILE IN PRODUCTION!
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const ALLOWED_EMAIL = 'disshad.k.p@gmail.com';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is disabled in production' },
        { status: 403 }
      );
    }

    const { uid, email } = await request.json();

    // Security check - only allow for specific email
    if (email !== ALLOWED_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized email' },
        { status: 403 }
      );
    }

    console.log(`Granting premium access to ${email} (${uid})`);

    // Update user document in Firestore
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    const subscriptionData = {
      tier: 'premium',
      status: 'active',
      subscriptionStartDate: new Date(),
      autoRenew: true,
      currency: 'USD',
      amount: 0
    };

    if (!userDoc.exists) {
      await userRef.set({
        uid,
        email,
        subscription: subscriptionData,
        premiumGrantedAt: new Date(),
        premiumGrantedBy: 'dev-api-testing',
        createdAt: new Date()
      });
    } else {
      await userRef.update({
        subscription: subscriptionData,
        premiumGrantedAt: new Date(),
        premiumGrantedBy: 'dev-api-testing'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Premium access granted!',
      subscription: subscriptionData
    });
  } catch (error: any) {
    console.error('Error granting premium:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to grant premium access' },
      { status: 500 }
    );
  }
}
