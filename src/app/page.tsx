import Header from '@/components/landing/header';
import Hero from '@/components/landing/hero';
import Bento from '@/components/landing/bento';
import { Backstory } from '@/components/landing/backstory';
import Testimonials from '@/components/landing/testimonials';
import Pricing from '@/components/landing/pricing';
import FAQ from '@/components/landing/faq';
import AnimFooter from '@/components/landing/footer';
import About from '@/components/landing/about';
import MarqueeSec from '@/components/landing/marqueesec';
import { generateFAQSchema, generateHowToSchema } from '@/lib/geo-content';
import { AnnouncementModal } from '@/components/shared/announcement-modal';

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
      <AnnouncementModal />
    </div>
  );
}
