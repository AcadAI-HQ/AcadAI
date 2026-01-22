"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RoadmapFile, RoadmapProgress } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import {
  getUserProgress,
  initializeProgress,
  getStepStatus,
  calculateProgressPercentage,
} from "@/lib/progress-service";
import {
  celebrateStepComplete,
  celebrateSectionComplete,
  celebrateRoadmapComplete,
  celebrateMilestone,
} from "@/lib/confetti";
import { PathNode } from "./path-node";
import { NodeDetailDrawer } from "./node-detail-drawer";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Star, Zap, Award } from "lucide-react";

interface LearningPathViewProps {
  roadmap: RoadmapFile;
  domain: string;
}

interface FlattenedStep {
  id: string; // "sectionIndex-subtopicIndex"
  sectionIndex: number;
  subtopicIndex: number;
  sectionTitle: string;
  sectionDescription: string;
  title: string; // subtopic title
  isFirstInSection: boolean;
  isLastInSection: boolean;
  totalInSection: number;
  resources: string[]; // URLs from the section
}

// Milestone thresholds for celebrations
const MILESTONES = [10, 25, 50, 75, 100];

interface MilestoneMessage {
  percentage: number;
  title: string;
  message: string;
  icon: "star" | "zap" | "award" | "trophy";
}

const getMilestoneMessage = (percentage: number): MilestoneMessage | null => {
  if (percentage === 10) {
    return {
      percentage: 10,
      title: "Great Start!",
      message: "You've completed 10% of your journey. Keep it up!",
      icon: "star",
    };
  }
  if (percentage === 25) {
    return {
      percentage: 25,
      title: "Quarter Way There!",
      message: "25% complete! You're building momentum.",
      icon: "zap",
    };
  }
  if (percentage === 50) {
    return {
      percentage: 50,
      title: "Halfway Hero!",
      message: "50% done! You're crushing it!",
      icon: "award",
    };
  }
  if (percentage === 75) {
    return {
      percentage: 75,
      title: "Almost There!",
      message: "75% complete! The finish line is in sight!",
      icon: "trophy",
    };
  }
  if (percentage === 100) {
    return {
      percentage: 100,
      title: "Roadmap Mastered!",
      message: "You've completed the entire roadmap! Incredible work!",
      icon: "trophy",
    };
  }
  return null;
};

