"use client";

import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroWithShader() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-white pb-16 md:pb-24">

      {/* Animated gradient blobs */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[96%] overflow-hidden">
        {/* Main bloom — top center, tall */}
        <div
          className="hero-blob absolute rounded-full"
          style={{
            width: '160%', height: '95%',
            top: '-38%', left: '-30%',
            background: 'radial-gradient(ellipse, rgba(59,130,246,0.24) 0%, transparent 62%)',
            animation: 'hero-blob-1 9s ease-in-out infinite alternate',
          }}
        />
        {/* Lighter accent — left, pushed lower */}
        <div
          className="hero-blob absolute rounded-full"
          style={{
            width: '80%', height: '75%',
            top: '20%', left: '-12%',
            background: 'radial-gradient(ellipse, rgba(96,165,250,0.13) 0%, transparent 58%)',
            animation: 'hero-blob-2 12s ease-in-out infinite alternate',
          }}
        />
        {/* Deeper accent — right, pushed lower */}
        <div
          className="hero-blob absolute rounded-full"
          style={{
            width: '70%', height: '65%',
            top: '18%', right: '-10%',
            background: 'radial-gradient(ellipse, rgba(37,99,235,0.13) 0%, transparent 58%)',
            animation: 'hero-blob-3 10s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.038) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse 75% 55% at 50% 30%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 55% at 50% 30%, black 30%, transparent 100%)',
        }}
      />

      {/* ── Centered copy ── */}
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 pb-10 pt-28 text-center">

        <motion.h1
          className="font-headline mb-6 font-normal"
          style={{ lineHeight: 1.04, letterSpacing: '-0.01em' }}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="block text-[clamp(2.8rem,7vw,5.25rem)] text-[#111827]">
            AI that helps you
          </span>
          <span className="block text-[clamp(2.8rem,7vw,5.25rem)] text-[#3B82F6]">
            land tech jobs.
          </span>
        </motion.h1>

        <motion.p
          className="mb-10 max-w-m text-base sm:text-lg leading-relaxed"
          style={{ color: 'rgba(17,24,39,0.70)' }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.18 }}
        >
          Personalized guidance to learn the right skills, build real projects,
          and move toward your first tech role — faster.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Link
            id="hero-cta"
            href="/signup"
            className="cta-raised-btn group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl px-8 py-3.5 text-sm font-semibold text-white"
          >
            <span className="cta-shine pointer-events-none absolute inset-0" aria-hidden />
            Start Your Tech Roadmap
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>

      {/* ── Product video placeholder ── */}
      <motion.div
        className="relative z-10 mx-auto w-full max-w-5xl px-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          filter: 'drop-shadow(0 32px 72px rgba(59,130,246,0.13)) drop-shadow(0 8px 24px rgba(0,0,0,0.06))',
        }}
      >
        {/* macOS-style browser chrome */}
        <div className="flex items-center gap-2 rounded-t-2xl border border-b-0 border-black/[0.07] bg-[#f3f4f6] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
          <div className="mx-4 flex-1 rounded-md border border-black/[0.06] bg-white/80 px-3 py-1.5 text-xs text-black/35">
            acadai.app/roadmap
          </div>
        </div>

        {/*
          TODO: Replace the placeholder below with a <video> or <iframe> when ready.

          YouTube embed example:
          <div className="relative w-full overflow-hidden rounded-b-2xl border border-t-0 border-black/[0.07]" style={{ aspectRatio: '16/9' }}>
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        */}

        {/* Video placeholder body */}
        <div
          className="relative w-full overflow-hidden rounded-b-2xl border border-t-0 border-black/[0.07]"
          style={{
            aspectRatio: '16/9',
            background: 'linear-gradient(140deg, #0f172a 0%, #1e2d4f 40%, #0f1b35 70%, #0a1628 100%)',
          }}
        >
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.10]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(96,165,250,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.5) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          {/* Center glow */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 55% 50% at 50% 52%, rgba(59,130,246,0.20) 0%, transparent 72%)',
            }}
          />
          {/* Corner accents */}
          <div
            className="absolute left-0 top-0 h-72 w-72 opacity-25"
            style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.35) 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-0 right-0 h-72 w-72 opacity-20"
            style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.30) 0%, transparent 70%)' }}
          />

          {/* Play button */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div
              className="flex h-[4.5rem] w-[4.5rem] cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white/20"
              role="button"
              aria-label="Play product demo"
            >
              <Play className="h-7 w-7 translate-x-0.5 fill-white text-white" />
            </div>
            <p className="text-sm font-medium tracking-wide text-white/40">
              Product demo · Coming soon
            </p>
          </div>

          {/* Mock bottom bar */}
          <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 opacity-20">
            <div className="h-8 w-8 shrink-0 rounded-full bg-blue-400/50" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2 w-36 rounded-full bg-white/30" />
              <div className="h-1.5 w-24 rounded-full bg-white/20" />
            </div>
            <div className="h-7 w-20 shrink-0 rounded-full border border-blue-400/40 bg-blue-500/20" />
          </div>
        </div>
      </motion.div>

    </section>
  );
}
