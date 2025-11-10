# Setup Checklist for Acad AI Backend

Use this checklist to ensure everything is properly configured.

## Pre-Setup

- [ ] Python 3.11+ installed
- [ ] Node.js installed (already done)
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] Firebase project created
- [ ] Google Cloud account (for Gemini)
- [ ] Razorpay account created

## Backend Installation

### 1. Python Environment
- [ ] Navigate to `backend/` directory
- [ ] Create virtual environment: `python -m venv venv`
- [ ] Activate virtual environment:
  - [ ] Windows: `venv\Scripts\activate`
  - [ ] Linux/Mac: `source venv/bin/activate`
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Verify installation: `pip list`

### 2. Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Set `HOST=0.0.0.0`
- [ ] Set `PORT=8000`
- [ ] Set `ENVIRONMENT=development`
- [ ] Set `DEBUG=True`
- [ ] Set `FRONTEND_URL=http://localhost:9002`
- [ ] Set `ALLOWED_ORIGINS=http://localhost:9002,http://localhost:3000`

### 3. Firebase Admin SDK
- [ ] Go to Firebase Console
- [ ] Select your project
- [ ] Navigate to Project Settings
- [ ] Go to Service Accounts tab
- [ ] Click "Generate New Private Key"
- [ ] Download JSON file
- [ ] Save as `backend/firebase-service-account.json`
- [ ] Verify file exists: `ls backend/firebase-service-account.json`
- [ ] Set `FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json`
- [ ] Ensure file is in `.gitignore`

### 4. Google Gemini API
- [ ] Go to Google AI Studio: https://makersuite.google.com/app/apikey
- [ ] Create API key (or use existing)
- [ ] Copy API key
- [ ] Set `GOOGLE_GEMINI_API_KEY=<your-key>` in `.env`
- [ ] Test API key is valid

### 5. Razorpay Configuration
- [ ] Log into Razorpay Dashboard
- [ ] Go to Settings → API Keys
- [ ] Generate Test Keys (for development)
- [ ] Copy Key ID
- [ ] Set `RAZORPAY_KEY_ID=<key-id>` in `.env`
- [ ] Copy Key Secret
- [ ] Set `RAZORPAY_KEY_SECRET=<key-secret>` in `.env`

### 6. Security Configuration
- [ ] Generate secure JWT secret (32+ characters)
- [ ] Set `JWT_SECRET_KEY=<random-string>` in `.env`
- [ ] Set `JWT_ALGORITHM=HS256`
- [ ] Set `ACCESS_TOKEN_EXPIRE_MINUTES=60`

### 7. Logging
- [ ] Set `LOG_LEVEL=INFO` (or DEBUG for development)

## Frontend Configuration

