"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { UserProfile } from "@/types";

interface ProfileCompletionBannerProps {
  user: UserProfile;
  onDismiss?: () => void;
}

export default function ProfileCompletionBanner({ user, onDismiss }: ProfileCompletionBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Don't show banner if profile is complete or if dismissed
  if (user.profileComplete || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  // Calculate completion percentage based on actual onboarding fields
  let completionScore = 0;
  const maxScore = 4; // userType, user-specific fields, interestedDomain, domainExperience

  // Check if user type is selected
  if (user.userType) {
    completionScore++;

    // Check user-type specific fields
    if (user.userType === 'student') {
      if (user.degree && user.startDate && user.endDate && user.currentYear) {
        completionScore++;
      }
    } else if (user.userType === 'professional') {
      if (user.currentRole && user.yearsOfExperience) {
        completionScore++;
      }
    } else if (user.userType === 'learner') {
      if (user.description) {
        completionScore++;
      }
    }
  }

  // Check domain selection
  if (user.interestedDomain) completionScore++;

  // Check domain experience
  if (user.domainExperience && user.domainExperience.length >= 20) completionScore++;

  const completionPercentage = Math.round((completionScore / maxScore) * 100);

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <User className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="flex-1 space-y-3">
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Complete your profile to get personalized roadmaps</span>
                <span className="text-sm font-medium">{completionPercentage}% complete</span>
              </div>
              <Progress value={completionPercentage} className="h-2 mb-3" />
              <p className="text-sm">
                Help us understand your background and goals to create 10x better, personalized learning roadmaps tailored just for you.
              </p>
            </AlertDescription>
            <div className="flex items-center space-x-3">
              <Button asChild size="sm">
                <Link href="/onboarding">
                  Complete Profile
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                Maybe later
              </Button>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}