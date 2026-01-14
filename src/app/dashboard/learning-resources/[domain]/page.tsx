'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WeeklyResourceCard } from '@/components/learning-resources/weekly-resource-card';
import { EmptyResourceState } from '@/components/learning-resources/empty-resource-state';
import { ErrorResourceState } from '@/components/learning-resources/error-resource-state';
import {
  getAllDomainResources,
  getDomainManifest,
} from '@/lib/weekly-resources-service';
import { getUserProgress } from '@/lib/user-progress-service';
import { useAuth } from '@/hooks/use-auth';
import { WeeklyResource } from '@/types/weekly-resources';
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
  params: Promise<{ domain: string }>;
}

export default function DomainResourcesPage({ params }: PageProps) {
  const { domain } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [resources, setResources] = useState<WeeklyResource[]>([]);
  const [progressData, setProgressData] = useState<
    Record<number, { completed: number; total: number; isCompleted: boolean }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextWeekDate, setNextWeekDate] = useState<string>('');

  const domainName = domainNames[domain] || domain;

  useEffect(() => {
    async function loadResources() {
      try {
        setLoading(true);
        setError(null);

        // Get domain manifest
        const manifest = await getDomainManifest(domain);
        if (manifest) {
          setNextWeekDate(manifest.nextWeekDate);
        }

        // Load all resources for the domain
        const resourcesData = await getAllDomainResources(domain);
        setResources(resourcesData);

        // Load progress data for each week if user is logged in
        if (user?.uid) {
          const progressMap: Record<
            number,
            { completed: number; total: number; isCompleted: boolean }
          > = {};

          const progressPromises = resourcesData.map(async (resource) => {
            try {
              const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 5000)
              );
              const progressPromise = getUserProgress(
                user.uid,
                domain,
                resource.weekNumber
              );

              const progress = await Promise.race([progressPromise, timeoutPromise]);
              const totalResources = resource.resources.length + 1; // +1 for main article
              const completedCount = progress?.completedResources.length || 0;

              progressMap[resource.weekNumber] = {
                completed: completedCount,
                total: totalResources,
                isCompleted: progress?.progress === 100,
              };
            } catch (error) {
              console.warn(`Failed to load progress for week ${resource.weekNumber}:`, error);
              const totalResources = resource.resources.length + 1;
              progressMap[resource.weekNumber] = {
                completed: 0,
                total: totalResources,
                isCompleted: false,
              };
            }
          });

          await Promise.all(progressPromises);
          setProgressData(progressMap);
        }
      } catch (err) {
        console.error('Failed to load domain resources:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load resources'
        );
      } finally {
        setLoading(false);
      }
    }

    loadResources();
  }, [domain, user?.uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29ABE2]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorResourceState
        errorType="load-error"
        domain={domain}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (resources.length === 0) {
    return <EmptyResourceState domain={domainName} nextWeekDate={nextWeekDate} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb / Back Button */}
      <div className="mb-6">
        <Link href="/dashboard/learning-resources">
          <Button variant="ghost" className="gap-2 text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Learning Resources
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">{domainName}</h1>
        <p className="text-gray-400 text-lg">
          {resources.length} week{resources.length !== 1 ? 's' : ''} of curated
          learning resources
        </p>
      </div>

      {/* Weekly Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => {
          const progress = progressData[resource.weekNumber] || {
            completed: 0,
            total: resource.resources.length + 1,
            isCompleted: false,
          };

          return (
            <WeeklyResourceCard
              key={resource.weekNumber}
              weekNumber={resource.weekNumber}
              title={resource.title}
              difficulty={resource.difficulty}
              estimatedTime={resource.estimatedTime}
              publishedDate={resource.publishedDate}
              completedResources={progress.completed}
              totalResources={progress.total}
              isCompleted={progress.isCompleted}
              onClick={() => {
                const url = `/dashboard/learning-resources/${domain}/week-${resource.weekNumber}`;
                console.log('[Domain Page] Navigating to:', url, 'weekNumber:', resource.weekNumber);
                router.push(url);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
