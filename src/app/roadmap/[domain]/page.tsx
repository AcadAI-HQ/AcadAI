
"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { RoadmapView } from "@/components/roadmap/roadmap-view";
import { ChatDialog } from "@/components/chat/chat-dialog";
import { RoadmapAssessmentDialog } from "@/components/roadmap/roadmap-assessment-dialog";
import type { Roadmap, RoadmapFile } from "@/types";
import { Bot, AlertTriangle, ArrowLeft, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRoadmapForUser, isRoadmapCustomized } from "@/lib/roadmap-service";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { UpgradePrompt, FeatureLockedBadge } from "@/components/shared/upgrade-prompt";

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
  const { hasAccess: hasHyperpersonalization } = useFeatureAccess('hyperpersonalization');
  const { hasAccess: hasChatAccess } = useFeatureAccess('chat');
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [checkingCustomization, setCheckingCustomization] = useState(true);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<'hyperpersonalization' | 'chat'>('chat');

  useEffect(() => {
    const checkAndLoadRoadmap = async () => {
      if (!user) return;

      setCheckingCustomization(true);

      try {
        // Check if user already has a customized roadmap
        const hasCustomRoadmap = await isRoadmapCustomized(user.uid, domain);

        if (hasCustomRoadmap) {
          // Load customized roadmap
          loadRoadmap();
        } else {
          // Only show assessment dialog for premium users
          // Free users will just see the base roadmap
          if (hasHyperpersonalization) {
            setShowAssessment(true);
            setCheckingCustomization(false);
          } else {
            // Load base roadmap for free users
            loadRoadmap();
          }
        }
      } catch (error) {
        console.error('Error checking customization:', error);
        // Fallback to loading roadmap
        loadRoadmap();
      }
    };

    if (user) {
      checkAndLoadRoadmap();
    }
  }, [domain, user, hasHyperpersonalization]);

  const loadRoadmap = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    setCheckingCustomization(false);

    try {
      // Fetch roadmap from Firestore or base template
      const { roadmap: roadmapData, isPersonalized: personalized } =
        await getRoadmapForUser(user.uid, domain);

      // Transform to app format
      const transformedRoadmap = transformRoadmapData(roadmapData, domain);
      setRoadmap(transformedRoadmap);
      setIsPersonalized(personalized);

    } catch (err: any) {
      setError(err.message || "Failed to load the roadmap.");
      console.error('Roadmap fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentComplete = async (customizedRoadmap: RoadmapFile | null) => {
    setShowAssessment(false);

    if (customizedRoadmap) {
      // Transform and display the customized roadmap
      const transformedRoadmap = transformRoadmapData(customizedRoadmap, domain);
      setRoadmap(transformedRoadmap);
      setIsPersonalized(true);
      setLoading(false);
    } else {
      // Fallback to loading default roadmap
      await loadRoadmap();
    }
  };


  // Show assessment dialog if needed
  if (showAssessment) {
    return (
      <RoadmapAssessmentDialog
        open={showAssessment}
        domain={domain}
        onComplete={handleAssessmentComplete}
      />
    );
  }

  if (loading || checkingCustomization) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Bot className="h-16 w-16 text-primary animate-pulse" />
        <h1 className="text-2xl font-headline mt-4">
          {checkingCustomization ? 'Preparing Your Experience...' : 'Crafting Your Personalized Roadmap...'}
        </h1>
        <p className="text-muted-foreground">
          {checkingCustomization ? 'Just a moment...' : 'Our AI is analyzing the latest trends to build your path.'}
        </p>
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

  const handleChatClick = () => {
    if (!hasChatAccess) {
      setUpgradeFeature('chat');
      setShowUpgradePrompt(true);
    } else {
      setChatOpen(true);
    }
  };

  const handleHyperpersonalizationClick = () => {
    if (!hasHyperpersonalization) {
      setUpgradeFeature('hyperpersonalization');
      setShowUpgradePrompt(true);
    } else {
      setShowAssessment(true);
    }
  };

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

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-headline font-bold">{roadmap.title}</h1>
            {isPersonalized && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="h-3 w-3" />
                Hyperpersonalized
              </span>
            )}
          </div>
          <p className="text-lg text-muted-foreground">{roadmap.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 shrink-0">
          {/* Hyperpersonalization Button */}
          {!isPersonalized && (
            <Button
              onClick={handleHyperpersonalizationClick}
              variant="default"
              size="default"
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Hyperpersonalize
              {!hasHyperpersonalization && <FeatureLockedBadge onClick={handleHyperpersonalizationClick} className="ml-2" />}
            </Button>
          )}

          {/* Chat Assistant Button */}
          <Button onClick={handleChatClick} variant="default" size="default" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            AI Assistant
            {!hasChatAccess && <FeatureLockedBadge onClick={handleChatClick} className="ml-2" />}
          </Button>
        </div>
      </div>
      <RoadmapView roadmap={roadmap} />

      {/* Chat Dialog - only show if user has access */}
      {hasChatAccess && (
        <ChatDialog open={chatOpen} onOpenChange={setChatOpen} domain={domain} />
      )}

      {/* Upgrade Prompt */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature={upgradeFeature}
      />
    </>
  );
}
