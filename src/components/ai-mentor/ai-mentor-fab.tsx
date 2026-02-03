"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BrainCircuit, Sparkles, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { AIMentorSheet } from "./ai-mentor-sheet";
import { HyperpersonalizationModal } from "@/components/hyperpersonalization/hyperpersonalization-modal";
import { Timestamp } from "firebase/firestore";

// Helper to check if subscription is active and not expired
function isSubscriptionActive(subscription: any): boolean {
  if (!subscription) return false;
  if (subscription.tier !== 'premium') return false;
  if (subscription.status !== 'active') return false;

  // Check if subscription has expired
  if (subscription.currentPeriodEnd) {
    let endDate: Date;
    if (subscription.currentPeriodEnd instanceof Timestamp) {
      endDate = subscription.currentPeriodEnd.toDate();
    } else if (subscription.currentPeriodEnd instanceof Date) {
      endDate = subscription.currentPeriodEnd;
    } else if (typeof subscription.currentPeriodEnd === 'string') {
      endDate = new Date(subscription.currentPeriodEnd);
    } else if (typeof subscription.currentPeriodEnd === 'object' && 'seconds' in subscription.currentPeriodEnd) {
      endDate = new Date((subscription.currentPeriodEnd as any).seconds * 1000);
    } else if (typeof subscription.currentPeriodEnd === 'object' && '_seconds' in subscription.currentPeriodEnd) {
      endDate = new Date((subscription.currentPeriodEnd as any)._seconds * 1000);
    } else {
      return true;
    }

    if (endDate < new Date()) {
      return false;
    }
  }

  return true;
}

export function AIMentorFAB() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isHyperModalOpen, setIsHyperModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [currentDomain, setCurrentDomain] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Check if user has premium access
  const isPremium = user?.flags?.bypassPremium === true ||
                    user?.roles?.admin === true ||
                    isSubscriptionActive(user?.subscription);

  // Detect domain from URL if on a roadmap page
  useEffect(() => {
    const roadmapMatch = pathname.match(/\/roadmap\/([^\/]+)/);
    if (roadmapMatch) {
      setCurrentDomain(roadmapMatch[1]);
    } else {
      setCurrentDomain(null);
    }
  }, [pathname]);

  const handleHyperpersonalization = () => {
    if (!isPremium) {
      setIsUpgradeModalOpen(true);
      return;
    }
    if (!currentDomain) {
      toast({
        title: "Navigate to a Roadmap",
        description: "Open a roadmap first to personalize it with AI.",
      });
      return;
    }
    setIsHyperModalOpen(true);
  };

  const handleAIMentor = () => {
    if (!isPremium) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setIsSheetOpen(true);
  };

  const handleHyperComplete = () => {
    // Trigger page refresh to show updated roadmap
    window.location.reload();
  };

  const handleUpgrade = () => {
    setIsUpgradeModalOpen(false);
    router.push("/pricing");
  };

  return (
    <>
      <TooltipProvider>
        <motion.div
          className="fixed bottom-6 right-6 z-40 flex flex-col gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          {/* Hyperpersonalization Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full shadow-lg bg-background border-border hover:bg-muted"
                  onClick={handleHyperpersonalization}
                >
                  <Sparkles className="h-5 w-5 text-foreground" />
                </Button>
                {!isPremium && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-yellow-500 flex items-center justify-center">
                    <Lock className="h-3 w-3 text-yellow-950" />
                  </div>
                )}
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>
                {!isPremium
                  ? "Premium: Hyperpersonalize roadmap"
                  : currentDomain
                    ? "Hyperpersonalize this roadmap"
                    : "Open a roadmap to personalize"}
              </p>
            </TooltipContent>
          </Tooltip>

          {/* AI Mentor Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Button
                  size="icon"
                  className="h-14 w-14 rounded-full shadow-lg bg-foreground text-background hover:bg-foreground/90"
                  onClick={handleAIMentor}
                >
                  <BrainCircuit className="h-6 w-6" />
                </Button>
                {!isPremium && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-yellow-500 flex items-center justify-center">
                    <Lock className="h-3 w-3 text-yellow-950" />
                  </div>
                )}
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{!isPremium ? "Premium: Chat with AI Mentor" : "Chat with AI Mentor"}</p>
            </TooltipContent>
          </Tooltip>
        </motion.div>
      </TooltipProvider>

      {/* Upgrade Modal for Free Users */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Premium Feature
            </DialogTitle>
            <DialogDescription className="pt-2">
              This feature is available exclusively for premium subscribers. Upgrade to unlock:
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 py-4">
            <li className="flex items-center gap-2 text-sm">
              <BrainCircuit className="h-4 w-4 text-primary" />
              <span>AI Mentor - Your personal learning assistant</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Hyperpersonalization - Customize your roadmap with AI</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Curated Learning Resources - Weekly study materials</span>
            </li>
          </ul>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsUpgradeModalOpen(false)} className="flex-1">
              Maybe Later
            </Button>
            <Button onClick={handleUpgrade} className="flex-1">
              Upgrade Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AIMentorSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />

      {currentDomain && (
        <HyperpersonalizationModal
          open={isHyperModalOpen}
          onOpenChange={setIsHyperModalOpen}
          domain={currentDomain}
          onComplete={handleHyperComplete}
        />
      )}
    </>
  );
}
