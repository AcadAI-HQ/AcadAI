"use client";

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const NAV_LINKS = [
  { name: 'Pricing',  href: '#pricing',  badge: null  },
  { name: 'Features', href: '#features', badge: 'New' },
  { name: 'Blog',     href: '/blog',     badge: null  },
];

/* ─────────────────────────────────────────────────────────────
   Floating CTA
   ─ Fixed top-right corner
   ─ Appears once hero CTA scrolls out of view
   ─ Disappears once the CTA section enters the viewport
   ───────────────────────────────────────────────────────────── */
export const FloatingCTA = () => {
  const [heroHidden,  setHeroHidden]  = useState(false);
  const [ctaVisible,  setCtaVisible]  = useState(false);

  /* Show once hero CTA scrolls away */
  useEffect(() => {
    let obs: IntersectionObserver | null = null;

    const attach = (el: Element) => {
      obs = new IntersectionObserver(
        ([e]) => setHeroHidden(!e.isIntersecting),
        { threshold: 0 },
      );
      obs.observe(el);
    };

    const el = document.getElementById('hero-cta');
    if (el) { attach(el); return () => obs?.disconnect(); }

    const mut = new MutationObserver(() => {
      const t = document.getElementById('hero-cta');
      if (t) { mut.disconnect(); attach(t); }
    });
    mut.observe(document.body, { childList: true, subtree: true });
    return () => { mut.disconnect(); obs?.disconnect(); };
  }, []);

  /* Hide once CTA section enters viewport */
  useEffect(() => {
    let obs: IntersectionObserver | null = null;

    const attach = (el: Element) => {
      obs = new IntersectionObserver(
        ([e]) => setCtaVisible(e.isIntersecting),
        { threshold: 0.1 },
      );
      obs.observe(el);
    };

    const el = document.getElementById('final-cta');
    if (el) { attach(el); return () => obs?.disconnect(); }

    const mut = new MutationObserver(() => {
      const t = document.getElementById('final-cta');
      if (t) { mut.disconnect(); attach(t); }
    });
    mut.observe(document.body, { childList: true, subtree: true });
    return () => { mut.disconnect(); obs?.disconnect(); };
  }, []);

  return (
    <AnimatePresence>
      {heroHidden && !ctaVisible && (
        <motion.div
          className="fixed top-5 right-6 z-50"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Link
            href="/signup"
            className="cta-raised-btn-dark relative inline-flex items-center overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          >
            <span className="cta-shine pointer-events-none absolute inset-0" aria-hidden />
            Sign Up Free
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─────────────────────────────────────────────────────────────
   Header — absolute (scrolls away with the page)
   ───────────────────────────────────────────────────────────── */
const Header = () => {
  const router = useRouter();
  return (
    <motion.header
      className="absolute top-0 z-40 w-full"
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <BrainCircuit className="h-5 w-5 text-black transition-all duration-300 group-hover:scale-110" />
          <span className="font-headline text-xl font-semibold tracking-tight text-black">
            Acad AI
          </span>
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-black/80 transition-all duration-200 hover:text-black hover:ring-1 hover:ring-[#3B82F6]"
            >
              {link.name}
              {link.badge && (
                <span className="rounded-full border border-blue-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black/80">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            className="nav-login-btn hidden sm:block px-5 py-2"
            onClick={() => router.push('/login')}
          >
            Log In
          </button>
          <Link
            href="/signup"
            className="cta-raised-btn-dark relative inline-flex items-center overflow-hidden rounded-xl px-5 py-2 text-sm font-semibold text-white"
          >
            <span className="cta-shine pointer-events-none absolute inset-0" aria-hidden />
            Sign Up
          </Link>
        </div>

      </div>
    </motion.header>
  );
};

export default Header;
