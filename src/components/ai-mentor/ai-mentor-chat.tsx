"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Trash2, BrainCircuit, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { AIMentorMessage } from "./ai-mentor-message";
import type { ChatMessage } from "@/types";
import {
  getChatMessages,
  addMessageToSession,
  clearChatHistory,
} from "@/lib/chat-service";

// Backend API URL
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

// Suggested prompts for new users
const SUGGESTED_PROMPTS = [
  "What should I learn first?",
  "How do I stay motivated?",
  "Suggest a project for me",
  "Explain my roadmap",
];

interface UsageStatus {
  isPremium: boolean;
  dailyCount: number;
  monthlyCount: number;
  dailyRemaining: number;
  monthlyRemaining: number;
  dailyLimit: number;
  monthlyLimit: number;
}

export function AIMentorChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use "ai-mentor" as the domain for general mentoring chat
  const chatDomain = "ai-mentor";

  // Fetch usage status
  const fetchUsageStatus = async () => {
    if (!user?.uid) return;
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const response = await fetch(`${API_URL}/api/ai-mentor/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsageStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch usage status:", error);
    }
  };

  // Load usage status on mount
  useEffect(() => {
    fetchUsageStatus();
  }, [user?.uid]);

  // Load existing messages on mount
  useEffect(() => {
    async function loadMessages() {
      if (!user?.uid) return;
      try {
        const existingMessages = await getChatMessages(user.uid, chatDomain);
        setMessages(existingMessages);
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    }
    loadMessages();
  }, [user?.uid]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const userMessage = (messageText || input).trim();
    if (!userMessage || !user?.uid || isLoading) return;

    setInput("");
    setIsLoading(true);

    try {
      // Add user message to local state and Firestore
      const savedUserMessage = await addMessageToSession(user.uid, chatDomain, {
        role: "user",
        content: userMessage,
      });
      setMessages((prev) => [...prev, savedUserMessage]);

      // Get Firebase auth token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Not authenticated");
      }
      const token = await currentUser.getIdToken();

      // Prepare chat history for context
      const chatHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call the backend AI Mentor API
      // User context is fetched server-side from Firebase for security
      const response = await fetch(`${API_URL}/api/ai-mentor/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          chatHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get response");
      }

      // Save assistant response to Firestore and update state
      const savedAssistantMessage = await addMessageToSession(user.uid, chatDomain, {
        role: "assistant",
        content: data.response,
      });
      setMessages((prev) => [...prev, savedAssistantMessage]);

      // Refresh usage status after successful message
      fetchUsageStatus();

    } catch (error: any) {
      console.error("Failed to send message:", error);

      // Check if it's a rate limit error
      const isRateLimitError = error.message?.includes("daily limit") || error.message?.includes("monthly limit");

      toast({
        title: isRateLimitError ? "Limit Reached" : "Error",
        description: error.message || "Failed to get AI response. Please try again.",
        variant: "destructive",
      });

      // Add appropriate error message to chat for user feedback
      let errorContent = "I'm sorry, I encountered an error processing your request. Please try again.";
      if (isRateLimitError) {
        errorContent = error.message;
        // Refresh usage status to show updated limits
        fetchUsageStatus();
      }

      const errorMessage = await addMessageToSession(user.uid, chatDomain, {
        role: "assistant",
        content: errorContent,
      });
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleClearChat = async () => {
    if (!user?.uid || isClearing) return;

    setIsClearing(true);
    try {
      await clearChatHistory(user.uid, chatDomain);
      setMessages([]);
      toast({
        title: "Chat cleared",
        description: "Your conversation has been cleared.",
      });
    } catch (error) {
      console.error("Failed to clear chat:", error);
      toast({
        title: "Error",
        description: "Failed to clear chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with usage status and clear button */}
      <div className="px-4 py-2 border-b flex items-center justify-between">
        {/* Usage status */}
        {usageStatus && (
          <div className={`flex items-center gap-2 text-xs ${
            usageStatus.dailyRemaining === 0 || usageStatus.monthlyRemaining === 0
              ? "text-destructive"
              : usageStatus.dailyRemaining <= 5 || usageStatus.monthlyRemaining <= 50
              ? "text-yellow-500"
              : "text-muted-foreground"
          }`}>
            <MessageCircle className="h-3 w-3" />
            <span>
              Today: {usageStatus.dailyRemaining}/{usageStatus.dailyLimit}
            </span>
            <span className="opacity-50">•</span>
            <span>
              Month: {usageStatus.monthlyRemaining}/{usageStatus.monthlyLimit}
            </span>
          </div>
        )}
        {!usageStatus && <div />}

        {/* Clear button */}
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            disabled={isClearing}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            {isClearing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
            <span className="ml-1">Clear chat</span>
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center mb-4">
                <BrainCircuit className="h-8 w-8 text-background" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Hi, I'm your AI Mentor!</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                I'm here to guide your learning journey. Ask me anything about your roadmap, learning strategies, or tech topics.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="text-xs h-8"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <AIMentorMessage
                  key={message.id}
                  message={message}
                  userPhotoURL={user?.photoURL}
                  userDisplayName={user?.displayName}
                  userEmail={user?.email}
                />
              ))}
              {isLoading && (
                <div className="flex gap-3 p-4 rounded-xl bg-muted/50 mr-8">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-background" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t">
        {usageStatus && (usageStatus.dailyRemaining === 0 || usageStatus.monthlyRemaining === 0) ? (
          <div className="text-center py-2">
            <p className="text-sm text-destructive font-medium">
              {usageStatus.dailyRemaining === 0
                ? "You've reached your daily message limit."
                : "You've reached your monthly message limit."}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {usageStatus.dailyRemaining === 0
                ? "Your daily limit resets at midnight."
                : "Your monthly limit resets on the 1st of next month."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your AI Mentor..."
                className="min-h-[44px] max-h-[120px] resize-none"
                rows={1}
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </>
        )}
      </div>
    </div>
  );
}
