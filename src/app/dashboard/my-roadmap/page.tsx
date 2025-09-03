
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Bot, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function MyRoadmapPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.lastGeneratedDomain) {
      router.replace(`/roadmap/${user.lastGeneratedDomain}`);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center">
        <Bot className="h-16 w-16 text-primary animate-pulse" />
        <h1 className="text-2xl font-headline mt-4">Loading Your Roadmap...</h1>
      </div>
    );
  }

  if (!user?.lastGeneratedDomain) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center text-muted-foreground bg-card border border-border/50 rounded-lg p-8">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold mb-2">No Roadmap Generated Yet</h2>
        <p className="max-w-md mb-6">
          You haven't generated a roadmap. Please go to the dashboard to select a domain and create your personalized learning path.
        </p>
        <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  // This component will redirect, so this part should ideally not be seen.
  // It's a fallback while redirection is in progress.
  return (
     <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center">
        <Bot className="h-16 w-16 text-primary animate-pulse" />
        <h1 className="text-2xl font-headline mt-4">Redirecting to your roadmap...</h1>
      </div>
  );
}
