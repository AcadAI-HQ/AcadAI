'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BrainCircuit, Check, X, ArrowRight, Zap, Brain, BookOpen, Bot } from 'lucide-react';

/* ─── Slide registry ───────────────────────────────────────── */
const SLIDES = [
  'cover',       // 01
  'problem',     // 02
  'insight',     // 03
  'solution',    // 04
  'platform',    // 05
  'feature1',    // 06
  'feature2',    // 07
  'feature3',    // 08
  'traction',    // 09
  'whyitworks',  // 10
  'market',      // 11
  'bizmodel',    // 12
  'competition', // 13
  'vision',      // 14
  'whyme',       // 15
  'ask',         // 16
];

const DARK_SLIDES = new Set([0, 10, 13, 15]); // cover, market, vision, ask

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

/* ─── Nav dots ─────────────────────────────────────────────── */
function Dots({ current }: { current: number }) {
  const dark = DARK_SLIDES.has(current);
  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 flex flex-col gap-[6px] z-50 print:hidden">
      {SLIDES.map((id, i) => (
        <button
          key={id}
          onClick={() => scrollTo(id)}
          className={`rounded-full transition-all duration-300 ${
            i === current
              ? `w-2 h-4 ${dark ? 'bg-white' : 'bg-[#111827]'}`
              : `w-2 h-2 ${dark ? 'bg-white/25 hover:bg-white/55' : 'bg-black/15 hover:bg-black/45'}`
          }`}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  );
}

/* ─── Counter + hint ───────────────────────────────────────── */
function Counter({ current }: { current: number }) {
  const dark = DARK_SLIDES.has(current);
  return (
    <>
      <div className={`fixed bottom-6 left-6 z-50 text-[11px] font-mono tracking-widest print:hidden ${dark ? 'text-white/25' : 'text-black/20'}`}>
        {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
      </div>
      <div className={`fixed bottom-6 right-14 z-50 text-[10px] tracking-wide print:hidden ${dark ? 'text-white/18' : 'text-black/18'}`}>
        ↑ ↓ to navigate
      </div>
    </>
  );
}

/* ─── Overline label ───────────────────────────────────────── */
const OL = ({ children, light }: { children: string; light?: boolean }) => (
  <p className={`text-[11px] font-semibold uppercase tracking-widest mb-6 ${light ? 'text-white/30' : 'text-black/30'}`}>
    {children}
  </p>
);

/* ─── Section heading ──────────────────────────────────────── */
const H = ({ children, light, className = '' }: { children: React.ReactNode; light?: boolean; className?: string }) => (
  <h2 className={`font-headline text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.1] tracking-tight mb-10 ${light ? 'text-white' : 'text-[#111827]'} ${className}`}>
    {children}
  </h2>
);

/* ═══════════════════════════════════════════════════════════ */
export default function PitchDeck() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = SLIDES.indexOf(e.target.id);
            if (idx !== -1) setCurrent(idx);
          }
        });
      },
      { threshold: 0.55 },
    );
    SLIDES.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
        scrollTo(SLIDES[Math.min(current + 1, SLIDES.length - 1)]);
      }
      if (['ArrowUp', 'ArrowLeft'].includes(e.key)) {
        e.preventDefault();
        scrollTo(SLIDES[Math.max(current - 1, 0)]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current]);

  const dark = DARK_SLIDES.has(current);

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth force-light">
      <Dots current={current} />
      <Counter current={current} />

      {/* ── Download button ─────────────────────────────────── */}
      <a
        href="/api/pitch-deck"
        download
        className={`fixed top-5 left-6 z-50 print:hidden flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors duration-200 ${
          dark
            ? 'border-white/15 text-white/40 hover:text-white/80 hover:border-white/30 bg-white/5'
            : 'border-black/12 text-black/35 hover:text-black/65 hover:border-black/25 bg-black/[0.03]'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download PPTX
      </a>

      {/* ══ 01  COVER ══════════════════════════════════════════ */}
      <section id="cover" className="h-screen snap-start bg-[#0A0A0A] flex flex-col items-center justify-center px-10 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[45%] rounded-full opacity-35 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.55) 0%, transparent 65%)' }} />
        <div className="relative z-10 max-w-3xl w-full">
          <div className="flex items-center gap-3 mb-10">
            <BrainCircuit className="h-6 w-6 text-blue-500" />
            <span className="font-headline text-xl font-semibold text-white">Acad AI</span>
          </div>
          <h1 className="font-headline text-[clamp(2.8rem,6vw,5.5rem)] font-semibold leading-[1.05] tracking-tight text-white mb-8">
            The AI-native platform<br />
            <span className="text-blue-400">that learns as it runs.</span>
          </h1>
          <p className="text-lg text-white/40 max-w-2xl leading-relaxed mb-12">
            Market-demand backed learning roadmaps across 13+ domains — hyper-personalised per user,
            auto-updated by AI weekly, and powered by a self-improving data flywheel.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold uppercase tracking-widest text-white/20">Pre-Seed · 2026</span>
            <span className="w-px h-4 bg-white/10" />
            <span className="text-sm text-white/20">Confidential — do not distribute</span>
          </div>
        </div>
      </section>

      {/* ══ 02  PROBLEM ════════════════════════════════════════ */}
      <section id="problem" className="h-screen snap-start bg-white flex flex-col justify-center px-10 lg:px-20">
        <div className="max-w-5xl mx-auto w-full">
          <OL>The Problem</OL>
          <H>Developers are learning<br />the wrong things.</H>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { stat: '43%',   label: 'of developers say their skills are 2+ years behind what employers actively want.',     src: 'Stack Overflow Dev Survey 2024' },
              { stat: '18 mo', label: 'average lag between peak job demand for a skill and when bootcamps start teaching it.', src: 'LinkedIn Workforce Report'       },
              { stat: '8 hrs', label: 'per week the average developer spends researching what to learn next — with no clear answer.', src: 'Internal user research'   },
            ].map(({ stat, label, src }) => (
              <div key={stat} className="border border-black/[0.07] rounded-2xl p-7">
                <p className="font-headline text-5xl font-bold text-[#111827] mb-4">{stat}</p>
                <p className="text-sm text-black/55 leading-relaxed mb-3">{label}</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-black/25">{src}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-base text-black/45 max-w-2xl leading-relaxed border-l-2 border-blue-500 pl-5">
            The pain isn&apos;t a shortage of learning content. The internet is drowning in tutorials.
            The pain is <strong className="text-[#111827]">lack of direction</strong> — developers have no reliable signal
            telling them what to learn, in what order, for the market they&apos;re actually trying to enter.
          </p>
        </div>
      </section>

      {/* ══ 03  INSIGHT ════════════════════════════════════════ */}
      <section id="insight" className="h-screen snap-start bg-[#F8FAFC] flex flex-col justify-center px-10 lg:px-20">
        <div className="max-w-5xl mx-auto w-full">
          <OL>Our Insight</OL>
          <H className="max-w-3xl">The problem isn&apos;t content.<br />It&apos;s <span className="text-blue-500">direction aligned with demand.</span></H>

          {/* Flow diagram */}
          <div className="flex items-stretch gap-3 mb-10">
            {[
              { icon: '📊', top: 'Market Demand', bot: '10,000+ JDs analysed', accent: 'border-blue-200 bg-blue-50' },
              null,
              { icon: '🤖', top: 'AI Analysis',   bot: 'Weekly skill extraction', accent: 'border-indigo-200 bg-indigo-50' },
              null,
              { icon: '🗺️', top: 'Personalised Roadmap', bot: 'Unique per user', accent: 'border-purple-200 bg-purple-50' },
              null,
              { icon: '✅', top: 'Job-Ready Skills', bot: 'Aligned with real hiring', accent: 'border-green-200 bg-green-50' },
            ].map((item, i) =>
              item === null ? (
                <div key={i} className="flex items-center shrink-0">
                  <ArrowRight className="h-5 w-5 text-black/20" />
                </div>
              ) : (
                <div key={i} className={`flex-1 border rounded-2xl p-5 text-center ${item.accent}`}>
                  <p className="text-3xl mb-3">{item.icon}</p>
                  <p className="text-sm font-semibold text-[#111827] leading-snug mb-1">{item.top}</p>
                  <p className="text-[11px] text-black/40">{item.bot}</p>
                </div>
              )
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border border-black/[0.07] rounded-2xl p-6">
              <p className="text-2xl mb-3">🔍</p>
              <p className="font-semibold text-[#111827] mb-2">We analysed 10,000+ job descriptions</p>
              <p className="text-sm text-black/50 leading-relaxed">
                Across 13+ domains to identify exactly which skills appear in job postings, how their demand
                changes week-over-week, and how they cluster into learnable sequences.
              </p>
            </div>
            <div className="bg-white border border-black/[0.07] rounded-2xl p-6">
              <p className="text-2xl mb-3">💡</p>
              <p className="font-semibold text-[#111827] mb-2">Direction is the product</p>
              <p className="text-sm text-black/50 leading-relaxed">
                Every incumbent teaches content. Nobody sells a clear, market-validated answer to
                &ldquo;what should I learn next, specifically, given my background and the current job market?&rdquo;
                That gap is our entire business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 04  SOLUTION ═══════════════════════════════════════ */}
      <section id="solution" className="h-screen snap-start bg-white flex flex-col justify-center px-10 lg:px-20">
        <div className="max-w-5xl mx-auto w-full">
          <OL>The Solution</OL>
          <H className="max-w-3xl">An AI-native platform that learns<br />the longer it runs.</H>
          <p className="text-lg text-black/50 max-w-2xl leading-relaxed mb-12">
            Acad AI doesn&apos;t serve blind. Every roadmap is generated from live job market data and refined
            continuously by a self-improving flywheel — the more users learn on the platform, the smarter
            and more precise the platform becomes.
          </p>

          <div className="flex items-center gap-3 p-6 bg-[#F8FAFC] border border-black/[0.07] rounded-2xl max-w-3xl">
            <div className="flex flex-col items-center gap-1">
              {['Market Data', 'User Data'].map((d) => (
                <span key={d} className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">{d}</span>
              ))}
            </div>
            <ArrowRight className="h-5 w-5 text-black/20 shrink-0" />
            <div className="text-center">
              <p className="text-xs font-semibold text-[#111827] mb-1">AI Engine</p>
              <p className="text-[11px] text-black/40">Analyses + learns</p>
            </div>
            <ArrowRight className="h-5 w-5 text-black/20 shrink-0" />
            <div className="text-center">
              <p className="text-xs font-semibold text-[#111827] mb-1">Better Roadmaps</p>
              <p className="text-[11px] text-black/40">More accurate, more relevant</p>
            </div>
            <ArrowRight className="h-5 w-5 text-black/20 shrink-0" />
            <div className="text-center">
              <p className="text-xs font-semibold text-[#111827] mb-1">More Users</p>
              <p className="text-[11px] text-black/40">Stronger signal → feeds back</p>
            </div>
            <div className="text-2xl text-black/20 ml-1">↩</div>
          </div>
        </div>
      </section>

      {/* ══ 05  PLATFORM ═══════════════════════════════════════ */}
      <section id="platform" className="h-screen snap-start bg-[#F8FAFC] flex flex-col justify-center px-10 lg:px-20">
        <div className="max-w-5xl mx-auto w-full">
          <OL>The Platform</OL>
          <H className="max-w-2xl">13+ domains. Every roadmap<br />backed by market demand.</H>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 mb-10">
            {[
              { name: 'Frontend',          color: 'bg-blue-50   border-blue-100   text-blue-700'   },
              { name: 'Backend',           color: 'bg-purple-50 border-purple-100 text-purple-700' },
              { name: 'Fullstack',         color: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
              { name: 'Machine Learning',  color: 'bg-green-50  border-green-100  text-green-700'  },
              { name: 'DevOps',            color: 'bg-orange-50 border-orange-100 text-orange-700' },
              { name: 'Data Science',      color: 'bg-teal-50   border-teal-100   text-teal-700'   },
              { name: 'Cybersecurity',     color: 'bg-red-50    border-red-100    text-red-700'    },
              { name: 'UI/UX Design',      color: 'bg-pink-50   border-pink-100   text-pink-700'   },
              { name: 'Android',           color: 'bg-lime-50   border-lime-100   text-lime-700'   },
              { name: 'iOS',               color: 'bg-sky-50    border-sky-100    text-sky-700'    },
              { name: 'Blockchain',        color: 'bg-amber-50  border-amber-100  text-amber-700'  },
              { name: 'Indie Game Dev',    color: 'bg-violet-50 border-violet-100 text-violet-700' },
              { name: 'AAA Game Dev',      color: 'bg-cyan-50   border-cyan-100   text-cyan-700'   },
              { name: '+ more shipping',   color: 'bg-black/[0.03] border-black/10 text-black/35 italic' },
            ].map(({ name, color }) => (
              <div key={name} className={`border rounded-xl px-3 py-2.5 text-center text-xs font-medium ${color}`}>
                {name}
              </div>
            ))}
          </div>
          <p className="text-sm text-black/40 max-w-xl">
            Each domain roadmap is generated from and updated against live hiring data —
            not community opinion or editorial judgment.
          </p>
        </div>
      </section>

      {/* ══ 06  FEATURE 1 — Market Roadmap ═════════════════════ */}
      <section id="feature1" className="h-screen snap-start bg-white flex flex-col justify-center px-10 lg:px-20">
        <div className="max-w-5xl mx-auto w-full">
          <OL>Feature 01</OL>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 shrink-0">
              <Zap className="h-7 w-7 text-blue-500" />
            </div>
            <H className="mb-0">Market-Demand Backed Roadmaps<br />Curated by AI, Every Week.</H>
          </div>
          <p className="text-lg text-black/50 max-w-2xl leading-relaxed mb-10">
            Every roadmap is generated from real job posting analysis — not what&apos;s trending on YouTube
            or what an instructor decided to teach. Each week, our AI re-scans the market and
            pushes updates automatically. Your path evolves with the job market.
          </p>
          <div className="grid grid-cols-3 gap-5">
            {[
              { title: 'Real-time signal',    body: 'Thousands of job descriptions processed weekly to extract in-demand skills and their relative priority.' },
              { title: 'Auto-updated paths',  body: 'When a new framework dominates hiring or a skill fades, your roadmap reflects it within the next weekly cycle.' },
              { title: 'Structured sequence', body: 'Skills are ordered by dependency and job frequency — not alphabetically or by what\'s easiest to teach.' },
            ].map(({ title, body }) => (
              <div key={title} className="border border-black/[0.07] rounded-2xl p-6 bg-[#F8FAFC]">
                <Check className="h-5 w-5 text-blue-500 mb-3" />
                <p className="font-semibold text-[#111827] mb-2">{title}</p>
                <p className="text-sm text-black/50 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 07  FEATURE 2 — Hyper-personalization ══════════════ */}
      <section id="feature2" className="h-screen snap-start bg-[#F8FAFC] flex flex-col justify-center px-10 lg:px-20">
        <div className="max-w-5xl mx-auto w-full">
          <OL>Feature 02</OL>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 shrink-0">
              <Brain className="h-7 w-7 text-purple-500" />
            </div>
            <H className="mb-0">Hyper-Personalisation.<br />No two users share the same path.</H>
          </div>
          <p className="text-lg text-black/50 max-w-2xl leading-relaxed mb-10">
            The platform continuously adapts to each user&apos;s background, pace, goals, and
            interaction patterns. The more you use it, the more it understands you —
            and the more precise your roadmap becomes.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border border-black/[0.07] rounded-2xl p-7">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-black/30 mb-4">Inputs the platform learns from</p>
              <ul className="space-y-3">
                {[
                  'Current skill level & background',
                  'Target role & timeline',
                  'Learning pace & consistency',
                  'Resources clicked & time spent',
                  'User feedback on content quality',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-black/55">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-black/[0.07] rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-black/30 mb-4">The result</p>
                <p className="font-headline text-3xl font-bold text-[#111827] mb-3">
                  A living roadmap<br />that grows with you.
                </p>
                <p className="text-sm text-black/50 leading-relaxed">
                  User data feeds back into the AI engine globally —
                  improving recommendations for every learner on the platform,
                  not just the individual.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-purple-600">
                <Brain className="h-4 w-4" />
                Platform intelligence compounds over time
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 08  FEATURE 3 — Resources + Mentor ═════════════════ */}
      <section id="feature3" className="h-screen snap-start bg-white flex flex-col justify-center px-10 lg:px-20">
        <div className="max-w-5xl mx-auto w-full">
          <OL>Features 03 &amp; 04</OL>
          <H className="max-w-3xl">Weekly learning resources<br />and a 24/7 AI mentor.</H>
          <div className="grid grid-cols-2 gap-6">

            <div className="border border-black/[0.07] rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-green-50 rounded-xl border border-green-100">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <p className="font-headline text-lg font-semibold text-[#111827]">Weekly AI-Curated Resources</p>
              </div>
              <p className="text-sm text-black/50 leading-relaxed mb-5">
                Every week, the AI scans the market for the highest-signal learning content —
                articles, videos, projects, and documentation — mapped precisely to where
                each user is in their roadmap.
              </p>
              <ul className="space-y-2">
                {[
                  'Matched to your current roadmap step',
                  'Ranked by quality + relevance signal',
                  'Refreshed weekly with market data',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-black/55">
                    <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-black/[0.07] rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <p className="font-headline text-lg font-semibold text-[#111827]">24/7 AI Mentor</p>
              </div>
              <p className="text-sm text-black/50 leading-relaxed mb-5">
                An always-on AI mentor that answers questions, unblocks learners, explains
                concepts in context, and keeps users accountable to their roadmap —
                without waiting for a human tutor or cohort.
              </p>
              <ul className="space-y-2">
                {[
                  'Context-aware of your roadmap & progress',
                  'Explains concepts at your skill level',
                  'Accountability nudges & progress tracking',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-black/55">
                    <Check className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ══ 09  TRACTION ═══════════════════════════════════════ */}
      <section id="traction" className="h-screen snap-start bg-[#F8FAFC] flex flex-col justify-center px-10 lg:px-20">
        <div className="max-w-5xl mx-auto w-full">
          <OL>Traction</OL>
          <H className="max-w-2xl">316 signups.<br />$0 spent on marketing.</H>

          <div className="grid grid-cols-4 gap-5 mb-10">
            {[
              { n: '316',    label: 'Registered users',    sub: '100% organic'              },
              { n: '$0',     label: 'Marketing spend',     sub: 'zero paid acquisition'     },
              { n: '100+',   label: 'Users gave feedback', sub: 'unprompted responses'      },
              { n: '13+',    label: 'Live domains',        sub: 'all market-demand backed'  },
            ].map(({ n, label, sub }) => (
              <div key={label} className="bg-white border border-black/[0.07] rounded-2xl p-6">
                <p className="font-headline text-4xl font-bold text-[#111827] mb-1">{n}</p>
                <p className="text-sm text-black/55 leading-snug">{label}</p>
                <p className="text-[10px] text-black/30 mt-1">{sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-400 mb-3">User feedback · week 1</p>
              <p className="text-sm text-black/65 leading-relaxed italic mb-3">
                &ldquo;Finally a platform that tells me <em>what</em> to learn, not just how. I wasted 3 months going in circles before I found this. My roadmap changed everything.&rdquo;
              </p>
              <p className="text-[10px] text-black/35">— Frontend developer, 2 weeks post-signup</p>
            </div>
            <div className="bg-white border border-black/[0.07] rounded-2xl p-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-black/25 mb-4">Engagement signals</p>
              <div className="flex gap-8 mb-5">
                <div>
                  <p className="font-headline text-3xl font-bold text-[#111827]">~68%</p>
                  <p className="text-xs text-black/45 mt-1">Activation rate</p>
                  <p className="text-[10px] text-black/30">signups → roadmap generated</p>
                </div>
                <div>
                  <p className="font-headline text-3xl font-bold text-[#111827]">42%</p>
                  <p className="text-xs text-black/45 mt-1">7-day return rate</p>
                  <p className="text-[10px] text-black/30">weekly active users</p>
                </div>
              </div>
              <p className="text-xs text-black/40 leading-relaxed">🔥 All growth is organic word-of-mouth. Zero paid acquisition. Users arrive and stay because the product solves a real problem.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 10  WHY IT WORKS ═══════════════════════════════════ */}
      <section id="whyitworks" className="h-screen snap-start bg-white flex flex-col justify-center px-10 lg:px-20">
        <div className="max-w-5xl mx-auto w-full">
          <OL>Why It Works</OL>
          <H className="max-w-2xl">Traditional platforms teach content.<br />We sell direction.</H>

          <div className="overflow-hidden rounded-2xl border border-black/[0.07]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] bg-black/[0.02]">
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-black/35 w-1/4">Dimension</th>
                  <th className="text-center px-5 py-4 text-xs font-semibold uppercase tracking-widest text-black/35">Bootcamps</th>
                  <th className="text-center px-5 py-4 text-xs font-semibold uppercase tracking-widest text-black/35">Course Platforms</th>
                  <th className="text-center px-5 py-4 text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50/40">Acad AI</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { dim: 'Starts from',           a: 'Curriculum opinion',    b: 'Popular topics',      c: 'Live job market data'        },
                  { dim: 'Personalisation',        a: 'None',                  b: 'Course recommender',  c: 'Hyper-personalised path'     },
                  { dim: 'Market alignment',       a: 'Updated yearly',        b: 'Rarely updated',      c: 'Refreshed every week'        },
                  { dim: 'Learning support',       a: 'Human cohort (slow)',   b: 'Forum / none',        c: '24/7 AI mentor'              },
                  { dim: 'Unique user paths',      a: '✗ Same for everyone',   b: '✗ Same courses',      c: '✓ No two paths alike'        },
                  { dim: 'Platform intelligence',  a: '✗ Static',              b: '✗ Static',            c: '✓ Learns as it runs'         },
                ].map(({ dim, a, b, c }) => (
                  <tr key={dim} className="border-b border-black/[0.04]">
                    <td className="px-6 py-3.5 font-medium text-black/60 text-sm">{dim}</td>
                    <td className="px-5 py-3.5 text-center text-sm text-black/40">{a}</td>
                    <td className="px-5 py-3.5 text-center text-sm text-black/40">{b}</td>
                    <td className="px-5 py-3.5 text-center text-sm font-semibold text-blue-600 bg-blue-50/30">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══ 11  MARKET ═════════════════════════════════════════ */}
      <section id="market" className="h-screen snap-start bg-[#0A0A0A] flex flex-col justify-center px-10 lg:px-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(59,130,246,0.6) 0%, transparent 65%)' }} />
        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <OL light>Market Opportunity</OL>
          <H light className="max-w-2xl">Targeting the most motivated<br />segment of the talent economy.</H>
          <p className="text-base text-white/40 max-w-2xl leading-relaxed mb-12">
            Our ideal customer is an <strong className="text-white/70">aspiring developer or career changer</strong> — someone
            actively trying to break into tech or upskill into a better role. High intent, high willingness to pay.
          </p>
          <div className="grid grid-cols-3 gap-5 mb-10">
            {[
              { label: 'TAM', size: '$366B', desc: 'Global edtech & professional upskilling market (2026)', sub: 'HolonIQ' },
              { label: 'SAM', size: '$8.6B', desc: 'English-speaking developer + tech career upskilling (28.7M devs × ~$300/yr avg spend)', sub: 'LinkedIn Workforce + BLS' },
              { label: 'SOM', size: '$860M', desc: 'Active job-seekers & career switchers with high intent — 10% SAM, 3-year target', sub: 'Serviceable obtainable market' },
            ].map(({ label, size, desc, sub }) => (
              <div key={label} className="border border-white/[0.08] rounded-2xl p-6">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">{label}</p>
                <p className="font-headline text-5xl font-bold text-white mb-3">{size}</p>
                <p className="text-sm text-white/45 leading-relaxed mb-2">{desc}</p>
                <p className="text-[10px] text-white/20">{sub}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-10">
            {[
              { n: '28.7M', label: 'developers worldwide' },
              { n: '~4M',   label: 'career changers entering tech annually' },
              { n: '+25%',  label: 'developer workforce growth by 2030' },
            ].map(({ n, label }) => (
              <div key={n}>
                <p className="font-headline text-2xl font-bold text-blue-400">{n}</p>
                <p className="text-xs text-white/30 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 12  BUSINESS MODEL ═════════════════════════════════ */}
      <section id="bizmodel" className="h-screen snap-start bg-[#F8FAFC] flex flex-col justify-center px-10 lg:px-20">
        <div className="max-w-5xl mx-auto w-full">
          <OL>Business Model</OL>
          <H className="max-w-2xl">Subscription-first.<br />Enterprise as the multiplier.</H>

          <div className="grid grid-cols-3 gap-5 mb-8">
            {[
              {
                phase: 'Now — Pre-Revenue',
                tier: 'Growth',
                price: 'Building user base',
                goal: 'Validate retention + flywheel',
                items: ['316 organic users', '100+ feedback responses', 'Market data engine running', 'Roadmaps across 13+ domains'],
                accent: 'border-black/10 bg-white',
                badge: 'bg-amber-50 text-amber-700',
              },
              {
                phase: 'Year 1',
                tier: 'Pro Subscription',
                price: '$19 / month',
                goal: 'Convert high-intent users',
                items: ['Hyper-personalised AI roadmap', 'Weekly resource curation', '24/7 AI mentor', 'Progress tracking + insights'],
                accent: 'border-blue-500/40 bg-blue-50/20',
                badge: 'bg-blue-100 text-blue-700',
              },
              {
                phase: 'Year 2+',
                tier: 'Enterprise / Teams',
                price: '$79 / seat / month',
                goal: 'B2B recurring revenue',
                items: ['Team onboarding roadmaps', 'Skills gap analysis for orgs', 'ATS & HR integrations', 'Custom domain coverage'],
                accent: 'border-black/10 bg-white',
                badge: 'bg-black/5 text-black/40',
              },
            ].map(({ phase, tier, price, goal, items, accent, badge }) => (
              <div key={tier} className={`border rounded-2xl p-7 ${accent}`}>
                <span className={`text-[9px] font-semibold uppercase tracking-widest rounded-full px-2.5 py-1 ${badge}`}>{phase}</span>
                <p className="font-headline text-xl font-semibold text-[#111827] mt-4 mb-1">{tier}</p>
                <p className="text-xl font-bold text-[#111827] mb-1">{price}</p>
                <p className="text-xs text-black/40 mb-5">{goal}</p>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-black/55">
                      <Check className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-sm text-black/35 italic">
            No revenue yet. Pre-seed capital will fund the product and GTM required to reach first $150k ARR by month 18.
          </p>
        </div>
      </section>

      {/* ══ 13  COMPETITION ════════════════════════════════════ */}
      <section id="competition" className="h-screen snap-start bg-white flex flex-col justify-center px-10 lg:px-20">
        <div className="max-w-5xl mx-auto w-full">
          <OL>Competitive Edge</OL>
          <H className="max-w-3xl">We don&apos;t serve blind.<br />Our moat compounds automatically.</H>

          <div className="grid grid-cols-5 gap-3 mb-6">
            {['', 'roadmap.sh', 'Coursera / Udemy', 'LinkedIn Learning', 'Acad AI ✦'].map((h, i) => (
              <div key={i} className={`text-center text-xs font-semibold rounded-xl px-3 py-2.5 ${i === 4 ? 'bg-blue-500 text-white' : i === 0 ? '' : 'bg-black/[0.03] text-black/50'}`}>
                {h}
              </div>
            ))}
            {[
              ['Market-demand backed',   false, false, false, true],
              ['AI-generated weekly',    false, false, false, true],
              ['Hyper-personalised',     false, false, false, true],
              ['Self-improving platform',false, false, false, true],
              ['13+ domains',            true,  true,  false, true],
              ['24/7 AI mentor',         false, false, false, true],
            ].map(([label, ...vals]) => (
              <>
                <div key={String(label)} className="col-span-1 flex items-center text-sm text-black/55 font-medium py-2 border-t border-black/[0.04]">
                  {label}
                </div>
                {(vals as boolean[]).map((v, i) => (
                  <div key={i} className={`flex items-center justify-center py-2 border-t border-black/[0.04] ${i === 3 ? 'bg-blue-50/30 rounded' : ''}`}>
                    {v
                      ? <Check className={`h-4 w-4 ${i === 3 ? 'text-blue-500' : 'text-green-500'}`} />
                      : <X className="h-4 w-4 text-black/15" />}
                  </div>
                ))}
              </>
            ))}
          </div>

          <div className="bg-[#F8FAFC] border border-black/[0.07] rounded-2xl p-5 max-w-3xl">
            <p className="text-sm font-semibold text-[#111827] mb-1">The moat: a self-reinforcing data flywheel</p>
            <p className="text-sm text-black/50">
              More users generate richer behavioural data → AI produces better personalisations → higher retention
              → more data. Simultaneously, the market data engine runs automatically — no manual curation needed.
              Competitors would need to rebuild both flywheels from scratch.
            </p>
          </div>
        </div>
      </section>

      {/* ══ 14  VISION ═════════════════════════════════════════ */}
      <section id="vision" className="h-screen snap-start bg-[#0A0A0A] flex flex-col justify-center px-10 lg:px-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 100% 60% at 30% 0%, rgba(99,102,241,0.7) 0%, transparent 55%), radial-gradient(ellipse 80% 50% at 80% 100%, rgba(59,130,246,0.5) 0%, transparent 60%)' }} />
        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <OL light>10-Year Vision</OL>
          <H light className="max-w-3xl">
            Not just a learning platform.<br />
            <span className="text-blue-400">A Career OS for everyone.</span>
          </H>
          <p className="text-base text-white/45 max-w-2xl leading-relaxed mb-12">
            Today we serve developers. In 10 years, Acad AI becomes the operating system for anyone
            building a career — regardless of industry, background, or geography.
          </p>
          <div className="grid grid-cols-3 gap-5">
            {[
              {
                icon: '👷',
                title: 'Blue-collar trades',
                body: 'Electricians, plumbers, HVAC technicians. The skilled trades face the same problem — no clear, market-aligned path to mastery. We\'re building for them too.',
              },
              {
                icon: '🥽',
                title: 'AI + AR / VR',
                body: 'For trades and hands-on skills, a text roadmap isn\'t enough. The long-term vision pairs our AI engine with AR/VR for immersive, guided, on-the-job training.',
              },
              {
                icon: '🌍',
                title: 'Every career, every market',
                body: 'Healthcare, finance, design, construction. Any field with a hiring market has skill demand we can read. The engine is domain-agnostic by design.',
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="border border-white/[0.08] rounded-2xl p-6 bg-white/[0.03]">
                <p className="text-3xl mb-4">{icon}</p>
                <p className="font-headline text-lg font-semibold text-white mb-2">{title}</p>
                <p className="text-sm text-white/45 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 15  WHY ME ═════════════════════════════════════════ */}
      <section id="whyme" className="h-screen snap-start bg-[#F8FAFC] flex flex-col justify-center px-10 lg:px-20">
        <div className="max-w-5xl mx-auto w-full">
          <OL>Why Me</OL>
          <H className="max-w-2xl">I lived the problem.<br />Then I solved it in two weeks.</H>

          <div className="flex gap-8 items-start">
            <div className="flex-1">
              <p className="text-base text-black/55 leading-relaxed mb-8 max-w-xl">
                I was a developer who couldn&apos;t figure out what to learn next. I spent weeks going in
                circles — tutorials, Reddit threads, YouTube rabbit holes. No platform gave me a clear,
                market-validated answer. So I built one.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: '⚡', title: 'Built in 2 weeks',         body: 'Went from idea to live product in 14 days. Shipped fast, iterated faster.' },
                  { icon: '🌱', title: '316 organic users',        body: '$0 spent on marketing. Every user arrived because the product solves a real problem.' },
                  { icon: '💬', title: '100+ feedback responses',  body: 'Users gave detailed, unprompted feedback — high-signal validation at pre-revenue stage.' },
                  { icon: '🧠', title: 'Domain expertise',         body: 'Deep hands-on experience across fullstack dev, AI integration, and developer tooling.' },
                ].map(({ icon, title, body }) => (
                  <div key={title} className="bg-white border border-black/[0.07] rounded-xl p-5">
                    <p className="text-xl mb-2">{icon}</p>
                    <p className="font-semibold text-[#111827] mb-1 text-sm">{title}</p>
                    <p className="text-xs text-black/45 leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <a href="https://x.com/a1siel" target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium text-black/50 hover:text-black/80 border border-black/10 rounded-full px-4 py-1.5 transition-colors bg-white">
                  Twitter / X · @a1siel
                </a>
                <a href="https://linkedin.com/in/bhaskarjpofficial" target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium text-black/50 hover:text-black/80 border border-black/10 rounded-full px-4 py-1.5 transition-colors bg-white">
                  LinkedIn · bhaskarjpofficial
                </a>
              </div>
            </div>

            <div className="border border-black/[0.07] rounded-2xl p-7 bg-white min-w-[260px] shrink-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-black/25 mb-5">Post-raise hires (Day 1)</p>
              {[
                { role: 'Co-founder / CTO', note: 'AI/ML + platform engineering' },
                { role: 'Head of Growth',   note: 'SEO, dev community, content'  },
                { role: 'ML / AI Engineer', note: 'Flywheel + personalisation'   },
              ].map(({ role, note }) => (
                <div key={role} className="mb-4 last:mb-0">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    <span className="text-sm font-medium text-black/65">{role}</span>
                  </div>
                  <p className="text-[10px] text-black/35 ml-3.5 mt-0.5">{note}</p>
                </div>
              ))}
              <p className="text-[10px] text-black/30 mt-4 leading-relaxed border-t border-black/[0.06] pt-4">
                $350k funds all three hires + 18-month runway.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 16  ASK ════════════════════════════════════════════ */}
      <section id="ask" className="h-screen snap-start bg-[#0A0A0A] flex flex-col justify-center px-10 lg:px-20 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-[45%] opacity-25 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.7) 0%, transparent 65%)' }} />
        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <OL light>The Ask</OL>
          <H light className="max-w-3xl">
            Raising a{' '}
            <span className="text-blue-400">$350k pre-seed</span><br />
            to reach first revenue.
          </H>
          <p className="text-base text-white/40 max-w-xl leading-relaxed mb-12">
            Capital will fund the engineering and GTM required to launch the subscription product,
            convert our 316-user base, and scale organic acquisition to first meaningful ARR.
          </p>

          <div className="grid grid-cols-3 gap-5 mb-10">
            {[
              { pct: '55%', label: 'Engineering',  desc: '~$193k — AI/ML + platform engineering' },
              { pct: '30%', label: 'Growth',        desc: '~$105k — SEO, content, dev community'  },
              { pct: '15%', label: 'Operations',    desc: '~$52k — legal, infra, tooling'         },
            ].map(({ pct, label, desc }) => (
              <div key={label} className="border border-white/[0.08] rounded-2xl p-6">
                <p className="font-headline text-4xl font-bold text-white mb-2">{pct}</p>
                <p className="text-sm font-semibold text-white/55 mb-1">{label}</p>
                <p className="text-xs text-white/28">{desc}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-8 flex-wrap">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-2">18-month target</p>
              <p className="text-base text-white/60">$150k ARR · ~700 paying users · Series A pipeline</p>
            </div>
            <span className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-2">Contact</p>
              <a href="https://x.com/a1siel" className="text-base text-blue-400 hover:text-blue-300 transition-colors">
                @a1siel on X
              </a>
            </div>
            <span className="w-px h-10 bg-white/10" />
            <Link href="/" className="flex items-center gap-2 text-white/35 hover:text-white/65 transition-colors text-sm">
              <BrainCircuit className="h-4 w-4" />
              acadai.app
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
