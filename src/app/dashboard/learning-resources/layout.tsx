import { ReactNode } from "react";
import PremiumGate from "@/components/auth/premium-gate";

export default function LearningResourcesLayout({ children }: { children: ReactNode }) {
  return <PremiumGate>{children}</PremiumGate>;
}
