"use client";

import { useAuth } from "@/hooks/use-auth";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { AIMentorChat } from "@/components/ai-mentor/ai-mentor-chat";
import { ProfileIncompletePrompt } from "@/components/ai-mentor/profile-incomplete-prompt";
import { BrainCircuit, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function PremiumUpgradePrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-10 text-center gap-5">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3B82F6]/10">
        <Lock className="h-7 w-7 text-[#3B82F6]" />
      </div>
      <div>
        <h3 className="font-semibold text-base mb-1">AI Mentor is a Premium Feature</h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
          Get instant answers, concept explanations, and accountability check-ins with your personal AI Mentor — available on the Premium plan.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <Button asChild className="gap-2">
          <Link href="/pricing">
            <Sparkles className="h-4 w-4" />
            Upgrade to Premium
          </Link>
        </Button>
        <p className="text-[11px] text-muted-foreground">
          Also unlocks hyperpersonalization &amp; weekly resources
        </p>
      </div>
    </div>
  );
}

export default function AIMentorPage() {
  const { user } = useAuth();
  const { hasAccess } = useFeatureAccess("chat");

  return (
    // Escape the container's px-4/sm:px-6 py-5 padding, fill from navbar down
    <div className="-mx-4 sm:-mx-6 -my-5 flex flex-col h-[calc(100vh-3rem)]">

      {/* ── Header ── */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-3.5 border-b border-border/60 bg-card/80 backdrop-blur-sm">
        <div className="h-9 w-9 rounded-xl bg-foreground flex items-center justify-center shrink-0">
          <BrainCircuit className="h-5 w-5 text-background" />
        </div>
        <div>
          <h1 className="font-semibold text-sm leading-tight">AI Mentor</h1>
          <p className="text-xs text-muted-foreground leading-tight">Your personalized learning companion</p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-hidden">
        {!hasAccess ? (
          <PremiumUpgradePrompt />
        ) : user?.profileComplete === false ? (
          <ProfileIncompletePrompt />
        ) : (
          <AIMentorChat />
        )}
      </div>

    </div>
  );
}
