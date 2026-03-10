export interface RoadmapModule {
  title: string;
  description: string;
  isCore: boolean;
  subtopics?: string[];
  examples?: RoadmapExample[];
  resources?: string[];
}

export interface RoadmapExample {
  name: string;
  features: string;
  stack: string;
}

export interface RoadmapStage {
  title: string;
  description: string;
  isCore: boolean;
  modules: RoadmapModule[];
}

export interface Roadmap {
  title: string;
  description: string;
  stages: RoadmapStage[];
}

// Roadmap JSON file structure (from public/roadmaps-new/)
export interface RoadmapStep {
  title: string;
  description: string;
  subtopics: string[];
  examples?: RoadmapExample[];
  resources?: string[];
}

export interface RoadmapFile {
  domain: string;
  type: string;
  overview: string;
  steps: RoadmapStep[];
}

// Personalized roadmap stored in Firestore
export interface UserRoadmap {
  userId: string;
  domain: string;
  baseRoadmapVersion: string; // For tracking when base templates are updated
  customized: boolean; // Whether user has made customizations
  lastModified: Date;
  content: RoadmapFile; // The actual roadmap data
  modifications?: RoadmapModification[]; // Optional: track change history
}

export interface RoadmapModification {
  timestamp: Date;
  type: 'ai_customization' | 'manual_edit' | 'base_update';
  description: string;
  modifiedBy: 'gemini' | 'user' | 'system';
}

// Subscription types
export type SubscriptionTier = 'free' | 'premium';

export interface SubscriptionData {
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired' | 'payment_failed';

  // Payment processor fields (for future integration)
  subscriptionId?: string;
  customerId?: string;
  priceId?: string;

  // Legacy Razorpay fields (for backwards compatibility)
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;

  // Subscription details
  interval?: 'month' | 'year';
  amount?: number; // Amount in smallest currency unit (cents for USD, paise for INR)
  currency?: string; // 'usd', 'inr', 'eur', etc.

  // Dates
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  cancelledAt?: Date;
  lastPaymentDate?: Date;
  lastPaymentAttempt?: Date;
  updatedAt?: Date;

  // Auto-renewal
  autoRenew?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  skills?: string[];
  lastGeneratedDomain?: string;

  // Subscription fields
  subscription?: SubscriptionData;

  // Onboarding fields
  profileComplete?: boolean;
  premiumOnboardingComplete?: boolean;
  userType?: 'student' | 'professional' | 'learner';

  // Student fields
  degree?: string;
  startDate?: string;
  endDate?: string;
  currentYear?: string;

  // Professional fields
  currentRole?: string;
  yearsOfExperience?: number;

  // Learner fields
  description?: string;

  // Common fields
  interestedDomain?: string; // Deprecated - kept for backward compatibility
  interestedDomains?: string[]; // New field for multiple domains
  domainExperience?: string;

  // Access controls (admin bypass)
  roles?: { admin?: boolean };
  flags?: { bypassPremium?: boolean };
}

// Learning path progress tracking
export interface StepProgress {
  stepId: string; // Format: "sectionIndex-subtopicIndex" e.g., "0-2" for first section, third subtopic
  completedAt: Date;
}

export interface RoadmapProgress {
  domain: string;
  completedSteps: string[]; // Array of stepIds that are completed
  currentStepId: string | null; // The step user is currently on
  lastUpdated: Date;
  totalSteps: number;
  completedCount: number;
}

// Chat system types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    roadmapModified?: boolean; // If the message resulted in roadmap changes
    suggestedChanges?: string[]; // List of suggested modifications
  };
}

export interface ChatSession {
  userId: string;
  domain: string; // Which roadmap domain this chat is about
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  context?: {
    userProfile?: Partial<UserProfile>; // Relevant user context
    roadmapVersion?: string; // Which version of roadmap is being discussed
  };
}
