# Payment System Migration Guide

This document describes the migration from Next.js API routes to a dedicated Node.js/Express backend for payment handling.

## Security Improvements

### Issues Fixed

1. **Client-side subscription persistence removed**
   - **Before**: `checkout/return/page.tsx` had `persistSubscriptionClientSide()` that wrote directly to Firestore
   - **Risk**: Users could grant themselves premium access by calling this function
   - **After**: All subscription persistence happens server-side only

2. **Hardcoded prices moved to backend**
   - **Before**: Prices were embedded in `use-geo-pricing.ts` on the client
   - **Risk**: Prices could drift out of sync; client-side price manipulation
   - **After**: Prices defined in `backend/src/config/env.ts`, served via API

3. **Server-side price validation**
   - **Before**: Server trusted client-provided currency without validation
   - **After**: Server validates currency and looks up correct product ID internally

## Architecture Overview

```
┌──────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│   Next.js App    │────▶│  Express Backend  │────▶│  DodoPayments   │
│   (Frontend)     │     │    (Port 3001)    │     │      API        │
└──────────────────┘     └───────────────────┘     └─────────────────┘
         │                        │
         │                        ▼
         │               ┌───────────────────┐
         └──────────────▶│     Firebase      │
              (Auth)     │    (Firestore)    │
                         └───────────────────┘
```

## Data Flow

### Checkout Flow

1. **User clicks "Upgrade"** on pricing page
2. **Frontend detects country** (geo-location for INR/USD)
3. **Frontend calls** `POST /api/payment/checkout` with:
   - Auth token (Bearer)
   - interval: 'monthly' | 'yearly'
   - currency: 'USD' | 'INR'
   - idempotencyKey (optional, prevents duplicates)

4. **Backend validates**:
   - Verifies Firebase auth token
   - Validates currency (ignores any amount from client)
   - Looks up correct product ID from env vars
   - Checks for duplicate sessions (idempotency)

5. **Backend creates DodoPayments session**
6. **Backend stores session mapping** in Firestore (`checkout_sessions` collection)
7. **Backend returns** checkout URL to frontend
8. **Frontend redirects** user to DodoPayments checkout

### Return Flow (After Payment)

1. **User completes payment**, redirected to `/checkout/return?session_id=xxx`
2. **Frontend calls** `GET /api/payment/checkout-status?session_id=xxx`
3. **Backend retrieves** session from DodoPayments
4. **Backend derives outcome** (success/failed/unknown)
5. **If success, backend persists** subscription to Firestore:
   - Looks up UID from `checkout_sessions` collection
   - Writes to `users/{uid}/subscription`
   - Updates `checkout_sessions` status to 'completed'
   - Creates `dodo_customers` reverse lookup

6. **Frontend refreshes user profile** to see updated subscription
7. **Frontend redirects** to dashboard

### Webhook Flow (Reliable Fulfillment)

1. **DodoPayments sends webhook** to `/api/webhook/dodo-payments`
2. **Backend verifies signature** using HMAC-SHA256
3. **Backend extracts** event type and payload
4. **Backend resolves UID** via:
   - Metadata in webhook payload
   - Session ID lookup in `checkout_sessions`
   - Customer ID lookup in `dodo_customers`

5. **Backend updates** subscription status based on event:
   - `subscription.active` → status: 'active'
   - `subscription.cancelled` → status: 'cancelled', cancelAtPeriodEnd: true
   - `subscription.expired` → status: 'expired'
   - `subscription.failed` → status: 'payment_failed'
   - `subscription.renewed` → status: 'active', new period end

## Migration Steps

### 1. Copy environment variables to backend

Copy these from your `.env.local` to `backend/.env`:

```bash
# Required for backend
DODO_PAYMENTS_API_KEY=your_key_here
DODO_PAYMENTS_ENVIRONMENT=live_mode
DODO_PAYMENTS_WEBHOOK_SECRET=your_secret_here
DODO_PAYMENTS_RETURN_URL=https://acadai.org/checkout/return

DODO_PRODUCT_PREMIUM_MONTHLY_USD=pdt_xxx
DODO_PRODUCT_PREMIUM_YEARLY_USD=pdt_xxx
DODO_PRODUCT_PREMIUM_MONTHLY_INR=pdt_xxx
DODO_PRODUCT_PREMIUM_YEARLY_INR=pdt_xxx
```

