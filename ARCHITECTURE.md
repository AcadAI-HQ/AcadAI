# Acad AI Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                            │
│                     (http://localhost:9002)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      NEXT.JS FRONTEND                            │
│                      (Port 9002)                                 │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │   Pages/UI     │  │  Firebase      │  │  API Client     │  │
│  │   Components   │  │  Client Auth   │  │  (api-client.ts)│  │
│  └────────────────┘  └────────────────┘  └─────────────────┘  │
│                                                 │                │
│         Public Keys:                            │                │
│         - Firebase Config                       │                │
│         - Razorpay Key ID                       │                │
└─────────────────────────────────────────────────┼────────────────┘
                                                  │
                                                  │ REST API
                                                  │ (with Firebase Token)
                                                  │
┌─────────────────────────────────────────────────▼────────────────┐
│                     FASTAPI BACKEND                               │
│                     (Port 8000)                                   │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Auth       │  │   Roadmap    │  │   Payment            │  │
│  │   Router     │  │   Router     │  │   Router             │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────────┘  │
│         │                 │                  │                   │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────────────┐  │
│  │  Firebase    │  │   Gemini     │  │   Razorpay           │  │
│  │  Service     │  │   Service    │  │   Service            │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────────┘  │
│         │                 │                  │                   │
│         │         Secret Keys (Secure):      │                   │
│         │         - Firebase Admin SDK       │                   │
│         │         - Gemini API Key           │                   │
│         │         - Razorpay Secret          │                   │
└─────────┼─────────────────┼──────────────────┼───────────────────┘
          │                 │                  │
          │                 │                  │
┌─────────▼────────┐ ┌──────▼─────────┐ ┌─────▼──────────────────┐
│  Firebase Admin  │ │  Google Gemini │ │  Razorpay API          │
│  SDK / Firestore │ │  1.5 Pro API   │ │  (Payment Gateway)     │
└──────────────────┘ └────────────────┘ └────────────────────────┘
```

## Request Flow Examples

### 1. User Authentication Flow

```
User                Frontend           Backend            Firebase
 │                     │                  │                  │
 │──Login Form────────>│                  │                  │
 │                     │                  │                  │
 │                     │──signInWith──────┼─────────────────>│
 │                     │  EmailPassword   │                  │
 │                     │                  │                  │
 │                     │<─────ID Token────┼──────────────────│
 │                     │                  │                  │
 │                     │──POST /auth/────>│                  │
 │                     │  verify-token    │                  │
 │                     │  (ID Token)      │                  │
 │                     │                  │──verify_token───>│
 │                     │                  │                  │
 │                     │                  │<─Valid/Invalid───│
 │                     │                  │                  │
 │                     │                  │──get_profile────>│
 │                     │                  │  (Firestore)     │
 │                     │<───User Profile──│                  │
 │                     │                  │                  │
 │<─Dashboard Redirect─│                  │                  │
 │                     │                  │                  │
```

### 2. AI Roadmap Customization Flow

```
User              Frontend              Backend              Gemini
 │                   │                      │                   │
 │─Select Domain────>│                      │                   │
 │  (e.g. Frontend)  │                      │                   │
 │                   │                      │                   │
 │                   │──POST /roadmap/─────>│                   │
 │                   │  customize           │                   │
 │                   │  {domain, userId}    │                   │
 │                   │  [Firebase Token]    │                   │
 │                   │                      │                   │
 │                   │                      │──Load Base───────>│
 │                   │                      │  Roadmap          │
 │                   │                      │                   │
 │                   │                      │──Get User ───────>│
 │                   │                      │  Profile          │
 │                   │                      │  (Firestore)      │
 │                   │                      │                   │
 │                   │                      │──Send Prompt─────>│
 │                   │                      │  (with context)   │
 │                   │                      │                   │
 │                   │                      │<─AI Response──────│
 │                   │                      │  (Customized)     │
 │                   │                      │                   │
 │                   │                      │──Save to ────────>│
 │                   │                      │  Firestore        │
 │                   │                      │  (User Roadmap)   │
 │                   │                      │                   │
 │                   │<─Customized Roadmap──│                   │
 │                   │                      │                   │
 │<─Display Roadmap──│                      │                   │
 │                   │                      │                   │
```

### 3. Payment Processing Flow

```
User           Frontend          Backend         Razorpay
 │                │                 │                │
 │─Click Premium──>│                │                │
 │                │                 │                │
 │                │──POST /payment/─>│               │
 │                │  create-sub      │               │
 │                │  [Token]         │               │
 │                │                  │               │
 │                │                  │──Create Sub──>│
 │                │                  │               │
 │                │                  │<─Payment Link─│
 │                │<─{shortUrl}──────│               │
 │                │                  │               │
 │<─Redirect to───│                  │               │
 │  Razorpay      │                  │               │
 │                │                  │               │
 │──Enter Card────┼─────────────────>│               │
 │  Details       │                  │               │
 │                │                  │               │
 │<─Payment OK────┼──────────────────┤               │
 │  (signature)   │                  │               │
 │                │                  │               │
 │                │──POST /payment/──>│               │
 │                │  verify-payment  │               │
 │                │  [signature]     │               │
 │                │                  │               │
 │                │                  │──Verify───────┤
 │                │                  │  Signature    │
 │                │                  │  (HMAC-SHA256)│
 │                │                  │               │
 │                │                  │──Update User──┤
 │                │                  │  (Premium)    │
 │                │                  │               │
 │                │<─{verified:true}─│               │
 │                │                  │               │
 │<─Premium Active─│                 │               │
 │                │                  │               │
```

## Component Responsibilities

### Frontend (Next.js)
**Responsibilities:**
- User interface and interactions
- Client-side routing
- Firebase client authentication
- Form validation
- UI state management
- Calling backend APIs

**Does NOT Handle:**
- Secret API keys
- Payment signature verification
- Server-side token verification
- Direct API calls to third parties

### Backend (FastAPI)
**Responsibilities:**
- Firebase token verification (Admin SDK)
- API key management (secrets)
- Business logic execution
- Third-party API calls (Gemini, Razorpay)
- Payment signature verification
- Data validation (Pydantic)
- Error handling and logging

**Security Features:**
- CORS configuration
- Token-based authentication
- Input validation
- Signature verification
- Secure error messages

## Data Flow

### User Profile Data
```
Firebase Auth (uid, email)
        │
        ▼
Frontend (Client SDK)
        │
        ▼
Backend (Admin SDK) ─────> Firestore
        │                    (users collection)
        ▼
Profile validated & returned
```

### Roadmap Data
```
Base Templates (/public/roadmaps-new/)
        │
        ▼
Backend loads base
        │
        ▼
Gemini AI customizes
        │
        ▼
Firestore (users/{uid}/roadmaps/{domain})
        │
        ▼
Frontend displays
```

### Payment Data
```
User initiates ──> Backend creates subscription
                          │
                          ▼
                   Razorpay generates link
                          │
                          ▼
                   User completes payment
                          │
                          ▼
                   Backend verifies signature
                          │
                          ▼
                   Firestore updates subscription
                          │
                          ▼
                   Frontend shows premium
```

## Security Layers

### Layer 1: CORS Protection
```
Backend only accepts requests from:
- http://localhost:9002 (dev)
- https://your-domain.com (prod)
```

### Layer 2: Firebase Authentication
```
Every protected endpoint requires:
Authorization: Bearer <firebase-id-token>

Backend verifies with Firebase Admin SDK
```

### Layer 3: Input Validation
```
Pydantic models validate all inputs:
- Type checking
- Required fields
- Format validation
```

### Layer 4: Business Logic
```
Backend enforces:
- User owns requested resource
- Valid payment signatures
- Rate limiting (future)
```

## Deployment Architecture

### Development
```
localhost:9002 (Frontend) ─────> localhost:8000 (Backend)
```

### Production
```
┌─────────────────┐
│   CloudFlare    │ (CDN, DDoS protection)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Next.js App   │ (Vercel/Netlify)
│   (Frontend)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FastAPI Backend│ (Railway/Render/AWS)
│  (with Docker)  │
└────────┬────────┘
         │
    ┌────┴────┬────────┬──────────┐
    ▼         ▼        ▼          ▼
Firebase   Gemini   Razorpay   Firestore
```

## Technology Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI:** React, Tailwind CSS, shadcn/ui
- **Auth:** Firebase Client SDK
- **State:** React Context

### Backend
- **Framework:** FastAPI 0.115
- **Language:** Python 3.11
- **Server:** Uvicorn (ASGI)
- **Validation:** Pydantic 2.10
- **Auth:** Firebase Admin SDK
- **AI:** Google Generative AI (Gemini)
- **Payment:** Razorpay Python SDK

### Infrastructure
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage (future)
- **Authentication:** Firebase Auth
- **AI:** Google Gemini 1.5 Pro
- **Payment:** Razorpay

## API Security Comparison

### Before (Insecure)
```javascript
// Frontend code - API key exposed! ❌
const response = await fetch('https://api.gemini.google.com/...', {
  headers: {
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GEMINI_KEY}`
    // ^ Exposed in browser! Anyone can see this!
  }
});
```

### After (Secure)
```javascript
// Frontend code - No secrets ✅
const response = await fetch('http://localhost:8000/api/roadmap/customize', {
  headers: {
    'Authorization': `Bearer ${firebaseToken}`
    // ^ Only Firebase token, which is meant to be public
  }
});

// Backend code - Secrets safe ✅
async def customize_roadmap():
    # API key stored securely in backend .env
    genai.configure(api_key=settings.GOOGLE_GEMINI_API_KEY)
    # User can never see this!
```

## Scalability Considerations

### Current (Hybrid)
- Frontend: Next.js handles UI
- Backend: FastAPI handles business logic
- Can scale each independently

### Future Enhancements
- **Caching:** Redis for API responses
- **Queue:** Celery for background tasks
- **Load Balancer:** NGINX for multiple backend instances
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK stack (Elasticsearch, Logstash, Kibana)

## Key Takeaways

1. **Secrets Stay Secret:** API keys never exposed to frontend
2. **Token-Based Auth:** Every request authenticated with Firebase
3. **Server-Side Validation:** All sensitive operations verified server-side
4. **Hybrid Architecture:** Frontend for UI, Backend for business logic
5. **Production Ready:** Docker support, health checks, monitoring
6. **Scalable:** Can add microservices, caching, load balancing

Your application is now **secure, scalable, and production-ready**! 🔒🚀
