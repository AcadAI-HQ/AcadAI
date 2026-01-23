"use client";

import React, { useEffect, useState } from "react";
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
      // Handle Firestore Timestamp-like object (serialized format)
      endDate = new Date((subscription.currentPeriodEnd as any).seconds * 1000);
    } else if (typeof subscription.currentPeriodEnd === 'object' && '_seconds' in subscription.currentPeriodEnd) {
      // Handle Firestore Timestamp with underscore prefix (client SDK format)
      endDate = new Date((subscription.currentPeriodEnd as any)._seconds * 1000);
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
  const { user, loading, refreshUserProfile } = useAuth();
  const [checking, setChecking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function checkSubscription() {
      if (loading) return;

      // Not logged in -> send to signup
      if (!user?.uid) {
        console.log('[PremiumGate] No user, redirecting to signup');
        router.replace("/signup");
        return;
      }

      const bypass = user?.flags?.bypassPremium === true || (user as any)?.roles?.admin === true;
      const isPremium = bypass || isSubscriptionValid(user.subscription);

      console.log('[PremiumGate] Subscription check:', {
        uid: user.uid,
        tier: user.subscription?.tier,
        status: user.subscription?.status,
        currentPeriodEnd: user.subscription?.currentPeriodEnd,
        bypass,
        isPremium,
        retryCount,
      });

      // If not premium and we haven't retried yet, refresh profile once
      // This handles the case where user just came from checkout
      if (!isPremium && retryCount < 2) {
        console.log('[PremiumGate] Not premium, refreshing profile (attempt', retryCount + 1, ')');
        setRetryCount(prev => prev + 1);
        try {
          await refreshUserProfile();
          // Wait a moment and let the effect re-run with new user data
          await new Promise(resolve => setTimeout(resolve, 1000));
          return;
        } catch (err) {
          console.error('[PremiumGate] Failed to refresh profile:', err);
        }
      }

      // After retries, redirect non-premium to pricing
      if (!isPremium) {
        console.log('[PremiumGate] Not premium after retries, redirecting to pricing');
        router.replace("/pricing");
      } else {
        setChecking(false);
      }
    }

    checkSubscription();
  }, [user, loading, router, refreshUserProfile, retryCount]);

  if (loading || checking) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center text-sm text-muted-foreground">
        Checking subscription...
      </div>
    );
  }

  // Render children while effect runs; if redirect occurs, Next router will navigate.
  return <>{children}</>;
}