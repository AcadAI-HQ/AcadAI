# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (runs on port 9002 with Turbopack)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Type checking**: `npm run typecheck`
- **AI Development**: `npm run genkit:dev` or `npm run genkit:watch` for auto-reload

## Architecture Overview

This is **Acad AI**, a Next.js 15 application for AI-powered personalized learning roadmaps with Firebase backend and Google Genkit integration.

### Core Structure
- **Frontend**: Next.js with TypeScript, Tailwind CSS, and shadcn/ui components
- **Authentication**: Firebase Auth with custom user profiles stored in Firestore
- **AI Integration**: Google Genkit with Gemini 2.0 Flash model for roadmap generation
- **UI Framework**: Radix UI primitives with custom styling, Framer Motion animations
- **State Management**: React Context for authentication state

### Key Directories
- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable UI components organized by feature (dashboard, landing, roadmap, shared, ui)
- `src/contexts/` - React contexts (AuthContext for user state)
- `src/ai/` - Genkit AI configuration and development setup
- `src/roadmaps/` - Static JSON roadmap data for different domains
- `src/types/` - TypeScript type definitions

### Business Logic
- **User Types**: Free users (3 roadmap generations) vs Premium users (unlimited)
- **Domains**: Frontend, Backend, Fullstack, ML, DevOps roadmaps
- **Subscription**: Premium tier at Rs. 199/month with Razorpay integration
- **Roadmap Structure**: Hierarchical stages → modules with core/optional classification

### Authentication Flow
- Firebase Auth manages authentication
- User profiles stored in Firestore with subscription status and generation limits
- AuthContext provides login/signup/logout and subscription management
- Protected routes redirect to login if unauthenticated

### Styling Guidelines
- **Colors**: Vibrant blue (#29ABE2), dark gray (#333333), electric purple (#8E2DE2)
- **Fonts**: Space Grotesk for headings, Inter for body text
- **Theme**: Dark mode by default (`className="dark"` on html element)
- **Components**: Using shadcn/ui with Radix UI primitives

### Firebase Configuration
- Authentication, Firestore database integration
- User profiles include: uid, email, displayName, subscriptionStatus, generationsLeft
- Firebase config in `src/lib/firebase.ts`

### Environment Variables Required
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase Web API Key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase Auth Domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase Project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase Storage Bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase Messaging Sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase App ID
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Razorpay Key for payment processing

### Component Patterns
- Components organized by feature in `src/components/`
- UI components from shadcn/ui in `src/components/ui/`
- Custom styling with Tailwind CSS and CSS modules
- Framer Motion for animations and transitions