import { ReactNode } from "react";
import { seoConfigs } from '@/lib/seo';

export const metadata = seoConfigs.dashboard;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
