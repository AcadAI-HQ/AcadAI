/**
 * Create Stripe Checkout Session
 * Initiates a checkout session for subscription purchase
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { createStripeCustomer, createCheckoutSession } from '@/lib/stripe-server';

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

    // Get request body
    const body = await request.json();
    const { priceId, interval } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing required field: priceId' },
        { status: 400 }
      );
    }

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
    const email = userData?.email;
    const displayName = userData?.displayName;

    if (!email) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId = userData?.subscription?.stripeCustomerId;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await createStripeCustomer(email, userId, displayName);
      customerId = customer.id;

      // Save customer ID to Firestore
      await db.collection('users').doc(userId).update({
        'subscription.stripeCustomerId': customerId,
      });
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    const successUrl = `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`;
    const cancelUrl = `${baseUrl}/pricing?cancelled=true`;

    const session = await createCheckoutSession(
      customerId,
      priceId,
      userId,
      successUrl,
      cancelUrl
    );

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Create checkout session error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
