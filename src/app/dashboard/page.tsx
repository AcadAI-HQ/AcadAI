"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { DomainCard } from "@/components/dashboard/domain-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Bot, Cpu, Layers, GitBranch, AlertTriangle } from "lucide-react";
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
  const { user, useGeneration } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
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

    useGeneration(domainId);
    router.push(`/dashboard/my-roadmap`);
  };


  return (
    <>
      <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
                <CardHeader className="pb-3">
                    <CardTitle className="font-headline flex items-center gap-2">
                        <span>Welcome, {user?.displayName}!</span>
                    </CardTitle>
                    <CardDescription className="max-w-lg text-balance leading-relaxed">
                        Generate unlimited comprehensive roadmaps with professional-level content - completely free!
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
    </>
  );
}