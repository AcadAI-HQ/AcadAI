# Backend Setup Guide for Acad AI

This guide will help you set up the secure FastAPI backend for Acad AI.

## Overview

The backend has been created to secure three critical components:
1. **Firebase Authentication** - Token verification with Firebase Admin SDK
2. **AI Roadmap Customization** - Google Gemini API integration (keeps API key secure)
3. **Payment Processing** - Razorpay subscription management with signature verification

## Prerequisites

- Python 3.11 or higher
- Firebase project with Admin SDK access
- Google Gemini API key
- Razorpay account with API credentials

## Quick Start

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Server Configuration
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
DEBUG=True

# CORS Settings
FRONTEND_URL=http://localhost:9002
ALLOWED_ORIGINS=http://localhost:9002,http://localhost:3000

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Google Gemini API
GOOGLE_GEMINI_API_KEY=your_actual_gemini_api_key

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Security
JWT_SECRET_KEY=generate_a_secure_32_character_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Logging
LOG_LEVEL=INFO
```

### 5. Get Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (AcadAI)
3. Click the gear icon (⚙️) > Project Settings
4. Go to "Service Accounts" tab
5. Click "Generate New Private Key"
6. Save the downloaded JSON file as `firebase-service-account.json` in the `backend` directory

**Important:** Never commit this file to version control!

### 6. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key and add it to your `.env` file

### 7. Get Razorpay Credentials

1. Log into [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings > API Keys
3. Generate Test/Live keys
4. Copy Key ID and Key Secret to your `.env` file

### 8. Run the Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 9. Test the Backend

Open your browser and visit:
- Main health check: http://localhost:8000/health
- API documentation: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

You should see a health check response:
```json
{
  "status": "healthy",
  "firebase": "connected",
  "gemini": "configured",
  "razorpay": "configured"
}
```

## Frontend Configuration

### Update Frontend Environment Variables

Add to your frontend `.env.local`:

```env
# Existing Firebase config...
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# ... other Firebase vars

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Remove Sensitive Keys from Frontend

**Remove these from frontend `.env.local`:**
- ~~`NEXT_PUBLIC_RAZORPAY_KEY_SECRET`~~ (moved to backend)
- ~~`GOOGLE_GEMINI_API_KEY`~~ (moved to backend)

**Keep only the public Razorpay key:**
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx  # Keep this for frontend checkout
```

## Architecture

### Before (Insecure)
```
Frontend -> Firebase (exposed keys)
Frontend -> Gemini API (exposed key)
Frontend -> Razorpay (exposed secret)
```

### After (Secure)
```
Frontend -> Backend (authenticated) -> Firebase Admin SDK
Frontend -> Backend (authenticated) -> Gemini API
Frontend -> Backend (authenticated) -> Razorpay
```

## API Usage Examples

### 1. Verify Firebase Token

```javascript
// Frontend code
import { verifyToken } from '@/lib/api-client';

const idToken = await user.getIdToken();
const response = await verifyToken(idToken);
console.log(response.user);
```

### 2. Customize Roadmap with AI

```javascript
import { customizeRoadmap } from '@/lib/api-client';

const result = await customizeRoadmap('frontend', userId);
console.log(result.roadmap);  // AI-customized roadmap
console.log(result.customized);  // true if AI customization succeeded
```

### 3. Create Subscription

```javascript
import { createSubscription } from '@/lib/api-client';

const subscription = await createSubscription(userId, 'monthly', 'INR');
console.log(subscription.subscriptionId);
console.log(subscription.shortUrl);  // Payment link
```

### 4. Verify Payment

```javascript
import { verifyPayment } from '@/lib/api-client';

// After Razorpay success callback
const result = await verifyPayment(
  razorpay_subscription_id,
  razorpay_payment_id,
  razorpay_signature,
  userId
);

if (result.verified) {
  console.log('Payment verified!');
  // Update UI to show premium features
}
```

## Security Benefits

1. **API Keys Protected**: Gemini API key never exposed to frontend
2. **Payment Security**: Razorpay secret key secure on backend
3. **Token Verification**: All requests verified with Firebase Admin SDK
4. **Signature Verification**: Payment signatures verified server-side
5. **CORS Protection**: Only allowed origins can access API
6. **Input Validation**: All inputs validated with Pydantic models
7. **Error Handling**: Secure error messages (no sensitive data leakage)

## Troubleshooting

### Backend won't start

**Error: "Firebase service account file not found"**
```bash
# Solution: Ensure firebase-service-account.json is in backend directory
ls backend/firebase-service-account.json
```

**Error: "GOOGLE_GEMINI_API_KEY not found"**
```bash
# Solution: Check .env file exists and has correct variable
cat backend/.env | grep GEMINI
```

### Frontend can't connect to backend

**Error: "CORS policy blocked"**
```bash
# Solution: Add frontend URL to ALLOWED_ORIGINS in backend/.env
ALLOWED_ORIGINS=http://localhost:9002,http://localhost:3000
```

**Error: "Failed to fetch"**
```bash
# Solution: Ensure backend is running on port 8000
curl http://localhost:8000/health
```

### Gemini customization not working

**Check logs:**
```bash
# Look for Gemini errors in backend logs
# Should show successful customization or fallback to rule-based
```

**Verify API key:**
- Go to Google AI Studio
- Check API key is valid and not expired
- Ensure Gemini 1.5 Pro is enabled

### Payment verification failing

**Check Razorpay credentials:**
- Verify Key ID and Secret are correct
- Ensure using Test keys for development
- Check signature verification logic

## Production Deployment

### Using Docker

```bash
cd backend
docker build -t acadai-backend .
docker run -p 8000:8000 --env-file .env acadai-backend
```

### Using Docker Compose

```bash
cd backend
docker-compose up -d
```

### Environment Variables for Production

Update `.env` for production:
```env
ENVIRONMENT=production
DEBUG=False
FRONTEND_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
```

## Next Steps

1. Update frontend components to use `api-client.ts`
2. Test all API endpoints with frontend
3. Set up Razorpay webhooks in dashboard
4. Configure production environment variables
5. Set up monitoring and logging
6. Deploy backend to your hosting service

## Need Help?

- Backend logs: Check terminal where uvicorn is running
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health
- Test endpoints using the interactive docs at `/docs`

## File Structure Reference

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment configuration
│   ├── models.py            # Pydantic models
│   ├── routers/
│   │   ├── auth.py          # /api/auth/* endpoints
│   │   ├── roadmap.py       # /api/roadmap/* endpoints
│   │   └── payment.py       # /api/payment/* endpoints
│   └── services/
│       ├── firebase_service.py    # Firebase Admin SDK
│       ├── gemini_service.py      # Google Gemini AI
│       └── payment_service.py     # Razorpay integration
├── .env                     # Your secrets (don't commit!)
├── .env.example            # Template for .env
├── requirements.txt        # Python dependencies
├── Dockerfile             # Docker image definition
└── README.md             # Backend documentation
```

Good luck! 🚀
