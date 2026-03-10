"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import {
  Check,
  Sparkles,
  ShieldCheck,
  BrainCircuit,
  BookOpen,
  TrendingUp,
  Layers,
  Target,
  Zap,
  Loader2,
  Tag,
  Copy,
  CopyCheck,
  ArrowRight,
  Brain,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { useGeoPricing } from '@/hooks/use-geo-pricing';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { trackCheckoutStarted } from '@/lib/analytics';
import { Timestamp } from 'firebase/firestore';
import Footer from '@/components/landing/footer';

// ─── helpers ───────────────────────────────────────────────────────────────
function isSubscriptionActive(subscription: any): boolean {
  if (!subscription) return false;
  if (subscription.tier !== 'premium') return false;
  if (subscription.status !== 'active') return false;
  if (subscription.currentPeriodEnd) {
    let endDate: Date;
    if (subscription.currentPeriodEnd instanceof Timestamp) {
      endDate = subscription.currentPeriodEnd.toDate();
    } else if (subscription.currentPeriodEnd instanceof Date) {
      endDate = subscription.currentPeriodEnd;
    } else if (typeof subscription.currentPeriodEnd === 'string') {
      endDate = new Date(subscription.currentPeriodEnd);
    } else if (typeof subscription.currentPeriodEnd === 'object' && 'seconds' in subscription.currentPeriodEnd) {
      endDate = new Date((subscription.currentPeriodEnd as any).seconds * 1000);
    } else {
      return true;
    }
    if (endDate < new Date()) return false;
  }
  return true;
}

const formatDomain = (domain: string): string => {
  const map: Record<string, string> = {
    frontend: 'Frontend Development', backend: 'Backend Development',
    fullstack: 'Full Stack Development', ml: 'Machine Learning',
    devops: 'DevOps', 'data-science': 'Data Science',
    cybersecurity: 'Cybersecurity', 'ui-ux': 'UI/UX Design',
    'product-engineering': 'Product Engineering',
    'game-dev-indie': 'Indie Game Development', 'game-dev-aaa': 'AAA Game Development',
    android: 'Android Development', iOS: 'iOS Development',
    blockchain: 'Blockchain Development',
  };
  return map[domain] || domain;
};

// ─── static data ───────────────────────────────────────────────────────────
const PROMO_CODE = 'ACADA1T0M00N';

const MONTHLY_FEATURES = [
  'All 14+ domain roadmaps',
  'Weekly curated resources',
  'Personalized learning path',
  'Cancel anytime',
];

const YEARLY_FEATURES = [
  'All 14+ domain roadmaps',
  'AI Mentor — ask anything, get unstuck',
  'Weekly curated resources',
  'AI-powered roadmap personalization',
];

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Industry-Standard Roadmaps',
    description: 'Structured learning paths across 14 tech domains — designed like professional training programs.',
  },
  {
    icon: Brain,
    title: 'AI Mentor',
    description: 'Ask anything, get unstuck, and stay accountable with your personal AI Mentor — available 24/7.',
  },
  {
    icon: Sparkles,
    title: 'Weekly Curated Resources',
    description: 'Fresh articles, tutorials, videos, and projects delivered every week — saving you hours of research.',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Monitor your completion across roadmap stages and see your growth over time.',
  },
  {
    icon: Layers,
    title: 'Unlimited Domain Access',
    description: 'Switch between any tech domain anytime — explore Frontend today, ML tomorrow.',
  },
  {
    icon: Zap,
    title: 'Instant Access',
    description: 'Start learning immediately. All content available from day one, no setup required.',
  },
];

const FAQS = [
  {
    question: 'What domains are covered?',
    answer: 'We cover 14 tech domains including Frontend, Backend, Full Stack, Machine Learning, DevOps, and more. Each roadmap provides comprehensive coverage from fundamentals to advanced topics, with industry-relevant tools and frameworks.',
  },
  {
    question: 'How often is the content updated?',
    answer: 'Roadmaps are regularly updated to reflect current industry standards and emerging technologies. Weekly learning resources are curated fresh each week to keep you aligned with market demands.',
  },
  {
    question: 'Can I access multiple roadmaps?',
    answer: 'Yes! Your subscription gives you unlimited access to all 14 roadmaps. Switch between any domain whenever you want.',
  },
  {
    question: 'What makes these roadmaps different?',
    answer: "Our roadmaps are structured like professional training programs — covering not just what to learn, but the optimal order, practical projects, and real-world context. They include testing, deployment, and production considerations that most free resources skip.",
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, absolutely. Cancel anytime with no questions asked. Your access continues until the end of your billing period.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards including Visa, Mastercard, American Express, and Discover.',
  },
];

type Interval = 'monthly' | 'yearly';

