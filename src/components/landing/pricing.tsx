"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useGeoPricing } from '@/hooks/use-geo-pricing';
import { Loader2, ShieldCheck, Check, Tag, Copy, CopyCheck } from 'lucide-react';
import Link from 'next/link';
import { useUserCount } from '@/hooks/use-user-count';

const PROMO_CODE = 'ACADA1T0M00N';

const MONTHLY_FEATURES = [
  'All 14+ domain roadmaps',
  'Weekly curated resources',
  'Personalized learning path',
  'Cancel anytime',
];

const YEARLY_FEATURES = [
  'Everything in Monthly',
  'AI-powered personalization',
  'Priority roadmap updates',
  'Biggest savings — pay once, learn all year',
];

export default function Pricing() {
  const pricing = useGeoPricing();
  const { userCount, loading } = useUserCount();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(PROMO_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Monthly is popular in India, yearly everywhere else
  const monthlyPopped = pricing.isIndia && !pricing.loading;
  const yearlyPopped = !pricing.isIndia && !pricing.loading;

  const savingsPct = pricing.annual.savingsPercent || '17';

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        {/* Heading */}
        <div className="mb-14 text-center">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-widest text-black/30 mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Pricing
          </motion.p>
          <motion.h2
            className="font-headline text-[clamp(2.2rem,4.5vw,3.2rem)] font-normal leading-[1.07] tracking-tight text-[#111827] mb-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Simple pricing.{' '}
            <span className="text-[#3B82F6]">Real value.</span>
          </motion.h2>
          <motion.p
            className="text-base text-black/40"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            Join{" "}
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                <span className="font-semibold text-[#111827]">{userCount.toLocaleString()}+</span>
              )}{" "}
            developers already on their path.
          </motion.p>
        </div>

        {/* Cards */}
        <motion.div
          className="mx-auto max-w-2xl grid md:grid-cols-2 gap-5 items-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >

          {/* ── Monthly ── */}
          <div
            className="relative flex flex-col rounded-2xl p-7 transition-shadow duration-300"
            style={monthlyPopped ? {
              background: '#ffffff',
              border: '1px solid rgba(59,130,246,0.22)',
              boxShadow: '0 8px 32px rgba(59,130,246,0.10), 0 2px 8px rgba(0,0,0,0.06)',
              transform: 'translateY(-4px)',
            } : {
              background: '#EDEEF0',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.13), inset 0 1px 3px rgba(0,0,0,0.10), inset 3px 0 8px rgba(0,0,0,0.05), inset 0 -2px 8px rgba(255,255,255,0.90), inset -2px 0 6px rgba(255,255,255,0.55)',
            }}
          >
            {/* Popular badge */}
            {monthlyPopped && (
              <div className="mb-4">
                <span className="rounded-full bg-[#111827] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                  Most Popular in 🇮🇳
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-black/40 mb-1">Monthly</h3>
              <p className="text-xs text-black/30">Flexible. Start or stop anytime.</p>
            </div>

            {pricing.loading ? (
              <div className="flex items-center gap-2 h-14 mb-6">
                <Loader2 className="h-5 w-5 animate-spin text-black/25" />
              </div>
            ) : (
              <div className="mb-6">
                <div className="flex items-end gap-1 leading-none">
                  <span className="text-base text-black/35 pb-1">{pricing.monthly.symbol}</span>
                  <span className="text-5xl font-bold tracking-tighter text-[#111827]">{pricing.monthly.price}</span>
                  <span className="text-sm text-black/35 pb-1">/mo</span>
                </div>
              </div>
            )}

            <ul className="flex-1 space-y-2.5 mb-8">
              {MONTHLY_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    style={{ color: monthlyPopped ? '#3B82F6' : 'rgba(0,0,0,0.30)' }}
                  />
                  <span className="text-sm text-black/50">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors"
              style={monthlyPopped ? {
                background: '#3B82F6', color: '#fff',
              } : {
                background: '#E4E5E7', color: '#111827',
              }}
            >
              Get Started
            </Link>
          </div>

          {/* ── Yearly ── */}
          <div
            className="relative flex flex-col rounded-2xl p-7 transition-shadow duration-300"
            style={yearlyPopped ? {
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.22)',
              boxShadow: '0 8px 32px rgba(59,130,246,0.10), 0 2px 8px rgba(0,0,0,0.06)',
              transform: 'translateY(-4px)',
            } : {
              background: '#EDEEF0',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.13), inset 0 1px 3px rgba(0,0,0,0.10), inset 3px 0 8px rgba(0,0,0,0.05), inset 0 -2px 8px rgba(255,255,255,0.90), inset -2px 0 6px rgba(255,255,255,0.55)',
            }}
          >
            {/* Popular badge */}
            {yearlyPopped && (
              <div className="mb-4">
                <span className="rounded-full bg-[#3B82F6] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                  Most Popular
                </span>
              </div>
            )}

            {/* Savings badge — top right */}
            {!pricing.loading && (
              <div className="absolute right-6 top-6">
                <span className="rounded-full border border-black bg-white px-2.5 py-1 text-[11px] font-semibold text-black">
                  Save {savingsPct}%
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-black/40 mb-1">Yearly</h3>
              <p className="text-xs text-black/40">Best value for committed learners.</p>
            </div>

            {pricing.loading ? (
              <div className="flex items-center gap-2 h-14 mb-6">
                <Loader2 className="h-5 w-5 animate-spin text-black/25" />
              </div>
            ) : (
              <div className="mb-6">
                <div className="flex items-end gap-1 leading-none">
                  <span className="text-base text-black/35 pb-1">{pricing.annual.symbol}</span>
                  <span className="text-5xl font-bold tracking-tighter text-[#111827]">{pricing.annual.price}</span>
                  <span className="text-sm text-black/35 pb-1">/yr</span>
                </div>
                <p className="mt-2 text-sm text-black/40">
                  Just{' '}
                  <span className="font-semibold text-[#3B82F6]">
                    {pricing.annual.symbol}{pricing.annual.monthlyEquivalent}/mo
                  </span>
                  {' '}—{' '}
                  <span className="line-through text-black/70">
                    {pricing.monthly.symbol}{pricing.monthly.price}/mo
                  </span>
                </p>
              </div>
            )}

            <ul className="flex-1 space-y-2.5 mb-8">
              {YEARLY_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    style={{ color: yearlyPopped ? '#3B82F6' : 'rgba(0,0,0,0.30)' }}
                  />
                  <span className="text-sm text-black/50">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors"
              style={yearlyPopped ? {
                background: '#000000', color: '#fff',
              } : {
                background: '#E4E5E7', color: '#111827',
              }}
            >
              Get Started
            </Link>
          </div>

        </motion.div>

        {/* Promo code banner */}
        <motion.div
          className="mx-auto mt-6 max-w-2xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-dashed border-[#3B82F6]/30 bg-[#3B82F6]/[0.04] px-5 py-4">
            <div className="flex items-center gap-2 shrink-0">
              <Tag className="h-4 w-4 text-[#3B82F6]" />
              <span className="text-xs font-semibold text-[#3B82F6] uppercase tracking-wider">
                Launch Offer
              </span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm text-black/60">
                Get{' '}
                <span className="font-semibold text-[#111827]">10% off</span>
                {' '}your first billing cycle — any plan.
                {' '}
                <span className="text-black/40 text-xs">First 50 uses only.</span>
              </p>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-2 rounded-xl border border-[#3B82F6]/25 bg-white px-4 py-2 text-sm font-mono font-semibold text-[#111827] shadow-sm transition-all hover:border-[#3B82F6]/50 hover:shadow-md active:scale-95 shrink-0"
              title="Copy promo code"
            >
              <span className="tracking-wider">{PROMO_CODE}</span>
              {copied
                ? <CopyCheck className="h-3.5 w-3.5 text-[#3B82F6]" />
                : <Copy className="h-3.5 w-3.5 text-black/30" />
              }
            </button>
          </div>
        </motion.div>

        {/* Trust line */}
        <motion.div
          className="mt-8 flex flex-col items-center gap-1.5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 text-xs text-black/40">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>No hidden fees. Cancel anytime.</span>
          </div>
          <p className="text-xs text-black/45 text-center">
            Premium unlocks weekly resources, AI personalization, and more.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
