# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (runs on port 9002 with Turbopack)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Type checking**: `npm run typecheck`


### Core Structure
- **Frontend**: Next.js with TypeScript, Tailwind CSS, and shadcn/ui components
- **Authentication**: Firebase Auth with simplified user profiles stored in Firestore
- **Roadmap Content**: Static JSON files with comprehensive, professional-level content
- **UI Framework**: Radix UI primitives with custom styling, Framer Motion animations
- **State Management**: React Context for authentication state

### Key Directories
- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable UI components organized by feature (dashboard, landing, roadmap, shared, ui)
- `src/contexts/` - React contexts (AuthContext for user state)
- `public/roadmaps/` - Static JSON roadmap files with comprehensive content
- `src/types/` - TypeScript type definitions

### Business Logic & Features
- **Subscription-Based Platform**: AcadAI is a premium product gated behind a paid subscription (`subscription.tier === 'premium'`)
- **Premium Features (all require active subscription)**:
  - AI-powered learning roadmaps (personalized via Gemini)
  - Hyperpersonalization modal on roadmap pages
  - Learning Resources (curated weekly content)
  - AI Mentor (chat, step Q&A via NodeDetailDrawer, and agentic tool calls)
  - Blog content and market-researched resources
- **Free / Public Access**: Landing page, login/signup, onboarding, and basic dashboard shell only
- **Subscription Check**: `subscription.tier` field on UserProfile; checked server-side in API routes and client-side for UI gating
- **Available Domains (14 total)**:
  - Frontend, Backend, Fullstack, Machine Learning, DevOps
  - Android, iOS, Blockchain, UI/UX, Product Engineering
  - AAA Game Dev, Indie Game Dev, Cybersecurity, Data Science
- **Roadmap Structure**: Hierarchical stages with detailed resources and learning paths

### Recent Changes (2025/2026)
- **Premium Subscription Model**: All core features gated behind subscription — free tier is landing/auth only
- **AI Mentor**: Fully agentic chat system with 5 tools, daily (50) and monthly (1500) usage caps per user
- **Hyperpersonalization**: Gemini-powered roadmap customization per user background/goals
- **Comprehensive User Onboarding**: Multi-step onboarding system collecting user type, background, and learning preferences
- **Profile Management System**: Complete profile viewing and editing functionality with tabbed interface
- **Enhanced Navigation**: Integrated sidebar navigation with Dashboard, My Roadmap, Learning Resources, Profile, and Feedback sections
- **Comprehensive Roadmaps**: All 14 domains feature detailed, professional-level learning paths
- **Personalized Roadmap Storage**: User roadmaps stored in Firestore (`users/{userId}/roadmaps/{domain}`) for AI customization
- **AI Pipeline**: Weekly blog + learning resources, monthly market research + roadmap regeneration via GitHub Actions

### Authentication Flow
- Firebase Auth manages authentication
- User profiles stored in Firestore with user preferences and skills
- AuthContext provides login/signup/logout functionality
- Protected routes redirect to login if unauthenticated

