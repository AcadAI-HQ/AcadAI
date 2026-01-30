"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Backend API URL
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

type Outcome = "success" | "failed" | "unknown";

interface CheckoutStatusResponse {
  outcome: Outcome;
  rawStatus?: string;
  subscriptionPersisted?: boolean;
  persistenceError?: string;
  uid?: string;
}

/**
 * SECURITY: Removed client-side subscription persistence
 *
 * Previous version had `persistSubscriptionClientSide()` which allowed
 * the client to write subscription data directly to Firestore.
 * This was a security vulnerability.
 *
 * Now ALL subscription persistence happens server-side via:
 * 1. The checkout-status API (immediate)
 * 2. The webhook handler (reliable)
 */

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

  const isPremiumActive = useMemo(() => {
    const sub = user?.subscription;
    return sub?.tier === "premium" && sub?.status === "active";
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    async function decideRedirect() {
      if (loading) return;

      // Fast path: if subscription already active, go to dashboard
      if (isPremiumActive) {
        if (!cancelled) {
          setStatusMessage("Subscription active! Redirecting to dashboard...");
          router.replace("/dashboard");
        }
        return;
      }

      let outcome: Outcome = "unknown";
      let data: CheckoutStatusResponse = { outcome: "unknown" };

      if (sessionId) {
        if (!cancelled) setStatusMessage("Verifying payment...");

        try {
          // Call the backend API to check status
          // The backend will persist the subscription if successful
          const res = await fetch(
            `${API_URL}/api/payment/checkout-status?session_id=${encodeURIComponent(sessionId)}`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

          data = await res.json().catch(() => ({ outcome: "unknown" } as CheckoutStatusResponse));

          if (res.ok && (data.outcome === "success" || data.outcome === "failed" || data.outcome === "unknown")) {
            outcome = data.outcome;
          }

          console.log("[checkout-return] Backend response:", data);
        } catch (err) {
          console.error("[checkout-return] Error fetching checkout status:", err);
        }
      }

      if (outcome === "success") {
        // Server has persisted the subscription
        // Just need to refresh the user profile to see it
        if (!cancelled) setStatusMessage("Activating your subscription...");

        // Retry profile refresh a few times (webhook might still be processing)
        let retries = 5;
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
            // Payment succeeded but subscription not visible yet
            // This can happen if there's webhook delay
            setError(
              "Your payment was successful! Your subscription is being activated. " +
              "Please wait a moment and refresh, or contact support if this persists."
            );
            setCanRetry(true);
          }
        }
        return;
      }

      // Failed or unknown outcome
      if (!cancelled) {
        if (outcome === "failed") {
          setError("Payment was not successful. Please try again.");
        } else {
          setError("Could not verify payment status. Please check your account or try again.");
        }
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
  }, [loading, isPremiumActive, router, sessionId, refreshUserProfile]);

  // Retry just refreshes the profile (no client-side persistence)
  const handleRetry = async () => {
    setRetrying(true);
    setError(null);
    setStatusMessage("Checking subscription status...");

    try {
      // Just try refreshing the profile
      const profile = await refreshUserProfile();

      if (profile?.subscription?.tier === "premium" && profile?.subscription?.status === "active") {
        setStatusMessage("Success! Redirecting to dashboard...");
        router.replace("/dashboard");
        return;
      }

      // Still not active
      setError(
        "Subscription still activating. This usually takes a few seconds. " +
        "If this persists, please contact support at support@acadai.app"
      );
      setCanRetry(true);
    } catch (err) {
      console.error("[checkout-return] Retry failed:", err);
      setError("Could not verify subscription. Please contact support at support@acadai.app");
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
                  {retrying ? "Checking..." : "Check Again"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="text-xs"
                >
                  Go to Dashboard
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
