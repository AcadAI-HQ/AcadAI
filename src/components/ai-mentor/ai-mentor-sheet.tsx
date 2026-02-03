"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { AIMentorChat } from "./ai-mentor-chat";
import { ProfileIncompletePrompt } from "./profile-incomplete-prompt";
import { BrainCircuit } from "lucide-react";

interface AIMentorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIMentorSheet({ open, onOpenChange }: AIMentorSheetProps) {
  const { user } = useAuth();

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
          {user?.profileComplete === false ? (
            <ProfileIncompletePrompt />
          ) : (
            <AIMentorChat />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
