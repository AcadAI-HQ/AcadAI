'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CTA() {
  return (
    <section id="final-cta" className="py-28 lg:py-40 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl">

          <motion.p
            className="text-[11px] font-semibold uppercase tracking-widest text-black/30 mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Get Started
          </motion.p>

          <motion.h2
            className="font-headline text-[clamp(2.6rem,5.5vw,4.5rem)] font-normal leading-[1.06] tracking-tight text-[#111827] mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Secure your job by getting{' '}
            <span className="text-[#3B82F6]">ahead of the market</span>{' '}
            — now.
          </motion.h2>

          <motion.p
            className="text-base text-black/45 max-w-lg leading-relaxed mb-10"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.14 }}
          >
            Acad AI reads live job market demand so your roadmap is always built
            for where hiring is going — not where it&apos;s been.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Link
              href="/signup"
              className="cta-raised-btn-dark relative inline-flex items-center overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            >
              <span className="cta-shine pointer-events-none absolute inset-0" aria-hidden />
              Sign Up Free
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
