"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { SparklesCore } from '../ui/sparkles';
import { PulsatingButton } from '../ui/pulsating-button';
import { ShimmerButton } from '../ui/shimmer-button';

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center text-center bg-black">
      <div className="absolute inset-0 z-0">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      <motion.div
        className="relative z-10 container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-tight font-headline">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              AI powered
            </span>{" "}
            <span className="block sm:inline">hyperpersonalized</span>
            <br className="hidden sm:block" />
            career roadmap
          </h1>

          <p className="mb-8 sm:mb-10 text-base sm:text-lg lg:text-xl xl:text-2xl leading-7 sm:leading-8 text-white/80 max-w-2xl lg:max-w-3xl mx-auto px-2">
            No more guessing what the companies want, know exactly what they are hiring for today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4">
            <PulsatingButton asChild className="w-full sm:w-auto shadow-2xl shadow-white/25">
              <Link href="/signup">
                Start Creating
                <ArrowRight className="ml-2 h-5 w-5 inline" />
              </Link>
            </PulsatingButton>
            <ShimmerButton className="font-semibold bg-transparent w-full sm:w-auto" asChild>
              <Link href="#about">
                Learn More
              </Link>
            </ShimmerButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-xl sm:max-w-2xl mx-auto px-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">1M+</div>
              <div className="text-white/60 text-xs sm:text-sm">Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">50+</div>
              <div className="text-white/60 text-xs sm:text-sm">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">24/7</div>
              <div className="text-white/60 text-xs sm:text-sm">Support</div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
