"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

/**
 * AuthGate - Requires authentication only (no premium check)
 * Use this for pages that should be accessible to all logged-in users
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user?.uid) {
      console.log('[AuthGate] No user, redirecting to signup');
      router.replace("/signup");
      return;
    }

    setChecked(true);
  }, [user, loading, router]);

  if (loading || !checked) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
