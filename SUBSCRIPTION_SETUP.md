# Premium Subscription Setup Guide

This guide will help you set up the premium subscription feature with Razorpay integration.

## Overview

The premium subscription system includes:
- **Free Tier**: Roadmap generation, monthly learning resources
- **Premium Tier** ($9.99/month or ₹299/month):
  - AI Hyperpersonalization
  - Interactive Chat Assistant
  - Weekly Learning Resources
  - Priority Support

## Prerequisites

1. A Razorpay account (https://razorpay.com/)
2. Firebase project with Firestore enabled
3. Node.js and npm installed

## Step 1: Create Razorpay Account and Get API Keys

1. Sign up at https://razorpay.com/
2. Go to Settings → API Keys
3. Generate API keys for your account
4. Copy the Key ID and Key Secret

## Step 2: Create Subscription Plans in Razorpay

You need to create two subscription plans in Razorpay:

### USD Plan ($9.99/month)
1. Go to Razorpay Dashboard → Subscriptions → Plans
2. Click "Create Plan"
3. Configure:
   - Plan Name: "Acad AI Premium - USD"
   - Billing Amount: $9.99 (999 cents)
   - Billing Frequency: Monthly
   - Currency: USD
4. Save and copy the Plan ID

### INR Plan (₹299/month)
1. Create another plan with:
   - Plan Name: "Acad AI Premium - INR"
   - Billing Amount: ₹299 (29900 paise)
   - Billing Frequency: Monthly
   - Currency: INR
2. Save and copy the Plan ID

## Step 3: Set Up Webhook

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Create a new webhook with URL: `https://your-domain.com/api/subscription/webhook`
3. Select these events:
   - subscription.activated
   - subscription.charged
   - subscription.cancelled
   - subscription.expired
   - payment.failed
4. Copy the Webhook Secret

## Step 4: Configure Environment Variables

Update your `.env.local` file with the following:

```bash
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx  # Your Razorpay Key ID
RAZORPAY_KEY_SECRET=your_key_secret_here           # Your Razorpay Key Secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here   # Webhook Secret from Step 3

# Razorpay Plan IDs
RAZORPAY_PLAN_ID_USD=plan_xxxxxxxxxxxx             # USD Plan ID from Step 2
RAZORPAY_PLAN_ID_INR=plan_xxxxxxxxxxxx             # INR Plan ID from Step 2
```

## Step 5: Update Firestore Security Rules

Add these rules to your Firestore security rules to protect subscription data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;

      // Only allow server-side updates to subscription status
      allow update: if request.auth != null &&
                      request.auth.uid == userId &&
                      !request.resource.data.diff(resource.data).affectedKeys().hasAny(['subscription.tier', 'subscription.status']);
    }
  }
}
```

## Step 6: Test the Integration

### Testing in Test Mode

1. Razorpay provides test cards for testing:
   - Card Number: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date

2. Test the subscription flow:
   - Navigate to `/subscription`
   - Click "Upgrade to Premium"
   - Complete the payment with test card
   - Verify subscription is activated in Firestore

### Testing Webhooks Locally

1. Install Razorpay CLI or use ngrok:
   ```bash
   ngrok http 9002
   ```
2. Update webhook URL in Razorpay dashboard to ngrok URL
3. Test subscription events

## Step 7: Go Live

### Before Going Live:

1. **Switch to Live Mode in Razorpay**:
   - Generate Live API Keys
   - Create Live Subscription Plans
   - Update environment variables with live credentials

2. **Update Webhook URL**:
   - Point webhook to production URL
   - Verify webhook secret is correct

3. **Test in Production**:
   - Test with real payment (small amount)
   - Verify webhook events are received
   - Check subscription status in Firestore

## Feature Gating

The system automatically gates features based on subscription tier:

### Free Tier
- ✅ Roadmap Generation
- ✅ Monthly Learning Resources
- ✅ Basic Profile Management
- ❌ Hyperpersonalization
- ❌ Chat Assistant
- ❌ Weekly Resources

### Premium Tier
- ✅ Everything in Free
- ✅ AI Hyperpersonalization
- ✅ Interactive Chat
- ✅ Weekly Resources
- ✅ Priority Support

## User Flow

1. **New User**: Starts on free tier with default subscription
2. **Upgrade**: User clicks upgrade, selects currency, completes payment
3. **Payment Success**: Webhook activates premium features
4. **Renewal**: Automatic monthly renewal via Razorpay
5. **Cancellation**: User can cancel anytime, access continues until period end

## Monitoring

### Check Subscription Status

```typescript
import { getUserSubscriptionTier } from '@/lib/razorpay-service';

const tier = await getUserSubscriptionTier(userId);
console.log('User tier:', tier); // 'free' or 'premium'
```

### Check Feature Access

```typescript
import { useFeatureAccess } from '@/hooks/use-feature-access';

const { hasAccess, tier } = useFeatureAccess('hyperpersonalization');
```

## Troubleshooting

### Payment Not Completing
- Check Razorpay logs for payment failures
- Verify API keys are correct
- Ensure webhook is receiving events

### Subscription Not Activating
- Check webhook logs in `/api/subscription/webhook`
- Verify Firestore permissions
- Check if user document exists

### Feature Access Issues
- Verify subscription status in Firestore
- Check subscription end date
- Ensure AuthContext is properly updating user state

## Support

For Razorpay-specific issues, contact Razorpay support at https://razorpay.com/support/

## Security Notes

1. **Never expose** `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` in client-side code
2. Always verify webhook signatures server-side
3. Validate payment signatures before activating subscriptions
4. Use HTTPS in production for webhook endpoints
5. Store sensitive data only in environment variables

## Next Steps

1. Set up monitoring and alerting for payment failures
2. Implement email notifications for subscription events
3. Create admin dashboard for subscription management
4. Add analytics tracking for conversion rates
5. Implement promo codes and discounts (future feature)
