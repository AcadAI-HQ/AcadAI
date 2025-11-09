import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const {
      razorpaySubscriptionId,
      razorpayPaymentId,
      razorpaySignature,
      userId,
    } = await request.json();

    if (!razorpaySubscriptionId || !razorpayPaymentId || !razorpaySignature || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
      .digest('hex');

    const isValid = generatedSignature === razorpaySignature;

    if (isValid) {
      // Calculate subscription dates
      const subscriptionStartDate = new Date();
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

      // Update user's subscription to premium
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        'subscription.tier': 'premium',
        'subscription.status': 'active',
        'subscription.razorpaySubscriptionId': razorpaySubscriptionId,
        'subscription.subscriptionStartDate': subscriptionStartDate,
        'subscription.subscriptionEndDate': subscriptionEndDate,
        'subscription.autoRenew': true,
        updatedAt: serverTimestamp(),
      });

      return NextResponse.json({ verified: true, tier: 'premium' });
    } else {
      return NextResponse.json(
        { verified: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
