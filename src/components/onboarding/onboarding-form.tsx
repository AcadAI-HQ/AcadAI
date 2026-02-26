"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile } from "@/types";
import { ArrowLeft, ArrowRight, Check, GraduationCap, Briefcase, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingFormProps {
  onComplete: (data: Partial<UserProfile>) => Promise<void>;
  onSkip?: () => void;
  initialData?: Partial<UserProfile>;
  loading?: boolean;
}

const DOMAINS = [
  { id: "Frontend Development",   accent: "#3B82F6", short: "Frontend" },
  { id: "Backend Development",    accent: "#22C55E", short: "Backend" },
  { id: "Fullstack Development",  accent: "#A855F7", short: "Fullstack" },
  { id: "Machine Learning",       accent: "#F97316", short: "ML / AI" },
  { id: "DevOps",                 accent: "#EF4444", short: "DevOps" },
  { id: "Android Development",    accent: "#3DDC84", short: "Android" },
  { id: "iOS Development",        accent: "#5856D6", short: "iOS" },
  { id: "Blockchain Development", accent: "#F7931A", short: "Blockchain" },
  { id: "UI/UX Design",           accent: "#FF6B6B", short: "UI / UX" },
  { id: "Product Engineering",    accent: "#00D9C0", short: "Product Eng" },
  { id: "AAA Game Development",   accent: "#C13333", short: "AAA Games" },
  { id: "Indie Game Development", accent: "#FF9F43", short: "Indie Games" },
  { id: "Cybersecurity",          accent: "#10B981", short: "Security" },
  { id: "Data Science",           accent: "#6366F1", short: "Data Science" },
];

const EXPERIENCE_SNIPPETS = [
  "I'm a complete beginner with no prior experience.",
  "I've done a few online tutorials and courses.",
  "I've built some personal projects on the side.",
  "I have professional experience in a related area.",
  "I'm switching from a non-tech background.",
];

const STEP_LABELS = ["About you", "Background", "Domain", "Experience"];

const parseDateString = (dateStr: string | undefined) => {
  if (!dateStr) return { year: "", month: "" };
  const [year, month] = dateStr.split("-");
  return { year: year || "", month: month || "" };
};

const combineDateParts = (year: string, month: string) => {
  if (!year || !month) return "";
  return `${year}-${month}`;
};

const slide = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -20 },
};

