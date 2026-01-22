"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { EnhancedDomainCard } from "@/components/dashboard/enhanced-domain-card";
import ProfileCompletionBanner from "@/components/dashboard/profile-completion-banner";
import ProfileCompletionModal from "@/components/dashboard/profile-completion-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Bot, Cpu, Layers, GitBranch, Shield, DatabaseZap, Network, Palette, Smartphone, Apple, Package, Gamepad2, Gamepad, Flame, Trophy, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserProfile, RoadmapProgress } from "@/types";
import { getAllUserProgress, calculateProgressPercentage } from "@/lib/progress-service";
import { motion } from "framer-motion";

const domains = [
  { id: 'frontend', name: 'Frontend', icon: Code, active: true },
  { id: 'backend', name: 'Backend', icon: Cpu, active: true },
  { id: 'fullstack', name: 'Fullstack', icon: Layers, active: true },
  { id: 'ml', name: 'Machine Learning', icon: Bot, active: true },
  { id: 'devops', name: 'DevOps', icon: GitBranch, active: true },
  { id: 'cybersecurity', name: 'CyberSecurity', icon: Shield, active: true },
  { id: 'data-science', name: 'Data Scientist', icon: DatabaseZap, active: true },
  { id: 'blockchain', name: 'Blockchain', icon: Network, active: true },
  { id: 'ui-ux', name: 'UI/UX Design', icon: Palette, active: true },
  { id: 'android', name: 'Android Development', icon: Smartphone, active: true },
  { id: 'ios', name: 'iOS Development', icon: Apple, active: true },
  { id: 'product-engineering', name: 'Product Engineering', icon: Package, active: true },
  { id: 'game-dev-indie', name: 'Indie Game Development', icon: Gamepad2, active: true },
  { id: 'game-dev-aaa', name: 'Game Development', icon: Gamepad, active: true },
];


export default function DashboardPage() {
  const { user, useGeneration, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedDomainId, setSelectedDomainId] = useState<string | undefined>();
  const [modalLoading, setModalLoading] = useState(false);
  const [progressMap, setProgressMap] = useState<Map<string, RoadmapProgress>>(new Map());
  const [loadingProgress, setLoadingProgress] = useState(true);

  // Fetch all domain progress on mount
  useEffect(() => {
    async function fetchProgress() {
      if (!user?.uid) {
        setLoadingProgress(false);
        return;
      }

      try {
        const progress = await getAllUserProgress(user.uid);
        setProgressMap(progress);
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      } finally {
        setLoadingProgress(false);
      }
    }

    fetchProgress();
  }, [user?.uid]);

  // Calculate overall stats
  const totalCompleted = Array.from(progressMap.values()).reduce(
    (sum, p) => sum + p.completedCount,
    0
  );
  const domainsInProgress = progressMap.size;
  const completedDomains = Array.from(progressMap.values()).filter(
    (p) => p.totalSteps > 0 && p.completedCount === p.totalSteps
  ).length;

  const handleDomainClick = (domainId: string) => {
    const domain = domains.find(d => d.id === domainId);
    if (!domain || !domain.active) {
      toast({
        title: "Coming Soon!",
        description: `Roadmaps for ${domain?.name ?? domainId} are under development.`,
        variant: "default",
      });
      return;
    }

    // Check if profile is complete
    if (!user?.profileComplete) {
      setSelectedDomainId(domainId);
      setShowProfileModal(true);
      return;
    }

    useGeneration(domainId);
    router.push(`/dashboard/my-roadmap`);
  };

  const handleCompleteProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return;

    setModalLoading(true);
    try {
      await updateUserProfile({
        ...profileData,
        profileComplete: true,
      });

      toast({
        title: "Profile Complete!",
        description: "Your profile has been saved. Generating your personalized roadmap!",
      });

      // Generate roadmap for the selected domain
      if (selectedDomainId) {
        await useGeneration(selectedDomainId);
        router.push('/dashboard/my-roadmap');
      }

      setShowProfileModal(false);
      setSelectedDomainId(undefined);
    } catch (error) {
      console.error("Failed to complete profile:", error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setModalLoading(false);
    }
  };
  
  return (
    <>
      {user && <ProfileCompletionBanner user={user} />}

      <div className="space-y-8">
        {/* Hero Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* Welcome Card */}
          <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <span>Welcome back, {user?.displayName?.split(' ')[0] || 'Learner'}!</span>
                <motion.span
                  animate={{ rotate: [0, 14, -8, 14, 0] }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  👋
                </motion.span>
              </CardTitle>
              <CardDescription className="text-base">
                {domainsInProgress > 0
                  ? `You're making great progress! Continue your learning journey below.`
                  : `Ready to start your learning journey? Pick a domain below.`}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Stats Cards */}
          <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCompleted}</p>
                  <p className="text-sm text-muted-foreground">Topics Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <Trophy className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedDomains}</p>
                  <p className="text-sm text-muted-foreground">Domains Mastered</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skills Section */}
        {user?.skills && user.skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Your Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Domain Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-headline font-bold tracking-tight">
                Learning Paths
              </h2>
              <p className="text-muted-foreground mt-1">
                Choose a domain to start or continue your journey
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {domains.map((domain, index) => {
              const progress = progressMap.get(domain.id);
              const progressData = progress
                ? {
                    completedCount: progress.completedCount,
                    totalSteps: progress.totalSteps,
                    percentage: calculateProgressPercentage(progress),
                  }
                : null;

              return (
                <motion.div
                  key={domain.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <EnhancedDomainCard
                    domain={domain}
                    progress={progressData}
                    isLastActive={user?.lastGeneratedDomain === domain.id}
                    onSelect={() => handleDomainClick(domain.id)}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Profile Completion Modal */}
      {user && (
        <ProfileCompletionModal
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedDomainId(undefined);
          }}
          onComplete={handleCompleteProfile}
          initialData={user}
          loading={modalLoading}
          domainId={selectedDomainId}
        />
      )}
    </>
  );
}
