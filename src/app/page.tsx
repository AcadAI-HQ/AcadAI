import Header from '@/components/landing/header';
import Hero from '@/components/landing/hero';
import AnimatedBeamMultipleOutputDemo  from '@/components/landing/about';
import HowItWorks from '@/components/landing/how-it-works';
import Backstory from '@/components/landing/backstory';
import Pricing from '@/components/landing/pricing';
import FAQ from '@/components/landing/faq';
import Footer from '@/components/landing/footer';
import { Component as ShadowOverlay } from '@/components/ui/shadowoverlay';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black relative">
      <div className="fixed inset-0 z-0">
        <ShadowOverlay
          sizing="fill"
          color="rgba(75, 85, 99, 0.8)"
          animation={{
            preview: false,
            scale: 20,
            speed: 85
          }}
          noise={{
            opacity: 0.2,
            scale: 0.5
          }}
          className="w-full h-full"
        />
      </div>
      <main className="flex-1 relative z-10">
        <div className="relative">
          <Header />
          <Hero />
        </div>
        <section id="about" className="py-20 md:py-28">
          <div className="container max-w-4xl mx-auto">
            <div className="text-center">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Why Choose Acad AI?
                </h2>
                <p className="mt-4 text-white/80 text-lg">
                  We go beyond generic advice. Acad AI analyzes thousands of real-time job postings from top platforms to understand exactly what skills companies are hiring for right now. Our AI then crafts a personalized, hyper-relevant roadmap to get you job-ready, faster.
                </p>
            </div>
            <AnimatedBeamMultipleOutputDemo />
          </div>
        </section>
        <HowItWorks />
        <Backstory />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
