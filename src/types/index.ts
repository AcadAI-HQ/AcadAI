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

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  skills?: string[];
  lastGeneratedDomain?: string;

  // Onboarding fields
  profileComplete?: boolean;
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
}
