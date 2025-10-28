# Personalized Roadmap System

## 🎯 Overview

Every user now receives a **100% personalized roadmap** based on an AI-powered assessment. No two users see the same roadmap - each path is customized to their experience, goals, and learning pace.

## ✨ How It Works

### User Journey

```
1. User clicks on a domain (e.g., Frontend Development)
         ↓
2. System checks: Does user have a customized roadmap?
         ↓
   ┌─── YES → Load their personalized roadmap
   │
   └─── NO  → Start Assessment Flow
              ↓
         Show Assessment Dialog
              ↓
         AI asks 5 questions:
         1. Current experience level?
         2. What topics do you know?
         3. What's your learning goal?
         4. How much time per week?
         5. Any tech preferences?
              ↓
         User answers each question
              ↓
         Gemini AI customizes roadmap (10-20 seconds)
              ↓
         Save customized roadmap to Firestore
              ↓
         Show personalized roadmap
              ↓
3. User sees ONLY their customized roadmap (never the base template)
```

### Assessment Questions

The system asks 5 targeted questions:

1. **Experience Level**: "What is your current experience level with {domain}?"
2. **Existing Knowledge**: "What specific topics are you already familiar with?"
3. **Learning Goal**: "What is your primary learning goal?"
4. **Time Commitment**: "How much time can you dedicate per week?"
5. **Tech Preferences**: "Any specific technologies you want to focus on or avoid?"

### AI Customization

Based on answers, Gemini AI:

- **Reorders** steps (skips basics for experienced users)
- **Marks** familiar topics as "Quick Review"
- **Emphasizes** topics matching user goals
- **Adjusts** depth based on time commitment
- **Personalizes** examples and resources
- **Tailors** the overview with user's context

## 📁 Architecture

### Components

1. **[src/components/roadmap/roadmap-assessment-dialog.tsx](src/components/roadmap/roadmap-assessment-dialog.tsx)**
   - Full-screen modal with chat interface
   - Progress bar showing questions completed
   - Sequential question flow
   - Loading state during customization
   - Success animation when complete

2. **[src/app/api/roadmap/customize/route.ts](src/app/api/roadmap/customize/route.ts)**
   - POST `/api/roadmap/customize`
   - Loads base roadmap template
   - Calls Gemini AI for customization
   - Saves result to Firestore
   - Returns personalized roadmap

3. **[src/app/roadmap/[domain]/page.tsx](src/app/roadmap/[domain]/page.tsx)**
   - Checks if user has customized roadmap
   - Shows assessment if not customized
   - Displays personalized roadmap only
   - No access to base templates for users

### Data Flow

```typescript
// 1. Check customization status
const hasCustomRoadmap = await isRoadmapCustomized(userId, domain);

// 2a. If customized → Load from Firestore
if (hasCustomRoadmap) {
  const { roadmap } = await getRoadmapForUser(userId, domain);
  displayRoadmap(roadmap);
}

// 2b. If not customized → Start assessment
else {
  showAssessmentDialog();

  // After questions answered:
  const response = await fetch('/api/roadmap/customize', {
    method: 'POST',
    body: JSON.stringify({ userId, domain, answers })
  });

  const { customizedRoadmap } = await response.json();

  // Save and display
  await updateUserRoadmap(userId, domain, customizedRoadmap);
  displayRoadmap(customizedRoadmap);
}
```

### Firestore Structure

```
users/{userId}/
  └─ roadmaps/{domain}/
      ├─ userId: string
      ├─ domain: string
      ├─ customized: true          // Always true for assessed users
      ├─ baseRoadmapVersion: "v1.0.0"
      ├─ lastModified: Timestamp
      ├─ content: RoadmapFile      // Personalized content
      └─ modifications: [
          {
            timestamp: Date,
            type: 'ai_customization',
            description: 'Roadmap customized based on initial assessment',
            modifiedBy: 'gemini'
          }
        ]
```

## 🎨 UI Components

### Assessment Dialog

**Features**:
- Cannot be closed during assessment (prevents skipping)
- Progress bar shows completion percentage
- Chat-style interface (familiar UX)
- Bot avatar for questions, User avatar for answers
- Loading spinner during AI customization
- Success message when complete

**Styling**:
- 600px height, 2xl max width
- Sparkles icon in header
- Primary color scheme
- Smooth scrolling message area
- Auto-focus on input field

### Customization States

