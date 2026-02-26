'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const faqs = [
  {
    question: 'How are the roadmaps built from job market data?',
    answer:
      'We pull requirements from thousands of active job postings across major tech roles and weight them by frequency and recency. Your roadmap reflects what companies are actually hiring for right now — not what a curriculum designer thought mattered two years ago.',
  },
  {
    question: 'What domains does Acad AI cover?',
    answer:
      'Frontend, Backend, Fullstack, Machine Learning, DevOps, and 9 more specialisations. Each domain has a full structured path — foundational concepts through production-grade skills, with curated resources at every stage.',
  },
  {
    question: 'How does personalisation work?',
    answer:
      'During onboarding we capture your current skills, experience level, and goal. That profile reshapes the depth, pacing, and resource recommendations throughout your roadmap. No two users get the same path.',
  },
  {
    question: 'Is there a free tier?',
    answer:
      'There was one until last September. There isn\'t now. Maintaining live data pipelines and curating resources at this quality requires the subscription to be sustainable. The pricing is deliberately low — cheaper than a single tech book per month.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes, both plans are cancel-anytime with no lock-in. Monthly billing stops at the end of the billing cycle. Annual billing is non-refundable after 7 days but you keep access through the period you paid for.',
  },
  {
    question: 'Who is Acad AI best suited for?',
    answer:
      'Anyone who wants to get hired in tech and is tired of guessing what to learn. Career switchers, self-taught developers, bootcamp grads, and working professionals pivoting to a new specialisation all get the most out of it.',
  },
];

function Item({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-black/[0.08]">
      <button
        className="w-full flex items-start justify-between gap-6 py-5 text-left"
        onClick={onToggle}
      >
        <span className="text-[0.9375rem] font-medium text-[#111827] leading-snug">
          {question}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="mt-0.5 shrink-0"
        >
          <Plus className="h-4 w-4 text-black/35" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm text-black/50 leading-relaxed max-w-lg">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 lg:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">

          {/* Left — heading */}
          <div className="lg:pt-1">
            <motion.h2
              className="font-headline text-[clamp(1.8rem,3vw,2.6rem)] font-normal leading-[1.1] tracking-tight text-[#111827]"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              Everything you{' '}
              <span className="text-black/35">need to know</span>
            </motion.h2>
          </div>

          {/* Right — accordion */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {faqs.map((faq, i) => (
              <Item
                key={i}
                question={faq.question}
                answer={faq.answer}
                open={open === i}
                onToggle={() => setOpen(open === i ? null : i)}
              />
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
