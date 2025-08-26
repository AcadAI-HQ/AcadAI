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
  const { user, useGeneration, updateSubscription } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const handleDomainClick = (domainId: string) => {
    if (user?.subscriptionStatus === 'free' && user.generationsLeft <= 0) {
      toast({
        title: "Generation Limit Reached",
        description: "Please upgrade to Premium for unlimited roadmap generations.",
        variant: "destructive",
      });
      return;
    }

    if (user?.subscriptionStatus === 'free') {
      setSelectedDomain(domainId);
      setDialogOpen(true);
    } else {
      router.push(`/roadmap/${domainId}`);
    }
  };

  const handleProceed = () => {
    if (selectedDomain) {
      useGeneration();
      router.push(`/roadmap/${selectedDomain}`);
    }
    setDialogOpen(false);
  };

  const handleUpgrade = () => {
    updateSubscription('premium');
    toast({
      title: 'Congratulations!',
      description: "You've been upgraded to Premium! Enjoy unlimited access.",
      className: "bg-green-600 text-white border-green-600"
    });
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className={cn(
          "lg:col-span-1",
          user?.subscriptionStatus === 'premium' && "relative overflow-hidden border-primary/50 shadow-lg shadow-primary/20"
        )}>
           {user?.subscriptionStatus === 'premium' && (
            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-br from-primary/10 via-transparent to-transparent"></div>
          )}
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              {user?.subscriptionStatus === 'premium' && <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />}
              <span>Welcome, {user?.displayName}!</span>
            </CardTitle>
            <CardDescription>
              {user?.subscriptionStatus === 'premium' ? 'You have unlimited access. Thank you for being a premium member!' : `You have ${user?.generationsLeft} roadmap generations left.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
             {user?.subscriptionStatus === 'premium' ? (
                <p className="text-sm text-muted-foreground">Explore any domain you wish and accelerate your career with our most advanced resources.</p>
             ) : (
                <p className="text-sm text-muted-foreground">Ready for more? Upgrade to unlock unlimited roadmaps and your full potential.</p>
             )}
          </CardContent>
          <CardFooter>
            {user?.subscriptionStatus === 'premium' ? (
              <Button variant="destructive" onClick={handleCancelSubscription}>Cancel Subscription</Button>
            ) : (
              <Button onClick={handleUpgrade} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600">Upgrade to Premium</Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-headline font-bold tracking-tight my-4">Choose a Domain</h2>
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

      <LimitWarningDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleProceed}
        generationsLeft={user?.generationsLeft ?? 0}
      />
    </>
  );
}