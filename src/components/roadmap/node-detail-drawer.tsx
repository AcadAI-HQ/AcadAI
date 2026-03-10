"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  CheckCircle2,
  Circle,
  ExternalLink,
  BookOpen,
  Target,
  Sparkles,
  Youtube,
  FileText,
  GraduationCap,
  Globe,
  Play,
  Code,
  Newspaper,
  BrainCircuit,
  Lock,
  Send,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoadmapProgress } from "@/types";
import { markStepComplete } from "@/lib/progress-service";
import { useState, useMemo, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import {
  getChatMessages,
  addMessageToSession,
} from "@/lib/chat-service";
import type { ChatMessage } from "@/types";
import Link from "next/link";

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
  resources: string[];
}

interface NodeDetailDrawerProps {
  step: FlattenedStep | null;
  open: boolean;
  onClose: () => void;
  onComplete: (stepId: string) => void;
  progress: RoadmapProgress | null;
  userId: string;
  domain: string;
  hasMentorAccess?: boolean;
}

// Parse URL to get resource info
interface ParsedResource {
  url: string;
  title: string;
  domain: string;
  type: "video" | "article" | "tutorial" | "documentation" | "course" | "tool";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function parseResource(url: string): ParsedResource {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");

    // Detect resource type based on domain
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      return {
        url,
        title: "YouTube Tutorial",
        domain: "youtube.com",
        type: "video",
        icon: Youtube,
        color: "text-red-500 bg-red-500/10",
      };
    }

    if (hostname.includes("developer.mozilla.org") || hostname.includes("mdn")) {
      return {
        url,
        title: "MDN Web Docs",
        domain: "developer.mozilla.org",
        type: "documentation",
        icon: BookOpen,
        color: "text-blue-500 bg-blue-500/10",
      };
    }

    if (hostname.includes("freecodecamp.org")) {
      return {
        url,
        title: "freeCodeCamp",
        domain: "freecodecamp.org",
        type: "course",
        icon: GraduationCap,
        color: "text-green-500 bg-green-500/10",
      };
    }

    if (hostname.includes("css-tricks.com")) {
      return {
        url,
        title: "CSS-Tricks",
        domain: "css-tricks.com",
        type: "article",
        icon: Newspaper,
        color: "text-orange-500 bg-orange-500/10",
      };
    }

    if (hostname.includes("javascript.info")) {
      return {
        url,
        title: "JavaScript.info",
        domain: "javascript.info",
        type: "tutorial",
        icon: Code,
        color: "text-yellow-500 bg-yellow-500/10",
      };
    }

    if (hostname.includes("react.dev") || hostname.includes("reactjs.org")) {
      return {
        url,
        title: "React Documentation",
        domain: "react.dev",
        type: "documentation",
        icon: BookOpen,
        color: "text-cyan-500 bg-cyan-500/10",
      };
    }

    if (hostname.includes("tailwindcss.com")) {
      return {
        url,
        title: "Tailwind CSS Docs",
        domain: "tailwindcss.com",
        type: "documentation",
        icon: BookOpen,
        color: "text-teal-500 bg-teal-500/10",
      };
    }

    if (hostname.includes("greensock.com") || hostname.includes("gsap")) {
      return {
        url,
        title: "GSAP Documentation",
        domain: "greensock.com",
        type: "documentation",
        icon: Play,
        color: "text-green-400 bg-green-400/10",
      };
    }

    if (hostname.includes("framer.com")) {
      return {
        url,
        title: "Framer Motion",
        domain: "framer.com",
        type: "documentation",
        icon: Sparkles,
        color: "text-purple-500 bg-purple-500/10",
      };
    }

    if (hostname.includes("github.com")) {
      return {
        url,
        title: "GitHub Repository",
        domain: "github.com",
        type: "tool",
        icon: Code,
        color: "text-gray-400 bg-gray-400/10",
      };
    }

    if (hostname.includes("udemy.com") || hostname.includes("coursera.org") || hostname.includes("pluralsight.com")) {
      return {
        url,
        title: hostname.split(".")[0].charAt(0).toUpperCase() + hostname.split(".")[0].slice(1),
        domain: hostname,
        type: "course",
        icon: GraduationCap,
        color: "text-violet-500 bg-violet-500/10",
      };
    }

    if (hostname.includes("patterns.dev")) {
      return {
        url,
        title: "Patterns.dev",
        domain: "patterns.dev",
        type: "tutorial",
        icon: FileText,
        color: "text-indigo-500 bg-indigo-500/10",
      };
    }

    if (hostname.includes("kentcdodds.com")) {
      return {
        url,
        title: "Kent C. Dodds Blog",
        domain: "kentcdodds.com",
        type: "article",
        icon: Newspaper,
        color: "text-amber-500 bg-amber-500/10",
      };
    }

    // Default case
    return {
      url,
      title: hostname.charAt(0).toUpperCase() + hostname.slice(1),
      domain: hostname,
      type: "article",
      icon: Globe,
      color: "text-primary bg-primary/10",
    };
  } catch {
    return {
      url,
      title: "Resource",
      domain: "external",
      type: "article",
      icon: ExternalLink,
      color: "text-muted-foreground bg-muted",
    };
  }
}

