export interface RoadmapModule {
  title: string;
  description: string;
  isCore: boolean;
}

export interface RoadmapStage {
  title:string;
  description: string;
  isCore: boolean;
  modules: RoadmapModule[];
}

export interface Roadmap {
  title: string;
  description: string;
  stages: RoadmapStage[];
}

export type SubscriptionStatus = 'free' | 'premium';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  subscriptionStatus: SubscriptionStatus;
  generationsLeft: number;
  skills?: string[];
  lastGeneratedDomain?: string;
}
