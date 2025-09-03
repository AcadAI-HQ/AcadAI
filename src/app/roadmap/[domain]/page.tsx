
"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { RoadmapView } from "@/components/roadmap/roadmap-view";
import type { Roadmap } from "@/types";
import { Bot, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Helper type for roadmap JSON structure
interface RoadmapStep {
  title: string;
  description: string;
  resources: string[];
}
interface RoadmapFile {
  domain: string;
  type: 'premium';
  overview: string;
  steps: RoadmapStep[];
}

// Convert JSON structure to our app's Roadmap structure
const transformRoadmapData = (data: RoadmapFile, domain: string): Roadmap => {
  // Capitalize first letter of domain
  const capitalizedDomain = domain.charAt(0).toUpperCase() + domain.slice(1);
  return {
    title: `${capitalizedDomain} Roadmap - Comprehensive`,
    description: data.overview,
    stages: data.steps.map(step => ({
      title: step.title,
      description: step.description,
      isCore: true, // We can simplify this as we are not filtering modules anymore
      modules: step.resources.map(res => ({
        title: res, // Using resource link as title for simplicity
        description: `Resource for ${step.title}`,
        isCore: true
      })),
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
    const fetchRoadmap = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      // Use premium roadmaps as the default free experience
      const roadmapFile = `/roadmaps/${domain}/premium.json`;

      try {
        const response = await fetch(roadmapFile);
        if (!response.ok) {
           if (response.status === 404) {
            // Handle cases where a roadmap for a specific domain doesn't exist yet
            const safeResponse = await fetch(`/roadmaps/frontend/premium.json`);
            if (!safeResponse.ok) {
               throw new Error(`Default roadmap for 'frontend' also not found.`);
            }
            const data: RoadmapFile = await safeResponse.json();
             // Simulate AI generation time
            await new Promise(resolve => setTimeout(resolve, 1000));
            setRoadmap(transformRoadmapData(data, 'frontend'));
            return;
          }
          throw new Error(`Roadmap not found at ${roadmapFile}. Please ensure the file exists.`);
        }
        const data: RoadmapFile = await response.json();
        
        // Simulate AI generation time
        await new Promise(resolve => setTimeout(resolve, 1000));

        setRoadmap(transformRoadmapData(data, domain));

      } catch (err: any) {
        setError(err.message || "Failed to load the roadmap.");
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
    <div className="pt-6 px-6">
      <h1 className="text-4xl font-headline font-bold">{roadmap.title}</h1>
      <p className="text-lg text-muted-foreground mt-2">{roadmap.description}</p>
      <RoadmapView roadmap={roadmap} />
    </div>
  );
}
