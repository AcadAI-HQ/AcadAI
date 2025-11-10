# Acad AI

A comprehensive learning roadmap platform for students and professionals, featuring AI-powered personalization with Google Gemini.

## Overview

Acad AI helps users create personalized learning roadmaps across multiple domains including Frontend, Backend, Fullstack, Machine Learning, and DevOps. The platform uses Google Gemini AI to customize roadmaps based on user profiles, experience levels, and learning goals.

## Architecture

This project uses a **secure hybrid architecture**:

- **Frontend:** Next.js 15 with TypeScript (Port 9002)
- **Backend:** FastAPI with Python (Port 8000)
- **Database:** Firebase Firestore
- **AI:** Google Gemini 1.5 Pro
- **Payment:** Razorpay (if applicable)

```
Browser → Next.js Frontend → FastAPI Backend → Firebase/Gemini/Razorpay
```

## Features

- **AI-Powered Personalization:** Roadmaps customized using Google Gemini based on user profile
- **Comprehensive Content:** Professional-level learning paths across multiple domains
- **User Profiles:** Detailed onboarding capturing user type, skills, and learning preferences
- **Secure Backend:** API keys and sensitive operations protected server-side
- **Firebase Integration:** Authentication and real-time database
- **Modern UI:** Built with Next.js, Tailwind CSS, and shadcn/ui

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Firebase account
- Google Gemini API key
- Razorpay account (optional)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AcadAI
```

### 2. Backend Setup

See [QUICK_START.md](./QUICK_START.md) for the fastest setup, or [BACKEND_SETUP.md](./BACKEND_SETUP.md) for detailed instructions.

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Configure .env
cp .env.example .env
# Edit .env with your credentials

# Get Firebase service account and save as firebase-service-account.json

# Start backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Firebase config

# Add backend URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" >> .env.local

# Start frontend
npm run dev
```

### 4. Start Both Servers

**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
./start-dev.sh
```

### 5. Access the Application

- **Frontend:** http://localhost:9002
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

## Documentation

### 🚀 Quick Start
- **[QUICK_START.md](./QUICK_START.md)** - Get running in 5 minutes
- **[SECURITY_COMPLETE.md](./SECURITY_COMPLETE.md)** - ✅ Security status & quick reference

### 🔒 Security
- **[SECURITY_VERIFICATION.md](./SECURITY_VERIFICATION.md)** - Complete security audit
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Frontend to backend migration

### ⚙️ Setup & Configuration
- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Detailed backend setup guide
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Complete setup checklist

### 📚 Architecture & Reference
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture diagrams
- **[BACKEND_SUMMARY.md](./BACKEND_SUMMARY.md)** - Backend implementation overview
- **[backend/README.md](./backend/README.md)** - Backend API documentation

## Development Commands

### Frontend
```bash
npm run dev          # Start development server (port 9002)
npm run build        # Build for production
npm run lint         # Run linting
npm run typecheck    # Run TypeScript type checking
```

### Backend
```bash
cd backend
python run.py                           # Start backend
uvicorn app.main:app --reload          # Start with auto-reload
```

## Project Structure

```
AcadAI/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI app
│   │   ├── config.py          # Configuration
│   │   ├── models.py          # Pydantic models
│   │   ├── routers/           # API endpoints
│   │   └── services/          # Business logic
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
├── src/                       # Next.js frontend
│   ├── app/                   # App router pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities & API client
│   │   └── api-client.ts     # Backend API client
│   ├── contexts/              # React contexts
│   └── types/                 # TypeScript types
│
├── public/                    # Static assets
│   └── roadmaps-new/         # Base roadmap templates
│
├── CLAUDE.md                  # Project guidelines
├── QUICK_START.md            # Quick setup guide
├── BACKEND_SETUP.md          # Backend setup
├── MIGRATION_GUIDE.md        # Migration guide
├── ARCHITECTURE.md           # Architecture docs
└── README.md                 # This file
```

## Available Domains

- **Frontend Development** - React, Vue, modern web technologies
- **Backend Development** - APIs, databases, system architecture
- **Fullstack Development** - Complete web application development
- **Machine Learning** - From foundations to MLOps
- **DevOps** - Infrastructure automation, CI/CD, cloud platforms

## Key Technologies

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Firebase Client SDK
- Framer Motion

### Backend
- FastAPI
- Python 3.11
- Firebase Admin SDK
- Google Generative AI (Gemini)
- Razorpay Python SDK
- Pydantic
- Uvicorn

### Infrastructure
- Firebase (Auth, Firestore)
- Google Gemini 1.5 Pro
- Razorpay (Payments)

## Environment Variables

### Frontend (.env.local)
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Razorpay (public key only)
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

### Backend (.env)
```env
# Server
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
DEBUG=True

# CORS
FRONTEND_URL=http://localhost:9002
ALLOWED_ORIGINS=http://localhost:9002,http://localhost:3000

# Firebase Admin
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Google Gemini
GOOGLE_GEMINI_API_KEY=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Security
JWT_SECRET_KEY=
JWT_ALGORITHM=HS256
```

## Security

The backend implementation provides several security improvements:

- ✅ API keys never exposed to frontend
- ✅ Server-side token verification with Firebase Admin SDK
- ✅ Payment signature verification server-side
- ✅ CORS protection
- ✅ Input validation with Pydantic
- ✅ Secure error handling

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed security architecture.

## API Endpoints

### Authentication
- `POST /api/auth/verify-token` - Verify Firebase token
- `GET /api/auth/me` - Get current user

### Roadmap
- `POST /api/roadmap/customize` - Customize roadmap with AI
- `GET /api/roadmap/domains` - Get available domains

### Payment
- `POST /api/payment/create-subscription` - Create subscription
- `POST /api/payment/verify-payment` - Verify payment
- `POST /api/payment/cancel-subscription` - Cancel subscription

See http://localhost:8000/docs for interactive API documentation.

## Deployment

### Backend (Docker)
```bash
cd backend
docker build -t acadai-backend .
docker run -p 8000:8000 --env-file .env acadai-backend
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy to your hosting service
```

See documentation for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

- **API Documentation:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health
- **Documentation:** See files in root directory

## License

MIT License - See LICENSE file for details

## Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for learners everywhere**

Made with Next.js, FastAPI, Firebase, and Google Gemini
