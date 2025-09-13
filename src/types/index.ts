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
}
