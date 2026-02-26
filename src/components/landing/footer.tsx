'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

const PRODUCT = [
  { label: 'Blog',    href: '/blog' },
  { label: 'Pricing', href: '#pricing' },
];

const LEGAL = [
  { label: 'Privacy Policy',   href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

const SOCIAL = [
  { label: 'Twitter / X', href: 'https://x.com/a1siel' },
  { label: 'LinkedIn',    href: 'https://linkedin.com/in/bhaskarjpofficial' },
];

/* Platforms — duplicated so the loop is seamless */
const PLATFORMS = [
  'Product Hunt',
  'SaaSCity',
  'RankInPublic',
  'IndieHackers',
  'Peer Push',
  'SaaSHub',
];
const MARQUEE_ITEMS = [...PLATFORMS, ...PLATFORMS]; // duplicate for seamless loop

export default function Footer() {
  return (
    <footer className="relative bg-white overflow-hidden">

      {/* ── Aurora — static base + animated blobs ─────────────────── */}

      {/* Static linear base — guarantees colour is always visible */}
      <div
        className="absolute bottom-0 inset-x-0 h-[70%] pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(59,130,246,0.2) 0%, rgba(99,102,241,0.09) 45%, transparent 100%)',
        }}
      />

      {/* Animated blobs */}
      <div className="absolute bottom-0 inset-x-0 h-[72%] pointer-events-none">

        {/* Centre pulse */}
        <motion.div
          className="absolute -bottom-1/3 left-1/2 -translate-x-1/2 w-[110%] h-full"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(59,130,246,0.30) 0%, rgba(99,102,241,0.14) 50%, transparent 75%)',
          }}
          animate={{
            scaleX: [1, 1.15, 0.9, 1.08, 1],
            scaleY: [1, 0.85, 1.1, 0.93, 1],
            opacity: [1, 1.15, 0.8, 1.1, 1],
          }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Left drift */}
        <motion.div
          className="absolute -bottom-1/4 -left-1/4 w-3/4 h-full"
          style={{
            background:
              'radial-gradient(ellipse 60% 55% at 30% 100%, rgba(99,102,241,0.24) 0%, transparent 70%)',
          }}
          animate={{ x: [0, 55, -25, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        />

        {/* Right drift */}
        <motion.div
          className="absolute -bottom-1/4 -right-1/4 w-3/4 h-full"
          style={{
            background:
              'radial-gradient(ellipse 60% 55% at 70% 100%, rgba(59,130,246,0.22) 0%, transparent 70%)',
          }}
          animate={{ x: [0, -45, 50, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />

      </div>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* Top row: logo + nav columns */}
        <div className="flex flex-col md:flex-row md:justify-between gap-12 pt-16 pb-12">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 w-fit">
              <BrainCircuit className="h-6 w-6 text-black/50" />
              <span className="font-headline text-2xl font-semibold text-black">Acad AI</span>
            </Link>
            <p className="text-sm text-black/50 leading-relaxed max-w-[220px]">
              Roadmaps that move<br />with the market.
            </p>

            {/* ── Mini marquee: "listed on" ─────────────────── */}
            <div className="mt-1 w-[220px] overflow-hidden">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-black/30 mb-2">
                Listed on
              </p>
              {/* Outer mask: fade edges */}
              <div
                className="relative overflow-hidden"
                style={{
                  maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
                }}
              >
                <motion.div
                  className="flex gap-4 w-max"
                  animate={{ x: ['0%', '-50%'] }}
                  transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  {MARQUEE_ITEMS.map((name, i) => (
                    <span
                      key={i}
                      className="text-xs text-black/70 whitespace-nowrap shrink-0"
                    >
                      {name}
                      <span className="ml-4 text-black/20">·</span>
                    </span>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Nav columns */}
          <div className="flex gap-16 sm:gap-24">

            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-black/35 mb-1">
                Product
              </p>
              {PRODUCT.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-base text-black/50 hover:text-black/85 transition-colors duration-200"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-black/35 mb-1">
                Legal
              </p>
              {LEGAL.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-base text-black/50 hover:text-black/85 transition-colors duration-200"
                >
                  {l.label}
                </Link>
              ))}
            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-black/[0.08]" />

        {/* Bottom strip */}
        <div className="flex flex-wrap items-center justify-between gap-y-3 py-6">
          <p className="text-sm text-black/40">
            © 2026 Acad AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-black/45 hover:text-black/80 transition-colors duration-200"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Taller spacer — more gradient real estate */}
        <div className="h-36" />

      </div>
    </footer>
  );
}
