# Migration Guide: Frontend to Backend Integration

This guide explains how to migrate your Acad AI application to use the new secure backend.

## Overview of Changes

The backend now handles three critical security-sensitive operations:

1. **Firebase Authentication** - Token verification using Firebase Admin SDK
2. **AI Customization** - Google Gemini API calls for roadmap personalization
3. **Payment Processing** - Razorpay subscription management and signature verification

## What's Been Created

### Backend Structure
```
backend/
├── app/
│   ├── main.py                    # FastAPI application
│   ├── config.py                  # Configuration management
│   ├── models.py                  # Pydantic models
│   ├── routers/
│   │   ├── auth.py               # Authentication endpoints
│   │   ├── roadmap.py            # AI customization endpoints
│   │   └── payment.py            # Payment endpoints
│   └── services/
│       ├── firebase_service.py    # Firebase Admin SDK
│       ├── gemini_service.py      # Gemini AI integration
│       └── payment_service.py     # Razorpay integration
├── requirements.txt               # Dependencies
├── .env.example                  # Environment template
├── Dockerfile                    # Docker image
└── README.md                     # Backend docs
```

### Frontend Changes
```
src/lib/api-client.ts              # New API client for backend
```

## Migration Steps

### Step 1: Set Up Backend (One-time)

Follow the [BACKEND_SETUP.md](./BACKEND_SETUP.md) guide to:
1. Install Python dependencies
2. Configure environment variables
3. Set up Firebase service account
4. Get Gemini API key
5. Configure Razorpay credentials

### Step 2: Update Frontend Environment Variables

**Remove sensitive variables:**
```env
# Remove these from .env.local
# GOOGLE_GEMINI_API_KEY - Now in backend only
# RAZORPAY_KEY_SECRET - Now in backend only
```

**Add backend URL:**
```env
# Add to .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Keep these frontend variables:**
```env
# Firebase (still needed for client-side auth)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Razorpay (only public key)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
```

### Step 3: Update Frontend Code to Use Backend

#### A. Roadmap Customization

**Before (Insecure):**
```typescript
// src/app/roadmap/[domain]/page.tsx
import { customizeRoadmapWithGemini } from '@/lib/gemini-service';

// Direct API call from frontend - exposes API key!
const customized = await customizeRoadmapWithGemini(roadmap, userProfile);
```

**After (Secure):**
```typescript
// src/app/roadmap/[domain]/page.tsx
import { customizeRoadmap } from '@/lib/api-client';

// Call backend API - API key stays secure
const result = await customizeRoadmap(domain, userId);
const customized = result.roadmap;
```

#### B. Payment Processing

**Before (Insecure):**
```typescript
// Frontend directly creating subscriptions
const subscription = await fetch('/api/subscription/create', {
  method: 'POST',
  body: JSON.stringify({ userId, planId, currency })
});
```

**After (Secure):**
```typescript
import { createSubscription, verifyPayment } from '@/lib/api-client';

// Create subscription through backend
const subscription = await createSubscription(userId, 'monthly', 'INR');

// Verify payment through backend
const result = await verifyPayment(
  razorpay_subscription_id,
  razorpay_payment_id,
  razorpay_signature,
  userId
);
```

### Step 4: Update Specific Components

#### Update Roadmap Page

**File:** `src/app/roadmap/[domain]/page.tsx`

```typescript
// Add import
import { customizeRoadmap } from '@/lib/api-client';

// Replace roadmap loading logic
async function loadRoadmap() {
  try {
    // Call backend for AI customization
    const result = await customizeRoadmap(domain, user.uid);

    if (result.customized) {
      console.log('Roadmap customized with:', result.message);
      return result.roadmap;
    }

    // Fallback to base roadmap
    return await loadBaseRoadmap(domain);
  } catch (error) {
    console.error('Failed to customize roadmap:', error);
    // Fallback to base roadmap
    return await loadBaseRoadmap(domain);
  }
}
```

#### Update Payment Components

If you have payment components, update them:

```typescript
import {
  createSubscription,
  verifyPayment,
  cancelSubscription
} from '@/lib/api-client';

// Create subscription
const handleSubscribe = async () => {
  try {
    const result = await createSubscription(user.uid, 'monthly', 'INR');

    // Open Razorpay with shortUrl or subscriptionId
    window.location.href = result.shortUrl;
  } catch (error) {
    console.error('Subscription creation failed:', error);
  }
};

