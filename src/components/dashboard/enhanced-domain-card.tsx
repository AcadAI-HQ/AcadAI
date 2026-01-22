"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Play, Clock, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DomainProgress {
  completedCount: number;
  totalSteps: number;
  percentage: number;
}

interface EnhancedDomainCardProps {
  domain: {
    id: string;
    name: string;
    icon: LucideIcon;
    active: boolean;
  };
  progress?: DomainProgress | null;
  isLastActive?: boolean; // Was this the last domain the user was learning?
  onSelect: () => void;
}

// Circular progress ring component
function ProgressRing({
  progress,
  size = 56,
  strokeWidth = 4,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-500 ease-out",
            progress === 100 ? "text-green-500" : "text-primary"
          )}
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "text-xs font-bold",
            progress === 100 ? "text-green-500" : "text-primary"
          )}
        >
          {progress}%
        </span>
      </div>
    </div>
  );
}

// Estimated time based on domain complexity
const domainEstimates: Record<string, { time: string; difficulty: "Beginner" | "Intermediate" | "Advanced" }> = {
  frontend: { time: "8-12 weeks", difficulty: "Beginner" },
  backend: { time: "10-14 weeks", difficulty: "Intermediate" },
  fullstack: { time: "16-20 weeks", difficulty: "Advanced" },
  ml: { time: "14-18 weeks", difficulty: "Advanced" },
  devops: { time: "10-14 weeks", difficulty: "Intermediate" },
  cybersecurity: { time: "12-16 weeks", difficulty: "Intermediate" },
  "data-science": { time: "14-18 weeks", difficulty: "Advanced" },
  blockchain: { time: "10-14 weeks", difficulty: "Intermediate" },
  "ui-ux": { time: "8-12 weeks", difficulty: "Beginner" },
  android: { time: "12-16 weeks", difficulty: "Intermediate" },
  ios: { time: "12-16 weeks", difficulty: "Intermediate" },
  "product-engineering": { time: "10-14 weeks", difficulty: "Intermediate" },
  "game-dev-indie": { time: "12-16 weeks", difficulty: "Intermediate" },
  "game-dev-aaa": { time: "16-20 weeks", difficulty: "Advanced" },
};

const difficultyColors = {
  Beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  Intermediate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Advanced: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function EnhancedDomainCard({
  domain,
  progress,
  isLastActive,
  onSelect,
}: EnhancedDomainCardProps) {
  const Icon = domain.icon;
  const hasProgress = progress && progress.completedCount > 0;
  const isComplete = progress?.percentage === 100;
  const estimate = domainEstimates[domain.id] || { time: "10-14 weeks", difficulty: "Intermediate" as const };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="relative"
    >
      {/* Continue Learning highlight */}
      {isLastActive && hasProgress && !isComplete && (
        <motion.div
          className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-xl blur-sm"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      <Card
        onClick={domain.active ? onSelect : undefined}
        className={cn(
          "relative h-full overflow-hidden transition-all duration-300",
          domain.active
            ? "cursor-pointer hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
            : "cursor-not-allowed bg-card/50 text-muted-foreground",
          isLastActive && hasProgress && !isComplete && "border-primary"
        )}
      >
        {/* Continue badge */}
        {isLastActive && hasProgress && !isComplete && (
          <div className="absolute top-3 right-3 z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full"
            >
              <Play className="h-3 w-3" fill="currentColor" />
              CONTINUE
            </motion.div>
          </div>
        )}

        {/* Completed badge */}
        {isComplete && (
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              <Sparkles className="h-3 w-3" />
              COMPLETE
            </div>
          </div>
        )}

        {/* Coming soon badge */}
        {!domain.active && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
        )}

        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            {/* Left side - Icon and info */}
            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                  domain.active
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="font-bold text-lg mb-1 truncate">{domain.name}</h3>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge
                  variant="outline"
                  className={cn("text-xs", difficultyColors[estimate.difficulty])}
                >
                  {estimate.difficulty}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {estimate.time}
                </div>
              </div>
            </div>

            {/* Right side - Progress ring or start indicator */}
            <div className="flex-shrink-0">
              {hasProgress ? (
                <ProgressRing progress={progress.percentage} />
              ) : (
                <div
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center border-2 border-dashed transition-colors",
                    domain.active
                      ? "border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary"
                      : "border-muted text-muted"
                  )}
                >
                  <ChevronRight className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>

          {/* Progress text */}
          {hasProgress && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {progress.completedCount} of {progress.totalSteps} topics
                </span>
                {!isComplete && (
                  <span className="text-primary font-medium flex items-center gap-1">
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
