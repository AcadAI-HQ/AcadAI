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
  const [completionStats, setCompletionStats] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        console.log('[Learning Resources] Starting to load data...');
        const manifestData = await loadManifest();
        console.log('[Learning Resources] Manifest loaded:', manifestData);
        setManifest(manifestData);

        // Load completion stats for each domain if user is logged in
        if (user?.uid) {
          console.log('[Learning Resources] User logged in, loading completion stats...');
          const stats: Record<string, number> = {};

          // Load stats with timeout to prevent hanging
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
          console.log('[Learning Resources] Completion stats loaded:', stats);
          setCompletionStats(stats);
        } else {
          console.log('[Learning Resources] No user logged in');
        }
      } catch (error) {
        console.error('[Learning Resources] Failed to load data:', error);
      } finally {
        console.log('[Learning Resources] Setting loading to false');
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Learning Resources
        </h1>
        <p className="text-gray-400 text-lg">
          Weekly curated resources to deepen your knowledge across different domains
        </p>
      </div>

      {/* Domain Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domainConfig.map((domain) => {
          const availableWeeks =
            manifest?.domains[domain.id]?.availableWeeks.length || 0;
          const completionPercentage = completionStats[domain.id] || 0;

          return (
            <DomainResourceCard
              key={domain.id}
              domain={domain}
              availableWeeks={availableWeeks}
              completionPercentage={completionPercentage}
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