### 2. Copy Firebase service account

Copy `firebase-service-account.json` to the `backend/` directory.

### 3. Add backend URL to frontend

Add to your Next.js `.env.local`:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

For production:
```
NEXT_PUBLIC_BACKEND_URL=https://api.acadai.org
```

### 4. Replace frontend files

Replace the old files with the new versions:

```bash
# Pricing hook (fetches from backend)
mv src/hooks/use-geo-pricing.ts src/hooks/use-geo-pricing.old.ts
mv src/hooks/use-geo-pricing-v2.ts src/hooks/use-geo-pricing.ts

# Checkout return page (no client-side persistence)
mv src/app/checkout/return/page.tsx src/app/checkout/return/page.old.tsx
mv src/app/checkout/return/page-v2.tsx src/app/checkout/return/page.tsx

# Subscription tab (uses backend API)
mv src/components/profile/subscription-tab.tsx src/components/profile/subscription-tab.old.tsx
mv src/components/profile/subscription-tab-v2.tsx src/components/profile/subscription-tab.tsx
```

### 5. Update webhook URL in DodoPayments Dashboard

Change webhook URL from:
```
https://acadai.org/api/webhook/dodo-payments
```

To:
```
https://api.acadai.org/api/webhook/dodo-payments
```

### 6. Start the backend

```bash
cd backend
npm install
npm run dev
```

### 7. Test the flow

1. Create a test checkout
2. Complete payment in test mode
3. Verify subscription is persisted
4. Test cancellation

## New Files Created

### Backend (`backend/`)

| File | Purpose |
|------|---------|
| `src/config/env.ts` | Environment config, server-side pricing |
| `src/config/firebase.ts` | Firebase Admin SDK |
| `src/middleware/auth.ts` | Firebase token verification |
| `src/services/payment.service.ts` | Payment business logic |
| `src/routes/payment.ts` | Payment API endpoints |
| `src/routes/webhook.ts` | Webhook handler |
| `src/index.ts` | Express app setup |

### Frontend (`src/`)

| File | Purpose |
|------|---------|
| `lib/payment-client.ts` | API client for backend |
| `hooks/use-geo-pricing-v2.ts` | Fetches pricing from backend |
| `app/checkout/return/page-v2.tsx` | Secure checkout return |
| `components/profile/subscription-tab-v2.tsx` | Uses backend for cancellation |

## API Endpoints

### Backend API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/payment/pricing` | No | Get validated pricing |
| POST | `/api/payment/checkout` | Yes | Create checkout session |
| GET | `/api/payment/checkout-status` | No* | Check payment status |
| POST | `/api/payment/cancel` | Yes | Cancel subscription |
| POST | `/api/webhook/dodo-payments` | Signature | Handle webhooks |

*Session ID acts as secure token

## Idempotency

The backend supports idempotency keys to prevent duplicate charges:

```typescript
const result = await createCheckout({
  interval: 'monthly',
  currency: 'USD',
  idempotencyKey: generateIdempotencyKey(), // checkout_xxx_xxx
});
```

If the same idempotency key is used within 30 minutes, the existing session is returned.

## Error Handling

### Error Mapping

| Backend Error | Frontend Message |
|--------------|------------------|
| 401 Unauthorized | "Please sign in to continue" |
| 400 Invalid pricing | "Invalid plan selected" |
| 500 Checkout failed | "Could not start checkout. Please try again." |
| Network error | "Connection error. Please check your internet." |

### Production Mode

In production, error details are stripped:

```json
// Development
{ "error": "Failed to create checkout", "details": "Product ID not found" }

// Production
{ "error": "Failed to create checkout" }
```

## Cleanup (After Migration)

Once migration is verified, you can remove:

1. Old Next.js API routes:
   - `src/app/api/checkout/route.ts`
   - `src/app/api/checkout-status/route.ts`
   - `src/app/api/webhook/dodo-payments/route.ts`
   - `src/app/api/subscription/cancel/route.ts`

2. Old frontend files (the `.old.ts` backups)

3. Payment-related env vars from Next.js `.env.local` (keep them in backend only)
