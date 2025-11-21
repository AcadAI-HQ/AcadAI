/**
 * Create Stripe Customer Portal Session
 * Allows customers to manage their subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { createPortalSession } from '@/lib/stripe-server';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decodedToken;

    try {
      decodedToken = await getAuth().verifyIdToken(token);
    } catch (authError) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Get user profile
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const customerId = userData?.subscription?.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Please subscribe first.' },
        { status: 400 }
      );
    }

    // Create portal session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    const returnUrl = `${baseUrl}/profile?tab=subscription`;

    const session = await createPortalSession(customerId, returnUrl);

    return NextResponse.json({
      url: session.url,
    });
  } catch (error: any) {
    console.error('Create portal session error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create portal session',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