1. **Asking Questions**
   - Shows current question number (e.g., "Question 2/5")
   - Progress bar updates after each answer
   - Send button enabled only when input has text

2. **Customizing**
   - Large spinning loader
   - "Creating your personalized roadmap..."
   - "This may take 10-20 seconds"
   - Input area hidden

3. **Complete**
   - Success message with celebration emoji
   - "Your personalized roadmap is ready!"
   - Brief delay before showing roadmap

## 🤖 AI Customization Logic

### Prompt Engineering

The system sends Gemini a comprehensive prompt with:

```
USER ASSESSMENT ANSWERS:
Q1: What is your current experience level with frontend?
A1: I'm intermediate, I know HTML, CSS, and basic JavaScript

Q2: What specific topics are you already familiar with?
A2: React basics, state management, component lifecycle

Q3: What is your primary learning goal?
A3: Build production-ready web applications

Q4: How much time can you dedicate per week?
A4: About 15 hours

Q5: Any specific technologies you want to focus on?
A5: Want to learn TypeScript and Next.js

USER PROFILE:
- Type: professional
- Current Skills: JavaScript, React, HTML, CSS
- Domain Experience: intermediate

BASE ROADMAP:
- 12 steps from basics to advanced
- Covers HTML → CSS → JS → React → Advanced topics

CUSTOMIZATION INSTRUCTIONS:
1. Skip/mark as "Quick Review": HTML, CSS basics, JavaScript fundamentals
2. Keep as core: Advanced React, TypeScript, Next.js
3. Emphasize: Production best practices, testing, deployment
4. Adjust: Focus on real-world projects
5. Time-aware: 15 hours/week = 3-4 months timeline
```

### Customization Rules

**For Beginners**:
- Keep all fundamental topics
- Add extra guidance and explanations
- Include more basic examples
- Emphasize learning resources
- Conservative timeline estimates

**For Intermediate**:
- Mark basics as "Quick Review"
- Focus on advanced topics
- Include complex project examples
- Prioritize best practices
- Moderate timeline estimates

**For Advanced**:
- Skip basics entirely
- Focus on specialized topics
- Include architecture patterns
- Emphasize performance and scalability
- Aggressive timeline estimates

**Time-Based Adjustments**:
- 5-10 hrs/week: Focus on essentials
- 10-20 hrs/week: Balanced depth
- 20+ hrs/week: Comprehensive coverage

**Goal-Based Adjustments**:
- Career change: Emphasize job-ready skills
- Building projects: More hands-on examples
- Enhancing skills: Advanced concepts

## 🔧 Configuration

### Model Settings

```typescript
model: 'gemini-2.0-flash-exp'

generationConfig: {
  temperature: 0.4,       // Lower = more consistent
  topP: 0.95,
  maxOutputTokens: 8000,  // Large enough for full roadmap
}

maxDuration: 60  // API route timeout
```

### Assessment Questions

Defined in [src/components/roadmap/roadmap-assessment-dialog.tsx](src/components/roadmap/roadmap-assessment-dialog.tsx:20-26):

```typescript
const ASSESSMENT_QUESTIONS = [
  "What is your current experience level with {domain}?",
  "What specific topics in {domain} are you already familiar with?",
  "What is your primary learning goal?",
  "How much time can you dedicate to learning per week?",
  "Are there any specific technologies or frameworks you want to focus on or avoid?",
];
```

To add/modify questions, update this array.

## 🚀 Testing

### Manual Test Flow

1. **First Time User**:
   ```bash
   npm run dev
   # Navigate to http://localhost:9002/roadmap/frontend
   # Should show assessment dialog
   # Answer all 5 questions
   # Wait for customization (10-20 seconds)
   # See personalized roadmap
   ```

2. **Returning User**:
   ```bash
   # Navigate to same domain again
   # Should load customized roadmap directly
   # No assessment shown
   ```

3. **Different Domain**:
   ```bash
   # Navigate to http://localhost:9002/roadmap/backend
   # Should show NEW assessment (different domain)
   # Each domain has separate assessment + roadmap
   ```

### Test Cases

- [ ] New user sees assessment
- [ ] Assessment shows 5 questions
- [ ] Progress bar updates correctly
- [ ] Cannot skip assessment
- [ ] Customization loading shows
- [ ] Customized roadmap saves to Firestore
- [ ] Returning user skips assessment
- [ ] Different domains trigger new assessments
- [ ] Error handling works (show base roadmap)
- [ ] Mobile responsive

