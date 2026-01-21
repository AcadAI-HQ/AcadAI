"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Timestamp } from "firebase/firestore";

// Helper to check if subscription is active and not expired
function isSubscriptionValid(subscription: any): boolean {
  if (!subscription) return false;
  if (subscription.tier !== 'premium') return false;
  if (subscription.status !== 'active') return false;

  // Check if subscription has expired
  if (subscription.currentPeriodEnd) {
    let endDate: Date;
    // Handle Firestore Timestamp or Date object or ISO string
    if (subscription.currentPeriodEnd instanceof Timestamp) {
      endDate = subscription.currentPeriodEnd.toDate();
    } else if (subscription.currentPeriodEnd instanceof Date) {
      endDate = subscription.currentPeriodEnd;
    } else if (typeof subscription.currentPeriodEnd === 'string') {
      endDate = new Date(subscription.currentPeriodEnd);
    } else if (typeof subscription.currentPeriodEnd === 'object' && 'seconds' in subscription.currentPeriodEnd) {
      // Handle Firestore Timestamp-like object
      endDate = new Date((subscription.currentPeriodEnd as any).seconds * 1000);
    } else {
      // Unknown format, assume not expired
      return true;
    }

    const now = new Date();
    if (endDate < now) {
      console.log('[PremiumGate] Subscription expired:', { endDate: endDate.toISOString(), now: now.toISOString() });
      return false;
    }
  }

  return true;
}

export default function PremiumGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Not logged in -> send to signup
    if (!user?.uid) {
      router.replace("/signup");
      return;
    }

    const bypass = user?.flags?.bypassPremium === true || (user as any)?.roles?.admin === true;
    const isPremium = bypass || isSubscriptionValid(user.subscription);

    // Non-premium -> pricing
    if (!isPremium) {
      router.replace("/pricing");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center text-sm text-muted-foreground">
        Checking subscription...
      </div>
    );
  }

  // Render children while effect runs; if redirect occurs, Next router will navigate.
  return <>{children}</>;
}