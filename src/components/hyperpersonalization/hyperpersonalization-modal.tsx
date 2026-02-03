"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  Crown,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

interface Question {
  id: string;
  type: "multi-select" | "single-select" | "text";
  question: string;
  description?: string;
  placeholder?: string;
  options?: Array<{
    value: string;
    label: string;
    subtopics?: string[];
  }>;
}

interface StartResponse {
  success: boolean;
  domain: string;
  domainTitle: string;
  remainingUses: number;
  showWarning: boolean;
  userContext: {
    userType?: string;
    skills?: string[];
    domainExperience?: string;
  };
  questions: Question[];
}

interface GenerateResponse {
  success: boolean;
  roadmap: {
    domain: string;
    type: string;
    overview: string;
    steps: any[];
    personalizationSummary: {
      removedTopics: string[];
      expandedTopics: string[];
      addedTopics: string[];
      estimatedTimeWeeks: number;
      keyRecommendations: string[];
    };
  };
  remainingUses: number;
}

interface HyperpersonalizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain: string;
  onComplete?: () => void;
}

export function HyperpersonalizationModal({
  open,
  onOpenChange,
  domain,
  onComplete,
}: HyperpersonalizationModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [step, setStep] = useState<"loading" | "questions" | "generating" | "complete" | "error">("loading");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [domainTitle, setDomainTitle] = useState("");
  const [remainingUses, setRemainingUses] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse["roadmap"] | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep("loading");
      setCurrentQuestionIndex(0);
      setAnswers({});
      setError(null);
      setResult(null);
      startHyperpersonalization();
    }
  }, [open, domain]);

  const startHyperpersonalization = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError("Please sign in to continue");
        setStep("error");
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_URL}/api/hyperpersonalization/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ domain }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setError("premium_required");
        } else if (response.status === 429) {
          setError(`limit_reached:${data.nextReset}`);
        } else {
          setError(data.message || "Failed to start hyperpersonalization");
        }
        setStep("error");
        return;
      }

      const startData = data as StartResponse;
      setQuestions(startData.questions);
      setDomainTitle(startData.domainTitle);
      setRemainingUses(startData.remainingUses);
      setShowWarning(startData.showWarning);
      setStep("questions");
    } catch (err: any) {
      console.error("Start error:", err);
      setError(err.message || "Something went wrong");
      setStep("error");
    }
  };

  const generateRoadmap = async () => {
    setStep("generating");

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError("Please sign in to continue");
        setStep("error");
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_URL}/api/hyperpersonalization/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ domain, answers }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to generate roadmap");
        setStep("error");
        return;
      }

      const generateData = data as GenerateResponse;
      setResult(generateData.roadmap);
      setRemainingUses(generateData.remainingUses);
      setStep("complete");
    } catch (err: any) {
      console.error("Generate error:", err);
      setError(err.message || "Something went wrong");
      setStep("error");
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      generateRoadmap();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleMultiSelectToggle = (questionId: string, optionValue: string) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (current.includes(optionValue)) {
        return { ...prev, [questionId]: current.filter((v: string) => v !== optionValue) };
      }
      return { ...prev, [questionId]: [...current, optionValue] };
    });
  };

  const handleComplete = () => {
    onOpenChange(false);
    onComplete?.();
    toast({
      title: "Roadmap Personalized!",
      description: "Your learning path has been customized based on your preferences.",
    });
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-0 rounded-none border-0 flex flex-col bg-background">
        {/* Full-screen header */}
        <div className="border-b px-6 py-4 flex items-center justify-between shrink-0">
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-6 w-6 text-primary" />
              Hyperpersonalize Your Roadmap
            </DialogTitle>
            {step === "questions" && (
              <DialogDescription className="text-base">
                {domainTitle} - Step {currentQuestionIndex + 1} of {questions.length}
              </DialogDescription>
            )}
          </DialogHeader>
          {/* Close button is provided by DialogContent */}
        </div>

        <AnimatePresence mode="wait">
          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-6 text-lg text-muted-foreground">Preparing your personalization...</p>
            </motion.div>
          )}

          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6"
            >
              {error === "premium_required" ? (
                <>
                  <div className="h-16 w-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                    <Crown className="h-8 w-8 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
                  <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
                    Hyperpersonalization is available exclusively for premium members.
                    Upgrade to customize your learning path with AI.
                  </p>
                  <Button onClick={() => onOpenChange(false)}>
                    Learn More About Premium
                  </Button>
                </>
              ) : error?.startsWith("limit_reached") ? (
                <>
                  <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Monthly Limit Reached</h3>
                  <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
                    You've used all 3 personalizations this month.
                    Your limit resets on the 1st of next month.
                  </p>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Got it
                  </Button>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Something Went Wrong</h3>
                  <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
                    {error || "Please try again later."}
                  </p>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Close
                  </Button>
                </>
              )}
            </motion.div>
          )}

          {step === "questions" && currentQuestion && (
            <motion.div
              key={`question-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Progress bar */}
              <div className="px-6 py-3 border-b">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm text-muted-foreground">{currentQuestionIndex + 1} of {questions.length}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>

              {/* Main content area */}
              <div className="flex-1 overflow-auto px-6 py-8">
                <div className="max-w-4xl mx-auto">
                  {/* Warning badge for last use */}
                  {showWarning && (
                    <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        This is your last personalization this month. Make it count!
                      </p>
                    </div>
                  )}

                  {/* Question */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-2">{currentQuestion.question}</h2>
                    {currentQuestion.description && (
                      <p className="text-muted-foreground">{currentQuestion.description}</p>
                    )}
                  </div>

                  {/* Answer area - Grid layout for multi-select */}
                  {currentQuestion.type === "multi-select" && currentQuestion.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {currentQuestion.options.map((option) => {
                        const isSelected = (answers[currentQuestion.id] || []).includes(option.value);
                        return (
                          <label
                            key={option.value}
                            className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }`}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleMultiSelectToggle(currentQuestion.id, option.value)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="font-medium block">{option.label}</span>
                              {option.subtopics && option.subtopics.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {option.subtopics.slice(0, 3).join(", ")}
                                  {option.subtopics.length > 3 && ` +${option.subtopics.length - 3} more`}
                                </p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {currentQuestion.type === "single-select" && currentQuestion.options && (
                    <RadioGroup
                      value={answers[currentQuestion.id] || ""}
                      onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                      className="grid grid-cols-1 md:grid-cols-2 gap-3"
                    >
                      {currentQuestion.options.map((option) => {
                        const isSelected = answers[currentQuestion.id] === option.value;
                        return (
                          <label
                            key={option.value}
                            className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }`}
                          >
                            <RadioGroupItem value={option.value} />
                            <span className="font-medium">{option.label}</span>
                          </label>
                        );
                      })}
                    </RadioGroup>
                  )}

                  {currentQuestion.type === "text" && (
                    <Textarea
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder={currentQuestion.placeholder}
                      className="min-h-[150px] text-base"
                    />
                  )}

                  {/* Selection count for multi-select */}
                  {currentQuestion.type === "multi-select" && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      {(answers[currentQuestion.id] || []).length} selected
                    </p>
                  )}
                </div>
              </div>

              {/* Navigation footer */}
              <div className="border-t px-6 py-4 shrink-0">
                <div className="max-w-4xl mx-auto flex justify-between">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleBack}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button size="lg" onClick={handleNext}>
                    {currentQuestionIndex === questions.length - 1 ? (
                      <>
                        Generate Roadmap
                        <Sparkles className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6"
            >
              <div className="relative">
                <Sparkles className="h-16 w-16 text-primary animate-pulse" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="h-16 w-16 text-primary/30" />
                </motion.div>
              </div>
              <h3 className="mt-8 text-2xl font-semibold">Generating Your Personalized Roadmap</h3>
              <p className="mt-3 text-muted-foreground text-center max-w-md">
                Our AI is crafting a custom learning path based on your preferences.
                This may take a moment...
              </p>
            </motion.div>
          )}

          {step === "complete" && result && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Success header */}
              <div className="text-center py-8 px-6">
                <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-semibold">Roadmap Personalized!</h2>
                <p className="text-muted-foreground mt-2">
                  Your learning path has been customized based on your preferences
                </p>
              </div>

              {/* Summary content */}
              <div className="flex-1 overflow-auto px-6 pb-6">
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* What Changed */}
                  <div className="p-6 bg-muted/50 rounded-xl">
                    <h4 className="font-semibold mb-4">What Changed</h4>
                    <div className="space-y-3">
                      {result.personalizationSummary.removedTopics.length > 0 && (
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="shrink-0">Simplified</Badge>
                          <p className="text-sm text-muted-foreground">
                            {result.personalizationSummary.removedTopics.join(", ")}
                          </p>
                        </div>
                      )}
                      {result.personalizationSummary.expandedTopics.length > 0 && (
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="shrink-0 border-primary text-primary">Expanded</Badge>
                          <p className="text-sm text-muted-foreground">
                            {result.personalizationSummary.expandedTopics.join(", ")}
                          </p>
                        </div>
                      )}
                      {result.personalizationSummary.addedTopics.length > 0 && (
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="shrink-0 border-green-500 text-green-500">Added</Badge>
                          <p className="text-sm text-muted-foreground">
                            {result.personalizationSummary.addedTopics.join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estimated time */}
                  {result.personalizationSummary.estimatedTimeWeeks && (
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                      <span className="font-medium">Estimated Duration</span>
                      <Badge variant="secondary" className="text-base px-4 py-1">
                        ~{result.personalizationSummary.estimatedTimeWeeks} weeks
                      </Badge>
                    </div>
                  )}

                  {/* Recommendations */}
                  {result.personalizationSummary.keyRecommendations.length > 0 && (
                    <div className="p-6 bg-muted/50 rounded-xl">
                      <h4 className="font-semibold mb-4">Key Recommendations</h4>
                      <ul className="space-y-2">
                        {result.personalizationSummary.keyRecommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="text-primary mt-1">
                              <Check className="h-4 w-4" />
                            </span>
                            <span className="text-muted-foreground">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t px-6 py-4 shrink-0">
                <div className="max-w-2xl mx-auto">
                  <Button size="lg" className="w-full" onClick={handleComplete}>
                    View Your Personalized Roadmap
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <p className="text-sm text-center text-muted-foreground mt-3">
                    {remainingUses} personalization{remainingUses !== 1 ? "s" : ""} remaining this month
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
