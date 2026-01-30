# AcadAI Backend

Node.js/Express backend API with Genkit for AI features.

## Tech Stack

- **Runtime**: Node.js (>=18)
- **Framework**: Express.js
- **Language**: TypeScript
- **AI**: Genkit with Google AI (Gemini)
- **Database**: Firebase Admin SDK (Firestore)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Google AI API key (for Genkit)
- Firebase service account credentials

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Copy the example environment file and configure your values:

```bash
cp .env.example .env
```

Required environment variables:
- `PORT` - Server port (default: 3001)
- `CORS_ORIGIN` - Frontend URL for CORS (default: http://localhost:9002)
- `GOOGLE_GENAI_API_KEY` - Your Google AI API key
- `FIREBASE_SERVICE_ACCOUNT_PATH` - Path to Firebase service account JSON

### Development

```bash
npm run dev
```

The server will start with hot-reload on `http://localhost:3001`.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration (Firebase, Genkit)
│   ├── middleware/      # Express middleware
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic and AI services
│   └── index.ts         # Application entry point
├── dist/                # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── nodemon.json
```

## API Endpoints

- `GET /` - API info
- `GET /api/health` - Health check

## AI Capabilities (Genkit)

The backend is configured with Genkit for AI features:
- Gemini 1.5 Pro for complex reasoning tasks
- Gemini 1.5 Flash for fast responses

See `src/config/genkit.ts` for configuration and `src/services/ai.service.ts` for the service layer.

## Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production server
- `npm run typecheck` - Run TypeScript type checking
