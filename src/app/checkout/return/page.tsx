"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Loader2, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Outcome = "success" | "failed" | "unknown";

interface CheckoutStatusResponse {
  outcome: Outcome;
  rawStatus?: string;
  subscriptionPersisted?: boolean;
  persistenceError?: string;
  uid?: string;
}

// Client-side fallback to persist subscription when server-side fails
async function persistSubscriptionClientSide(interval: 'monthly' | 'yearly', currency: string): Promise<boolean> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error("[checkout-return] No authenticated user for client-side persistence");
    return false;
  }

  const now = new Date();
  const currentPeriodEnd = interval === 'yearly'
    ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
    : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  try {
    const userRef = doc(db, "users", currentUser.uid);
    await setDoc(userRef, {
      subscription: {
        tier: 'premium',
        status: 'active',
        interval: interval === 'yearly' ? 'year' : 'month',
        currency: currency.toLowerCase(),
        currentPeriodEnd: currentPeriodEnd,
        cancelAtPeriodEnd: false,
        autoRenew: true,
        updatedAt: new Date(),
        // Note: customerId and subscriptionId will be filled in by webhook later
      },
    }, { merge: true });

    console.log("[checkout-return] Successfully persisted subscription client-side");
    return true;
  } catch (error) {
    console.error("[checkout-return] Failed to persist subscription client-side:", error);
    return false;
  }
}

