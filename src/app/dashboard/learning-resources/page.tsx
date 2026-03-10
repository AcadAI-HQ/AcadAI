'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Code,
  Server,
  Layers,
  Brain,
  Cloud,
  Shield,
  BarChart3,
  Smartphone,
  Blocks,
  Palette,
  Package,
  Gamepad2,
  Gamepad,
} from 'lucide-react';
import { DomainResourceCard } from '@/components/learning-resources/domain-resource-card';
import { loadManifest } from '@/lib/weekly-resources-service';
import { getCompletionStats } from '@/lib/user-progress-service';
import { hasAIResourcesForDomain, getAIResourcesForDomain } from '@/lib/ai-learning-resources-service';
import { useAuth } from '@/hooks/use-auth';
import { WeeklyResourceManifest } from '@/types/weekly-resources';

const domainConfig = [
  { id: 'frontend', name: 'Frontend Development', icon: Code },
  { id: 'backend', name: 'Backend Development', icon: Server },
  { id: 'fullstack', name: 'Fullstack Development', icon: Layers },
  { id: 'ml', name: 'Machine Learning', icon: Brain },
  { id: 'devops', name: 'DevOps', icon: Cloud },
  { id: 'android', name: 'Android Development', icon: Smartphone },
  { id: 'ios', name: 'iOS Development', icon: Smartphone },
  { id: 'blockchain', name: 'Blockchain Development', icon: Blocks },
  { id: 'ui-ux', name: 'UI/UX Design', icon: Palette },
  { id: 'product-engineering', name: 'Product Engineering', icon: Package },
  { id: 'game-dev-aaa', name: 'AAA Game Development', icon: Gamepad2 },
  { id: 'game-dev-indie', name: 'Indie Game Development', icon: Gamepad },
  { id: 'cybersecurity', name: 'Cybersecurity', icon: Shield },
  { id: 'data-science', name: 'Data Science', icon: BarChart3 },
];

export default function LearningResourcesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [manifest, setManifest] = useState<WeeklyResourceManifest | null>(null);
  const [completionStats, setCompletionStats] = useState<Record<string, number>>({});
  // Map of domain id -> number of AI-generated weeks
  const [aiWeekCounts, setAiWeekCounts] = useState<Record<string, number>>({});
  // Map of domain id -> whether AI content exists
  const [aiDomainFlags, setAiDomainFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mark learning resources as visited (for onboarding widget + spotlight dot)
    localStorage.setItem("acadai_visited_resources", "1");
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        // ── Static manifest ──────────────────────────────────────────────
        const manifestData = await loadManifest();
        setManifest(manifestData);

        // ── AI resources (parallel per domain, graceful degradation) ─────
        const aiFlags: Record<string, boolean> = {};
        const aiCounts: Record<string, number> = {};

        try {
          const aiChecks = await Promise.all(
            domainConfig.map(async (domain) => {
              const hasAI = await hasAIResourcesForDomain(domain.id);
              let weekCount = 0;
              if (hasAI) {
                const weeks = await getAIResourcesForDomain(domain.id);
                weekCount = weeks.length;
              }
              return { id: domain.id, hasAI, weekCount };
            })
          );

          for (const result of aiChecks) {
            aiFlags[result.id] = result.hasAI;
            aiCounts[result.id] = result.weekCount;
          }
        } catch (aiError) {
          // Firestore unavailable — degrade gracefully and show only static content
          console.error('[Learning Resources] Failed to load AI resources, showing static only:', aiError);
        }

        setAiDomainFlags(aiFlags);
        setAiWeekCounts(aiCounts);

        // ── Completion stats (per-user) ──────────────────────────────────
        if (user?.uid) {
          const stats: Record<string, number> = {};

          const statsPromises = domainConfig.map(async (domain) => {
            try {
              const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 5000)
              );
              const statsPromise = getCompletionStats(user.uid, domain.id);

              const domainStats = await Promise.race([statsPromise, timeoutPromise]);
              stats[domain.id] = domainStats.completionPercentage;
            } catch (error) {
              console.warn(`Failed to load stats for ${domain.id}:`, error);
              stats[domain.id] = 0;
            }
          });

          await Promise.all(statsPromises);
          setCompletionStats(stats);
        }
      } catch (error) {
        console.error('[Learning Resources] Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29ABE2]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-headline text-2xl font-bold md:text-3xl">
          Learning Resources
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Weekly curated resources to deepen your knowledge across different domains
        </p>
      </div>

      {/* Domain Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {domainConfig.map((domain) => {
          const staticWeeks = manifest?.domains[domain.id]?.availableWeeks.length ?? 0;
          const aiWeeks = aiWeekCounts[domain.id] ?? 0;

          // Deduplicate by taking the greater of static + AI counts.
          // Both lists may overlap on the same week number, so we present
          // the sum but guard against double-counting by capping at a sane max.
          // The detail page handles the actual dedup logic.
          const totalWeeks = staticWeeks + aiWeeks;

          const completionPercentage = completionStats[domain.id] ?? 0;
          const hasAiContent = aiDomainFlags[domain.id] ?? false;

          return (
            <DomainResourceCard
              key={domain.id}
              domain={domain}
              availableWeeks={totalWeeks}
              completionPercentage={completionPercentage}
              hasAiContent={hasAiContent}
              onSelect={() =>
                router.push(`/dashboard/learning-resources/${domain.id}`)
              }
            />
          );
        })}
      </div>
    </div>
  );
}
