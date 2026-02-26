"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import OnboardingForm from "@/components/onboarding/onboarding-form";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import Link from "next/link";
import { UserProfile } from "@/types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect } from "react";

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!loading && !user) {
      router.replace('/login');
      return;
    }

    // If user already has complete profile, redirect to dashboard
    if (!loading && user?.profileComplete) {
      router.replace('/dashboard');
      return;
    }
  }, [user, loading, router]);

  const handleCompleteOnboarding = async (profileData: Partial<UserProfile>) => {
    if (!user) return;

    try {
      // Filter out undefined values, empty strings, and irrelevant fields based on user type
      const baseData = {
        ...profileData,
        profileComplete: true,
      };

      // Remove fields that don't apply to the user's type
      const relevantData = { ...baseData };

      if (profileData.userType === 'professional') {
        // Remove student and learner specific fields
        delete relevantData.degree;
        delete relevantData.startDate;
        delete relevantData.endDate;
        delete relevantData.currentYear;
        delete relevantData.description;
      } else if (profileData.userType === 'student') {
        // Remove professional and learner specific fields
        delete relevantData.currentRole;
        delete relevantData.yearsOfExperience;
        delete relevantData.description;
      } else if (profileData.userType === 'learner') {
        // Remove student and professional specific fields
        delete relevantData.degree;
        delete relevantData.startDate;
        delete relevantData.endDate;
        delete relevantData.currentYear;
        delete relevantData.currentRole;
        delete relevantData.yearsOfExperience;
      }

      const cleanData = Object.fromEntries(
        Object.entries(relevantData).filter(([_, value]) =>
          value !== undefined && value !== '' && value !== null
        )
      );


      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, cleanData);

      toast({
        title: "Profile Complete!",
        description: "Your profile has been saved. Let's create your personalized roadmap!",
      });

      router.push('/dashboard');
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSkip = () => {
    toast({
      title: "Profile Skipped",
      description: "You can complete your profile later from the dashboard to get personalized roadmaps.",
    });
    router.push('/dashboard');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <BrainCircuit className="h-16 w-16 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user, don't render anything (useEffect will handle redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3B82F6]/15">
              <BrainCircuit className="h-5 w-5 text-[#3B82F6]" />
            </div>
            <span className="font-headline text-xl font-semibold">Acad AI</span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm">
          <OnboardingForm
            onComplete={handleCompleteOnboarding}
            onSkip={handleSkip}
            initialData={user}
            loading={loading}
          />
        </div>

        <p className="text-center mt-5 text-xs text-muted-foreground/50">
          Takes less than 2 minutes · Free forever
        </p>
      </div>
    </div>
  );
}