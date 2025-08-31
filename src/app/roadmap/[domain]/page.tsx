"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { RoadmapView } from "@/components/roadmap/roadmap-view";
import type { Roadmap } from "@/types";
import { Bot, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Helper function to filter roadmap for free users
const getFreeRoadmap = (premiumRoadmap: Roadmap): Roadmap => {
  const freeStages = premiumRoadmap.stages
    .filter(stage => stage.isCore)
    .map(stage => ({
      ...stage,
      modules: stage.modules.filter(module => module.isCore),
    }));
  return { ...premiumRoadmap, stages: freeStages };
};

export default function RoadmapPage({ params }: { params: Promise<{ domain: string }> }) {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Unwrap the params Promise using React.use()
  const { domain } = use(params);

  useEffect(() => {
    const fetchRoadmap = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/roadmaps/${domain}.json`);
        if (!response.ok) {
          throw new Error("Roadmap not found");
        }
        const data: Roadmap = await response.json();
        
        // Simulate AI generation time
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (user?.subscriptionStatus === 'free') {
          setRoadmap(getFreeRoadmap(data));
        } else {
          setRoadmap(data);
        }
      } catch (err) {
        setError("Failed to load the roadmap. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) { // Only fetch if user is loaded
        fetchRoadmap();
    }

  }, [domain, user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Bot className="h-16 w-16 text-primary animate-pulse" />
        <h1 className="text-2xl font-headline mt-4">Crafting Your Personalized Roadmap...</h1>
        <p className="text-muted-foreground">Our AI is analyzing the latest trends to build your path.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center text-destructive">
        {error}
      </div>
    );
  }

  if (!roadmap) {
    return <div className="text-center">No roadmap data available.</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-headline font-bold">{roadmap.title}</h1>
      <p className="text-lg text-muted-foreground mt-2">{roadmap.description}</p>
      {user?.subscriptionStatus === 'free' && (
          <div className="mt-6 mb-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-yellow-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6"/>
              <div>
                <h3 className="font-bold">Premium Preview</h3>
                <p className="text-sm text-yellow-300/80">This is a preview of the full roadmap. Upgrade for access to all modules.</p>
              </div>
            </div>
            <Button asChild>
                <Link href="/dashboard">Upgrade to Premium</Link>
            </Button>
          </div>
      )}
      <RoadmapView roadmap={roadmap} />
    </div>
  );
}