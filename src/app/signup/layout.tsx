import { seoConfigs } from '@/lib/seo';

export const metadata = seoConfigs.signup;

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <div className="force-light">{children}</div>;
}
