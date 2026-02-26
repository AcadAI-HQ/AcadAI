"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { AIMentorChat } from "./ai-mentor-chat";
import { ProfileIncompletePrompt } from "./profile-incomplete-prompt";
import { BrainCircuit, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AIMentorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PremiumUpgradePrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-10 text-center gap-5">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3B82F6]/10">
        <Lock className="h-7 w-7 text-[#3B82F6]" />
      </div>
      <div>
        <h3 className="font-semibold text-base mb-1">AI Mentor is a Premium Feature</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
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
          Also unlocks roadmaps, hyperpersonalization &amp; weekly resources
        </p>
      </div>
    </div>
  );
}

export function AIMentorSheet({ open, onOpenChange }: AIMentorSheetProps) {
  const { user } = useAuth();
  const { hasAccess } = useFeatureAccess("chat");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-md w-full p-0 flex flex-col"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
              <BrainCircuit className="h-4 w-4 text-background" />
            </div>
            <span>AI Mentor</span>
          </SheetTitle>
          <SheetDescription>
            Your personalized learning companion
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          {!hasAccess ? (
            <PremiumUpgradePrompt />
          ) : user?.profileComplete === false ? (
            <ProfileIncompletePrompt />
          ) : (
            <AIMentorChat />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
