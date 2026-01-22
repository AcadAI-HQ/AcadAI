"use client";

import { motion } from "framer-motion";
import { Check, Lock, Star, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlattenedStep {
  id: string;
  sectionIndex: number;
  subtopicIndex: number;
  sectionTitle: string;
  sectionDescription: string;
  title: string;
  isFirstInSection: boolean;
  isLastInSection: boolean;
  totalInSection: number;
}

interface PathNodeProps {
  step: FlattenedStep;
  status: "completed" | "current" | "locked";
  onClick: () => void;
  index: number;
}

export function PathNode({ step, status, onClick, index }: PathNodeProps) {
  const isCompleted = status === "completed";
  const isCurrent = status === "current";
  const isLocked = status === "locked";

  return (
    <motion.button
      className={cn(
        "relative flex flex-col items-center group",
        isLocked && "cursor-not-allowed"
      )}
      onClick={onClick}
      disabled={isLocked}
      whileHover={!isLocked ? { scale: 1.05 } : undefined}
      whileTap={!isLocked ? { scale: 0.95 } : undefined}
    >
      {/* Glow effect for current node */}
      {isCurrent && (
        <motion.div
          className="absolute inset-0 -m-2 rounded-full bg-primary/20 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Ring animation for current node */}
      {isCurrent && (
        <motion.div
          className="absolute inset-0 -m-1 rounded-full border-2 border-primary"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}

      {/* Main Node Circle */}
      <div
        className={cn(
          "relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border-4",
          // Completed state
          isCompleted && "bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/30",
          // Current state
          isCurrent && "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30",
          // Locked state
          isLocked && "bg-muted border-muted-foreground/20 text-muted-foreground/50"
        )}
      >
        {isCompleted ? (
          <Check className="h-6 w-6" strokeWidth={3} />
        ) : isCurrent ? (
          <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
        ) : (
          <Lock className="h-5 w-5" />
        )}

        {/* Star badge for first in section */}
        {step.isFirstInSection && !isLocked && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
            <Star className="h-3 w-3 text-amber-900" fill="currentColor" />
          </div>
        )}
      </div>

      {/* Step Title Label */}
      <motion.div
        className={cn(
          "mt-2 px-3 py-1.5 rounded-lg text-xs font-medium max-w-32 text-center transition-all",
          isCompleted && "bg-green-500/10 text-green-500",
          isCurrent && "bg-primary/10 text-primary",
          isLocked && "bg-muted text-muted-foreground/50"
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span className="line-clamp-2">{step.title}</span>
      </motion.div>

      {/* "Continue" label for current node */}
      {isCurrent && (
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          CONTINUE
        </motion.div>
      )}

      {/* Hover tooltip with full title */}
      <div
        className={cn(
          "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 border",
          isLocked && "hidden"
        )}
      >
        {step.title}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover" />
      </div>
    </motion.button>
  );
}