export function LearningPathView({ roadmap, domain }: LearningPathViewProps) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<RoadmapProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState<FlattenedStep | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [milestoneToShow, setMilestoneToShow] = useState<MilestoneMessage | null>(null);
  const [previousPercentage, setPreviousPercentage] = useState<number>(0);

  // Flatten the roadmap structure: sections -> subtopics become individual steps
  const flattenedSteps = useMemo<FlattenedStep[]>(() => {
    const steps: FlattenedStep[] = [];

    roadmap.steps.forEach((section, sectionIndex) => {
      const subtopics = section.subtopics || [];
      const sectionResources = section.resources || [];
      subtopics.forEach((subtopic, subtopicIndex) => {
        steps.push({
          id: `${sectionIndex}-${subtopicIndex}`,
          sectionIndex,
          subtopicIndex,
          sectionTitle: section.title,
          sectionDescription: section.description,
          title: subtopic,
          isFirstInSection: subtopicIndex === 0,
          isLastInSection: subtopicIndex === subtopics.length - 1,
          totalInSection: subtopics.length,
          resources: sectionResources,
        });
      });
    });

    return steps;
  }, [roadmap]);

  // Calculate total steps
  const totalSteps = flattenedSteps.length;

  // Load or initialize progress
  useEffect(() => {
    async function loadProgress() {
      if (!user?.uid) return;

      setLoading(true);
      try {
        let userProgress = await getUserProgress(user.uid, domain);

        if (!userProgress) {
          // Initialize progress for first-time viewers
          userProgress = await initializeProgress(user.uid, domain, totalSteps);
        } else if (userProgress.totalSteps !== totalSteps) {
          // Update total steps if roadmap has changed
          userProgress.totalSteps = totalSteps;
        }

        setProgress(userProgress);
        // Initialize previous percentage for milestone tracking
        const initialPercentage = userProgress.totalSteps > 0
          ? Math.round((userProgress.completedCount / userProgress.totalSteps) * 100)
          : 0;
        setPreviousPercentage(initialPercentage);
      } catch (error) {
        console.error("[learning-path] Error loading progress:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [user?.uid, domain, totalSteps]);

  const handleNodeClick = (step: FlattenedStep) => {
    const status = getStepStatus(step.id, progress);
    // Allow clicking on completed, current, or first unlocked step
    if (status !== "locked") {
      setSelectedStep(step);
      setDrawerOpen(true);
    }
  };

  const handleStepComplete = (stepId: string) => {
    // Update local state immediately for responsiveness
    if (progress) {
      const newCompletedSteps = [...progress.completedSteps];
      if (!newCompletedSteps.includes(stepId)) {
        newCompletedSteps.push(stepId);
      }

      // Find next step
      const currentIndex = flattenedSteps.findIndex((s) => s.id === stepId);
      const nextStep = flattenedSteps[currentIndex + 1];
      const completedStep = flattenedSteps[currentIndex];

      const newProgress = {
        ...progress,
        completedSteps: newCompletedSteps,
        currentStepId: nextStep?.id || null,
        completedCount: newCompletedSteps.length,
      };

      setProgress(newProgress);

      // Calculate new percentage
      const newPercentage = Math.round(
        (newCompletedSteps.length / totalSteps) * 100
      );

      // Check if section was completed
      if (completedStep?.isLastInSection) {
        // Check if all steps in this section are now completed
        const sectionSteps = flattenedSteps.filter(
          (s) => s.sectionIndex === completedStep.sectionIndex
        );
        const allSectionComplete = sectionSteps.every((s) =>
          newCompletedSteps.includes(s.id)
        );

        if (allSectionComplete) {
          celebrateSectionComplete();
        }
      } else {
        // Regular step completion
        celebrateStepComplete();
      }

      // Check for milestones
      for (const milestone of MILESTONES) {
        if (previousPercentage < milestone && newPercentage >= milestone) {
          if (milestone === 100) {
            celebrateRoadmapComplete();
          } else {
            celebrateMilestone(milestone);
          }
          const message = getMilestoneMessage(milestone);
          if (message) {
            setMilestoneToShow(message);
            // Auto-hide after 4 seconds
            setTimeout(() => setMilestoneToShow(null), 4000);
          }
          break;
        }
      }

      setPreviousPercentage(newPercentage);
    }
    setDrawerOpen(false);
  };

  const progressPercentage = progress
    ? calculateProgressPercentage(progress)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">
          Loading your progress...
        </div>
      </div>
    );
  }

  // Group steps by section for rendering section headers
  const sections = roadmap.steps.map((section, idx) => ({
    index: idx,
    title: section.title,
    description: section.description,
    steps: flattenedSteps.filter((s) => s.sectionIndex === idx),
  }));

  return (
    <div className="relative pb-20">
      {/* Progress Header */}
      <motion.div
        className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 -mx-4 px-4 py-4 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-orange-500">
              <Flame className="h-5 w-5" />
              <span className="font-semibold">{progress?.completedCount || 0}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              of {totalSteps} topics completed
            </span>
          </div>
          <div className="flex items-center gap-2 text-amber-500">
            <Trophy className="h-5 w-5" />
            <span className="font-semibold">{progressPercentage}%</span>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </motion.div>

      {/* Milestone Celebration Message */}
      <AnimatePresence>
        {milestoneToShow && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-amber-500/90 via-orange-500/90 to-amber-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-2xl shadow-2xl border border-amber-400/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  {milestoneToShow.icon === "star" && <Star className="h-6 w-6" />}
                  {milestoneToShow.icon === "zap" && <Zap className="h-6 w-6" />}
                  {milestoneToShow.icon === "award" && <Award className="h-6 w-6" />}
                  {milestoneToShow.icon === "trophy" && <Trophy className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{milestoneToShow.title}</h3>
                  <p className="text-white/90 text-sm">{milestoneToShow.message}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Learning Path */}
      <div className="relative max-w-lg mx-auto">
        {/* SVG Path Background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Sections and Nodes */}
        {sections.map((section, sectionIdx) => (
          <div key={section.index} className="relative mb-8">
            {/* Section Header */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: sectionIdx * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {sectionIdx + 1}
                </div>
                <h2 className="text-xl font-bold">{section.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground ml-11">
                {section.description}
              </p>
            </motion.div>

            {/* Path Nodes for this section */}
            <div className="relative ml-4">
              {/* Connecting line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent -translate-x-1/2" />

              {section.steps.map((step, stepIdx) => {
                const status = getStepStatus(step.id, progress);
                // Calculate sine wave offset for the node position
                const amplitude = 80; // How far left/right the wave goes
                const frequency = 0.5; // How many waves per section
                const xOffset =
                  Math.sin((stepIdx * Math.PI * frequency) + (sectionIdx * Math.PI * 0.5)) * amplitude;

                return (
                  <motion.div
                    key={step.id}
                    className="relative py-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: sectionIdx * 0.1 + stepIdx * 0.05,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    {/* Curved connector line */}
                    {stepIdx > 0 && (
                      <svg
                        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible"
                        width="200"
                        height="40"
                        style={{ zIndex: 0 }}
                      >
                        <path
                          d={`M ${100 + Math.sin(((stepIdx - 1) * Math.PI * frequency) + (sectionIdx * Math.PI * 0.5)) * amplitude} 0
                              Q 100 20
                              ${100 + xOffset} 40`}
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="2"
                          strokeOpacity="0.2"
                          strokeDasharray={status === "locked" ? "4 4" : "none"}
                        />
                      </svg>
                    )}

                    {/* Node positioned along the sine wave */}
                    <div
                      className="relative flex justify-center"
                      style={{ transform: `translateX(${xOffset}px)` }}
                    >
                      <PathNode
                        step={step}
                        status={status}
                        onClick={() => handleNodeClick(step)}
                        index={stepIdx}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Section completion indicator */}
            {section.steps.every((s) =>
              progress?.completedSteps.includes(s.id)
            ) && (
              <motion.div
                className="flex justify-center mt-4"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
                  <Trophy className="h-4 w-4" />
                  Section Complete!
                </div>
              </motion.div>
            )}
          </div>
        ))}

        {/* Completion Message */}
        {progressPercentage === 100 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Roadmap Complete!</h2>
            <p className="text-muted-foreground">
              You've mastered all topics in this roadmap. Amazing work!
            </p>
          </motion.div>
        )}
      </div>

      {/* Detail Drawer */}
      <NodeDetailDrawer
        step={selectedStep}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onComplete={handleStepComplete}
        progress={progress}
        userId={user?.uid || ""}
        domain={domain}
      />
    </div>
  );
}