export default function CheckoutReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, refreshUserProfile } = useAuth();
  const [checking, setChecking] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Processing your checkout...");
  const [error, setError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const sessionId = useMemo(() => {
    return (
      searchParams.get("session_id") ||
      searchParams.get("sessionId") ||
      searchParams.get("id") ||
      ""
    );
  }, [searchParams]);

  // Extract interval from URL if present (passed from checkout)
  const intervalParam = useMemo(() => {
    return searchParams.get("interval") as 'monthly' | 'yearly' | null;
  }, [searchParams]);

  const isPremiumActive = useMemo(() => {
    const sub = user?.subscription;
    return sub?.tier === "premium" && sub?.status === "active";
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    async function decideRedirect() {
      // If auth still loading, wait
      if (loading) return;

      // Fast path: if subscription is already active, send to dashboard
      if (isPremiumActive) {
        if (!cancelled) {
          setStatusMessage("Subscription active! Redirecting to dashboard...");
          router.replace("/dashboard");
        }
        return;
      }

      // If we have a session id, ask backend for outcome; otherwise, fallback
      let outcome: Outcome = "unknown";
      let data: CheckoutStatusResponse = { outcome: "unknown" };

      if (sessionId) {
        if (!cancelled) setStatusMessage("Verifying payment...");
        try {
          const res = await fetch(`/api/checkout-status?session_id=${encodeURIComponent(sessionId)}`, {
            method: "GET",
            cache: "no-store",
          });
          data = await res.json().catch(() => ({ outcome: "unknown" } as CheckoutStatusResponse));
          if (res.ok && (data.outcome === "success" || data.outcome === "failed" || data.outcome === "unknown")) {
            outcome = data.outcome;
          }

          console.log("[checkout-return] API response:", data);
        } catch (err) {
          console.error("[checkout-return] Error fetching checkout status:", err);
          // ignore; we'll fallback to subscription check below
        }
      }

      // If API says success, refresh the user profile to get updated subscription
      // The checkout-status API also persists the subscription to Firestore
      if (outcome === "success") {
        // Check if subscription was actually persisted on server
        if (!data.subscriptionPersisted) {
          console.error("[checkout-return] Payment succeeded but server-side persistence failed:", data.persistenceError);

          // Try client-side fallback persistence
          if (!cancelled) setStatusMessage("Setting up your subscription...");

          const interval = intervalParam || 'monthly';
          const currency = 'USD'; // Default, will be updated by webhook
          const clientPersisted = await persistSubscriptionClientSide(interval, currency);

          if (!clientPersisted) {
            console.error("[checkout-return] Client-side persistence also failed");
            // Don't give up yet - try refreshing profile in case webhook already fired
          }
        }

        if (!cancelled) setStatusMessage("Activating your subscription...");

        // Refresh user profile to get the updated subscription data
        // Retry a few times in case there's a slight delay
        let retries = 5; // Increased retries
        let refreshed = false;
        while (retries > 0 && !refreshed) {
          try {
            const profile = await refreshUserProfile();
            if (profile?.subscription?.tier === "premium" && profile?.subscription?.status === "active") {
              refreshed = true;
              console.log("[checkout-return] Subscription confirmed:", profile.subscription);
            } else {
              console.log("[checkout-return] Subscription not yet active, retrying...", {
                tier: profile?.subscription?.tier,
                status: profile?.subscription?.status,
                retriesLeft: retries - 1
              });
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          } catch (err) {
            console.error("[checkout-return] Failed to refresh user profile:", err);
          }
          retries--;
        }

        if (!cancelled) {
          if (refreshed) {
            setStatusMessage("Success! Redirecting to dashboard...");
            router.replace("/dashboard");
          } else {
            // Payment succeeded but subscription not confirmed after all retries
            // This is a critical error - don't redirect to dashboard as user will be bounced to pricing
            console.error("[checkout-return] Payment succeeded but subscription could not be confirmed after all retries");
            setError("Your payment was successful, but we couldn't activate your subscription immediately. Please wait a moment and click 'Retry' below, or contact support if the issue persists.");
            setCanRetry(true);
          }
        }
        return;
      }

      // For failed/unknown (declined, canceled, or error), send back to pricing
      if (!cancelled) {
        if (outcome === "failed") {
          setError("Payment was not successful. Please try again.");
        } else {
          setError("Could not verify payment status. Please check your account or try again.");
        }
        // Wait a moment to show the error before redirecting
        await new Promise(resolve => setTimeout(resolve, 2000));
        router.replace("/pricing");
      }
    }

    decideRedirect().finally(() => {
      if (!cancelled) setChecking(false);
    });

    return () => {
      cancelled = true;
    };
  }, [loading, isPremiumActive, router, sessionId, refreshUserProfile, intervalParam]);

  // Retry handler for when subscription activation fails
  const handleRetry = async () => {
    setRetrying(true);
    setError(null);
    setStatusMessage("Retrying subscription activation...");

    try {
      // First try client-side persistence again
      const interval = intervalParam || 'monthly';
      await persistSubscriptionClientSide(interval, 'USD');

      // Wait a moment for Firestore to sync
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Refresh user profile
      const profile = await refreshUserProfile();
      if (profile?.subscription?.tier === "premium" && profile?.subscription?.status === "active") {
        setStatusMessage("Success! Redirecting to dashboard...");
        router.replace("/dashboard");
        return;
      }

      // If still not active, show error again
      setError("Subscription still not active. Please contact support at support@acadai.app with your payment confirmation.");
      setCanRetry(true);
    } catch (err) {
      console.error("[checkout-return] Retry failed:", err);
      setError("Retry failed. Please contact support at support@acadai.app with your payment confirmation.");
      setCanRetry(true);
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center max-w-md px-4">
        {error ? (
          <>
            <AlertCircle className="h-8 w-8 text-amber-500" />
            <p className="text-sm text-muted-foreground">{error}</p>
            {canRetry && (
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  onClick={handleRetry}
                  disabled={retrying}
                  className="gap-2"
                >
                  {retrying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {retrying ? "Retrying..." : "Retry Activation"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="text-xs"
                >
                  Go to Dashboard Anyway
                </Button>
              </div>
            )}
          </>
        ) : statusMessage.includes("Success") || statusMessage.includes("active") ? (
          <>
            <CheckCircle className="h-8 w-8 text-green-500" />
            <p className="text-sm text-muted-foreground">{statusMessage}</p>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{statusMessage}</p>
          </>
        )}
      </div>
    </div>
  );
}