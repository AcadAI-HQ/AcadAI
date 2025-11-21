/**
 * Stripe Webhook Handler
 * Handles Stripe events like subscription creation, updates, and cancellations
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { verifyWebhookSignature } from '@/lib/stripe-server';
import { getFirestore } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log('Processing Stripe event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.firebaseUserId;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId) {
    console.error('No Firebase user ID in checkout session metadata');
    return;
  }

  console.log(`Checkout completed for user ${userId}`);

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Update user in Firestore
  await updateUserSubscription(userId, subscription, customerId);
}

/**
 * Handle subscription update (creation or modification)
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.firebaseUserId;
  const customerId = subscription.customer as string;

  if (!userId) {
    console.error('No Firebase user ID in subscription metadata');
    return;
  }

  console.log(`Subscription updated for user ${userId}`);

  // Update user in Firestore
  await updateUserSubscription(userId, subscription, customerId);
}

/**
 * Handle subscription deletion/cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.firebaseUserId;

  if (!userId) {
    console.error('No Firebase user ID in subscription metadata');
    return;
  }

  console.log(`Subscription cancelled for user ${userId}`);

  // Update user in Firestore
  const db = getFirestore();
  await db.collection('users').doc(userId).update({
    subscription: {
      tier: 'free',
      status: 'cancelled',
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      cancelledAt: new Date(),
      periodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.firebaseUserId;

  if (!userId) {
    console.error('No Firebase user ID in subscription metadata');
    return;
  }

  console.log(`Payment succeeded for user ${userId}`);

  // Ensure subscription is active
  const db = getFirestore();
  await db.collection('users').doc(userId).update({
    'subscription.status': 'active',
    'subscription.lastPaymentDate': new Date(),
  });
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.firebaseUserId;

  if (!userId) {
    console.error('No Firebase user ID in subscription metadata');
    return;
  }

  console.log(`Payment failed for user ${userId}`);

  // Update subscription status
  const db = getFirestore();
  await db.collection('users').doc(userId).update({
    'subscription.status': 'payment_failed',
    'subscription.lastPaymentAttempt': new Date(),
  });
}

/**
 * Update user subscription in Firestore
 */
async function updateUserSubscription(
  userId: string,
  subscription: Stripe.Subscription,
  customerId: string
) {
  const db = getFirestore();

  // Determine subscription status
  let status: 'active' | 'cancelled' | 'expired' | 'payment_failed' = 'active';
  if (subscription.status === 'canceled') {
    status = 'cancelled';
  } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
    status = 'payment_failed';
  } else if (subscription.status === 'incomplete_expired') {
    status = 'expired';
  }

  // Get price details
  const price = subscription.items.data[0]?.price;
  const interval = price?.recurring?.interval || 'month';

  await db.collection('users').doc(userId).update({
    subscription: {
      tier: 'premium',
      status,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      stripePriceId: price?.id,
      interval,
      amount: price?.unit_amount || 0,
      currency: price?.currency || 'usd',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date(),
    },
  });

  console.log(`Updated subscription for user ${userId} to ${status}`);
}

// Disable body parsing for webhooks
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
