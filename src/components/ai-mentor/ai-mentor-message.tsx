"use client";

import { cn } from "@/lib/utils";
import { BrainCircuit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ChatMessage } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AIMentorMessageProps {
  message: ChatMessage;
  userPhotoURL?: string | null;
  userDisplayName?: string | null;
  userEmail?: string | null;
}

export function AIMentorMessage({
  message,
  userPhotoURL,
  userDisplayName,
  userEmail,
}: AIMentorMessageProps) {
  const isUser = message.role === "user";

  const getUserInitials = () => {
    if (userDisplayName) {
      return userDisplayName.charAt(0).toUpperCase();
    }
    if (userEmail) {
      return userEmail.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserFallbackUrl = () => {
    return `https://api.dicebear.com/8.x/adventurer/svg?seed=${userEmail || "user"}`;
  };

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-xl transition-colors",
        isUser ? "bg-muted ml-8" : "bg-muted/50 mr-8"
      )}
    >
      {isUser ? (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage
            src={userPhotoURL || getUserFallbackUrl()}
            alt={userDisplayName || "User"}
          />
          <AvatarFallback className="text-xs font-medium">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
          <BrainCircuit className="h-4 w-4" />
        </div>
      )}
      <div className="flex-1 space-y-1 overflow-hidden">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium">{isUser ? "You" : "AI Mentor"}</p>
          <span className="text-[10px] text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
        </div>
        <div
          className={cn(
            "text-sm prose prose-sm dark:prose-invert max-w-none",
            "prose-p:leading-relaxed prose-p:my-1",
            "prose-ul:my-1 prose-ol:my-1 prose-li:my-0",
            "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs",
            "prose-pre:bg-muted prose-pre:p-3 prose-pre:rounded-lg",
            "prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1",
            "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  // Handle both Date objects and Firestore Timestamps
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