// Generate additional suggested resources based on topic
function generateSuggestedResources(topic: string): ParsedResource[] {
  const encodedTopic = encodeURIComponent(topic);
  return [
    {
      url: `https://www.youtube.com/results?search_query=${encodedTopic}+tutorial`,
      title: "YouTube Tutorials",
      domain: "youtube.com",
      type: "video",
      icon: Youtube,
      color: "text-red-500 bg-red-500/10",
    },
    {
      url: `https://dev.to/search?q=${encodedTopic}`,
      title: "Dev.to Articles",
      domain: "dev.to",
      type: "article",
      icon: Newspaper,
      color: "text-gray-400 bg-gray-400/10",
    },
    {
      url: `https://github.com/search?q=${encodedTopic}&type=repositories`,
      title: "GitHub Projects",
      domain: "github.com",
      type: "tool",
      icon: Code,
      color: "text-gray-400 bg-gray-400/10",
    },
  ];
}

// Resource Card Component
function ResourceCard({ resource }: { resource: ParsedResource }) {
  const Icon = resource.icon;

  return (
    <motion.a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-accent/50 hover:border-primary/30 transition-all group"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={cn("p-2.5 rounded-lg", resource.color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
          {resource.title}
        </h4>
        <p className="text-xs text-muted-foreground truncate">{resource.domain}</p>
      </div>
      <Badge variant="secondary" className="text-xs capitalize shrink-0">
        {resource.type}
      </Badge>
      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
    </motion.a>
  );
}

// ---------------------------------------------------------------------------
// Compact mentor chat embedded inside the step drawer
// ---------------------------------------------------------------------------

interface MentorStepChatProps {
  step: FlattenedStep;
  domain: string;
  userId: string;
}

