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

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.acadai.org';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Acad AI — Master In-Demand Tech Skills with Industry-Standard Roadmaps',
    template: '%s | Acad AI',
  },
  description: 'Accelerate your tech career with industry-standard learning roadmaps across 14 domains. Get structured paths for Frontend, Backend, ML, DevOps, and more — plus weekly curated resources and AI-powered personalization.',
  keywords: ['learning roadmap', 'tech career', 'frontend development', 'backend development', 'fullstack', 'machine learning', 'devops', 'data science', 'cybersecurity', 'ui ux design', 'game development', 'android', 'ios', 'blockchain', 'career development', 'tech skills', 'developer roadmap', 'coding roadmap'],
  authors: [{ name: 'Acad AI', url: BASE_URL }],
  creator: 'Acad AI',
  publisher: 'Acad AI',
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: 'PASTE_YOUR_CODE_HERE',
  },
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
    url: BASE_URL,
    siteName: 'Acad AI',
    title: 'Acad AI — Master In-Demand Tech Skills',
    description: 'Industry-standard learning roadmaps across 14 tech domains. Accelerate your career with structured paths, weekly curated resources, and AI personalization.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Acad AI — Industry-Standard Tech Learning Roadmaps',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acad AI — Master In-Demand Tech Skills',
    description: 'Industry-standard learning roadmaps across 14 tech domains. Accelerate your career with structured paths, weekly curated resources, and AI personalization.',
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
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        name: 'Acad AI',
        url: BASE_URL,
        description: 'Industry-standard learning roadmaps across 14 tech domains with weekly curated resources and AI personalization.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BASE_URL}/blog?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
        inLanguage: 'en-US',
      },
      {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: 'Acad AI',
        url: BASE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/brain-icon.ico`,
          contentUrl: `${BASE_URL}/brain-icon.ico`,
        },
        sameAs: [],
        description: 'Acad AI helps developers accelerate their careers with industry-standard learning roadmaps, weekly curated resources, and AI-powered personalization.',
      },
      {
        '@type': 'WebApplication',
        '@id': `${BASE_URL}/#webapp`,
        name: 'Acad AI',
        url: BASE_URL,
        description: 'Industry-standard learning roadmaps across 14 tech domains with weekly curated resources and AI-powered personalization to accelerate your tech career.',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          description: 'Free access to 14 tech domain roadmaps, weekly curated learning resources, progress tracking, and AI Mentor.',
        },
        featureList: [
          'Industry-standard learning roadmaps for 14 tech domains',
          'AI-powered roadmap personalization',
          'AI Mentor for personalized learning guidance',
          'Weekly curated learning resources',
          'Progress tracking',
          'Frontend Development roadmap',
          'Backend Development roadmap',
          'Fullstack Development roadmap',
          'Machine Learning roadmap',
          'DevOps roadmap',
          'Data Science roadmap',
          'Cybersecurity roadmap',
          'UI/UX Design roadmap',
          'Android Development roadmap',
          'iOS Development roadmap',
          'Blockchain Development roadmap',
        ],
        publisher: { '@id': `${BASE_URL}/#organization` },
      },
    ],
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
