'use client';

import { motion } from 'framer-motion';

const statements = [
  {
    word: 'Dynamic.',
    sub: 'Every roadmap is built from live job market data — updated as demand shifts, not once a year.',
    align: 'left' as const,
    color: 'text-[#111827]',
  },
  {
    word: 'Yours.',
    sub: 'Your experience, pace, and goal reshape the entire path. Nobody else gets the same roadmap.',
    align: 'right' as const,
    color: 'text-[#3B82F6]',
  },
  {
    word: 'Deep.',
    sub: 'Not topic lists. Full structured learning paths with curated resources at every stage.',
    align: 'left' as const,
    color: 'text-[#111827]',
  },
];

export default function Differentiators() {
  return (
    <section className="py-24 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">

        {/* Eyebrow */}
        <motion.p
          className="text-lg font-semibold uppercase tracking-widest text-black/70 mb-20 lg:mb-28"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          What sets us apart
        </motion.p>

        {/* Statements */}
        <div className="flex flex-col gap-20 lg:gap-28">
          {statements.map((s, i) => (
            <motion.div
              key={s.word}
              className={`flex flex-col ${s.align === 'right' ? 'items-end text-right' : 'items-start'}`}
              initial={{ opacity: 0, x: s.align === 'right' ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2
                className={`font-headline font-bold leading-[0.92] tracking-tighter ${s.color}`}
                style={{ fontSize: 'clamp(5rem, 12vw, 9.5rem)' }}
              >
                {s.word}
              </h2>
              <p className="mt-5 text-base text-black/60 leading-relaxed max-w-sm">
                {s.sub}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
