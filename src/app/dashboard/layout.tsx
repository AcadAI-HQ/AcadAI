import { ReactNode } from "react";
import { seoConfigs } from '@/lib/seo';
import PremiumGate from "@/components/auth/premium-gate";

export const metadata = seoConfigs.dashboard;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <PremiumGate>{children}</PremiumGate>;
}
