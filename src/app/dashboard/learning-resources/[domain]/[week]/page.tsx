'use client';

import { use } from 'react';
import { ArrowLeft, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ResourceDetailView } from '@/components/learning-resources/resource-detail-view';
import { ErrorResourceState } from '@/components/learning-resources/error-resource-state';
import { useWeeklyResource } from '@/hooks/use-weekly-resources';
import { useResourceProgress } from '@/hooks/use-resource-progress';
import { motion } from 'framer-motion';
import { getAIWeekById, type AIWeekData, type AIResource } from '@/lib/ai-learning-resources-service';
import { useEffect, useState } from 'react';
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

// ---------------------------------------------------------------------------
// Badge colour maps
// ---------------------------------------------------------------------------

const typeBadgeColors: Record<AIResource['type'], string> = {
  article: 'border-blue-500/40 text-blue-400',
  video: 'border-red-500/40 text-red-400',
  course: 'border-yellow-500/40 text-yellow-400',
  tool: 'border-cyan-500/40 text-cyan-400',
  documentation: 'border-gray-500/40 text-gray-300',
};

const difficultyColors: Record<AIResource['difficulty'], string> = {
  beginner: 'border-green-500/40 text-green-500',
  intermediate: 'border-yellow-500/40 text-yellow-500',
  advanced: 'border-red-500/40 text-red-500',
};

// ---------------------------------------------------------------------------
// AI week view
// ---------------------------------------------------------------------------

interface AIWeekViewProps {
  domain: string;
  weekId: string;
}

function AIWeekView({ domain, weekId }: AIWeekViewProps) {
  const [weekData, setWeekData] = useState<AIWeekData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const domainName = domainNames[domain] || domain;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAIWeekById(domain, weekId);
        if (!cancelled) {
          if (!data) {
            setError('Week not found');
          } else {
            setWeekData(data);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load week');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [domain, weekId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8E2DE2]" />
      </div>
    );
  }

  if (error || !weekData) {
    return (
      <ErrorResourceState
        errorType="not-found"
        domain={domain}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const updatedAgo = weekData.updatedAt
    ? (() => {
        const d = new Date(weekData.updatedAt);
        return isNaN(d.getTime())
          ? null
          : formatDistance(d, new Date(), { addSuffix: true });
      })()
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-400">
        <Link href="/dashboard/learning-resources">
          <Button variant="ghost" size="sm" className="gap-2 text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Learning Resources
          </Button>
        </Link>
        <span>/</span>
        <Link href={`/dashboard/learning-resources/${domain}`}>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            {domainName}
          </Button>
        </Link>
        <span>/</span>
        <span className="text-white">Week {weekData.weekNumber}</span>
      </div>

      {/* Header */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">
            Week {weekData.weekNumber}
          </h1>
          <Badge
            variant="outline"
            className="border-[#8E2DE2]/50 text-[#8E2DE2] gap-1"
          >
            <Sparkles className="h-3 w-3" />
            AI Curated
          </Badge>
        </div>
        <p className="text-gray-300 text-lg">{weekData.displayName} — {weekData.weekId}</p>
        {updatedAgo && (
          <p className="text-sm text-muted-foreground">
            Updated {updatedAgo}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {weekData.resources.length} resource{weekData.resources.length !== 1 ? 's' : ''} curated by AI
        </p>
      </div>

      {/* Resource List */}
      <div className="space-y-4">
        {weekData.resources.map((resource, idx) => (
          <motion.div
            key={`${resource.url}-${idx}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: idx * 0.06,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <Card className="border-border/50 hover:border-[#8E2DE2]/40 transition-colors duration-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Title link */}
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 font-semibold text-white hover:text-[#8E2DE2] transition-colors duration-150"
                    >
                      <span className="truncate">{resource.title}</span>
                      <ExternalLink className="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </a>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {resource.description}
                    </p>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Badge
                        variant="outline"
                        className={typeBadgeColors[resource.type]}
                      >
                        {resource.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={difficultyColors[resource.difficulty]}
                      >
                        {resource.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {resource.estimatedTime}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page — handles both week-{n} (static) and ai-week-{weekId} (AI)
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ domain: string; week: string }>;
}

export default function WeekDetailPage({ params }: PageProps) {
  const { domain, week } = use(params);

  // ── AI week route: ai-week-{weekId} ──────────────────────────────────────
  if (week && week.startsWith('ai-week-')) {
    const weekId = week.replace('ai-week-', '');
    return <AIWeekView domain={domain} weekId={weekId} />;
  }

  // ── Static week route: week-{number} ─────────────────────────────────────
  return <StaticWeekView domain={domain} week={week} />;
}

// ---------------------------------------------------------------------------
// Static week sub-component (extracted from the original page)
// ---------------------------------------------------------------------------

interface StaticWeekViewProps {
  domain: string;
  week: string;
}

function StaticWeekView({ domain, week }: StaticWeekViewProps) {
  const weekNumber = week && week.startsWith('week-')
    ? parseInt(week.replace('week-', ''), 10)
    : NaN;

  const domainName = domainNames[domain] || domain;

  const { resource, loading: resourceLoading, error: resourceError } = useWeeklyResource(
    domain,
    weekNumber
  );

  const {
    progress,
    toggleCompletion,
    markWeekComplete,
  } = useResourceProgress(domain, weekNumber);

  if (isNaN(weekNumber)) {
    return (
      <ErrorResourceState
        errorType="invalid-week"
        domain={domain}
        weekNumber={weekNumber}
      />
    );
  }

  if (resourceLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29ABE2]" />
      </div>
    );
  }

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
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-400">
        <Link href="/dashboard/learning-resources">
          <Button variant="ghost" size="sm" className="gap-2 text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Learning Resources
          </Button>
        </Link>
        <span>/</span>
        <Link href={`/dashboard/learning-resources/${domain}`}>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            {domainName}
          </Button>
        </Link>
        <span>/</span>
        <span className="text-white">Week {weekNumber}</span>
      </div>

      <ResourceDetailView
        resource={resource}
        completedResources={progress?.completedResources || []}
        onToggleCompletion={toggleCompletion}
        onMarkWeekComplete={markWeekComplete}
      />
    </div>
  );
}
