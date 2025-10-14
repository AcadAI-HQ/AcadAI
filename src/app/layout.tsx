import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Providers } from './providers';
import { ConditionalLayout } from '@/components/layout/conditional-layout';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://acadai.org'),
  title: {
    default: 'Acad AI - AI-Powered Personalized Learning Roadmaps for Tech Careers',
    template: '%s | Acad AI',
  },
  description: 'Get AI-powered, hyper-personalized learning roadmaps tailored to your skills, proficiency, and learning speed. Master Frontend, Backend, Fullstack, Machine Learning, and DevOps at your own pace. Free access available now.',
  keywords: ['learning roadmap', 'personalized learning', 'AI learning path', 'tech career roadmap', 'custom learning plan', 'frontend development', 'backend development', 'fullstack', 'machine learning', 'devops', 'adaptive learning', 'skill-based learning'],
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
    title: 'Acad AI - AI-Powered Personalized Learning Roadmaps',
    description: 'Hyper-personalized learning roadmaps that adapt to YOUR skills, pace, and goals. Master tech skills faster with AI-driven customization.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Acad AI - Personalized AI Learning Roadmaps',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acad AI - AI-Powered Personalized Learning',
    description: 'Hyper-personalized learning roadmaps that adapt to YOUR skills, pace, and goals. Master tech skills faster with AI.',
    images: ['/og-image.png'],
    creator: '@AcadAI',
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
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
    description: 'AI-powered, hyper-personalized learning roadmaps tailored to your skills, proficiency level, and learning speed for tech careers.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://acadai.org',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Plan',
        price: '0',
        priceCurrency: 'USD',
        description: 'Access to comprehensive learning roadmaps',
      },
      {
        '@type': 'Offer',
        name: 'Premium Plan',
        description: 'Hyper-personalized roadmaps with skill-based customization, proficiency tracking, and adaptive learning speed',
        availability: 'https://schema.org/ComingSoon',
      },
    ],
    featureList: [
      'AI-powered learning roadmaps',
      'Hyper-personalized learning paths',
      'Skill-based customization',
      'Proficiency level adaptation',
      'Learning speed optimization',
      'Frontend Development paths',
      'Backend Development paths',
      'Fullstack Development paths',
      'Machine Learning paths',
      'DevOps paths',
    ],
    creator: {
      '@type': 'Organization',
      name: 'Acad AI',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
  };

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
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
      </body>
    </html>
  );
}
