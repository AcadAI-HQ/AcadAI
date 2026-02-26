
"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { LearningPathView } from "@/components/roadmap/learning-path-view";
import type { RoadmapFile } from "@/types";
import { Bot, AlertTriangle, ArrowLeft, Map, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRoadmapForUser } from "@/lib/roadmap-service";
import { HyperpersonalizationModal } from "@/components/hyperpersonalization/hyperpersonalization-modal";

// Format domain name for display
const formatDomainName = (domain: string): string => {
  const domainMap: Record<string, string> = {
    'frontend': 'Frontend Development',
    'backend': 'Backend Development',
    'fullstack': 'Full Stack Development',
    'ml': 'Machine Learning',
    'devops': 'DevOps',
    'data-science': 'Data Science',
    'cybersecurity': 'Cybersecurity',
    'ui-ux': 'UI/UX Design',
    'product-engineering': 'Product Engineering',
    'game-dev-indie': 'Indie Game Development',
    'game-dev-aaa': 'AAA Game Development',
    'android': 'Android Development',
    'ios': 'iOS Development',
    'blockchain': 'Blockchain Development',
  };
  return domainMap[domain] || domain.charAt(0).toUpperCase() + domain.slice(1);
};


export default function RoadmapPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = use(params);
  const { user } = useAuth();
  const [roadmapData, setRoadmapData] = useState<RoadmapFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHyperModalOpen, setIsHyperModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadRoadmap();
    }
  }, [domain, user]);

  const loadRoadmap = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch roadmap from Firestore or base template
      const { roadmap } = await getRoadmapForUser(user.uid, domain);
      setRoadmapData(roadmap);
    } catch (err: any) {
      setError(err.message || "Failed to load the roadmap.");
      console.error('Roadmap fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <Bot className="h-16 w-16 text-primary animate-pulse" />
        <h1 className="text-2xl font-headline mt-4">Loading Your Roadmap...</h1>
        <p className="text-muted-foreground">Preparing your learning journey...</p>
      </div>
    );
  }

  if (error) {
    return (
       <div className="flex flex-col items-center justify-center h-full text-center text-destructive bg-destructive/10 border border-destructive/50 rounded-lg p-8">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Roadmap</h2>
        <p className="max-w-md">{error}</p>
        <Button asChild className="mt-6">
            <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (!roadmapData) {
    return <div className="text-center py-20">No roadmap data available.</div>;
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsHyperModalOpen(true)}
          className="gap-2 border-[#29ABE2]/30 text-[#29ABE2] hover:bg-[#29ABE2]/10 hover:border-[#29ABE2]/50 hover:text-[#29ABE2]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Personalize with AI
        </Button>
      </div>

      {/* Title Section */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
          <Map className="h-4 w-4" />
          Learning Path
        </div>
        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-3">
          {formatDomainName(domain)}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {roadmapData.overview}
        </p>
      </div>

      {/* Learning Path */}
      <LearningPathView roadmap={roadmapData} domain={domain} />

      <HyperpersonalizationModal
        open={isHyperModalOpen}
        onOpenChange={setIsHyperModalOpen}
        domain={domain}
        onComplete={() => window.location.reload()}
      />
    </>
  );
}
