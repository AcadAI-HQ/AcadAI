"use client";

import { AuthProvider } from "@/contexts/auth-context";
import { SmoothScroll } from "@/components/smooth-scroll";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SmoothScroll>{children}</SmoothScroll>
    </AuthProvider>
  );
}
