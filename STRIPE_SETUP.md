# Stripe Payment Integration Setup Guide

This guide will walk you through setting up Stripe payments for Acad AI's premium subscription model.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Stripe Account Setup](#stripe-account-setup)
3. [Environment Variables](#environment-variables)
4. [Testing the Integration](#testing-the-integration)
5. [Going Live](#going-live)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js and npm installed
- Firebase project setup
- Stripe account (create one at [stripe.com](https://stripe.com))
- Firebase Admin SDK service account JSON file

---

## Stripe Account Setup

### Step 1: Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and sign up
2. Complete account verification (required for live payments)
3. Access your Stripe Dashboard

### Step 2: Get API Keys

1. Go to **Developers** → **API keys** in your Stripe Dashboard
2. Copy your **Publishable key** and **Secret key**
3. For testing, use the **Test mode** keys (toggle in dashboard)

### Step 3: Create Products and Prices

1. Go to **Products** in Stripe Dashboard
2. Click **"Add product"**

**For Monthly Plan:**
```
Name: Acad AI Premium Monthly
Description: AI-powered hyperpersonalization and chat assistant
Price: $9.99 USD
Billing period: Monthly
```

3. After creating, copy the **Price ID** (starts with `price_...`)

**For Yearly Plan:**
```
Name: Acad AI Premium Yearly
Description: AI-powered hyperpersonalization and chat assistant
Price: $99.99 USD
Billing period: Yearly
```

4. Copy the **Price ID** for the yearly plan

### Step 4: Set Up Webhook

1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   - **Development:** `http://localhost:9002/api/webhooks/stripe`
   - **Production:** `https://yourdomain.com/api/webhooks/stripe`

4. Select events to listen for:
   ```
   ✓ checkout.session.completed
   ✓ customer.subscription.created
   ✓ customer.subscription.updated
   ✓ customer.subscription.deleted
   ✓ invoice.payment_succeeded
   ✓ invoice.payment_failed
   ```

5. Copy the **Webhook signing secret** (starts with `whsec_...`)

---

## Environment Variables

Add the following to your `.env.local` file:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_... # Your secret key (NEVER commit to git!)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Your publishable key

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_... # Monthly price ID
NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID=price_... # Yearly price ID

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook signing secret

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:9002 # Change to your production URL when live

# Firebase Admin (for API routes)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}' # Or path to service account JSON
```

### Important Notes:

- **Never commit** `.env.local` to version control
- Add `.env.local` to your `.gitignore`
- For production, use **live mode** keys (not test mode)
- Store secrets securely in your hosting platform's environment variables

---

## Testing the Integration

### Test with Stripe Test Cards

Stripe provides test card numbers for testing:

**Successful Payment:**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

**Payment Requires Authentication (3D Secure):**
```
Card Number: 4000 0025 0000 3155
```

**Declined Payment:**
```
Card Number: 4000 0000 0000 9995
```

### Testing Flow

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Test Subscription Purchase:**
   - Navigate to `/pricing`
   - Click "Upgrade to Premium"
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout

3. **Verify Webhook Events:**
   - Check your Stripe Dashboard → **Developers** → **Webhooks**
   - Look for successful webhook deliveries
   - Check your application logs for webhook processing

4. **Test Webhook Locally with Stripe CLI:**
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe

   # Login to Stripe
   stripe login

   # Forward webhooks to localhost
   stripe listen --forward-to localhost:9002/api/webhooks/stripe

   # Trigger test events
   stripe trigger checkout.session.completed
   ```

5. **Verify User Subscription:**
   - Check Firebase Console → Firestore → `users` collection
   - User document should have updated `subscription` object:
   ```json
   {
     "subscription": {
       "tier": "premium",
       "status": "active",
       "stripeSubscriptionId": "sub_...",
       "stripeCustomerId": "cus_...",
       "amount": 999,
       "currency": "usd",
       "interval": "month",
       "currentPeriodEnd": "2024-12-15T..."
     }
   }
   ```

6. **Test Premium Features:**
   - Navigate to any roadmap page
   - Should see assessment dialog (hyperpersonalization)
   - Chat assistant should be available

### Testing Subscription Management

1. Navigate to `/profile?tab=subscription`
2. Click "Manage Subscription"
3. Should redirect to Stripe Customer Portal
4. Test:
   - Updating payment method
   - Canceling subscription
   - Viewing invoices

---

## Going Live

### Checklist Before Launch:

- [ ] Switch to **Live mode** in Stripe Dashboard
- [ ] Update all environment variables with **live keys**
- [ ] Update webhook endpoint URL to production domain
- [ ] Test complete checkout flow in live mode
- [ ] Verify webhook events are being received
- [ ] Test subscription cancellation
- [ ] Set up Stripe radar rules for fraud prevention
- [ ] Configure email receipts in Stripe Dashboard
- [ ] Set up subscription recovery for failed payments

### Production Environment Variables:

```bash
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_live_...
NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID=price_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Deploy Steps:

1. **Update environment variables** in your hosting platform (Vercel, Netlify, etc.)
2. **Deploy application** to production
3. **Update webhook endpoint** in Stripe Dashboard
4. **Test with real card** (can use $0.01 test)
5. **Monitor** Stripe Dashboard for webhook deliveries

---

## Subscription Data Structure

The subscription data is stored in Firestore under each user's document:

```typescript
interface SubscriptionData {
  tier: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired' | 'payment_failed';

  // Stripe IDs
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;

  // Billing details
  interval?: 'month' | 'year';
  amount?: number; // in cents (999 = $9.99)
  currency?: string; // 'usd', 'eur', etc.

  // Dates
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  updatedAt?: Date;
}
```

---

## Webhook Events Handled

| Event | Description | Action |
|-------|-------------|--------|
| `checkout.session.completed` | Customer completed checkout | Create/activate subscription |
| `customer.subscription.created` | New subscription created | Update user to premium |
| `customer.subscription.updated` | Subscription modified | Update subscription details |
| `customer.subscription.deleted` | Subscription cancelled | Downgrade to free tier |
| `invoice.payment_succeeded` | Payment successful | Ensure subscription is active |
| `invoice.payment_failed` | Payment failed | Mark subscription as payment_failed |

---

## Troubleshooting

### Issue: Webhook not receiving events

**Solution:**
1. Check webhook URL is correct
2. Verify webhook secret matches environment variable
3. Check Stripe Dashboard → Webhooks for delivery attempts
4. Look for errors in application logs

### Issue: "Invalid API key" error

**Solution:**
1. Verify `STRIPE_SECRET_KEY` is set correctly
2. Check you're using the correct key for test/live mode
3. Regenerate keys if compromised

### Issue: Subscription not updating in Firebase

**Solution:**
1. Check webhook events are being received
2. Verify Firebase Admin SDK is initialized
3. Check application logs for errors
4. Ensure user ID is included in subscription metadata

### Issue: Redirect after checkout not working

**Solution:**
1. Verify `NEXT_PUBLIC_BASE_URL` is set correctly
2. Check success_url and cancel_url in checkout session
3. Test with Stripe CLI webhook forwarding

### Issue: "Price ID not found"

**Solution:**
1. Verify price IDs are set in environment variables
2. Check price IDs exist in Stripe Dashboard
3. Ensure you're using test price IDs in test mode

---

## Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Always verify webhook signatures** before processing events
3. **Use HTTPS** in production
4. **Validate user authentication** before creating checkout sessions
5. **Log all subscription changes** for audit trail
6. **Set up Stripe Radar** for fraud prevention
7. **Monitor failed payments** and set up dunning
8. **Regularly rotate API keys**

---

## Support

- **Stripe Documentation:** [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe Support:** Dashboard → Help
- **Stripe Community:** [https://github.com/stripe](https://github.com/stripe)

---

## Files Created

1. **Configuration:**
   - `/src/lib/stripe.ts` - Client-side Stripe setup
   - `/src/lib/stripe-server.ts` - Server-side utilities

2. **API Routes:**
   - `/src/app/api/stripe/create-checkout-session/route.ts`
   - `/src/app/api/stripe/create-portal-session/route.ts`
   - `/src/app/api/webhooks/stripe/route.ts`

3. **UI Components:**
   - `/src/app/pricing/page.tsx` - Pricing page
   - `/src/components/profile/subscription-tab.tsx` - Subscription management

4. **Documentation:**
   - `/STRIPE_SETUP.md` - This file

---

## Next Steps

1. Complete Stripe account setup
2. Add environment variables
3. Test locally with test cards
4. Deploy to staging environment
5. Test with live mode
6. Launch to production

🎉 **Your Stripe integration is ready!**
