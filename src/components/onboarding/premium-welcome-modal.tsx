"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Map, BrainCircuit, Sparkles, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PremiumWelcomeModalProps {
  onDismiss: () => void;
}

const FEATURES = [
  {
    icon: Map,
    name: "Roadmap",
    desc: "A personalised, step-by-step learning path for your domain.",
    color: "#3B82F6",
  },
  {
    icon: BrainCircuit,
    name: "AI Mentor",
    desc: "Ask anything, get unstuck, and stay accountable — 24/7.",
    color: "#8E2DE2",
  },
  {
    icon: Sparkles,
    name: "Learning Resources",
    desc: "Market-researched weekly content curated to your stack.",
    color: "#29ABE2",
  },
];

export function PremiumWelcomeModal({ onDismiss }: PremiumWelcomeModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-2xl rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden"
        >
          {/* Subtle gradient accent */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#3B82F6]/6 via-transparent to-[#8E2DE2]/6" />

          {/* Close button */}
          <button
            onClick={onDismiss}
            className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative px-6 pt-10 pb-8 md:px-10 md:pt-12 md:pb-10 text-center">
            {/* Badge */}
            <div className="mb-5 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-3 py-1 text-xs font-medium text-[#3B82F6]">
                <Sparkles className="h-3 w-3" />
                Premium activated
              </span>
            </div>

            <h2 className="font-headline text-3xl font-bold md:text-4xl">
              You're in. Let's build<br className="hidden sm:block" /> your future.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
              Here's what's unlocked and ready to use right now.
            </p>

            {/* Feature cards */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.15 + i * 0.1 }}
                  className="rounded-xl border border-border/50 bg-background/60 p-4 text-left"
                >
                  <div
                    className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: `${feature.color}18` }}
                  >
                    <feature.icon className="h-4.5 w-4.5" style={{ color: feature.color }} />
                  </div>
                  <p className="text-sm font-semibold">{feature.name}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.5 }}
              className="mt-8"
            >
              <Button
                size="lg"
                onClick={onDismiss}
                className="gap-2 px-8"
              >
                Start exploring
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
