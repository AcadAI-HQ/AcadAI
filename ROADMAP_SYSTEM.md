# Personalized Roadmap System Documentation

## Overview

The Acad AI platform now features a personalized roadmap system that stores user-specific roadmap data in Firebase Firestore. This allows for AI-powered customization using Google Gemini while maintaining base templates for all users.

## Architecture

### Data Flow

```
1. User requests roadmap
   ↓
2. Check Firestore for personalized version
   ↓
3a. If exists → Load from Firestore
3b. If not → Load base template from /public/roadmaps-new/
   ↓
4. Initialize user's copy in Firestore (background)
   ↓
5. Display roadmap with personalization badge
   ↓
6. Future: AI customization via Google Gemini
```

### Firestore Structure

```
users/{userId}/
  ├─ (user profile fields)
  └─ roadmaps/{domain}/
      ├─ userId: string
      ├─ domain: string
      ├─ baseRoadmapVersion: string
      ├─ customized: boolean
      ├─ lastModified: Timestamp
      ├─ content: RoadmapFile
      └─ modifications: Array<RoadmapModification>
```

#### Fields Explained

- **userId**: User's Firebase UID
- **domain**: Roadmap domain (e.g., 'frontend', 'backend', 'ml')
- **baseRoadmapVersion**: Version tracking for base templates (currently 'v1.0.0')
- **customized**: Boolean flag indicating if AI/manual customizations have been applied
- **lastModified**: Timestamp of last update
- **content**: The full roadmap JSON structure
- **modifications**: Array tracking change history with metadata

## TypeScript Types

### Core Types

```typescript
// Roadmap JSON file structure (from public/roadmaps-new/)
interface RoadmapFile {
  domain: string;
  type: string;
  overview: string;
  steps: RoadmapStep[];
}

interface RoadmapStep {
  title: string;
  description: string;
  subtopics: string[];
  examples?: RoadmapExample[];
  resources?: string[];
}

// Personalized roadmap stored in Firestore
interface UserRoadmap {
  userId: string;
  domain: string;
  baseRoadmapVersion: string;
  customized: boolean;
  lastModified: Date;
  content: RoadmapFile;
  modifications?: RoadmapModification[];
}

interface RoadmapModification {
  timestamp: Date;
  type: 'ai_customization' | 'manual_edit' | 'base_update';
  description: string;
  modifiedBy: 'gemini' | 'user' | 'system';
}
```

## Roadmap Service API

Located in [`src/lib/roadmap-service.ts`](src/lib/roadmap-service.ts)

### Core Functions

#### `getRoadmapForUser(userId, domain)`

Retrieves roadmap for a user - returns personalized version if exists, otherwise base template.

```typescript
const { roadmap, isPersonalized } = await getRoadmapForUser(userId, 'frontend');
// Returns: { roadmap: RoadmapFile, isPersonalized: boolean }
```

#### `getUserRoadmap(userId, domain)`

Fetches user's personalized roadmap from Firestore.

```typescript
const userRoadmap = await getUserRoadmap(userId, 'backend');
// Returns: UserRoadmap | null
```

#### `loadBaseRoadmap(domain)`

Loads base roadmap template from `/public/roadmaps-new/{domain}.json`.

```typescript
const baseRoadmap = await loadBaseRoadmap('ml');
// Returns: RoadmapFile
```

#### `initializeUserRoadmap(userId, domain)`

Creates a user's roadmap copy from base template in Firestore.

```typescript
const userRoadmap = await initializeUserRoadmap(userId, 'devops');
// Returns: UserRoadmap
```

#### `updateUserRoadmap(userId, domain, newContent, type, description)`

Updates user's roadmap with new content (for AI customization or manual edits).

```typescript
await updateUserRoadmap(
  userId,
  'frontend',
  modifiedRoadmapContent,
  'ai_customization',
  'Customized based on user skills and preferences'
);
```

#### `saveUserRoadmap(userRoadmap)`

Saves or updates a user's roadmap in Firestore.

```typescript
await saveUserRoadmap(userRoadmapObject);
```

#### `isRoadmapCustomized(userId, domain)`

Checks if user has a customized roadmap.

```typescript
const customized = await isRoadmapCustomized(userId, 'cybersecurity');
// Returns: boolean
```

#### `deleteUserRoadmap(userId, domain)`

Resets user's roadmap to base template.

```typescript
await deleteUserRoadmap(userId, 'data-science');
```

#### `getUserRoadmapDomains(userId)`

Gets all domains where user has initialized roadmaps.

```typescript
const domains = await getUserRoadmapDomains(userId);
// Returns: string[] (e.g., ['frontend', 'backend', 'ml'])
```

## Usage Examples

### Example 1: Loading a Roadmap

```typescript
import { getRoadmapForUser } from '@/lib/roadmap-service';

async function loadUserRoadmap(userId: string, domain: string) {
  try {
    const { roadmap, isPersonalized } = await getRoadmapForUser(userId, domain);

    console.log('Roadmap loaded:', roadmap.domain);
    console.log('Personalized:', isPersonalized);

    return roadmap;
  } catch (error) {
    console.error('Failed to load roadmap:', error);
  }
}
```

### Example 2: Customizing with Gemini AI

