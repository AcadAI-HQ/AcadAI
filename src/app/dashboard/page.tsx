"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { DomainCard } from "@/components/dashboard/domain-card";
import ProfileCompletionBanner from "@/components/dashboard/profile-completion-banner";
import ProfileCompletionModal from "@/components/dashboard/profile-completion-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Bot, Cpu, Layers, GitBranch, AlertTriangle, Star, Shield, DatabaseZap, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/types";

const domains = [
  { id: 'frontend', name: 'Frontend', icon: Code, active: true },
  { id: 'backend', name: 'Backend', icon: Cpu, active: true },
  { id: 'fullstack', name: 'Fullstack', icon: Layers, active: true },
  { id: 'ml', name: 'Machine Learning', icon: Bot, active: true },
  { id: 'devops', name: 'DevOps', icon: GitBranch, active: true },
  { id: 'cybersecurity', name: 'CyberSecurity', icon: Shield, active: true },
  { id: 'data-science', name: 'Data Scientist', icon: DatabaseZap, active: true },
  { id: 'blockchain', name: 'Blockchain', icon: Network, active: false },
];

export default function DashboardPage() {
  const { user, useGeneration, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedDomainId, setSelectedDomainId] = useState<string | undefined>();
  const [modalLoading, setModalLoading] = useState(false);

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

      <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
                <CardHeader className="pb-3">
                    <CardTitle className="font-headline flex items-center gap-2">
                        <span>Welcome, {user?.displayName}!</span>
                    </CardTitle>
                    <CardDescription className="max-w-lg text-balance leading-relaxed">
                        Select a domain below to generate a new personalized learning roadmap.
                    </CardDescription>
                </CardHeader>
            </Card>
            {user?.skills && user.skills.length > 0 && (
            <Card x-chunk="dashboard-05-chunk-1">
                <CardHeader>
                    <CardTitle>Your Skills</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                    {user.skills.map(skill => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
            </Card>
             )}
        </div>
        
        <div>
          <h2 className="text-2xl font-headline font-bold tracking-tight my-4">Choose a Domain to Generate Roadmap</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {domains.map((domain) => (
              <DomainCard
                key={domain.id}
                domain={domain}
                onSelect={() => handleDomainClick(domain.id)}
              />
            ))}
          </div>
        </div>
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
