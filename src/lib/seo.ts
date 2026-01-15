import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
}

export function generateSEO(config: SEOConfig): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acadai.org';
  const defaultImage = '/og-image.png';

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    robots: config.noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
    openGraph: {
      title: config.title,
      description: config.description,
      images: [
        {
          url: config.image || defaultImage,
          width: 1200,
          height: 630,
          alt: config.title,
        },
      ],
      type: 'website',
      siteName: 'Acad AI',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [config.image || defaultImage],
      creator: '@AcadAI',
    },
  };
}

// Pre-defined SEO configurations for common pages
export const seoConfigs = {
  login: generateSEO({
    title: 'Login to Acad AI',
    description: 'Sign in to access your hyper-personalized learning roadmaps and continue your tech journey.',
    noIndex: true, // Don't index login page
  }),
  signup: generateSEO({
    title: 'Sign Up for Acad AI - Get Early Access',
    description: 'Create your account and get early access to AI-powered, hyper-personalized learning roadmaps. Premium features launching soon!',
    noIndex: true, // Don't index signup page
  }),
  dashboard: generateSEO({
    title: 'Dashboard',
    description: 'Your personalized learning dashboard with AI-powered roadmaps tailored to your skills and learning pace.',
    noIndex: true, // Protected page, don't index
  }),
  onboarding: generateSEO({
    title: 'Complete Your Profile',
    description: 'Tell us about your skills, proficiency level, and learning pace to unlock hyper-personalized roadmaps.',
    noIndex: true, // Don't index onboarding page
  }),
};
