"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

type Outcome = "success" | "failed" | "unknown";

export default function CheckoutReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, refreshUserProfile } = useAuth();
  const [checking, setChecking] = useState(true);

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
          router.replace("/dashboard");
        }
        return;
      }

      // If we have a session id, ask backend for outcome; otherwise, fallback
      let outcome: Outcome = "unknown";
      if (sessionId) {
        try {
          const res = await fetch(`/api/checkout-status?session_id=${encodeURIComponent(sessionId)}`, {
            method: "GET",
            cache: "no-store",
          });
          const data = await res.json().catch(() => ({} as any));
          if (res.ok && (data.outcome === "success" || data.outcome === "failed" || data.outcome === "unknown")) {
            outcome = data.outcome as Outcome;
          }
        } catch {
          // ignore; we'll fallback to subscription check below
        }
      }

      // If API says success, refresh the user profile to get updated subscription
      // The checkout-status API also persists the subscription to Firestore
      if (outcome === "success") {
        // Refresh user profile to get the updated subscription data
        try {
          await refreshUserProfile();
        } catch (err) {
          console.error("[checkout-return] Failed to refresh user profile:", err);
          // Continue anyway - the subscription should be in Firestore now
        }

        if (!cancelled) {
          router.replace("/dashboard");
        }
        return;
      }

      // For failed/unknown (declined, canceled, or error), send back to pricing
      if (!cancelled) {
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
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {checking ? "Processing your checkout..." : "Redirecting..."}
        </p>
      </div>
    </div>
  );
}