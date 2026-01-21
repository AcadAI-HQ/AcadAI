"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

type Outcome = "success" | "failed" | "unknown";

interface CheckoutStatusResponse {
  outcome: Outcome;
  rawStatus?: string;
  subscriptionPersisted?: boolean;
  persistenceError?: string;
  uid?: string;
}

export default function CheckoutReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, refreshUserProfile } = useAuth();
  const [checking, setChecking] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Processing your checkout...");
  const [error, setError] = useState<string | null>(null);

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
        // Check if subscription was actually persisted
        if (!data.subscriptionPersisted) {
          console.error("[checkout-return] Payment succeeded but subscription persistence failed:", data.persistenceError);
          // Still try to proceed - maybe webhook will handle it
        }

        if (!cancelled) setStatusMessage("Activating your subscription...");

        // Refresh user profile to get the updated subscription data
        // Retry a few times in case there's a slight delay
        let retries = 3;
        let refreshed = false;
        while (retries > 0 && !refreshed) {
          try {
            const profile = await refreshUserProfile();
            if (profile?.subscription?.tier === "premium" && profile?.subscription?.status === "active") {
              refreshed = true;
              console.log("[checkout-return] Subscription confirmed:", profile.subscription);
            } else {
              console.log("[checkout-return] Subscription not yet active, retrying...", profile?.subscription);
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
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
            // Subscription persistence might have failed, but payment succeeded
            // Show message and redirect anyway - webhook might fix it
            console.warn("[checkout-return] Could not confirm subscription, redirecting anyway");
            setStatusMessage("Payment successful! Setting up your account...");
            // Give a moment for the message to show
            await new Promise(resolve => setTimeout(resolve, 1500));
            router.replace("/dashboard");
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
  }, [loading, isPremiumActive, router, sessionId, refreshUserProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center max-w-md px-4">
        {error ? (
          <>
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
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