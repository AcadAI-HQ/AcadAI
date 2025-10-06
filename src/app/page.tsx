import Header from '@/components/landing/header';
import Hero from '@/components/landing/hero';
import Bento from '@/components/landing/bento';
import { Backstory } from '@/components/landing/backstory';
import Pricing from '@/components/landing/pricing';
import FAQ from '@/components/landing/faq';
import AnimFooter from '@/components/landing/footer';
import About from '@/components/landing/about';
import MarqueeSec from '@/components/landing/marqueesec';


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black relative">
      <main className="flex-1 relative z-10">
        <div className="relative">
          <Header />
          <Hero />         
        </div>
        <About />
        <MarqueeSec/>
        <Bento />
        <Backstory />
        <Pricing />
        <FAQ />
      </main>
      <AnimFooter />
    </div>
  );
}
