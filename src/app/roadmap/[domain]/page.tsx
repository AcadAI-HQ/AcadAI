
"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { RoadmapView } from "@/components/roadmap/roadmap-view";
import type { Roadmap, RoadmapFile } from "@/types";
import { Bot, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRoadmapForUser } from "@/lib/roadmap-service";

// Convert JSON structure to our app's Roadmap structure
const transformRoadmapData = (data: RoadmapFile, domain: string): Roadmap => {
  // Capitalize first letter of domain
  const capitalizedDomain = domain.charAt(0).toUpperCase() + domain.slice(1);
  return {
    title: `${capitalizedDomain} Development Roadmap`,
    description: data.overview,
    stages: data.steps.map(step => ({
      title: step.title,
      description: step.description,
      isCore: true,
      modules: [{
        title: step.title,
        description: step.description,
        isCore: true,
        subtopics: step.subtopics,
        examples: step.examples,
        resources: step.resources // Keep resources but don't show them in UI
      }],
    })),
  };
};


export default function RoadmapPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = use(params);
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const { roadmap: roadmapData } = await getRoadmapForUser(user.uid, domain);

      // Transform to app format
      const transformedRoadmap = transformRoadmapData(roadmapData, domain);
      setRoadmap(transformedRoadmap);

    } catch (err: any) {
      setError(err.message || "Failed to load the roadmap.");
      console.error('Roadmap fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Bot className="h-16 w-16 text-primary animate-pulse" />
        <h1 className="text-2xl font-headline mt-4">Loading Your Roadmap...</h1>
        <p className="text-muted-foreground">Just a moment...</p>
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

  if (!roadmap) {
    return <div className="text-center">No roadmap data available.</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-4xl font-headline font-bold mb-2">{roadmap.title}</h1>
        <p className="text-lg text-muted-foreground">{roadmap.description}</p>
      </div>

      <RoadmapView roadmap={roadmap} />
    </>
  );
}
