"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { updateUserRoadmap } from "@/lib/roadmap-service";
import type { ChatMessage } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Bot, User, Sparkles, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RoadmapAssessmentDialogProps {
  open: boolean;
  domain: string;
  onComplete: (customizedRoadmap: any) => void;
}

// Define questions with their answer options
const ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    question: "What is your current experience level with {domain}?",
    type: "buttons" as const,
    options: [
      { value: "complete-beginner", label: "Complete Beginner", description: "Never worked with {domain}" },
      { value: "some-basics", label: "Some Basics", description: "Learned a few concepts" },
      { value: "intermediate", label: "Intermediate", description: "Can build simple projects" },
      { value: "advanced", label: "Advanced", description: "Professional experience" },
    ],
  },
  {
    id: 2,
    question: "What topics in {domain} are you already familiar with?",
    type: "buttons" as const,
    options: [
      { value: "none", label: "None", description: "Starting from scratch" },
      { value: "fundamentals", label: "Just Fundamentals", description: "Basic concepts only" },
      { value: "some-advanced", label: "Some Advanced Topics", description: "Beyond basics" },
      { value: "most-topics", label: "Most Topics", description: "Broad knowledge" },
    ],
  },
  {
    id: 3,
    question: "What is your primary learning goal?",
    type: "buttons" as const,
    options: [
      { value: "career-change", label: "Career Change", description: "Get a job in {domain}" },
      { value: "build-projects", label: "Build Projects", description: "Create real applications" },
      { value: "enhance-skills", label: "Enhance Skills", description: "Level up current knowledge" },
      { value: "explore", label: "Explore & Learn", description: "General learning interest" },
    ],
  },
  {
    id: 4,
    question: "How much time can you dedicate to learning per week?",
    type: "buttons" as const,
    options: [
      { value: "5-10-hours", label: "5-10 hours", description: "Part-time learning" },
      { value: "10-20-hours", label: "10-20 hours", description: "Serious commitment" },
      { value: "20-30-hours", label: "20-30 hours", description: "Full-time learning" },
      { value: "30-plus-hours", label: "30+ hours", description: "Intensive bootcamp pace" },
    ],
  },
  {
    id: 5,
    question: "Any specific technologies or frameworks you want to focus on?",
    type: "text" as const,
    placeholder: "e.g., React, TypeScript, Next.js, or leave blank for general path",
  },
  {
    id: 6,
    question: "Anything else we should know to personalize your roadmap?",
    type: "text" as const,
    placeholder: "e.g., learning style preferences, time constraints, specific goals...",
  },
];

