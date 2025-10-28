# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (runs on port 9002 with Turbopack)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Type checking**: `npm run typecheck`
- **AI Development**: `npm run genkit:dev` or `npm run genkit:watch` for auto-reload

## Architecture Overview

This is **Acad AI**, a completely free Next.js 15 application for comprehensive learning roadmaps with Firebase backend. Previously premium content is now available to all users at no cost.

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
- **Free for Everyone**: Completely free platform with no subscription tiers or generation limits
- **Comprehensive Content**: All users receive professional-level, detailed roadmaps (previously premium content)
- **Available Domains**: 
  - Frontend Development (React, Vue, modern web technologies)
  - Backend Development (APIs, databases, system architecture)
  - Fullstack Development (complete web application development)
  - Machine Learning (from foundations to MLOps and specialized applications)
  - DevOps (infrastructure automation, CI/CD, cloud platforms)
- **Roadmap Structure**: Hierarchical stages with detailed resources and learning paths

### Recent Changes (2025)
- **Removed Premium Model**: Eliminated all subscription-based features and payment integration
- **Enhanced Free Content**: What was previously premium content is now available to all users
- **Comprehensive User Onboarding**: Multi-step onboarding system collecting user type, background, and learning preferences
- **Profile Management System**: Complete profile viewing and editing functionality with tabbed interface
- **Enhanced Navigation**: Integrated sidebar navigation with Dashboard, My Roadmap, and Profile sections
- **Comprehensive Roadmaps**: All domains now feature detailed, professional-level learning paths
- **Personalized Roadmap Storage**: User roadmaps now stored in Firestore for future AI customization with Google Gemini

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
- Enhanced user profiles include: uid, email, displayName, skills, lastGeneratedDomain, profileComplete, userType, and type-specific fields
- Firebase config in `src/lib/firebase.ts`
- Data filtering prevents undefined/null values in Firestore updates
- No payment or subscription data stored
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
- `GOOGLE_GEMINI_API_KEY` - (Future) Google Gemini API key for AI customization

### Component Patterns
- Components organized by feature in `src/components/`
- UI components from shadcn/ui in `src/components/ui/`
- Custom styling with Tailwind CSS and CSS modules
- Framer Motion for animations and transitions
- Removed: Pricing components, limit warning dialogs, subscription management UI

### Navigation & Layout System
- **ConditionalLayout**: Root-level layout handling authentication, sidebar, and navbar
- **Unified Navigation**: Single sidebar with Dashboard, My Roadmap, and Profile sections
- **Layout Structure**: ConditionalLayout provides consistent navigation across all dashboard pages
- **Mobile Support**: Responsive sidebar with mobile toggle functionality

### Development Notes
- **No Payment Integration**: All Razorpay and payment-related code has been removed
- **Enhanced Auth Context**: Includes profile management and data filtering functionality
- **Content Loading**: Roadmap pages load from Firestore if personalized, otherwise base templates
- **User Experience**: All users see comprehensive roadmaps without restrictions
- **Profile System**: Complete onboarding and profile management with validation
- **Data Integrity**: Firestore updates filter out undefined/null/empty values
- **Messaging**: UI emphasizes "comprehensive" and "professional-level" content being free
- **Roadmap Service**: Centralized service at `src/lib/roadmap-service.ts` handles all roadmap CRUD operations
- **AI Integration Ready**: Prepared for Google Gemini integration via `src/lib/gemini-service.ts` (placeholder)

### Common Issues & Solutions
- **Next.js Cache Corruption**: If encountering ENOENT errors, remove `.next` directory and restart dev server
- **Duplicate Navigation**: ConditionalLayout handles all navigation - avoid adding additional layout wrappers
- **Profile Completion**: Users must complete onboarding before generating roadmaps