## 📊 Example Outputs

### Beginner Frontend Developer

**Input**:
- Experience: Complete beginner
- Knowledge: None
- Goal: Career change to web development
- Time: 20 hours/week
- Preferences: Want to learn React

**Output Roadmap**:
- 15 steps (comprehensive)
- Starts with HTML/CSS fundamentals
- Detailed explanations at each step
- Basic project examples
- Timeline: 4-5 months
- Emphasizes job-ready skills

### Intermediate Backend Developer

**Input**:
- Experience: Intermediate
- Knowledge: Node.js, Express, SQL
- Goal: Learn microservices
- Time: 10 hours/week
- Preferences: Focus on Docker, Kubernetes

**Output Roadmap**:
- 10 steps (focused)
- Marks Node/Express as "Quick Review"
- Emphasizes: API design, microservices, containerization
- Advanced project examples
- Timeline: 2-3 months
- Docker/K8s integrated throughout

## 🔮 Future Enhancements

### 1. Re-Assessment Option

Allow users to retake assessment:

```typescript
// Add button to roadmap page
<Button onClick={handleReAssess}>
  Retake Assessment
</Button>

const handleReAssess = async () => {
  // Clear existing customization
  await deleteUserRoadmap(userId, domain);
  // Show assessment again
  setShowAssessment(true);
};
```

### 2. Progress Tracking

Track which steps user has completed:

```typescript
interface UserRoadmapProgress {
  completedSteps: string[];
  currentStep: string;
  percentComplete: number;
}

// Update as user progresses
await updateProgress(userId, domain, {
  completedSteps: ['step-1', 'step-2'],
  currentStep: 'step-3',
  percentComplete: 20
});
```

### 3. Dynamic Adjustments

AI re-customizes based on progress:

```typescript
// After user completes 50% of roadmap
if (percentComplete >= 50) {
  const updatedRoadmap = await recustomizeBasedOnProgress(
    userId,
    domain,
    completedSteps,
    strugglingTopics
  );
}
```

### 4. Skill Verification Quizzes

Add quizzes to verify claimed knowledge:

```typescript
// During assessment, after user claims to know React
if (userSays("I know React")) {
  showQuickQuiz("React Basics", 3questions);

  if (score < 2/3) {
    // Don't skip React in roadmap
  }
}
```

### 5. Comparison View

Show what was customized:

```typescript
<Button onClick={() => setShowComparison(true)}>
  What Changed?
</Button>

// Show diff between base and personalized
<ComparisonView
  base={baseRoadmap}
  personalized={customizedRoadmap}
/>
```

## 🎓 Best Practices

### For Users

1. **Be Honest**: Answer truthfully about your experience
2. **Be Specific**: List actual technologies you know
3. **Be Realistic**: Accurate time commitment helps AI plan better
4. **Be Clear**: State your goals explicitly

### For Developers

1. **Monitor API Costs**: Gemini API calls cost money
2. **Cache Responses**: Consider caching for identical answers
3. **Error Handling**: Always have fallback to base roadmap
4. **Validation**: Ensure Gemini returns valid JSON
5. **User Feedback**: Add rating system for customizations

## 📈 Analytics Ideas

Track effectiveness:

```typescript
interface CustomizationMetrics {
  assessmentCompletionRate: number;  // % who finish assessment
  avgCustomizationTime: number;      // How long AI takes
  userSatisfaction: number;          // Post-assessment rating
  roadmapCompletionRate: number;     // % who finish roadmap
  commonAnswerPatterns: object;      // What users typically say
}
```

## 🔒 Security

- ✅ User can only access their own roadmaps
- ✅ Firestore rules prevent cross-user access
- ✅ API validates userId matches authenticated user
- ✅ No sensitive data in assessment answers
- ✅ Gemini API key server-side only

## 📝 Summary

**What Users Experience**:
1. Click domain → Assessment dialog appears
2. Answer 5 quick questions
3. Wait 10-20 seconds while AI customizes
4. See their personalized roadmap
5. Never see generic templates again

**What Happens Behind the Scenes**:
1. Check Firestore for existing customization
2. If none, show assessment
3. Collect answers
4. Send to Gemini with prompt + base roadmap
5. Parse customized JSON response
6. Save to Firestore
7. Display to user

**Result**: Every user gets a unique, tailored learning path that matches their exact experience, goals, and availability. 🎉
