"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface GettingStartedWidgetProps {
  uid: string;
  /** true if the user's roadmap completedCount > 0 */
  hasCompletedStep: boolean;
}

interface ChecklistItem {
  id: string;
  label: string;
  href: string;
}

const ITEMS: ChecklistItem[] = [
  { id: "visited_roadmap",    label: "View your roadmap",         href: "/dashboard/my-roadmap" },
  { id: "completed_step",     label: "Complete your first step",  href: "/dashboard/my-roadmap" },
  { id: "visited_resources",  label: "Check learning resources",  href: "/dashboard/learning-resources" },
  { id: "asked_mentor",       label: "Ask your AI Mentor",        href: "/dashboard/ai-mentor" },
];

function lsKey(uid: string) { return `acadai_onboarding_${uid}`; }
function dismissKey(uid: string) { return `acadai_onboarding_dismissed_${uid}`; }

export function GettingStartedWidget({ uid, hasCompletedStep }: GettingStartedWidgetProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load state from localStorage after mount
  useEffect(() => {
    if (!uid) return;
    const raw = localStorage.getItem(lsKey(uid));
    const stored: Record<string, boolean> = raw ? JSON.parse(raw) : {};

    // Auto-check "completed_step" based on prop
    if (hasCompletedStep) stored["completed_step"] = true;

    // Auto-check from visit trackers
    if (localStorage.getItem("acadai_visited_roadmap") === "1")    stored["visited_roadmap"] = true;
    if (localStorage.getItem("acadai_visited_resources") === "1")   stored["visited_resources"] = true;
    if (localStorage.getItem("acadai_visited_mentor") === "1")      stored["asked_mentor"] = true;

    setChecked(stored);
    setDismissed(localStorage.getItem(dismissKey(uid)) === "1");
    setMounted(true);
  }, [uid, hasCompletedStep]);

  // Persist checked state
  useEffect(() => {
    if (!uid || !mounted) return;
    localStorage.setItem(lsKey(uid), JSON.stringify(checked));
  }, [checked, uid, mounted]);

  const completedCount = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((completedCount / ITEMS.length) * 100);
  const canDismiss = completedCount >= 3;

  const handleDismiss = () => {
    localStorage.setItem(dismissKey(uid), "1");
    setDismissed(true);
  };

  if (!mounted || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl border border-[#3B82F6]/20 bg-[#3B82F6]/5 p-5"
      >
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Sparkles className="h-3.5 w-3.5 text-[#29ABE2]" />
              <p className="text-sm font-semibold">Getting started</p>
              <span className="text-xs text-muted-foreground font-normal">{pct}% done</span>
            </div>
            <Progress value={pct} className="h-1.5 w-40 bg-[#3B82F6]/15" />
          </div>
          {canDismiss && (
            <button
              onClick={handleDismiss}
              className="shrink-0 rounded-md p-1 text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Checklist */}
        <ul className="space-y-1.5">
          {ITEMS.map((item) => {
            const done = !!checked[item.id];
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    done
                      ? "text-muted-foreground"
                      : "hover:bg-[#3B82F6]/8 text-foreground/90"
                  }`}
                >
                  <span className="shrink-0">
                    {done ? (
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                      </motion.span>
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/40" />
                    )}
                  </span>
                  <span className={done ? "line-through" : ""}>{item.label}</span>
                  {!done && <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground/30" />}
                </Link>
              </li>
            );
          })}
        </ul>

        {canDismiss && (
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            You're all set! Hit × to dismiss this card.
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
