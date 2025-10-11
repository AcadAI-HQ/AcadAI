import { seoConfigs } from '@/lib/seo';

export const metadata = seoConfigs.onboarding;

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