export default function OnboardingForm({
  onComplete,
  onSkip,
  initialData,
  loading,
}: OnboardingFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    userType:         undefined,
    degree:           "",
    currentYear:      "",
    currentRole:      "",
    yearsOfExperience: undefined,
    description:      "",
    interestedDomains: [],
    interestedDomain: "",
    domainExperience: "",
    ...initialData,
  });

  // Keep date parts for backward compat (stored but not shown as required)
  const [startDateParts] = useState(() => parseDateString(initialData?.startDate));
  const [endDateParts]   = useState(() => parseDateString(initialData?.endDate));

  const totalSteps = 4;

  const updateFormData = (key: keyof UserProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = (s: number): boolean => {
    switch (s) {
      case 1: return !!formData.userType;
      case 2:
        if (formData.userType === "student")      return !!(formData.degree && formData.currentYear);
        if (formData.userType === "professional") return !!(formData.currentRole && formData.yearsOfExperience !== undefined);
        if (formData.userType === "learner")      return !!(formData.description && formData.description.trim().length > 0);
        return false;
      case 3: return !!(formData.interestedDomain && formData.interestedDomain.trim().length > 0);
      case 4: return !!(formData.domainExperience && formData.domainExperience.length >= 10);
      default: return false;
    }
  };

  // Auto-advance after user type selection (slight delay for visual feedback)
  const handleUserTypeSelect = (type: "student" | "professional" | "learner") => {
    updateFormData("userType", type);
    setTimeout(() => setStep(2), 260);
  };

  const appendSnippet = (snippet: string) => {
    const current = formData.domainExperience || "";
    const sep = current && !current.endsWith(" ") ? " " : "";
    updateFormData("domainExperience", current + sep + snippet);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      profileComplete:  true,
      startDate:        combineDateParts(startDateParts.year, startDateParts.month),
      endDate:          combineDateParts(endDateParts.year, endDateParts.month),
      interestedDomains: formData.interestedDomain ? [formData.interestedDomain] : [],
    };
    await onComplete(submissionData);
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const done   = n < step;
          const active = n === step;
          return (
            <div key={n} className="flex items-center gap-1 flex-1 last:flex-none">
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-all duration-200",
                  done   ? "bg-[#3B82F6] text-white"
                         : active ? "bg-[#3B82F6]/15 text-[#3B82F6] ring-1 ring-[#3B82F6]/40"
                         : "bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check className="h-3 w-3" /> : n}
              </div>
              <span
                className={cn(
                  "text-[11px] hidden sm:block",
                  active ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 mx-1 transition-colors duration-300",
                    done ? "bg-[#3B82F6]/50" : "bg-border/50"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {/* ── Step 1: Who are you ── */}
          {step === 1 && (
            <motion.div key="s1" {...slide} transition={{ duration: 0.22 }} className="space-y-3">
              <div className="mb-5">
                <h2 className="text-xl font-semibold">Who are you?</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  This shapes how we tailor your roadmap
                </p>
              </div>

              {[
                {
                  type: "student" as const,
                  icon: GraduationCap,
                  title: "College Student",
                  desc: "Currently pursuing a degree — building skills for your first role",
                  accent: "#3B82F6",
                },
                {
                  type: "professional" as const,
                  icon: Briefcase,
                  title: "Working Professional",
                  desc: "Employed and looking to pivot into tech or level up",
                  accent: "#A855F7",
                },
                {
                  type: "learner" as const,
                  icon: BookOpen,
                  title: "Independent Learner",
                  desc: "Self-taught, career changer, or just love learning",
                  accent: "#22C55E",
                },
              ].map(({ type, icon: Icon, title, desc, accent }) => {
                const selected = formData.userType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleUserTypeSelect(type)}
                    className={cn(
                      "w-full text-left flex items-center gap-4 rounded-xl border p-4 transition-all duration-150",
                      selected
                        ? "ring-1"
                        : "border-border/60 hover:border-border hover:bg-muted/30"
                    )}
                    style={
                      selected
                        ? { borderColor: `${accent}50`, boxShadow: `0 0 0 1px ${accent}30`, backgroundColor: `${accent}08` }
                        : {}
                    }
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors"
                      style={selected ? { backgroundColor: `${accent}18`, color: accent } : {}}
                    >
                      <Icon className={cn("h-5 w-5", !selected && "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</p>
                    </div>
                    {selected && (
                      <Check className="h-4 w-4 shrink-0" style={{ color: accent }} />
                    )}
                  </button>
                );
              })}

              {onSkip && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="w-full text-center text-xs text-muted-foreground/50 hover:text-muted-foreground mt-1 transition-colors py-1"
                >
                  Skip for now
                </button>
              )}
            </motion.div>
          )}

          {/* ── Step 2: Background ── */}
          {step === 2 && (
            <motion.div key="s2" {...slide} transition={{ duration: 0.22 }} className="space-y-5">
              <div className="mb-5">
                <h2 className="text-xl font-semibold">A bit about yourself</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Helps us calibrate the right starting point for you
                </p>
              </div>

              {formData.userType === "student" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Degree / Programme</Label>
                    <Input
                      placeholder="e.g., Computer Science, Electrical Engineering"
                      value={formData.degree || ""}
                      onChange={(e) => updateFormData("degree", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Current Year of Study</Label>
                    <Select
                      value={formData.currentYear || ""}
                      onValueChange={(v) => updateFormData("currentYear", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                        <SelectItem value="5+">5th Year or above</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {formData.userType === "professional" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Current Role</Label>
                    <Input
                      placeholder="e.g., Marketing Manager, Sales Executive, Accountant"
                      value={formData.currentRole || ""}
                      onChange={(e) => updateFormData("currentRole", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Years of Work Experience</Label>
                    <Select
                      value={formData.yearsOfExperience?.toString() || ""}
                      onValueChange={(v) => updateFormData("yearsOfExperience", parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Less than 1 year</SelectItem>
                        <SelectItem value="1">1 – 2 years</SelectItem>
                        <SelectItem value="3">3 – 5 years</SelectItem>
                        <SelectItem value="6">6 – 10 years</SelectItem>
                        <SelectItem value="11">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {formData.userType === "learner" && (
                <div className="space-y-1.5">
                  <Label>What best describes you?</Label>
                  <Input
                    placeholder="e.g., Self-taught developer, Career changer from finance, Hobbyist"
                    value={formData.description || ""}
                    onChange={(e) => updateFormData("description", e.target.value)}
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* ── Step 3: Domain picker ── */}
          {step === 3 && (
            <motion.div key="s3" {...slide} transition={{ duration: 0.22 }} className="space-y-4">
              <div className="mb-3">
                <h2 className="text-xl font-semibold">What do you want to learn?</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Pick one to get started — you can always explore others later
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {DOMAINS.map((d) => {
                  const selected = formData.interestedDomain === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => updateFormData("interestedDomain", d.id)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-all duration-150",
                        selected
                          ? ""
                          : "border-border/40 hover:border-border/70 hover:bg-muted/30"
                      )}
                      style={
                        selected
                          ? { borderColor: `${d.accent}60`, backgroundColor: `${d.accent}08`, boxShadow: `0 0 0 1px ${d.accent}30` }
                          : {}
                      }
                    >
                      <div
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: d.accent, boxShadow: `0 0 0 2px ${d.accent}25` }}
                      />
                      <span className="flex-1 text-xs font-medium leading-tight">{d.short}</span>
                      {selected && <Check className="h-3 w-3 shrink-0" style={{ color: d.accent }} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Experience ── */}
          {step === 4 && (
            <motion.div key="s4" {...slide} transition={{ duration: 0.22 }} className="space-y-4">
              <div className="mb-3">
                <h2 className="text-xl font-semibold">Your experience so far</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Tell us what you know about{" "}
                  <span className="text-foreground font-medium">
                    {formData.interestedDomain}
                  </span>
                </p>
              </div>

              {/* Quick-fill chips */}
              <div>
                <p className="text-[11px] text-muted-foreground mb-2">Quick fill:</p>
                <div className="flex flex-wrap gap-1.5">
                  {EXPERIENCE_SNIPPETS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => appendSnippet(s)}
                      className="rounded-full border border-border/50 px-2.5 py-1 text-[11px] text-muted-foreground hover:border-[#3B82F6]/40 hover:text-foreground hover:bg-[#3B82F6]/8 transition-all"
                    >
                      + {s.split(" ").slice(0, 5).join(" ")}…
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Textarea
                  placeholder="Describe what you already know — tools, projects, courses. Or just say you're starting fresh!"
                  value={formData.domainExperience || ""}
                  onChange={(e) => updateFormData("domainExperience", e.target.value)}
                  rows={5}
                  className="resize-none"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Use the chips above to fill this in quickly</span>
                  <span
                    className={
                      formData.domainExperience && formData.domainExperience.length >= 10
                        ? "text-[#22C55E]"
                        : ""
                    }
                  >
                    {(formData.domainExperience || "").length} / 10 min
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation — only shown from step 2 onward */}
        {step > 1 && (
          <div className="flex items-center justify-between mt-7 pt-5 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => s - 1)}
              className="gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>

            {step < totalSteps ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed(step)}
                className="gap-1.5"
              >
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="sm"
                disabled={!canProceed(step) || loading}
              >
                {loading ? "Setting up…" : "Start Learning →"}
              </Button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
