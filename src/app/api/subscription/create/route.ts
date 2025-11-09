import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SUBSCRIPTION_PRICING } from '@/lib/razorpay-config';
import { getClientIP, validateCurrency } from '@/lib/server-geo';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { userId, currency } = await request.json();

    if (!userId || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // SECURITY: Validate currency against user's actual IP location
    const clientIP = getClientIP(request.headers);
    const validation = await validateCurrency(currency, clientIP);

    if (!validation.valid) {
      console.warn(
        `Currency mismatch detected! Requested: ${currency}, Actual: ${validation.actualCurrency}, IP: ${clientIP}`
      );

      // Force the actual currency based on IP
      return NextResponse.json(
        {
          error: 'Currency mismatch',
          message: 'The selected currency does not match your location. Please refresh the page.',
          correctCurrency: validation.actualCurrency,
        },
        { status: 400 }
      );
    }

    // Get pricing based on VALIDATED currency
    const pricing = SUBSCRIPTION_PRICING[validation.actualCurrency].monthly;

    // Create Razorpay subscription with VALIDATED currency
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env[`RAZORPAY_PLAN_ID_${validation.actualCurrency}`]!,
      customer_notify: 1,
      total_count: 12, // 12 months before requiring renewal
      quantity: 1,
      notes: {
        userId,
        tier: 'premium',
      },
    });

    // Update user document with subscription info using VALIDATED currency
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      'subscription.razorpaySubscriptionId': subscription.id,
      'subscription.tier': 'free', // Will be updated to premium after payment verification
      'subscription.status': 'pending',
      'subscription.currency': validation.actualCurrency,
      'subscription.amount': pricing.amount,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      currency: validation.actualCurrency,
      amount: pricing.amount,
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
