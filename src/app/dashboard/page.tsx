"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  BrainCircuit,
  BookOpen,
  Route,
  Sparkles,
  Target,
  ChevronRight,
  MessageSquareHeart,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getUserProgress } from "@/lib/progress-service";

const DOMAINS = [
  { id: "frontend",            name: "Frontend Dev",        desc: "React, CSS, JS & more",          accent: "#3B82F6" },
  { id: "backend",             name: "Backend Dev",         desc: "APIs, DBs & server-side",        accent: "#22C55E" },
  { id: "fullstack",           name: "Fullstack Dev",       desc: "End-to-end web development",     accent: "#A855F7" },
  { id: "ml",                  name: "Machine Learning",    desc: "AI, models & pipelines",         accent: "#F97316" },
  { id: "devops",              name: "DevOps",              desc: "CI/CD, cloud & infra",           accent: "#EF4444" },
  { id: "android",             name: "Android Dev",         desc: "Kotlin, Jetpack & more",         accent: "#3DDC84" },
  { id: "ios",                 name: "iOS Dev",             desc: "Swift, SwiftUI & Xcode",         accent: "#5856D6" },
  { id: "blockchain",          name: "Blockchain Dev",      desc: "Web3, Solidity & DeFi",          accent: "#F7931A" },
  { id: "ui-ux",               name: "UI/UX Design",        desc: "Figma, design systems & UX",     accent: "#FF6B6B" },
  { id: "product-engineering", name: "Product Engineering", desc: "PM, roadmaps & execution",       accent: "#00D9C0" },
  { id: "game-dev-aaa",        name: "AAA Game Dev",        desc: "Unreal, C++ & AAA pipeline",     accent: "#C13333" },
  { id: "game-dev-indie",      name: "Indie Game Dev",      desc: "Unity, Godot & solo dev",        accent: "#FF9F43" },
  { id: "cybersecurity",       name: "Cybersecurity",       desc: "Ethical hacking & defense",      accent: "#10B981" },
  { id: "data-science",        name: "Data Science",        desc: "Python, stats & visualization",  accent: "#6366F1" },
];

