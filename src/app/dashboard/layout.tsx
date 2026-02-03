import { ReactNode } from "react";
import { seoConfigs } from '@/lib/seo';
import AuthGate from "@/components/auth/auth-gate";

export const metadata = seoConfigs.dashboard;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
