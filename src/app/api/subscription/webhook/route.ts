import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    // Handle different webhook events
    switch (eventType) {
      case 'subscription.activated':
        await handleSubscriptionActivated(payload.subscription.entity);
        break;

      case 'subscription.charged':
        await handleSubscriptionCharged(payload.subscription.entity, payload.payment.entity);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload.subscription.entity);
        break;

      case 'subscription.expired':
        await handleSubscriptionExpired(payload.subscription.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;

      default:
        console.log('Unhandled webhook event:', eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionActivated(subscription: any) {
  const userId = subscription.notes?.userId;
  if (!userId) return;

  const subscriptionEndDate = new Date(subscription.current_end * 1000);

  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, {
    'subscription.tier': 'premium',
    'subscription.status': 'active',
    'subscription.razorpaySubscriptionId': subscription.id,
    'subscription.subscriptionEndDate': subscriptionEndDate,
    'subscription.autoRenew': true,
    updatedAt: serverTimestamp(),
  });
}

async function handleSubscriptionCharged(subscription: any, payment: any) {
  const userId = subscription.notes?.userId;
  if (!userId) return;

  // Extend subscription period
  const subscriptionEndDate = new Date(subscription.current_end * 1000);

  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, {
    'subscription.status': 'active',
    'subscription.subscriptionEndDate': subscriptionEndDate,
    updatedAt: serverTimestamp(),
  });
}

async function handleSubscriptionCancelled(subscription: any) {
  const userId = subscription.notes?.userId;
  if (!userId) return;

  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, {
    'subscription.status': 'cancelled',
    'subscription.autoRenew': false,
    updatedAt: serverTimestamp(),
  });
}

async function handleSubscriptionExpired(subscription: any) {
  const userId = subscription.notes?.userId;
  if (!userId) return;

  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, {
    'subscription.tier': 'free',
    'subscription.status': 'expired',
    'subscription.autoRenew': false,
    updatedAt: serverTimestamp(),
  });
}

async function handlePaymentFailed(payment: any) {
  // Extract subscription ID from payment
  const subscriptionId = payment.subscription_id;
  if (!subscriptionId) return;

  // Find user by subscription ID
  // Note: In production, you'd want to index this or store subscription -> user mapping
  // For now, we'll just mark the subscription as payment_failed
  console.error('Payment failed for subscription:', subscriptionId);
}
