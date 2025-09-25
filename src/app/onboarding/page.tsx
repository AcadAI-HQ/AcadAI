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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <span className="font-headline text-2xl font-bold text-foreground">Acad AI</span>
          </Link>
          <h1 className="text-3xl font-headline font-bold mb-2">Welcome to Acad AI!</h1>
          <p className="text-muted-foreground text-lg">
            Let's personalize your learning experience to create the perfect roadmap for you.
          </p>
        </div>

        {/* Onboarding Form */}
        <OnboardingForm
          onComplete={handleCompleteOnboarding}
          onSkip={handleSkip}
          initialData={user}
          loading={loading}
        />

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}