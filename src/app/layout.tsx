import type {Metadata} from 'next';
import { EB_Garamond, Geist } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Providers } from './providers';
import { ConditionalLayout } from '@/components/layout/conditional-layout';
import { GoogleAnalytics } from '@next/third-parties/google';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
  fallback: ['Geist Fallback', 'ui-sans-serif', 'system-ui', 'sans-serif'],
});

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-eb-garamond',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  fallback: ['Georgia', 'ui-serif', 'serif'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://acadai.org'),
  title: {
    default: 'Acad AI - Master In-Demand Tech Skills with Industry-Standard Roadmaps',
    template: '%s | Acad AI',
  },
  description: 'Accelerate your tech career with industry-standard learning roadmaps across 14 domains. Get structured paths for Frontend, Backend, ML, DevOps, and more - plus weekly curated resources.',
  keywords: ['learning roadmap', 'tech career', 'frontend development', 'backend development', 'fullstack', 'machine learning', 'devops', 'data science', 'cybersecurity', 'ui ux design', 'game development', 'android', 'ios', 'blockchain', 'career development', 'tech skills'],
  authors: [{ name: 'Acad AI' }],
  creator: 'Acad AI',
  publisher: 'Acad AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/brain-icon.ico',
    shortcut: '/brain-icon.ico',
    apple: '/brain-icon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Acad AI',
    title: 'Acad AI - Master In-Demand Tech Skills',
    description: 'Industry-standard learning roadmaps across 14 tech domains. Accelerate your career with structured paths and weekly curated resources.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Acad AI - Industry-Standard Tech Learning Roadmaps',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acad AI - Master In-Demand Tech Skills',
    description: 'Industry-standard learning roadmaps across 14 tech domains. Accelerate your career with structured paths and weekly curated resources.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Acad AI',
    description: 'Industry-standard learning roadmaps across 14 tech domains with weekly curated resources to accelerate your tech career.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://acadai.org',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      name: 'Acad AI Subscription',
      description: 'Full access to 14 tech domain roadmaps, weekly curated learning resources, and progress tracking',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    featureList: [
      'Industry-standard learning roadmaps',
      'Weekly curated learning resources',
      'Progress tracking',
      '14 tech domains covered',
      'Frontend Development',
      'Backend Development',
      'Fullstack Development',
      'Machine Learning',
      'DevOps',
      'Data Science',
      'Cybersecurity',
      'UI/UX Design',
      'Product Engineering',
      'Game Development',
      'Android Development',
      'iOS Development',
      'Blockchain Development',
    ],
    creator: {
      '@type': 'Organization',
      name: 'Acad AI',
      url: 'https://acadai.org',
    },
  };

  return (
    <html lang="en" className={`dark ${geist.variable} ${ebGaramond.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased">
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <Toaster />
        </Providers>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
