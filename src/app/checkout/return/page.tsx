"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

type Outcome = "success" | "failed" | "unknown";

export default function CheckoutReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
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
          // Get the current user's ID token for authentication
          const currentUser = auth.currentUser;
          const token = currentUser ? await currentUser.getIdToken() : null;

          const res = await fetch(`/api/checkout-status?session_id=${encodeURIComponent(sessionId)}`, {
            method: "GET",
            cache: "no-store",
            headers: token ? { "Authorization": `Bearer ${token}` } : {},
          });
          const data = await res.json().catch(() => ({} as any));
          if (res.ok && (data.outcome === "success" || data.outcome === "failed" || data.outcome === "unknown")) {
            outcome = data.outcome as Outcome;
          }
        } catch {
          // ignore; we'll fallback to subscription check below
        }
      }

      // If API says success but our subscription hasn't reflected yet,
      // still route to dashboard; PremiumGate will enforce access anyway.
      if (outcome === "success") {
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
  }, [loading, isPremiumActive, router, sessionId]);

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