// ─── page ──────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const pricing = useGeoPricing();
  const { monthly, annual } = pricing;
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const monthlyPopped = pricing.isIndia && !pricing.loading;
  const yearlyPopped  = !pricing.isIndia && !pricing.loading;
  const savingsPct    = annual.savingsPercent || '17';

  const copyCode = () => {
    navigator.clipboard.writeText(PROMO_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    if (loading) return;
    const bypass = user?.flags?.bypassPremium === true || (user as any)?.roles?.admin === true;
    if (bypass || isSubscriptionActive(user?.subscription)) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const handleCheckout = async (interval: Interval) => {
    try {
      const currency = monthly.symbol === '₹' ? 'INR' : 'USD';
      trackCheckoutStarted(interval, currency);
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        toast({ title: 'Please sign in', description: 'You need to be signed in to subscribe.', variant: 'destructive' });
        router.push('/login');
        return;
      }
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const res = await fetch(`${backendUrl}/api/payment/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ interval, currency }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to start checkout');
      window.location.href = data.checkout_url;
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Checkout failed', description: e?.message || 'Please try again.', variant: 'destructive' });
    }
  };

  const firstName = user?.displayName?.split(' ')[0] || 'there';
  const domain    = user?.interestedDomains?.[0] || user?.lastGeneratedDomain || '';

  return (
    <div style={{ background: '#ffffff', color: '#111827' }}>

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50" style={{ background: 'rgba(255,255,255,0.92)', borderBottom: '1px solid rgba(0,0,0,0.06)', backdropFilter: 'blur(12px)' }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <BrainCircuit className="h-5 w-5 text-black transition-transform group-hover:scale-110" />
            <span className="font-headline text-xl font-semibold tracking-tight text-black">Acad AI</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard"
                className="rounded-xl px-5 py-2 text-sm font-semibold transition-colors hover:bg-black/5"
                style={{ color: '#111827' }}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login"
                  className="hidden sm:block rounded-xl px-5 py-2 text-sm font-medium transition-colors hover:bg-black/5"
                  style={{ color: 'rgba(0,0,0,0.6)' }}>
                  Log in
                </Link>
                <Link href="/signup"
                  className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: '#111827' }}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-20 pb-6 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-widest mb-5"
            style={{ color: 'rgba(0,0,0,0.3)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Pricing
          </motion.p>

          {user && domain ? (
            <>
              <motion.h1
                className="font-headline text-[clamp(2rem,4.5vw,3rem)] font-normal leading-[1.07] tracking-tight mb-4"
                style={{ color: '#111827' }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                Hey {firstName}, ready to master{' '}
                <span style={{ color: '#3B82F6' }}>{formatDomain(domain)}</span>?
              </motion.h1>
              <motion.p
                className="text-base mb-0"
                style={{ color: 'rgba(0,0,0,0.45)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {user.skills && user.skills.length > 0
                  ? `Build on your ${user.skills.slice(0, 3).join(', ')} skills with a structured roadmap and weekly curated resources.`
                  : 'Get unlimited access to your personalized roadmap and weekly curated resources.'}
              </motion.p>
            </>
          ) : (
            <>
              <motion.h1
                className="font-headline text-[clamp(2rem,4.5vw,3rem)] font-normal leading-[1.07] tracking-tight mb-4"
                style={{ color: '#111827' }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                Simple pricing.{' '}
                <span style={{ color: '#3B82F6' }}>Real results.</span>
              </motion.h1>
              <motion.p
                className="text-base mb-0"
                style={{ color: 'rgba(0,0,0,0.45)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Industry-standard roadmaps and curated resources to accelerate your career.
              </motion.p>
            </>
          )}
        </div>
      </section>

      {/* ── Pricing cards ── */}
      <section className="pb-10 px-6">
        <motion.div
          className="mx-auto max-w-2xl grid md:grid-cols-2 gap-5 items-start"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >

          {/* Monthly */}
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
              boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.13), inset 0 1px 3px rgba(0,0,0,0.10)',
            }}
          >
            {monthlyPopped && (
              <div className="mb-4">
                <span className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ background: '#111827', color: '#fff' }}>
                  Most Popular in 🇮🇳
                </span>
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-1"
                style={{ color: 'rgba(0,0,0,0.4)' }}>Monthly</h3>
              <p className="text-xs" style={{ color: 'rgba(0,0,0,0.3)' }}>Flexible. Start or stop anytime.</p>
            </div>
            {pricing.loading ? (
              <div className="flex items-center gap-2 h-14 mb-6">
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'rgba(0,0,0,0.25)' }} />
              </div>
            ) : (
              <div className="mb-6">
                <div className="flex items-end gap-1 leading-none">
                  <span className="text-base pb-1" style={{ color: 'rgba(0,0,0,0.35)' }}>{monthly.symbol}</span>
                  <span className="text-5xl font-bold tracking-tighter" style={{ color: '#111827' }}>{monthly.price}</span>
                  <span className="text-sm pb-1" style={{ color: 'rgba(0,0,0,0.35)' }}>/mo</span>
                </div>
              </div>
            )}
            <ul className="flex-1 space-y-2.5 mb-8">
              {MONTHLY_FEATURES.map((text) => (
                <li key={text} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    style={{ color: monthlyPopped ? '#3B82F6' : 'rgba(0,0,0,0.30)' }} />
                  <span className="text-sm" style={{ color: 'rgba(0,0,0,0.6)' }}>{text}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout('monthly')}
              className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 hover:opacity-90"
              style={monthlyPopped
                ? { background: '#3B82F6', color: '#fff' }
                : { background: '#E4E5E7', color: '#111827' }}
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Yearly */}
          <div
            className="relative flex flex-col rounded-2xl p-7 transition-shadow duration-300"
            style={yearlyPopped ? {
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.22)',
              boxShadow: '0 8px 32px rgba(59,130,246,0.10), 0 2px 8px rgba(0,0,0,0.06)',
              transform: 'translateY(-4px)',
            } : {
              background: '#EDEEF0',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.13), inset 0 1px 3px rgba(0,0,0,0.10)',
            }}
          >
            {!pricing.loading && (
              <div className="absolute right-6 top-6">
                <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ border: '1px solid rgba(0,0,0,0.12)', background: '#fff', color: '#111827' }}>
                  Save {savingsPct}%
                </span>
              </div>
            )}
            {yearlyPopped && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ background: '#3B82F6', color: '#fff' }}>
                  <Sparkles className="h-3 w-3" />
                  Best value
                </span>
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-1"
                style={{ color: 'rgba(0,0,0,0.4)' }}>Yearly</h3>
              <p className="text-xs" style={{ color: 'rgba(0,0,0,0.3)' }}>Commit to the journey. Pay less.</p>
            </div>
            {pricing.loading ? (
              <div className="flex items-center gap-2 h-14 mb-6">
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'rgba(0,0,0,0.25)' }} />
              </div>
            ) : (
              <div className="mb-6">
                <div className="flex items-end gap-1 leading-none">
                  <span className="text-base pb-1" style={{ color: 'rgba(0,0,0,0.35)' }}>{annual.symbol}</span>
                  <span className="text-5xl font-bold tracking-tighter" style={{ color: '#111827' }}>{annual.price}</span>
                  <span className="text-sm pb-1" style={{ color: 'rgba(0,0,0,0.35)' }}>/yr</span>
                </div>
                <p className="mt-2 text-sm" style={{ color: 'rgba(0,0,0,0.4)' }}>
                  Just{' '}
                  <span className="font-semibold" style={{ color: '#3B82F6' }}>
                    {annual.symbol}{annual.monthlyEquivalent}/mo
                  </span>
                  {' '}—{' '}
                  <span style={{ textDecoration: 'line-through', color: 'rgba(0,0,0,0.35)' }}>
                    {monthly.symbol}{monthly.price}/mo
                  </span>
                </p>
              </div>
            )}
            <ul className="flex-1 space-y-2.5 mb-8">
              {YEARLY_FEATURES.map((text) => (
                <li key={text} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    style={{ color: yearlyPopped ? '#3B82F6' : 'rgba(0,0,0,0.30)' }} />
                  <span className="text-sm" style={{ color: 'rgba(0,0,0,0.6)' }}>{text}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout('yearly')}
              className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 hover:opacity-90"
              style={yearlyPopped
                ? { background: '#000000', color: '#fff' }
                : { background: '#E4E5E7', color: '#111827' }}
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </motion.div>

        {/* Promo code */}
        <motion.div
          className="mx-auto mt-5 max-w-2xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl px-5 py-4"
            style={{ border: '1px dashed rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.04)' }}>
            <div className="flex items-center gap-2 shrink-0">
              <Tag className="h-4 w-4" style={{ color: '#3B82F6' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#3B82F6' }}>
                Launch Offer
              </span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm" style={{ color: 'rgba(0,0,0,0.55)' }}>
                Get{' '}
                <span className="font-semibold" style={{ color: '#111827' }}>10% off</span>
                {' '}your first billing cycle — any plan.{' '}
                <span className="text-xs" style={{ color: 'rgba(0,0,0,0.35)' }}>First 50 uses only.</span>
              </p>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-mono font-semibold transition-all hover:opacity-80 active:scale-95 shrink-0"
              style={{ background: '#fff', border: '1px solid rgba(59,130,246,0.25)', color: '#111827', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <span className="tracking-wider">{PROMO_CODE}</span>
              {copied
                ? <CopyCheck className="h-3.5 w-3.5" style={{ color: '#3B82F6' }} />
                : <Copy className="h-3.5 w-3.5" style={{ color: 'rgba(0,0,0,0.3)' }} />
              }
            </button>
          </div>
        </motion.div>

        {/* Trust line */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs" style={{ color: 'rgba(0,0,0,0.35)' }}>
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Secure payment · Cancel anytime · All features included</span>
        </div>
      </section>

      {/* ── What's included ── */}
      <section className="py-20 px-6" style={{ background: '#F9FAFB' }}>
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'rgba(0,0,0,0.3)' }}>
              What you get
            </p>
            <h2 className="font-headline text-[clamp(1.8rem,3.5vw,2.6rem)] font-normal leading-tight tracking-tight mb-3"
              style={{ color: '#111827' }}>
              Everything you need to succeed
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(0,0,0,0.45)' }}>
              Comprehensive tools and resources to accelerate your tech career.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.07 }}
              >
                <div className="rounded-2xl p-6 h-full transition-shadow duration-200 hover:shadow-md"
                  style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)' }}>
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: 'rgba(59,130,246,0.08)' }}>
                    <feature.icon className="h-4.5 w-4.5" style={{ color: '#3B82F6' }} />
                  </div>
                  <p className="text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>
                    {feature.title}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(0,0,0,0.5)' }}>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6" style={{ background: '#ffffff' }}>
        <div className="mx-auto max-w-3xl">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'rgba(0,0,0,0.3)' }}>
              FAQ
            </p>
            <h2 className="font-headline text-[clamp(1.8rem,3.5vw,2.6rem)] font-normal leading-tight tracking-tight"
              style={{ color: '#111827' }}>
              Common questions
            </h2>
          </motion.div>

          <div className="space-y-2">
            {FAQS.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <div className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(0,0,0,0.07)' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors duration-150 hover:bg-black/[0.02]"
                    style={{ background: '#fff' }}
                  >
                    <span className="text-sm font-semibold pr-4" style={{ color: '#111827' }}>
                      {faq.question}
                    </span>
                    <span className="shrink-0 text-lg leading-none" style={{ color: 'rgba(0,0,0,0.3)' }}>
                      {openFaq === idx ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-5" style={{ background: '#fff' }}>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(0,0,0,0.55)' }}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-6" style={{ background: '#F9FAFB' }}>
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div className="rounded-3xl px-8 py-14"
            style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
            <div className="mb-5 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: 'rgba(59,130,246,0.10)' }}>
                <BrainCircuit className="h-6 w-6" style={{ color: '#3B82F6' }} />
              </div>
            </div>
            {user && domain ? (
              <>
                <h2 className="font-headline text-[clamp(1.6rem,3vw,2.2rem)] font-normal leading-tight mb-3"
                  style={{ color: '#111827' }}>
                  Start your {formatDomain(domain)} journey today
                </h2>
                <p className="text-sm mb-8" style={{ color: 'rgba(0,0,0,0.45)' }}>
                  {firstName}, your personalized roadmap is waiting.
                </p>
              </>
            ) : (
              <>
                <h2 className="font-headline text-[clamp(1.6rem,3vw,2.2rem)] font-normal leading-tight mb-3"
                  style={{ color: '#111827' }}>
                  Ready to accelerate your career?
                </h2>
                <p className="text-sm mb-8" style={{ color: 'rgba(0,0,0,0.45)' }}>
                  Join developers building in-demand skills with structured roadmaps and weekly resources.
                </p>
              </>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => handleCheckout('yearly')}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: '#3B82F6', color: '#fff', boxShadow: '0 4px 20px rgba(59,130,246,0.3)' }}
              >
                Get started now
                <ArrowRight className="h-4 w-4" />
              </button>
              {!user && (
                <Link href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: '#F3F4F6', color: '#111827', border: '1px solid rgba(0,0,0,0.08)' }}
                >
                  Create free account
                </Link>
              )}
            </div>
            <p className="mt-6 text-xs" style={{ color: 'rgba(0,0,0,0.3)' }}>
              Cancel anytime · Unlimited roadmaps · Weekly resources included
            </p>
          </div>

          {/* Founder note */}
          <p className="mt-10 text-sm" style={{ color: 'rgba(0,0,0,0.4)' }}>
            <span className="font-medium" style={{ color: 'rgba(0,0,0,0.65)' }}>From the founder:</span>{' '}
            Acad AI started as a passion project to help students navigate tech careers. Your support keeps the platform running and the content fresh.
          </p>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <Footer />

    </div>
  );
}