// Verify payment after Razorpay success
const handlePaymentSuccess = async (response: any) => {
  try {
    const result = await verifyPayment(
      response.razorpay_subscription_id,
      response.razorpay_payment_id,
      response.razorpay_signature,
      user.uid
    );

    if (result.verified) {
      // Update UI to show premium features
      toast.success('Payment verified! Welcome to Premium!');
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
  }
};
```

### Step 5: Remove Old Backend API Routes (Optional)

You can now remove these Next.js API routes as they're replaced by the backend:

```
src/app/api/subscription/create/route.ts
src/app/api/subscription/verify/route.ts
src/app/api/subscription/cancel/route.ts
src/app/api/roadmap/customize/route.ts
```

**Note:** Keep them for now if you want gradual migration.

### Step 6: Test the Integration

1. **Start both servers:**
   ```bash
   # Windows
   start-dev.bat

   # Linux/Mac
   ./start-dev.sh
   ```

2. **Test backend health:**
   ```bash
   curl http://localhost:8000/health
   ```

3. **Test authentication flow:**
   - Sign up/login on frontend
   - Check backend logs for token verification
   - Verify user profile loads

4. **Test roadmap customization:**
   - Navigate to a roadmap page
   - Check backend logs for Gemini API call
   - Verify customized content loads

5. **Test payment flow:**
   - Attempt to create subscription
   - Complete payment in Razorpay
   - Verify signature verification succeeds

## Hybrid Approach Benefits

You're using a **hybrid architecture** where:
- Frontend still handles UI and Firebase client auth
- Backend handles sensitive operations securely
- Gradual migration is possible

**Advantages:**
- ✅ No need to rewrite entire frontend
- ✅ Can migrate component by component
- ✅ Keep existing Firebase client features
- ✅ Secure sensitive API keys immediately
- ✅ Better scalability for future features

## Common Issues & Solutions

### Issue: "Authorization header missing"

**Solution:** Ensure you're calling authenticated endpoints with Firebase token:

```typescript
// The api-client.ts handles this automatically
// Make sure user is logged in before calling
if (!auth.currentUser) {
  throw new Error('User not authenticated');
}

const result = await customizeRoadmap(domain, userId);
```

### Issue: "CORS policy blocked"

**Solution:** Update backend `.env`:
```env
ALLOWED_ORIGINS=http://localhost:9002,http://localhost:3000
```

### Issue: "Firebase service account not found"

**Solution:** Ensure `firebase-service-account.json` is in the `backend` directory:
```bash
ls backend/firebase-service-account.json
```

### Issue: "Gemini API key not configured"

**Solution:** Check backend `.env` has correct key:
```env
GOOGLE_GEMINI_API_KEY=AIza...
```

### Issue: Payment verification fails

**Solution:** Check Razorpay credentials in backend `.env`:
```env
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
```

## Security Checklist

Before going to production:

- [ ] Remove all sensitive API keys from frontend `.env.local`
- [ ] Verify `firebase-service-account.json` is in `.gitignore`
- [ ] Ensure backend `.env` is in `.gitignore`
- [ ] Update `ALLOWED_ORIGINS` for production domain
- [ ] Set `DEBUG=False` in production backend
- [ ] Use HTTPS for all communication
- [ ] Set up Razorpay webhooks in production
- [ ] Configure proper CORS for production
- [ ] Set up backend monitoring and logging

## Rollback Plan

If you need to rollback:

1. Keep old Next.js API routes temporarily
2. Switch frontend to use old routes
3. Comment out api-client imports
4. Restore sensitive keys to frontend (temporarily)

## Next Steps

1. **Complete frontend migration** - Update all components to use `api-client.ts`
2. **Test thoroughly** - Test all user flows end-to-end
3. **Set up monitoring** - Add logging and error tracking
4. **Deploy backend** - Deploy to your hosting service
5. **Configure webhooks** - Set up Razorpay webhooks for production
6. **Performance testing** - Test with multiple concurrent users

## Need Help?

- Check backend logs: `cd backend && tail -f logs/backend.log`
- API documentation: http://localhost:8000/docs
- Test endpoints: http://localhost:8000/health
- Backend README: [backend/README.md](./backend/README.md)
- Setup guide: [BACKEND_SETUP.md](./BACKEND_SETUP.md)

## Architecture Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ HTTP/HTTPS
       │
┌──────▼──────────┐
│   Next.js App   │ (Port 9002)
│  (Frontend)     │
└──────┬──────────┘
       │
       │ API Calls (with Firebase token)
       │
┌──────▼──────────┐
│  FastAPI        │ (Port 8000)
│  (Backend)      │
└─────┬─┬─┬───────┘
      │ │ │
      │ │ └──────> Razorpay API (Secure)
      │ │
      │ └────────> Google Gemini API (Secure)
      │
      └──────────> Firebase Admin SDK (Secure)
                   └──> Firestore
```

Your secrets are now secure! 🔒
