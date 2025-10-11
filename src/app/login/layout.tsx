import { seoConfigs } from '@/lib/seo';

export const metadata = seoConfigs.login;

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
