"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileIncompletePrompt() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <BrainCircuit className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        To provide personalized learning guidance, we need to know a bit more about you.
        Complete your profile to unlock your AI Mentor.
      </p>
      <Button onClick={() => router.push("/onboarding")} className="gap-2">
        Complete Profile
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
