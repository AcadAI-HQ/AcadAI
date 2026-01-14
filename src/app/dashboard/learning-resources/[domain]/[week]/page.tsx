'use client';

import { use } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResourceDetailView } from '@/components/learning-resources/resource-detail-view';
import { ErrorResourceState } from '@/components/learning-resources/error-resource-state';
import { useWeeklyResource } from '@/hooks/use-weekly-resources';
import { useResourceProgress } from '@/hooks/use-resource-progress';
import Link from 'next/link';

const domainNames: Record<string, string> = {
  frontend: 'Frontend Development',
  backend: 'Backend Development',
  fullstack: 'Fullstack Development',
  ml: 'Machine Learning',
  devops: 'DevOps',
  android: 'Android Development',
  ios: 'iOS Development',
  blockchain: 'Blockchain Development',
  'ui-ux': 'UI/UX Design',
  'product-engineering': 'Product Engineering',
  'game-dev-aaa': 'AAA Game Development',
  'game-dev-indie': 'Indie Game Development',
  cybersecurity: 'Cybersecurity',
  'data-science': 'Data Science',
};

interface PageProps {
  params: Promise<{ domain: string; week: string }>;
}

export default function WeekDetailPage({ params }: PageProps) {
  const { domain, week } = use(params);
  console.log('[Week Detail] Params received:', { domain, week });

  // Extract number from "week-1" format
  const weekNumber = week && week.startsWith('week-')
    ? parseInt(week.replace('week-', ''), 10)
    : NaN;
  console.log('[Week Detail] Parsed weekNumber:', weekNumber);

  // Early validation check
  if (isNaN(weekNumber)) {
    return (
      <ErrorResourceState
        errorType="invalid-week"
        domain={domain}
        weekNumber={weekNumber}
      />
    );
  }

  const { resource, loading: resourceLoading, error: resourceError } = useWeeklyResource(
    domain,
    weekNumber
  );

  const {
    progress,
    isLoading: progressLoading,
    toggleCompletion,
    markWeekComplete,
  } = useResourceProgress(domain, weekNumber);

  const domainName = domainNames[domain] || domain;

  // Only show loading if resource is loading. Progress can load in background
  if (resourceLoading) {
    console.log('Loading resource for', domain, 'week', weekNumber);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29ABE2]"></div>
      </div>
    );
  }

  console.log('Resource loaded:', resource ? 'yes' : 'no');
  console.log('Progress loading:', progressLoading);
  console.log('Progress data:', progress);

  if (resourceError || !resource) {
    return (
      <ErrorResourceState
        errorType={resourceError?.includes('not available') ? 'not-found' : 'load-error'}
        domain={domain}
        weekNumber={weekNumber}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb / Back Button */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-400">
        <Link href="/dashboard/learning-resources">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Learning Resources
          </Button>
        </Link>
        <span>/</span>
        <Link href={`/dashboard/learning-resources/${domain}`}>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            {domainName}
          </Button>
        </Link>
        <span>/</span>
        <span className="text-white">Week {weekNumber}</span>
      </div>

      {/* Resource Detail View */}
      <ResourceDetailView
        resource={resource}
        completedResources={progress?.completedResources || []}
        onToggleCompletion={toggleCompletion}
        onMarkWeekComplete={markWeekComplete}
      />
    </div>
  );
}