### 1. Environment Variables
- [ ] Open `.env.local` in root directory
- [ ] Add `NEXT_PUBLIC_API_URL=http://localhost:8000/api`
- [ ] Verify Firebase config exists:
  - [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
  - [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] Keep `NEXT_PUBLIC_RAZORPAY_KEY_ID` (for checkout)
- [ ] **Remove** `GOOGLE_GEMINI_API_KEY` (now in backend)
- [ ] **Remove** `RAZORPAY_KEY_SECRET` (now in backend)

## Testing

### Backend Tests
- [ ] Start backend: `cd backend && uvicorn app.main:app --reload`
- [ ] Backend starts without errors
- [ ] Check health: `curl http://localhost:8000/health`
- [ ] Health check returns JSON with "healthy" status
- [ ] Check API docs: Open http://localhost:8000/docs
- [ ] Swagger UI loads successfully
- [ ] Check ReDoc: Open http://localhost:8000/redoc
- [ ] ReDoc loads successfully

### Backend Service Tests
- [ ] Auth health: `curl http://localhost:8000/api/auth/health`
- [ ] Roadmap health: `curl http://localhost:8000/api/roadmap/health`
- [ ] Payment health: `curl http://localhost:8000/api/payment/health`
- [ ] All services return "healthy"

### Frontend Tests
- [ ] Start frontend: `npm run dev`
- [ ] Frontend starts on port 9002
- [ ] Open http://localhost:9002
- [ ] Landing page loads
- [ ] No console errors
- [ ] Check Network tab for API calls

### Integration Tests
- [ ] Sign up / Login works
- [ ] Check backend logs for token verification
- [ ] Navigate to dashboard
- [ ] Dashboard loads user data
- [ ] Navigate to a roadmap page
- [ ] Check backend logs for Gemini API call
- [ ] Roadmap customizes based on profile
- [ ] Try payment flow (if applicable)
- [ ] Payment creation works
- [ ] Razorpay checkout opens

## File Structure Verification

### Backend Files
```
backend/
├── app/
│   ├── __init__.py              ✓
│   ├── main.py                  ✓
│   ├── config.py                ✓
│   ├── models.py                ✓
│   ├── routers/
│   │   ├── __init__.py          ✓
│   │   ├── auth.py              ✓
│   │   ├── roadmap.py           ✓
│   │   └── payment.py           ✓
│   └── services/
│       ├── __init__.py          ✓
│       ├── firebase_service.py  ✓
│       ├── gemini_service.py    ✓
│       └── payment_service.py   ✓
├── venv/                        ✓
├── firebase-service-account.json ✓
├── .env                         ✓
├── .env.example                 ✓
├── .gitignore                   ✓
├── requirements.txt             ✓
├── Dockerfile                   ✓
├── docker-compose.yml           ✓
├── run.py                       ✓
└── README.md                    ✓
```

### Frontend Files
```
src/
└── lib/
    └── api-client.ts            ✓
```

### Documentation
```
Root/
├── BACKEND_SETUP.md             ✓
├── MIGRATION_GUIDE.md           ✓
├── BACKEND_SUMMARY.md           ✓
├── ARCHITECTURE.md              ✓
├── QUICK_START.md               ✓
├── SETUP_CHECKLIST.md (this)    ✓
├── start-dev.bat                ✓
└── start-dev.sh                 ✓
```

## Security Checklist

### Secrets Management
- [ ] `.env` in `.gitignore`
- [ ] `firebase-service-account.json` in `.gitignore`
- [ ] No API keys in frontend code
- [ ] No secrets committed to git
- [ ] Check git history: `git log --all --full-history --source -- "*.env"`

### CORS Configuration
- [ ] Backend CORS allows only frontend URL
- [ ] No wildcard (`*`) in CORS origins
- [ ] Production URLs will be configured separately

### Authentication
- [ ] All protected endpoints require Firebase token
- [ ] Token verification works
- [ ] Unauthorized requests return 401

### Payment Security
- [ ] Payment signature verification works
- [ ] Razorpay webhook signature verification configured
- [ ] Payment amounts validated server-side

## Production Readiness

### When Ready for Production
- [ ] Update `ENVIRONMENT=production`
- [ ] Set `DEBUG=False`
- [ ] Update `ALLOWED_ORIGINS` to production domain
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Use production Firebase project
- [ ] Use production Razorpay keys
- [ ] Set up SSL/HTTPS
- [ ] Configure Razorpay webhooks
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Set up logging service
- [ ] Set up automated backups
- [ ] Configure CDN for static assets
- [ ] Set up CI/CD pipeline

## Docker Setup (Optional)

### Docker Build
- [ ] Build image: `docker build -t acadai-backend backend/`
- [ ] Image builds successfully
- [ ] Run container: `docker run -p 8000:8000 --env-file backend/.env acadai-backend`
- [ ] Container starts successfully
- [ ] Test health: `curl http://localhost:8000/health`

### Docker Compose
- [ ] Navigate to backend: `cd backend`
- [ ] Start services: `docker-compose up -d`
- [ ] Services start successfully
- [ ] Check logs: `docker-compose logs -f`
- [ ] Test API endpoints
- [ ] Stop services: `docker-compose down`

## Common Issues Resolution

### Backend won't start
- [ ] Virtual environment activated?
- [ ] All dependencies installed?
- [ ] `.env` file exists?
- [ ] Firebase service account file exists?
- [ ] Port 8000 not already in use?

### Frontend can't connect
- [ ] Backend is running?
- [ ] `NEXT_PUBLIC_API_URL` set correctly?
- [ ] CORS configured correctly?
- [ ] No firewall blocking?

### Gemini not working
- [ ] API key valid?
- [ ] API enabled in Google Cloud Console?
- [ ] Quota limits not exceeded?
- [ ] Check backend logs for errors?

### Payment issues
- [ ] Razorpay keys correct?
- [ ] Using test keys for development?
- [ ] Signature verification logic correct?
- [ ] Check Razorpay dashboard for errors?

## Final Verification

- [ ] Backend running: http://localhost:8000
- [ ] Frontend running: http://localhost:9002
- [ ] API docs accessible: http://localhost:8000/docs
- [ ] Health check passes: http://localhost:8000/health
- [ ] Can sign up / login
- [ ] Can view roadmaps
- [ ] Roadmaps customize based on profile
- [ ] No errors in browser console
- [ ] No errors in backend logs
- [ ] All API calls authenticated
- [ ] Payment flow works (if applicable)

## Documentation Review

Have you read:
- [ ] [QUICK_START.md](./QUICK_START.md) - Quick setup guide
- [ ] [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Detailed setup
- [ ] [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Code migration
- [ ] [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [ ] [BACKEND_SUMMARY.md](./BACKEND_SUMMARY.md) - Overview
- [ ] [backend/README.md](./backend/README.md) - Backend docs

## Next Steps

Once all checkboxes are complete:
1. Start development on new features
2. Migrate existing frontend code to use api-client
3. Test all user flows end-to-end
4. Set up monitoring and error tracking
5. Prepare for production deployment

## Support Resources

- **API Documentation:** http://localhost:8000/docs
- **Backend Logs:** Check terminal where uvicorn is running
- **Frontend Logs:** Check browser console
- **Firebase Console:** https://console.firebase.google.com/
- **Razorpay Dashboard:** https://dashboard.razorpay.com/
- **Google AI Studio:** https://makersuite.google.com/

## Completion

- [ ] All sections above completed
- [ ] Backend running successfully
- [ ] Frontend integrated with backend
- [ ] All tests passing
- [ ] Documentation reviewed
- [ ] Ready to develop!

---

**Congratulations!** Your secure backend is now set up and ready to use! 🎉

If you encounter any issues, refer to the troubleshooting sections in the documentation files.
