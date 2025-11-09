import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { userId, subscriptionId } = await request.json();

    if (!userId || !subscriptionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Cancel subscription in Razorpay
    await razorpay.subscriptions.cancel(subscriptionId, true); // cancel_at_cycle_end = true

    // Update user's subscription status
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      'subscription.status': 'cancelled',
      'subscription.autoRenew': false,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
