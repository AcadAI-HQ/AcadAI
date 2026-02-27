"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  RefreshCw,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const MAX_TEXT_CHARS = 150;
const MAX_MULTISELECT = 5;

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

interface HyperpersonalizationFlowProps {
  domain: string;
  onClose: () => void;
  onComplete: () => void;
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

export function HyperpersonalizationFlow({
  domain,
  onClose,
  onComplete,
}: HyperpersonalizationFlowProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<"loading" | "questions" | "generating" | "complete" | "error">("loading");
  const [direction, setDirection] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [domainTitle, setDomainTitle] = useState("");
  const [remainingUses, setRemainingUses] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse["roadmap"] | null>(null);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Fetch questions on mount
  useEffect(() => {
    startHyperpersonalization();
  }, [domain]);

  const startHyperpersonalization = async () => {
    setStep("loading");
    setCurrentQuestionIndex(0);
    setAnswers({});
    setError(null);
    setResult(null);
    setDirection(1);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) { setError("Please sign in to continue"); setStep("error"); return; }
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_URL}/api/hyperpersonalization/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ domain }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403) setError("premium_required");
        else if (response.status === 429) setError(`limit_reached:${data.nextReset}`);
        else setError(data.message || "Failed to start hyperpersonalization");
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
      setError(err.message || "Something went wrong");
      setStep("error");
    }
  };

  const generateRoadmap = async () => {
    setStep("generating");
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) { setError("Please sign in"); setStep("error"); return; }
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_URL}/api/hyperpersonalization/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ domain, answers }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.message || "Failed to generate"); setStep("error"); return; }
      const generateData = data as GenerateResponse;
      setResult(generateData.roadmap);
      setRemainingUses(generateData.remainingUses);
      setStep("complete");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setStep("error");
    }
  };

  const goNext = () => {
    setDirection(1);
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex((p) => p + 1);
    else generateRoadmap();
  };

  const goBack = () => {
    setDirection(-1);
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((p) => p - 1);
  };

  const skipQuestion = () => {
    setDirection(1);
    const q = questions[currentQuestionIndex];
    if (q) setAnswers((prev) => { const n = { ...prev }; delete n[q.id]; return n; });
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex((p) => p + 1);
    else generateRoadmap();
  };

  const toggleMulti = (questionId: string, val: string) => {
    setAnswers((prev) => {
      const current: string[] = prev[questionId] || [];
      if (current.includes(val)) return { ...prev, [questionId]: current.filter((v) => v !== val) };
      if (current.length >= MAX_MULTISELECT) return prev;
      return { ...prev, [questionId]: [...current, val] };
    });
  };

  const handleComplete = () => {
    toast({ title: "Roadmap Personalized!", description: "Your learning path has been customized." });
    onComplete();
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col min-h-full rounded-xl border border-border/60 bg-card overflow-hidden">

      {/* ── Top bar ── */}
      <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#29ABE2]/10">
            <Sparkles className="h-4 w-4 text-[#29ABE2]" />
          </div>
          <span className="font-semibold text-sm">Personalize with AI</span>
          {domainTitle && (
            <Badge variant="secondary" className="text-[11px] hidden sm:flex">
              {domainTitle}
            </Badge>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground transition-colors"
          aria-label="Back to roadmap"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── Body ── */}
      <AnimatePresence mode="wait" custom={direction}>

        {/* Loading */}
        {step === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 py-24"
          >
            <div className="h-14 w-14 rounded-full bg-[#29ABE2]/10 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-[#29ABE2] animate-pulse" />
            </div>
            <p className="text-muted-foreground text-sm">Preparing your personalization...</p>
          </motion.div>
        )}

        {/* Error */}
        {step === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6 gap-4 py-24 max-w-md mx-auto text-center"
          >
            <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">
                {error === "premium_required" ? "Premium Feature" :
                 error?.startsWith("limit_reached") ? "Monthly Limit Reached" :
                 "Something Went Wrong"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {error === "premium_required"
                  ? "Hyperpersonalization is available on the Premium plan."
                  : error?.startsWith("limit_reached")
                  ? "You've used all 3 personalizations this month. Resets on the 1st."
                  : (error || "Please try again later.")}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>Back to Roadmap</Button>
          </motion.div>
        )}

        {/* Questions */}
        {step === "questions" && currentQuestion && (
          <motion.div
            key={`q-${currentQuestionIndex}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex-1 flex flex-col"
          >
            {/* Step dots + question */}
            <div className="shrink-0 px-5 pt-5 pb-4">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-1.5 mb-4">
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i < currentQuestionIndex ? "bg-[#29ABE2] w-6" :
                        i === currentQuestionIndex ? "bg-[#29ABE2] w-8" :
                        "bg-border w-2"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {currentQuestionIndex + 1} / {questions.length}
                  </span>
                </div>

                {showWarning && (
                  <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-yellow-500/8 border border-yellow-500/20 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      Last personalization this month — make it count!
                    </p>
                  </div>
                )}

                <h2 className="text-xl font-semibold leading-tight mb-1">{currentQuestion.question}</h2>
                {currentQuestion.description && (
                  <p className="text-sm text-muted-foreground">{currentQuestion.description}</p>
                )}
                {currentQuestion.type === "multi-select" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Select up to {MAX_MULTISELECT} ·{" "}
                    <span className={(answers[currentQuestion.id]?.length ?? 0) === MAX_MULTISELECT ? "text-[#29ABE2]" : ""}>
                      {answers[currentQuestion.id]?.length ?? 0} selected
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="flex-1 px-5 pb-4">
              <div className="max-w-2xl mx-auto">

                {currentQuestion.type === "multi-select" && currentQuestion.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {currentQuestion.options.map((opt) => {
                      const isSelected = (answers[currentQuestion.id] || []).includes(opt.value);
                      const isMaxed = (answers[currentQuestion.id]?.length ?? 0) >= MAX_MULTISELECT;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => toggleMulti(currentQuestion.id, opt.value)}
                          disabled={!isSelected && isMaxed}
                          className={`relative text-left rounded-xl border-2 px-4 py-3.5 transition-all duration-150 ${
                            isSelected ? "border-[#29ABE2] bg-[#29ABE2]/8 shadow-sm" :
                            isMaxed ? "border-border/40 opacity-40 cursor-not-allowed" :
                            "border-border hover:border-[#29ABE2]/50 hover:bg-muted/50 cursor-pointer"
                          }`}
                        >
                          <div className={`absolute top-2.5 right-2.5 h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                            isSelected ? "bg-[#29ABE2] scale-100" : "bg-border/30 scale-90"
                          }`}>
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className="font-medium text-sm block pr-6">{opt.label}</span>
                          {opt.subtopics && opt.subtopics.length > 0 && (
                            <span className="text-xs text-muted-foreground mt-1 block line-clamp-1">
                              {opt.subtopics.slice(0, 3).join(", ")}
                              {opt.subtopics.length > 3 && ` +${opt.subtopics.length - 3}`}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.type === "single-select" && currentQuestion.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentQuestion.options.map((opt) => {
                      const isSelected = answers[currentQuestion.id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: opt.value }))}
                          className={`text-left rounded-xl border-2 px-4 py-3.5 transition-all duration-150 flex items-center gap-3 ${
                            isSelected ? "border-[#29ABE2] bg-[#29ABE2]/8 shadow-sm" :
                            "border-border hover:border-[#29ABE2]/50 hover:bg-muted/50 cursor-pointer"
                          }`}
                        >
                          <div className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                            isSelected ? "border-[#29ABE2] bg-[#29ABE2]" : "border-border"
                          }`}>
                            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                          <span className="font-medium text-sm">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.type === "text" && (
                  <div className="relative">
                    <Textarea
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => {
                        if (e.target.value.length <= MAX_TEXT_CHARS)
                          setAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }));
                      }}
                      placeholder={currentQuestion.placeholder || "Type your answer here..."}
                      className="min-h-[120px] text-sm resize-none pb-6"
                    />
                    <span className={`absolute bottom-2 right-3 text-[11px] ${
                      (answers[currentQuestion.id]?.length ?? 0) >= MAX_TEXT_CHARS - 20
                        ? "text-orange-400" : "text-muted-foreground/50"
                    }`}>
                      {answers[currentQuestion.id]?.length ?? 0}/{MAX_TEXT_CHARS}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Nav footer */}
            <div className="shrink-0 border-t border-border/60 px-5 py-4">
              <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
                <Button
                  variant="ghost" size="sm"
                  onClick={goBack}
                  disabled={currentQuestionIndex === 0}
                  className="gap-1.5 text-muted-foreground"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={skipQuestion} className="text-muted-foreground/70 text-xs">
                    Skip
                  </Button>
                  <Button
                    size="sm" onClick={goNext}
                    className="gap-1.5 bg-[#29ABE2] hover:bg-[#29ABE2]/90 text-white min-w-[100px]"
                  >
                    {currentQuestionIndex === questions.length - 1 ? (
                      <><span>Generate</span><Sparkles className="h-3.5 w-3.5" /></>
                    ) : (
                      <><span>Next</span><ArrowRight className="h-3.5 w-3.5" /></>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Generating */}
        {step === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-5 px-6 py-24"
          >
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full bg-[#29ABE2]/10" />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="h-7 w-7 text-[#29ABE2]/40" />
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-[#29ABE2] animate-pulse" />
              </div>
            </div>
            <div className="text-center max-w-sm">
              <h3 className="font-semibold text-lg mb-1">Crafting Your Path</h3>
              <p className="text-sm text-muted-foreground">
                AI is building a custom roadmap based on your {Object.keys(answers).length} answer{Object.keys(answers).length !== 1 ? "s" : ""}...
              </p>
            </div>
          </motion.div>
        )}

        {/* Complete */}
        {step === "complete" && result && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <div className="shrink-0 py-8 px-6 text-center border-b border-border/60">
              <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                <Check className="h-7 w-7 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold">Roadmap Personalized!</h2>
              <p className="text-sm text-muted-foreground mt-1">Your learning path has been tailored to your profile</p>
            </div>

            <div className="flex-1 px-6 py-5">
              <div className="max-w-lg mx-auto space-y-3">
                {result.personalizationSummary.removedTopics.length > 0 && (
                  <SummaryRow label="Streamlined" color="text-muted-foreground" dotColor="bg-muted-foreground/40" items={result.personalizationSummary.removedTopics} />
                )}
                {result.personalizationSummary.expandedTopics.length > 0 && (
                  <SummaryRow label="Expanded" color="text-[#29ABE2]" dotColor="bg-[#29ABE2]" items={result.personalizationSummary.expandedTopics} />
                )}
                {result.personalizationSummary.addedTopics.length > 0 && (
                  <SummaryRow label="Added" color="text-green-500" dotColor="bg-green-500" items={result.personalizationSummary.addedTopics} />
                )}
                {result.personalizationSummary.estimatedTimeWeeks && (
                  <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3 mt-4">
                    <span className="text-sm font-medium">Estimated duration</span>
                    <Badge variant="secondary">~{result.personalizationSummary.estimatedTimeWeeks} weeks</Badge>
                  </div>
                )}
                {result.personalizationSummary.keyRecommendations.length > 0 && (
                  <div className="rounded-xl bg-muted/40 px-4 py-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recommendations</p>
                    <ul className="space-y-1.5">
                      {result.personalizationSummary.keyRecommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />{rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 border-t border-border/60 px-6 py-4">
              <div className="max-w-lg mx-auto">
                <Button className="w-full gap-2 bg-[#29ABE2] hover:bg-[#29ABE2]/90 text-white" onClick={handleComplete}>
                  View Personalized Roadmap <ArrowRight className="h-4 w-4" />
                </Button>
                {remainingUses > 0 && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    {remainingUses} personalization{remainingUses !== 1 ? "s" : ""} remaining this month
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

function SummaryRow({ label, color, dotColor, items }: {
  label: string; color: string; dotColor: string; items: string[];
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-muted/40 px-4 py-3">
      <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
      <div className="min-w-0">
        <span className={`text-xs font-semibold uppercase tracking-wider ${color}`}>{label}</span>
        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{items.join(", ")}</p>
      </div>
    </div>
  );
}
