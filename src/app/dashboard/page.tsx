"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { DomainCard } from "@/components/dashboard/domain-card";
import { LimitWarningDialog } from "@/components/dashboard/limit-warning-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Bot, Cpu, Layers, GitBranch, AlertTriangle, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const domains = [
  { id: 'frontend', name: 'Frontend', icon: Code, active: true },
  { id: 'backend', name: 'Backend', icon: Cpu, active: true },
  { id: 'fullstack', name: 'Fullstack', icon: Layers, active: true },
  { id: 'ml', name: 'Machine Learning', icon: Bot, active: true },
  { id: 'devops', name: 'DevOps', icon: GitBranch, active: true },
  { id: 'qa', name: 'QA Engineer', icon: AlertTriangle, active: false },
  { id: 'data-science', name: 'Data Scientist', icon: AlertTriangle, active: false },
  { id: 'blockchain', name: 'Blockchain', icon: AlertTriangle, active: false },
];

export default function DashboardPage() {
  const { user, useGeneration, updateSubscription, processPayment } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  
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

    if (user?.subscriptionStatus === 'free' && user.generationsLeft <= 0) {
      setDialogOpen(true);
      return;
    }

    if (user?.subscriptionStatus === 'free') {
      setSelectedDomain(domainId);
      setDialogOpen(true);
    } else {
      // Premium users go straight to the roadmap
      useGeneration(domainId);
      router.push(`/dashboard/my-roadmap`);
    }
  };

  const handleProceed = () => {
    if (selectedDomain) {
      useGeneration(selectedDomain);
      router.push(`/dashboard/my-roadmap`);
    }
    setDialogOpen(false);
  };

  const handleUpgrade = async () => {
    if (!user) return;
    try {
      await processPayment(199); 
      toast({
        title: 'Congratulations!',
        description: "You've been upgraded to Premium! Enjoy unlimited access.",
        className: "bg-green-600 text-white border-green-600"
      });
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: "Something went wrong during payment. Please try again.",
        variant: 'destructive'
      });
      console.error("Payment failed", error);
    }
    setDialogOpen(false);
  }
  
  const handleCancelSubscription = () => {
    updateSubscription('free');
    toast({
      title: 'Subscription Cancelled',
      description: "Your premium subscription has been cancelled. You can upgrade again anytime.",
    });
  }

  return (
    <>
      <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
                <CardHeader className="pb-3">
                    <CardTitle className="font-headline flex items-center gap-2">
                        {user?.subscriptionStatus === 'premium' && <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />}
                        <span>Welcome, {user?.displayName}!</span>
                    </CardTitle>
                    <CardDescription className="max-w-lg text-balance leading-relaxed">
                        {user?.subscriptionStatus === 'premium' ? 'You have unlimited access. Thank you for being a premium member!' : `You have ${user?.generationsLeft} roadmap generations left.`}
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    {user?.subscriptionStatus === 'premium' ? (
                        <Button variant="destructive" onClick={handleCancelSubscription}>Cancel Subscription</Button>
                    ) : (
                        <Button onClick={handleUpgrade} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600">Upgrade to Premium</Button>
                    )}
                </CardFooter>
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
          <h2 className="text-2xl font-headline font-bold tracking-tight my-4 text-center">Choose a Domain to Generate Roadmap</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
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

      <LimitWarningDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleProceed}
        generationsLeft={user?.generationsLeft ?? 0}
        onUpgrade={handleUpgrade}
      />
    </>
  );
}