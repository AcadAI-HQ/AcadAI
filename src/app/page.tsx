import dynamic from 'next/dynamic';
import Header, { FloatingCTA } from '@/components/landing/header';

const Hero = dynamic(() => import('@/components/landing/hero'), {
  loading: () => <div className="min-h-screen bg-white" />,
});

const Benefits = dynamic(() => import('@/components/landing/benefits'), {
  loading: () => <div className="h-[800px] bg-white" />,
});

const HowItWorks = dynamic(() => import('@/components/landing/howitworks'), {
  loading: () => <div className="h-[700px] bg-white" />,
});

const SocialProof = dynamic(() => import('@/components/landing/socialproof'), {
  loading: () => <div className="h-[600px] bg-white" />,
});

const Differentiators = dynamic(() => import('@/components/landing/differentiators'), {
  loading: () => <div className="h-[600px] bg-white" />,
});

const Pricing = dynamic(() => import('@/components/landing/pricing'), {
  loading: () => <div className="h-[600px] bg-white" />,
});

const FAQ = dynamic(() => import('@/components/landing/faq'), {
  loading: () => <div className="h-[500px] bg-white" />,
});

const CTA = dynamic(() => import('@/components/landing/cta'), {
  loading: () => <div className="h-[400px] bg-white" />,
});

const Footer = dynamic(() => import('@/components/landing/footer'), {
  loading: () => <div className="h-[320px] bg-[#0A0A0A]" />,
});

export default function LandingPage() {
  return (
    <div className="force-light flex flex-col min-h-screen bg-white relative">
      <FloatingCTA />
      <main className="flex-1 relative z-10">
        <div className="relative">
          <Header />
          <Hero />
        </div>
        <Benefits />
        <HowItWorks />
        <SocialProof />
        <Differentiators />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
