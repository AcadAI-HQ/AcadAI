import dynamic from 'next/dynamic';
import Header from '@/components/landing/header';
import About from '@/components/landing/about';
import MarqueeSec from '@/components/landing/marqueesec';
import Pricing from '@/components/landing/pricing';
import { generateFAQSchema, generateHowToSchema } from '@/lib/geo-content';

// Lazy load heavy components for better initial load performance
const Hero = dynamic(() => import('@/components/landing/hero'), {
  loading: () => <div className="min-h-screen bg-black" />,
});

const Bento = dynamic(() => import('@/components/landing/bento'), {
  loading: () => <div className="h-96 bg-black" />,
});

const Backstory = dynamic(
  () => import('@/components/landing/backstory').then(mod => ({ default: mod.Backstory })),
  {
    loading: () => <div className="h-96 bg-black" />,
  }
);

const Testimonials = dynamic(() => import('@/components/landing/testimonials'), {
  loading: () => <div className="h-64 bg-black" />,
});

const FAQ = dynamic(() => import('@/components/landing/faq'), {
  loading: () => <div className="h-96 bg-black" />,
});

const AnimFooter = dynamic(() => import('@/components/landing/footer'), {
  loading: () => <div className="h-32 bg-black" />,
});

export default function LandingPage() {
  const faqSchema = generateFAQSchema();
  const howToSchema = generateHowToSchema();

  return (
    <div className="flex flex-col min-h-screen bg-black relative">
      {/* GEO: FAQ Schema for AI engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* GEO: HowTo Schema for AI parsing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <main className="flex-1 relative z-10">
        <div className="relative">
          <Header />
          <Hero />
        </div>
        <About />
        <MarqueeSec/>
        <Bento />
        <Backstory />
        <Testimonials/>
        <Pricing />
        <FAQ />
      </main>
      <AnimFooter />
    </div>
  );
}
