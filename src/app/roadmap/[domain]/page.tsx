
"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { LearningPathView } from "@/components/roadmap/learning-path-view";
import type { RoadmapFile } from "@/types";
import { AlertTriangle, ArrowLeft, Map, Sparkles, BrainCircuit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getRoadmapForUser } from "@/lib/roadmap-service";
import { HyperpersonalizationFlow } from "@/components/hyperpersonalization/hyperpersonalization-modal";

const INTRO_BANNER_KEY = "acadai_roadmap_intro_seen";

const formatDomainName = (domain: string): string => {
  const domainMap: Record<string, string> = {
    frontend: "Frontend Development",
    backend: "Backend Development",
    fullstack: "Full Stack Development",
    ml: "Machine Learning",
    devops: "DevOps",
    "data-science": "Data Science",
    cybersecurity: "Cybersecurity",
    "ui-ux": "UI/UX Design",
    "product-engineering": "Product Engineering",
    "game-dev-indie": "Indie Game Development",
    "game-dev-aaa": "AAA Game Development",
    android: "Android Development",
    ios: "iOS Development",
    blockchain: "Blockchain Development",
  };
  return domainMap[domain] || domain.charAt(0).toUpperCase() + domain.slice(1);
};

const fadeProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.35, ease: "easeInOut" },
};

export default function RoadmapPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = use(params);
  const { user } = useAuth();
  const [roadmapData, setRoadmapData] = useState<RoadmapFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"roadmap" | "personalizing">("roadmap");
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [showIntroBanner, setShowIntroBanner] = useState(false);

  useEffect(() => {
    if (user) loadRoadmap();
  }, [domain, user]);

  // Check localStorage once on mount (client-only)
  useEffect(() => {
    const seen = localStorage.getItem(INTRO_BANNER_KEY);
    if (!seen) setShowIntroBanner(true);
    // Mark roadmap as visited (for onboarding widget)
    localStorage.setItem("acadai_visited_roadmap", "1");
  }, []);

  const dismissIntroBanner = () => {
    localStorage.setItem(INTRO_BANNER_KEY, "true");
    setShowIntroBanner(false);
  };

  const loadRoadmap = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { roadmap, isAiGenerated: aiFlag } = await getRoadmapForUser(user.uid, domain);
      setRoadmapData(roadmap);
      setIsAiGenerated(!!aiFlag);
    } catch (err: unknown) {
      console.error("Roadmap fetch error:", err);
      setError("load_failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Loading state: skeleton (not a pulsing Bot — that implies real-time generation) ──
  if (loading) {
    return (
      <div className="space-y-6 py-6 px-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-40 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="text-center space-y-3 py-4">
          <Skeleton className="h-6 w-32 rounded-full mx-auto" />
          <Skeleton className="h-10 w-72 mx-auto rounded-lg" />
          <Skeleton className="h-4 w-96 mx-auto rounded" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  // ── Error state: friendly copy, no raw error string ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20 px-6">
        <div className="rounded-full bg-destructive/10 p-5 mb-5">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-xl font-bold mb-2">We couldn't load your roadmap right now.</h2>
        <p className="text-muted-foreground max-w-md mb-6 leading-relaxed">
          This is usually a temporary issue. The base version of this roadmap is always available — try refreshing the page.
        </p>
        <div className="flex gap-3">
          <Button onClick={loadRoadmap} variant="default">Try again</Button>
          <Button asChild variant="ghost">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!roadmapData) {
    return <div className="text-center py-20 text-muted-foreground">No roadmap data available.</div>;
  }

  return (
    <AnimatePresence mode="wait">

      {view === "roadmap" ? (
        <motion.div key="roadmap" {...fadeProps}>

          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>

            {/* "Tailor to my background" — gradient border button (P1.3) */}
            <div
              title="The base roadmap covers everything in demand for this role. Tailoring removes topics you already know and adds depth where you need it most."
              className="relative p-px rounded-xl bg-gradient-to-r from-[#3B82F6]/40 to-[#8E2DE2]/40 hover:from-[#3B82F6]/70 hover:to-[#8E2DE2]/70 transition-all duration-200 hover:shadow-[0_0_16px_rgba(59,130,246,0.18)]"
            >
              <button
                onClick={() => setView("personalizing")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-[11px] bg-background text-[13px] font-medium text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#60A5FA]" />
                Tailor to my background
              </button>
            </div>
          </div>

          {/* One-time dismissible intro banner (P1.1) — explains AI research origin */}
          <AnimatePresence>
            {showIntroBanner && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden mb-4"
              >
                <div className="bg-gradient-to-r from-[#3B82F6]/10 to-[#8E2DE2]/10 border border-[#3B82F6]/20 rounded-xl p-4 flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#3B82F6]/12 flex items-center justify-center mt-0.5">
                    <BrainCircuit className="h-4 w-4 text-[#60A5FA]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground/90 leading-snug mb-0.5">
                      This roadmap was built from job market research — not a static list.
                    </p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      AcadAI scans engineering job postings monthly and updates these paths to reflect what companies are actually hiring for right now.
                    </p>
                  </div>
                  <button
                    onClick={dismissIntroBanner}
                    aria-label="Dismiss"
                    className="flex-shrink-0 p-1 rounded-lg hover:bg-white/8 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI freshness banner — only when roadmap is from AI pipeline (P1.2) */}
          {isAiGenerated && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-gradient-to-r from-[#3B82F6]/8 to-[#8E2DE2]/8 border border-[#3B82F6]/15 rounded-xl p-3 mb-6 flex items-center gap-3"
            >
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-[#60A5FA]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-foreground/80 leading-snug">
                  This roadmap is updated monthly with the latest job market data.
                </p>
                {(roadmapData as any).generatedAt && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Last updated: {new Date((roadmapData as any).generatedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 hidden sm:block">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/25">
                  <BrainCircuit className="h-2.5 w-2.5" />
                  Market-researched
                </span>
              </div>
            </motion.div>
          )}

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

        </motion.div>

      ) : (
        <motion.div key="personalizing" {...fadeProps}>
          <HyperpersonalizationFlow
            domain={domain}
            onClose={() => setView("roadmap")}
            onComplete={async () => {
              await loadRoadmap();
              setView("roadmap");
            }}
          />
        </motion.div>
      )}

    </AnimatePresence>
  );
}