### Styling Guidelines
- **Colors**: Vibrant blue (#29ABE2), dark gray (#333333), electric purple (#8E2DE2)
- **Fonts**: Space Grotesk for headings, Inter for body text
- **Theme**: Dark mode by default (`className="dark"` on html element)
- **Components**: Using shadcn/ui with Radix UI primitives

### User Profile System
- **Comprehensive Onboarding**: 4-step process collecting user type, background info, and learning preferences
- **User Types**: Student, Professional, Learner - each with type-specific fields
- **Profile Completion Tracking**: Prevents roadmap generation until profile is complete
- **Backward Compatibility**: Migration logic for existing users
- **Profile Management**: View and edit functionality with tabbed interface (Personal Info, Background, Learning Preferences)

### Firebase Configuration
- Authentication, Firestore database integration
- Enhanced user profiles include: uid, email, displayName, skills, lastGeneratedDomain, profileComplete, userType, subscription, and type-specific fields
- Firebase config in `src/lib/firebase.ts`
- Data filtering prevents undefined/null values in Firestore updates
- Subscription data stored in `subscription` field on user profile (`{ tier: 'free' | 'premium', ... }`)
- **Personalized Roadmaps**: Stored in `users/{userId}/roadmaps/{domain}` subcollection
  - Each user gets their own copy of roadmaps for AI customization
  - Base templates from `/public/roadmaps-new/` used as fallback
  - Tracks modifications, version, and customization status

### Roadmap Content Structure
- **Base Templates**: `/public/roadmaps-new/{domain}.json` (served as default content)
- **Personalized Storage**: `users/{userId}/roadmaps/{domain}` in Firestore
- **Format**: JSON files with domain, overview, and detailed learning steps
- **Content Quality**: Professional-level, comprehensive coverage including:
  - Foundational concepts and advanced topics
  - Modern industry tools and frameworks
  - Best practices and current job market requirements
  - Testing, deployment, and production considerations
  - Specialized applications and career paths
- **Customization**: Prepared for Google Gemini AI integration to personalize roadmaps per user

### Environment Variables Required
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase Web API Key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase Auth Domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase Project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase Storage Bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase Messaging Sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase App ID
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics Measurement ID (e.g., G-XXXXXXXXXX)
- `GOOGLE_GEMINI_API_KEY` - (Future) Google Gemini API key for AI customization

### Subscription & Premium Gating
- **Server-side check**: AI Mentor chat route (`/api/ai-mentor/chat`) validates `subscription.tier === 'premium'` before processing
- **Client-side check**: `hasMentorAccess` prop gates AI Mentor tab in `NodeDetailDrawer`; Learning Resources, Hyperpersonalization, and roadmap pages check subscription on load
- **Free users**: See locked UI states (lock icon chips, upgrade prompts) on premium features; redirected to `/pricing` page
- **`/pricing` page**: Subscription purchase/upgrade flow
- **Onboarding**: Multi-step onboarding runs regardless of subscription tier; subscription gate enforced after profile is complete

### Component Patterns
- Components organized by feature in `src/components/`
- UI components from shadcn/ui in `src/components/ui/`
- Custom styling with Tailwind CSS and CSS modules
- Framer Motion for animations and transitions
- Premium-locked UI: lock icon chip components, upgrade CTA cards, gated feature placeholders

### Navigation & Layout System
- **ConditionalLayout**: Root-level layout handling authentication, sidebar, and navbar
- **Unified Navigation**: Single sidebar with Dashboard, My Roadmap, and Profile sections
- **Layout Structure**: ConditionalLayout provides consistent navigation across all dashboard pages
- **Mobile Support**: Responsive sidebar with mobile toggle functionality

### Development Notes
- **Subscription Gating**: Always enforce `subscription.tier === 'premium'` checks — both server-side (API routes) and client-side (UI). Do NOT remove gates.
- **Enhanced Auth Context**: Includes profile management, subscription state, and data filtering functionality
- **Content Loading**: Roadmap pages load from Firestore if personalized (premium), otherwise base templates (free users see upgrade prompt)
- **Profile System**: Complete onboarding and profile management with validation; roadmap generation requires complete profile + premium subscription
- **Data Integrity**: Firestore updates filter out undefined/null/empty values
- **Roadmap Service**: Centralized service at `src/lib/roadmap-service.ts` handles all roadmap CRUD operations
- **Gemini Service**: `src/lib/gemini-service.ts` — single entry point for all Gemini calls with token budget enforcement
- **AI Mentor Usage**: Tracked in `users/{uid}/usage/ai-mentor` (daily 50, monthly 1500 caps)

### Common Issues & Solutions
- **Next.js Cache Corruption**: If encountering ENOENT errors, remove `.next` directory and restart dev server
- **Duplicate Navigation**: ConditionalLayout handles all navigation - avoid adding additional layout wrappers
- **Profile Completion**: Users must complete onboarding before generating roadmaps