export function RoadmapAssessmentDialog({
  open,
  domain,
  onComplete,
}: RoadmapAssessmentDialogProps) {
  const { user } = useAuth();
  const { hasAccess: hasHyperpersonalization } = useFeatureAccess('hyperpersonalization');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [textInput, setTextInput] = useState("");
  const [isCustomizing, setIsCustomizing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      // Smooth scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [messages, currentQuestionIndex]);

  // Reset and start assessment when dialog opens
  useEffect(() => {
    if (open && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startAssessment();
    }

    // Reset when dialog closes
    if (!open) {
      hasStartedRef.current = false;
      setMessages([]);
      setCurrentQuestionIndex(-1);
      setAnswers({});
      setTextInput("");
      setIsCustomizing(false);
    }
  }, [open]);

  const startAssessment = () => {
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: `welcome_${Date.now()}`,
      role: "assistant",
      content: `Hi! 👋 I'm here to personalize your ${domain} learning roadmap. I'll ask you a few quick questions to understand your background and goals. This will help me create a roadmap tailored specifically for you.\n\nLet's get started!`,
      timestamp: new Date(),
    };

    setMessages([welcomeMessage]);

    // Ask first question after a short delay
    setTimeout(() => {
      askQuestion(0);
    }, 800);
  };

  const askQuestion = (questionIndex: number) => {
    if (questionIndex >= ASSESSMENT_QUESTIONS.length) {
      // All questions answered - start customization
      customizeRoadmap();
      return;
    }

    const questionData = ASSESSMENT_QUESTIONS[questionIndex];
    const question = questionData.question.replace(/{domain}/g, domain);

    const questionMessage: ChatMessage = {
      id: `q_${questionIndex}_${Date.now()}`,
      role: "assistant",
      content: question, // Remove "Question X/Y" from content (it's in the header)
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, questionMessage]);
    setCurrentQuestionIndex(questionIndex);
  };

  const handleButtonAnswer = (value: string, label: string) => {
    const questionIndex = currentQuestionIndex;

    // Save answer
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));

    // Add user answer to messages
    const userMsg: ChatMessage = {
      id: `a_${questionIndex}_${Date.now()}`,
      role: "user",
      content: label,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Move to next question after a short delay
    setTimeout(() => {
      askQuestion(questionIndex + 1);
    }, 500);
  };

  const handleTextAnswer = () => {
    if (!textInput.trim() && currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
      // For non-last questions, allow skipping
      const userMsg: ChatMessage = {
        id: `a_${currentQuestionIndex}_${Date.now()}`,
        role: "user",
        content: "(Skipped)",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: "No specific preference",
      }));
    } else {
      const answer = textInput.trim() || "No additional information";

      // Save answer
      setAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: answer,
      }));

      // Add user answer to messages
      const userMsg: ChatMessage = {
        id: `a_${currentQuestionIndex}_${Date.now()}`,
        role: "user",
        content: answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
    }

    setTextInput("");

    // Move to next question
    setTimeout(() => {
      askQuestion(currentQuestionIndex + 1);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextAnswer();
    }
  };

  const customizeRoadmap = async () => {
    if (!user) return;

    // Check if user has access to hyperpersonalization
    if (!hasHyperpersonalization) {
      const errorMsg: ChatMessage = {
        id: `error_${Date.now()}`,
        role: "assistant",
        content: "I'm sorry, but hyperpersonalization is a premium feature. Please upgrade to premium to get AI-customized roadmaps tailored to your needs.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);

      setTimeout(() => {
        onComplete(null);
      }, 2000);
      return;
    }

    setIsCustomizing(true);

    // Show customization message
    const customizingMsg: ChatMessage = {
      id: `customizing_${Date.now()}`,
      role: "assistant",
      content: "Perfect! I have all the information I need. Give me a moment while I create your personalized roadmap... ✨",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, customizingMsg]);

    try {
      // Build answers array
      const answersArray = ASSESSMENT_QUESTIONS.map((q, i) => ({
        question: q.question.replace(/{domain}/g, domain),
        answer: answers[i] || "Not specified",
      }));

      // Get the user's Firebase auth token
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      const idToken = await currentUser.getIdToken();

      // Call API to customize roadmap with auth token
      const response = await fetch("/api/roadmap/customize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          userId: user.uid,
          domain,
          answers: answersArray,
          userProfile: {
            userType: user.userType,
            skills: user.skills,
            domainExperience: user.domainExperience,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle premium feature requirement specifically
        if (response.status === 403 && errorData.isPremiumFeature) {
          throw new Error(errorData.message || "This feature requires a premium subscription");
        }

        throw new Error(errorData.message || errorData.details || "Failed to customize roadmap");
      }

      const data = await response.json();

      // Save the customized roadmap to Firestore
      try {
        await updateUserRoadmap(
          user.uid,
          domain,
          data.customizedRoadmap,
          'ai_customization',
          'Roadmap customized based on initial assessment'
        );
        console.log('Saved customized roadmap to Firestore');
      } catch (saveError) {
        console.error('Error saving roadmap to Firestore:', saveError);
        // Continue anyway - we have the roadmap in memory
      }

      // Show success message
      const successMsg: ChatMessage = {
        id: `success_${Date.now()}`,
        role: "assistant",
        content: "🎉 Your personalized roadmap is ready! I've tailored it based on your experience and goals. Let me show you...",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, successMsg]);

      // Wait a moment before closing
      setTimeout(() => {
        onComplete(data.customizedRoadmap);
      }, 1500);
    } catch (error: any) {
      console.error("Error customizing roadmap:", error);

      const errorMsg: ChatMessage = {
        id: `error_${Date.now()}`,
        role: "assistant",
        content: `I encountered an error while customizing your roadmap: ${error.message}. Let me load a default roadmap for you, and you can customize it later through the AI Assistant.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMsg]);

      // Fallback to default
      setTimeout(() => {
        onComplete(null);
      }, 2000);
    } finally {
      setIsCustomizing(false);
    }
  };

  const progress = ((currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100;
  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-4xl h-[80vh] flex flex-col p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            Personalize Your Roadmap
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Answer a few questions to get a roadmap tailored to your experience and goals
          </DialogDescription>
          {!isCustomizing && currentQuestionIndex < ASSESSMENT_QUESTIONS.length && currentQuestionIndex >= 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Progress</span>
                <span>
                  {currentQuestionIndex + 1} of {ASSESSMENT_QUESTIONS.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </DialogHeader>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))}

            {/* Show answer options for current question */}
            {!isCustomizing &&
              currentQuestionIndex >= 0 &&
              currentQuestionIndex < ASSESSMENT_QUESTIONS.length &&
              currentQuestion?.type === "buttons" && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {currentQuestion.options?.map((option) => (
                    <Button
                      key={option.value}
                      variant="outline"
                      className="h-auto flex flex-col items-start p-4 text-left hover:bg-primary/10 hover:border-primary transition-all group"
                      onClick={() => handleButtonAnswer(option.value, option.label)}
                    >
                      <div className="flex items-start gap-2 w-full">
                        <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium text-foreground group-hover:text-foreground">
                            {option.label.replace(/{domain}/g, domain)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 group-hover:text-muted-foreground">
                            {option.description.replace(/{domain}/g, domain)}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}

            {isCustomizing && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-lg font-medium">Creating your personalized roadmap...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This may take 15-30 seconds
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area - Only show for text questions */}
        {!isCustomizing &&
          currentQuestionIndex >= 0 &&
          currentQuestionIndex < ASSESSMENT_QUESTIONS.length &&
          currentQuestion?.type === "text" && (
            <div className="p-6 pt-4 border-t">
              <div className="flex flex-col gap-2">
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={currentQuestion.placeholder}
                  className="min-h-[80px] resize-none"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleTextAnswer}
                    size="sm"
                  >
                    {currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1 ? "Finish" : "Skip"}
                  </Button>
                  <Button onClick={handleTextAnswer} size="sm" disabled={!textInput.trim()}>
                    {currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1 ? "Generate Roadmap" : "Next"}
                  </Button>
                </div>
              </div>
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
}
