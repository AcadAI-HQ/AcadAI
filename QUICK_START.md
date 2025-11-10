# Quick Start Guide

Get your secure backend up and running in 5 minutes!

## Prerequisites
- Python 3.11+
- Node.js (already installed)
- Firebase project
- Google Gemini API key
- Razorpay account

## Steps

### 1. Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration (2 minutes)

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
notepad .env  # Windows
# or
nano .env     # Linux/Mac
```

**Required values in .env:**
```env
GOOGLE_GEMINI_API_KEY=your_key_here
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
JWT_SECRET_KEY=generate_a_random_32_char_string
```

### 3. Firebase Service Account (1 minute)

1. Go to Firebase Console
2. Project Settings → Service Accounts
3. Generate New Private Key
4. Save as `backend/firebase-service-account.json`

### 4. Start Backend

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Update Frontend

Add to your `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Remove from `.env.local`:
```env
# Delete these lines (now in backend)
GOOGLE_GEMINI_API_KEY=...
RAZORPAY_KEY_SECRET=...
```

### 6. Start Frontend

```bash
# In project root
npm run dev
```

## Verify Installation

### Test Backend Health
```bash
curl http://localhost:8000/health
```

Should return:
```json
{
  "status": "healthy",
  "firebase": "connected",
  "gemini": "configured",
  "razorpay": "configured"
}
```

### Test API Documentation
Open browser: http://localhost:8000/docs

### Test Frontend
Open browser: http://localhost:9002

## Common Commands

### Start Both Servers

**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
./start-dev.sh
```

### Backend Only
```bash
cd backend
python run.py
```

### View Backend Logs
```bash
# Logs are in terminal where uvicorn is running
# Set log level in backend/.env:
LOG_LEVEL=DEBUG
```

### Run with Docker
```bash
cd backend
docker-compose up
```

## Quick API Reference

### Authentication
```javascript
import { verifyToken } from '@/lib/api-client';
const result = await verifyToken(idToken);
```

### Roadmap Customization
```javascript
import { customizeRoadmap } from '@/lib/api-client';
const result = await customizeRoadmap('frontend', userId);
```

### Payment
```javascript
import { createSubscription } from '@/lib/api-client';
const sub = await createSubscription(userId, 'monthly', 'INR');
```

## Troubleshooting

### "Module not found"
```bash
cd backend
pip install -r requirements.txt
```

### "Firebase service account not found"
Check file exists:
```bash
ls backend/firebase-service-account.json
```

### "CORS error"
Update backend `.env`:
```env
ALLOWED_ORIGINS=http://localhost:9002,http://localhost:3000
```

### "Port already in use"
Kill process on port 8000:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

## Next Steps

1. Read [BACKEND_SETUP.md](./BACKEND_SETUP.md) for detailed setup
2. Read [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) to update your code
3. Explore API docs at http://localhost:8000/docs
4. Test all endpoints

## Key URLs

- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health
- Frontend: http://localhost:9002

## File Locations

- Backend code: `backend/app/`
- Backend config: `backend/.env`
- Firebase key: `backend/firebase-service-account.json`
- Frontend API client: `src/lib/api-client.ts`
- Frontend config: `.env.local`

## Support

- Detailed setup: [BACKEND_SETUP.md](./BACKEND_SETUP.md)
- Migration guide: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- Backend README: [backend/README.md](./backend/README.md)
- Summary: [BACKEND_SUMMARY.md](./BACKEND_SUMMARY.md)

You're all set! 🚀
