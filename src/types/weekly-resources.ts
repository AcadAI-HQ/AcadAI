export interface WeeklyResource {
  domain: string;
  weekNumber: number;
  title: string;
  description: string;
  publishedDate: string; // ISO format: "2025-01-12"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // Total time in minutes
  mainArticle: ResourceItem;
  resources: ResourceItem[];
  topics: string[];
  keywords: string[];
}

export interface ArticleContent {
  markdown: string; // Full markdown content of the article
}

export interface ResourceItem {
  id: string; // Format: "main-article" for mainArticle, "resource-1", "resource-2", etc.
  title: string;
  description: string;
  url?: string; // Optional: External URL (if no inline content)
  type: 'article' | 'video' | 'tutorial' | 'project' | 'course';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // Minutes
  content?: ArticleContent; // Optional: Inline article content in markdown
}

export interface WeeklyProgress {
  id?: string; // Document ID: "{domain}-{weekNumber}"
  userId: string;
  domain: string;
  weekNumber: number;
  startedAt: Date;
  completedAt?: Date;
  completedResources: string[]; // Array of resource IDs
  progress: number; // 0-100
  lastAccessedAt?: Date;
}

export interface WeeklyResourceManifest {
  lastUpdated: string;
  domains: {
    [domain: string]: DomainManifest;
  };
}

export interface DomainManifest {
  maxWeek: number;
  availableWeeks: number[];
  nextWeekDate: string;
}

export interface CompletionStats {
  domain: string;
  totalWeeks: number;
  completedWeeks: number;
  completionPercentage: number;
  totalResourcesCompleted: number;
}