function MentorStepChat({ step, domain, userId }: MentorStepChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatDomain = `roadmap-${domain}`;

  const stepSuggestedPrompts = [
    `Explain "${step.title}" simply`,
    `What should I build for this?`,
    `How long will this take realistically?`,
  ];

  useEffect(() => {
    async function load() {
      if (!userId) return;
      try {
        const msgs = await getChatMessages(userId, chatDomain, 20);
        setMessages(msgs);
      } catch {
        // silent
      } finally {
        setIsLoadingHistory(false);
      }
    }
    load();
  }, [userId, chatDomain]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || !user || isLoading) return;
    setInput("");
    setIsLoading(true);

    try {
      const saved = await addMessageToSession(userId, chatDomain, { role: "user", content: msg });
      setMessages((prev) => [...prev, saved]);

      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not authenticated");
      const token = await currentUser.getIdToken();

      const res = await fetch("/api/ai-mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: msg,
          domain,
          chatHistory: messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
          stepContext: {
            stepId: step.id,
            stepTitle: step.title,
            sectionTitle: step.sectionTitle,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get response");

      const aiMsg = await addMessageToSession(userId, chatDomain, {
        role: "assistant",
        content: data.response,
      });
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg = await addMessageToSession(userId, chatDomain, {
        role: "assistant",
        content: err.message || "Sorry, I couldn't process that. Please try again.",
      });
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[340px]">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-1"
      >
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4 text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
              <BrainCircuit className="h-6 w-6 text-[#3B82F6]" />
            </div>
            <p className="text-xs text-muted-foreground max-w-[220px]">
              Ask me anything about <strong>{step.title}</strong>
            </p>
            <div className="flex flex-col gap-1.5 w-full">
              {stepSuggestedPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  className="text-xs text-left px-3 py-2 rounded-lg border border-border/60 hover:border-[#3B82F6]/40 hover:bg-[#3B82F6]/5 transition-colors text-muted-foreground hover:text-foreground"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex gap-2",
                  m.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "text-xs px-3 py-2 rounded-xl max-w-[85%] leading-relaxed",
                    m.role === "user"
                      ? "bg-[#3B82F6] text-white rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t mt-3">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about this step..."
          className="min-h-[38px] max-h-[80px] resize-none text-sm"
          rows={1}
          disabled={isLoading}
        />
        <Button
          size="icon"
          className="shrink-0 h-[38px] w-[38px]"
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function NodeDetailDrawer({
  step,
  open,
  onClose,
  onComplete,
  progress,
  userId,
  domain,
  hasMentorAccess = false,
}: NodeDetailDrawerProps) {
  const [completing, setCompleting] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Parse resources
  const parsedResources = useMemo(() => {
    if (!step?.resources) return [];
    return step.resources.map(parseResource);
  }, [step?.resources]);

  // Generate suggested resources
  const suggestedResources = useMemo(() => {
    if (!step) return [];
    return generateSuggestedResources(step.title);
  }, [step]);

  if (!step) return null;

  const isCompleted = progress?.completedSteps.includes(step.id) || false;

  const handleMarkComplete = async () => {
    if (!userId || !step) return;

    setCompleting(true);
    try {
      // Calculate next step ID
      const [sectionIdx, subtopicIdx] = step.id.split("-").map(Number);
      let nextStepId: string | null = null;

      if (!step.isLastInSection) {
        nextStepId = `${sectionIdx}-${subtopicIdx + 1}`;
      } else {
        // Move to first step of next section
        nextStepId = `${sectionIdx + 1}-0`;
      }

      await markStepComplete(userId, domain, step.id, nextStepId);
      onComplete(step.id);
    } catch (error) {
      console.error("Error marking step complete:", error);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[90vh] rounded-t-3xl bg-white"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="max-w-2xl mx-auto h-full flex flex-col">
          <SheetHeader className="text-left pb-4 border-b shrink-0">
            {/* Section badge */}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {step.sectionTitle}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Step {step.subtopicIndex + 1} of {step.totalInSection}
              </span>
            </div>

            <SheetTitle className="text-2xl flex items-center gap-3">
              {isCompleted ? (
                <CheckCircle2 className="h-7 w-7 text-green-500 shrink-0" />
              ) : (
                <Target className="h-7 w-7 text-primary shrink-0" />
              )}
              {step.title}
            </SheetTitle>

            <SheetDescription className="text-base">
              {step.sectionDescription}
            </SheetDescription>
          </SheetHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto py-4">
            <Tabs defaultValue="resources" className="w-full">
              <TabsList className={cn("grid w-full mb-4", hasMentorAccess ? "grid-cols-3" : "grid-cols-2")}>
                <TabsTrigger value="resources" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Resources
                </TabsTrigger>
                <TabsTrigger value="tips" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Tips
                </TabsTrigger>
                {hasMentorAccess ? (
                  <TabsTrigger value="mentor" className="flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4" />
                    Ask Mentor
                  </TabsTrigger>
                ) : (
                  <Link
                    href="/pricing"
                    className="flex items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium text-muted-foreground border border-dashed border-border/60 hover:border-[#3B82F6]/40 hover:text-[#3B82F6] transition-colors"
                  >
                    <Lock className="h-3 w-3" />
                    Mentor
                  </Link>
                )}
              </TabsList>

              <TabsContent value="resources" className="space-y-4 mt-0">
                {/* Curated Resources */}
                {parsedResources.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Curated Resources
                    </h3>
                    <div className="space-y-2">
                      {parsedResources.map((resource, idx) => (
                        <ResourceCard key={idx} resource={resource} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Resources */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Explore More
                  </h3>
                  <div className="space-y-2">
                    {suggestedResources.map((resource, idx) => (
                      <ResourceCard key={idx} resource={resource} />
                    ))}
                  </div>
                </div>

                {/* Progress indicator within section */}
                <div className="pt-4">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    Section Progress
                  </h3>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: step.totalInSection }).map((_, idx) => {
                      const itemStepId = `${step.sectionIndex}-${idx}`;
                      const itemCompleted =
                        progress?.completedSteps.includes(itemStepId);
                      const isCurrent = idx === step.subtopicIndex;

                      return (
                        <div
                          key={idx}
                          className={cn(
                            "h-2 flex-1 rounded-full transition-colors",
                            itemCompleted
                              ? "bg-green-500"
                              : isCurrent
                              ? "bg-primary"
                              : "bg-muted"
                          )}
                        />
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {progress?.completedSteps.filter(id =>
                      id.startsWith(`${step.sectionIndex}-`)
                    ).length || 0} of {step.totalInSection} completed in this section
                  </p>
                </div>
              </TabsContent>

              {/* Ask Mentor Tab */}
              {hasMentorAccess && step && (
                <TabsContent value="mentor" className="mt-0">
                  <MentorStepChat step={step} domain={domain} userId={userId} />
                </TabsContent>
              )}

              <TabsContent value="tips" className="space-y-4 mt-0">
                {/* Learning Tips */}
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3 text-primary">
                    <Sparkles className="h-5 w-5" />
                    <h3 className="font-semibold">Learning Tips</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">1</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Focus on understanding the core concepts of <strong className="text-foreground">{step.title}</strong> before moving to advanced topics
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">2</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Practice with small projects to reinforce your learning
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">3</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Don't rush - take time to truly understand each concept
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">4</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Build something real using what you learn - nothing beats hands-on experience
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Quick Challenge */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-3 text-primary">
                    <Target className="h-5 w-5" />
                    <h3 className="font-semibold">Quick Challenge</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    After studying <strong className="text-foreground">{step.title}</strong>, try to explain it to someone else or write a short blog post about it. Teaching is the best way to solidify your understanding!
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="pt-4 border-t flex gap-3 shrink-0 pb-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {!isCompleted && (
              <Button
                onClick={handleMarkComplete}
                disabled={completing}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                {completing ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Circle className="h-4 w-4" />
                    </motion.div>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Mark as Complete
                  </span>
                )}
              </Button>
            )}
            {isCompleted && (
              <Button variant="secondary" className="flex-1" disabled>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Completed
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