```typescript
import { getUserRoadmap, updateUserRoadmap } from '@/lib/roadmap-service';
import { customizeRoadmapWithGemini } from '@/lib/gemini-service'; // Future implementation

async function personalizeRoadmap(userId: string, domain: string, userProfile: UserProfile) {
  try {
    // Get current roadmap (or base template)
    const currentRoadmap = await getUserRoadmap(userId, domain);

    // Customize using Gemini AI based on user profile
    const customizedContent = await customizeRoadmapWithGemini(
      currentRoadmap?.content || await loadBaseRoadmap(domain),
      userProfile
    );

    // Save customized version
    await updateUserRoadmap(
      userId,
      domain,
      customizedContent,
      'ai_customization',
      'Personalized based on user profile and experience level'
    );

    console.log('Roadmap personalized successfully!');
  } catch (error) {
    console.error('Failed to personalize roadmap:', error);
  }
}
```

### Example 3: Tracking Modifications

```typescript
import { getUserRoadmap } from '@/lib/roadmap-service';

async function showModificationHistory(userId: string, domain: string) {
  const userRoadmap = await getUserRoadmap(userId, domain);

  if (userRoadmap?.modifications) {
    console.log('Modification History:');
    userRoadmap.modifications.forEach(mod => {
      console.log(`${mod.timestamp}: ${mod.description} (by ${mod.modifiedBy})`);
    });
  }
}
```

## Security Rules

Firestore security rules in [`firestore.rules`](firestore.rules):

```javascript
match /users/{userId}/roadmaps/{domain} {
  // Users can only access their own roadmaps
  allow read: if isOwner(userId);
  allow create: if isOwner(userId);
  allow update: if isOwner(userId);
  allow delete: if isOwner(userId);
}
```

This ensures users can only access and modify their own roadmaps.

## Integration Points

### 1. Roadmap Page Component

[`src/app/roadmap/[domain]/page.tsx`](src/app/roadmap/[domain]/page.tsx)

```typescript
// Automatic loading with personalization detection
const { roadmap: roadmapData, isPersonalized: personalized } =
  await getRoadmapForUser(user.uid, domain);

// Display personalization badge
{isPersonalized && (
  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
    <Sparkles className="h-3 w-3" />
    Personalized
  </span>
)}
```

### 2. Dashboard Integration

When user selects a domain:

```typescript
// In dashboard/page.tsx
const handleDomainClick = async (domain: string) => {
  // Update lastGeneratedDomain
  await useGeneration(domain);

  // Navigate to roadmap page (will auto-load personalized version)
  router.push('/dashboard/my-roadmap');
};
```

## Future Enhancements

### 1. Google Gemini Integration

Create [`src/lib/gemini-service.ts`](src/lib/gemini-service.ts) to handle AI customization:

```typescript
export async function customizeRoadmapWithGemini(
  baseRoadmap: RoadmapFile,
  userProfile: UserProfile
): Promise<RoadmapFile> {
  // TODO: Implement Gemini API call
  // - Analyze user profile (skills, experience, goals)
  // - Customize roadmap steps based on user needs
  // - Add/remove topics based on experience level
  // - Suggest personalized resources
  // - Adjust learning path order

  return customizedRoadmap;
}
```

### 2. Roadmap Versioning

When base templates are updated:

```typescript
async function migrateUserRoadmaps(newVersion: string) {
  // Check all user roadmaps
  // Compare baseRoadmapVersion
  // Offer users option to update to new version
  // Preserve customizations while incorporating new content
}
```

### 3. Progress Tracking

Add user progress to roadmap steps:

```typescript
interface UserRoadmapProgress {
  domain: string;
  completedSteps: string[];
  currentStep: string;
  lastAccessed: Date;
  totalProgress: number; // 0-100
}
```

### 4. Collaborative Features

- Share customized roadmaps with other users
- Community-contributed roadmap templates
- Mentor feedback on roadmap progress

## Deployment

### Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Environment Variables

Ensure these are set in `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Future: Gemini API

```
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

## Testing

### Manual Testing Checklist

- [ ] New user loads roadmap (should get base template)
- [ ] Roadmap is saved to Firestore on first load
- [ ] Personalization badge appears when `customized: true`
- [ ] Updates to roadmap are persisted
- [ ] Modification history is tracked
- [ ] Security rules prevent cross-user access
- [ ] Base template fallback works correctly

### Test User Scenarios

1. **First-time user**: Should see base template, auto-initialize in Firestore
2. **Returning user**: Should load personalized version from Firestore
3. **Multiple domains**: Each domain should have separate roadmap
4. **Customization**: Changes should be saved and reflected on reload

## Troubleshooting

### Issue: Roadmap not loading

Check:
1. User is authenticated
2. Domain name matches available domains
3. Firestore rules are deployed
4. Base template exists in `/public/roadmaps-new/`

### Issue: Changes not persisting

Check:
1. Firestore write permissions
2. Network connectivity
3. Browser console for errors
4. Firestore emulator (if using local dev)

### Issue: "Permission denied" errors

Check:
1. Firestore rules are correctly deployed
2. User is authenticated
3. UserId matches auth.uid in rules

## Resources

- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

## Contributing

When adding new features to the roadmap system:

1. Update TypeScript types in [`src/types/index.ts`](src/types/index.ts)
2. Add new functions to [`src/lib/roadmap-service.ts`](src/lib/roadmap-service.ts)
3. Update Firestore rules if needed
4. Document changes in this file
5. Add test cases

## Changelog

### v1.0.0 (2025-10-25)

- Initial implementation of personalized roadmap system
- Firestore integration for user roadmap storage
- Base template fallback mechanism
- Modification tracking and versioning
- Security rules for roadmap data protection
- UI updates with personalization badge
