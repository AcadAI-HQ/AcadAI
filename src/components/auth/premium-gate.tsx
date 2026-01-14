"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

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

    const sub = user.subscription;
    const bypass = user?.flags?.bypassPremium === true || (user as any)?.roles?.admin === true;
    const isPremium = (sub?.tier === "premium" && sub?.status === "active") || bypass;

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