const QUICK_ACTIONS = [
  { title: "My Roadmap",          desc: "Continue your learning path",        icon: Route,              href: "/dashboard/my-roadmap",         accent: "#3B82F6" },
  { title: "Learning Resources",  desc: "Weekly curated content",             icon: BookOpen,           href: "/dashboard/learning-resources",  accent: "#29ABE2" },
  { title: "Profile",             desc: "Manage your info & preferences",     icon: Target,             href: "/dashboard/profile",             accent: "#A855F7" },
  { title: "Feedback",            desc: "Help us build better for you",       icon: MessageSquareHeart, href: "/dashboard/feedback",            accent: "#F97316" },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

export default function DashboardPage() {
  const { user } = useAuth();
  const [progressPct, setProgressPct]       = useState<number | null>(null);
  const [daysSinceVisit, setDaysSinceVisit] = useState<number | null>(null);

  const firstName    = user?.displayName?.split(" ")[0] || "there";
  const hasRoadmap   = !!user?.lastGeneratedDomain;
  const activeDomain = DOMAINS.find((d) => d.id === user?.lastGeneratedDomain);

  // Profile completion score (0–100, 25 pts each)
  let completionScore = 0;
  if (user?.userType)                                               completionScore += 25;
  if (user?.interestedDomain)                                       completionScore += 25;
  if (user?.domainExperience && user.domainExperience.length >= 20) completionScore += 25;
  if (user?.skills && user.skills.length > 0)                      completionScore += 25;

  // Time-aware greeting (uses device local time)
  const hour = new Date().getHours();
  const greeting =
    hour < 5  ? "Still up?"
    : hour < 12 ? "Good morning"
    : hour < 17 ? "Good afternoon"
    : hour < 21 ? "Good evening"
    : "Burning the midnight oil?";

  useEffect(() => {
    // Track days since last dashboard visit (localStorage)
    const key  = "acadai_last_dashboard_visit";
    const last = localStorage.getItem(key);
    if (last) {
      const days = Math.floor((Date.now() - parseInt(last)) / 86_400_000);
      if (days > 0) setDaysSinceVisit(days);
    }
    localStorage.setItem(key, String(Date.now()));

    // Fetch roadmap progress for the user's active domain
    if (user?.uid && user?.lastGeneratedDomain) {
      getUserProgress(user.uid, user.lastGeneratedDomain)
        .then((p) => {
          if (p && p.totalSteps > 0) {
            setProgressPct(Math.round((p.completedCount / p.totalSteps) * 100));
          }
        })
        .catch(() => {});
    }
  }, [user?.uid, user?.lastGeneratedDomain]);

  // Context-aware message inside the welcome banner
  const contextualMessage = (() => {
    if (!hasRoadmap) return "You haven't started a roadmap yet. Pick your domain below and begin your journey.";
    const name = activeDomain?.name ?? "tech";
    if (progressPct === null) return `You're on the ${name} path. Consistency beats talent — keep going.`;
    if (progressPct === 0)    return `Your ${name} roadmap is ready. Let's take the first step today.`;
    if (progressPct < 25)     return `You're ${progressPct}% through ${name}. Every session builds momentum — keep it up.`;
    if (progressPct < 50)     return `${progressPct}% through ${name}. You've made real progress — the hard part is behind you.`;
    if (progressPct < 75)     return `Over halfway through ${name}! Consistency is clearly your superpower. 💪`;
    if (progressPct < 100)    return `${progressPct}% done with ${name} — the finish line is in sight. Almost there!`;
    return `You've completed ${name}! 🎉 Explore another domain to level up even further.`;
  })();

  // AI Mentor nudge message (shown when user has been away ≥ 3 days)
  const nudgeMessage = daysSinceVisit !== null && daysSinceVisit >= 3
    ? daysSinceVisit >= 7
      ? `It's been ${daysSinceVisit} days — your AI Mentor misses you! What's been getting in the way?`
      : `Welcome back after ${daysSinceVisit} days! Ready to pick up where you left off?`
    : null;

  return (
    <div className="space-y-7 pb-10">

      {/* ── Welcome banner ── */}
      <motion.div {...fadeUp(0)}>
        <div className="relative overflow-hidden rounded-2xl border border-[#3B82F6]/20 bg-gradient-to-br from-[#3B82F6]/10 via-background to-[#8E2DE2]/8 p-6 md:p-8">
          <BrainCircuit
            className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.06] text-[#3B82F6]"
            style={{ width: 160, height: 160 }}
            aria-hidden
          />
          <div className="relative">
            <p className="mb-1 text-sm text-muted-foreground">
              {greeting} 👋
            </p>
            <h1 className="font-headline text-2xl font-bold md:text-3xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground md:text-base">
              {contextualMessage}
            </p>
            {hasRoadmap && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button asChild size="sm">
                  <Link href="/dashboard/my-roadmap">
                    {progressPct !== null && progressPct > 0
                      ? `Continue (${progressPct}%)`
                      : "Start Roadmap"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {progressPct !== null && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-1.5 w-20 rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#3B82F6] transition-all duration-700"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span>{progressPct}% complete</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── AI Mentor nudge (away ≥ 3 days) ── */}
      {nudgeMessage && hasRoadmap && (
        <motion.div {...fadeUp(0.05)}>
          <div className="rounded-xl border border-[#3B82F6]/20 bg-[#3B82F6]/5 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3B82F6]/15 mt-0.5">
                <BrainCircuit className="h-3.5 w-3.5 text-[#3B82F6]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground/90">{nudgeMessage}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Stuck or frustrated? Drop a message — the founder reads every piece of feedback and ships fixes fast.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-10 sm:ml-0">
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs px-3">
                <Link href="/dashboard/feedback">Give feedback</Link>
              </Button>
              <Button asChild size="sm" className="h-7 text-xs px-3">
                <Link href="/dashboard/my-roadmap">Continue →</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Profile completion nudge ── */}
      {completionScore < 100 && (
        <motion.div {...fadeUp(0.07)}>
          <div className="flex items-center gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground/90 mb-1.5">
                Complete your profile for personalised recommendations
              </p>
              <Progress value={completionScore} className="h-1.5 bg-amber-100/20" />
            </div>
            <span className="shrink-0 text-sm font-semibold text-amber-500">
              {completionScore}%
            </span>
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link href="/dashboard/profile">Complete</Link>
            </Button>
          </div>
        </motion.div>
      )}

      {/* ── Quick access ── */}
      <motion.div {...fadeUp(0.12)}>
        <h2 className="mb-3 text-base font-semibold text-foreground/80">Quick access</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.title} href={action.href} className="group">
              <Card className="h-full cursor-pointer transition-all duration-200 hover:border-[#3B82F6]/30 hover:shadow-sm hover:-translate-y-0.5">
                <CardContent className="flex items-start gap-3 p-4">
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${action.accent}18` }}
                  >
                    <action.icon className="h-4 w-4" style={{ color: action.accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">{action.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/70 mt-0.5" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Domain picker ── */}
      <motion.div {...fadeUp(0.18)}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground/80">
            {hasRoadmap ? "Explore other domains" : "Choose your domain"}
          </h2>
          {!hasRoadmap && (
            <Badge
              variant="outline"
              className="border-[#29ABE2]/30 text-[#29ABE2] text-[11px]"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              Free for everyone
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {DOMAINS.map((domain, i) => {
            const isActive = user?.lastGeneratedDomain === domain.id;
            return (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.18 + i * 0.03 }}
              >
                <Link href={`/roadmap/${domain.id}`} className="group block h-full">
                  <Card
                    className={`h-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      isActive
                        ? "border-[#3B82F6]/40 bg-[#3B82F6]/5"
                        : "hover:border-border/60"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: domain.accent,
                            boxShadow: `0 0 0 2px ${domain.accent}30`,
                          }}
                        />
                        {isActive && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-semibold leading-snug">{domain.name}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground leading-tight">
                        {domain.desc}
                      </p>
                      <div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground/50 transition-colors group-hover:text-muted-foreground/80">
                        <span>View roadmap</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
}
