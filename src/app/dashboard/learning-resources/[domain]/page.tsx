'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { WeeklyResourceCard } from '@/components/learning-resources/weekly-resource-card';
import { EmptyResourceState } from '@/components/learning-resources/empty-resource-state';
import { ErrorResourceState } from '@/components/learning-resources/error-resource-state';
import { motion } from 'framer-motion';
import {
  getAllDomainResources,
  getDomainManifest,
} from '@/lib/weekly-resources-service';
import { getAIResourcesForDomain, type AIWeekData } from '@/lib/ai-learning-resources-service';
import { getUserProgress } from '@/lib/user-progress-service';
import { useAuth } from '@/hooks/use-auth';
import { WeeklyResource } from '@/types/weekly-resources';
import Link from 'next/link';
import { formatDistance } from 'date-fns';

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

/** Returns true if the ISO date string is within the last 14 days. */
function isRecentlyUpdated(isoDate: string): boolean {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return false;
  const diffMs = Date.now() - d.getTime();
  return diffMs < 14 * 24 * 60 * 60 * 1000;
}

interface PageProps {
  params: Promise<{ domain: string }>;
}

export default function DomainResourcesPage({ params }: PageProps) {
  const { domain } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [staticResources, setStaticResources] = useState<WeeklyResource[]>([]);
  const [aiWeeks, setAiWeeks] = useState<AIWeekData[]>([]);
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

        // Load static resources and AI weeks in parallel
        const [manifestResult, staticResult, aiResult] = await Promise.allSettled([
          getDomainManifest(domain),
          getAllDomainResources(domain),
          getAIResourcesForDomain(domain),
        ]);

        if (manifestResult.status === 'fulfilled' && manifestResult.value) {
          setNextWeekDate(manifestResult.value.nextWeekDate);
        }

        const resolvedStatic: WeeklyResource[] =
          staticResult.status === 'fulfilled' ? staticResult.value : [];
        const resolvedAi: AIWeekData[] =
          aiResult.status === 'fulfilled' ? aiResult.value : [];

        if (aiResult.status === 'rejected') {
          console.error('[Domain Page] Failed to load AI resources, showing static only:', aiResult.reason);
        }

        // Deduplicate: build a set of weekNumbers claimed by AI weeks.
        // If both static and AI have the same weekNumber, AI data takes precedence.
        const aiWeekNumbers = new Set(resolvedAi.map((w) => w.weekNumber));
        const filteredStatic = resolvedStatic.filter(
          (r) => !aiWeekNumbers.has(r.weekNumber)
        );

        setAiWeeks(resolvedAi);
        setStaticResources(filteredStatic);

        // Load progress for static weeks if user is logged in
        if (user?.uid && filteredStatic.length > 0) {
          const progressMap: Record<
            number,
            { completed: number; total: number; isCompleted: boolean }
          > = {};

          await Promise.all(
            filteredStatic.map(async (resource) => {
              try {
                const timeoutPromise = new Promise<never>((_, reject) =>
                  setTimeout(() => reject(new Error('Timeout')), 5000)
                );
                const progress = await Promise.race([
                  getUserProgress(user.uid, domain, resource.weekNumber),
                  timeoutPromise,
                ]);
                const totalResources = (resource.resources?.length || 0) + 1;
                const completedCount = progress?.completedResources.length || 0;

                progressMap[resource.weekNumber] = {
                  completed: completedCount,
                  total: totalResources,
                  isCompleted: progress?.progress === 100,
                };
              } catch {
                const totalResources = (resource.resources?.length || 0) + 1;
                progressMap[resource.weekNumber] = {
                  completed: 0,
                  total: totalResources,
                  isCompleted: false,
                };
              }
            })
          );

          setProgressData(progressMap);
        }
      } catch (err) {
        console.error('Failed to load domain resources:', err);
        setError(err instanceof Error ? err.message : 'Failed to load resources');
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

  const totalCount = aiWeeks.length + staticResources.length;

  if (totalCount === 0) {
    return <EmptyResourceState domain={domainName} nextWeekDate={nextWeekDate} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
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
          {totalCount} week{totalCount !== 1 ? 's' : ''} of curated learning resources
          {aiWeeks.length > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 text-[#8E2DE2] text-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {aiWeeks.length} AI curated
            </span>
          )}
        </p>
      </div>

      {/* AI-generated weeks — shown first */}
      {aiWeeks.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#8E2DE2]" />
            AI Curated
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiWeeks.map((week, idx) => {
              const fresh = isRecentlyUpdated(week.updatedAt);
              const updatedAgo = week.updatedAt
                ? (() => {
                    const d = new Date(week.updatedAt);
                    return isNaN(d.getTime())
                      ? null
                      : formatDistance(d, new Date(), { addSuffix: true });
                  })()
                : null;

              return (
                <motion.div
                  key={week.weekId}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ y: -3 }}
                >
                  <Card
                    onClick={() =>
                      router.push(
                        `/dashboard/learning-resources/${domain}/ai-week-${week.weekId}`
                      )
                    }
                    className="cursor-pointer hover:border-[#8E2DE2] hover:shadow-lg hover:shadow-[#8E2DE2]/10 transition-all duration-300 h-full flex flex-col justify-between border-[#8E2DE2]/20"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-[#8E2DE2]">
                            Week {week.weekNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {fresh && (
                            <Badge
                              variant="outline"
                              className="border-green-500/40 text-green-500 text-xs"
                            >
                              Fresh
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className="border-[#8E2DE2]/50 text-[#8E2DE2] gap-1"
                          >
                            <Sparkles className="h-3 w-3" />
                            AI Curated
                          </Badge>
                        </div>
                      </div>
                      <p className="font-headline text-lg font-semibold text-white">
                        {week.displayName} — {week.weekId}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{week.resources.length} resource{week.resources.length !== 1 ? 's' : ''}</span>
                        </div>
                        {updatedAgo && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{updatedAgo}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Static weeks — shown after AI weeks */}
      {staticResources.length > 0 && (
        <div>
          {aiWeeks.length > 0 && (
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Curated
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staticResources.map((resource, idx) => {
              const progress = progressData[resource.weekNumber] || {
                completed: 0,
                total: (resource.resources?.length || 0) + 1,
                isCompleted: false,
              };

              return (
                <motion.div
                  key={resource.weekNumber}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: (aiWeeks.length + idx) * 0.05,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <WeeklyResourceCard
                    weekNumber={resource.weekNumber}
                    title={resource.title}
                    difficulty={resource.difficulty}
                    estimatedTime={resource.estimatedTime}
                    publishedDate={resource.publishedDate}
                    completedResources={progress.completed}
                    totalResources={progress.total}
                    isCompleted={progress.isCompleted}
                    onClick={() => {
                      router.push(
                        `/dashboard/learning-resources/${domain}/week-${resource.weekNumber}`
                      );
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
