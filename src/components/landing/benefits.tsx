"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

/* ─────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────── */
const skills = [
  { name: "Next.js",             pct: 91 },
  { name: "System Architecture", pct: 84 },
  { name: "AI Tools",            pct: 79 },
  { name: "TypeScript",          pct: 88 },
];

const scanSteps = [
  "Frontend & Backend roles",
  "AI / ML positions",
  "Systems & Architecture",
  "14,203 postings analyzed",
];

const domains = [
  "Frontend",          "Machine Learning",  "Backend",
  "DevOps",            "Blockchain",        "Fullstack",
  "iOS",               "Data Science",      "Android",
  "UI/UX",             "Cybersecurity",     "Product Engineering",
  "Indie Game Dev",    "AAA Game Dev",
];

const rotations = [1.2, -1.8, 0.6, -1.0, 2.0, -0.5, 1.5, -2.2, 0.8, -1.4, 1.0, -0.8, 1.6, -1.3];

const abandonedCourses = [
  { name: "Advanced Web Dev Bootcamp",        price: 19.99 },
  { name: "JavaScript: The Complete Guide",   price: 24.99 },
  { name: "React — The Complete Guide",       price: 14.99 },
  { name: "System Design for Interviews",     price: 16.99 },
];

const profileFields = [
  { label: "Goal",      value: "Frontend Developer" },
  { label: "Level",     value: "Intermediate" },
  { label: "Resources", value: "12 curated this week" },
];

/* ─────────────────────────────────────────────────────
   CARD 1 — Hiring demand with scan → results animation
───────────────────────────────────────────────────── */
function SkillBars() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [phase, setPhase] = useState<"scan" | "results">("scan");
  const [checked, setChecked] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    scanSteps.forEach((_, i) => {
      timers.push(setTimeout(() => setChecked(i + 1), 500 + i * 520));
    });
    timers.push(
      setTimeout(() => setPhase("results"), 500 + scanSteps.length * 520 + 650)
    );
    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  return (
    <div ref={ref} className="w-full">
      <AnimatePresence mode="wait">
        {phase === "scan" ? (
          /* ── Scanning phase ── */
          <motion.div
            key="scan"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="w-full rounded-2xl border border-black/[0.07] bg-white px-5 py-4 shadow-sm"
          >
            {/* Header row with pulsing dot */}
            <div className="mb-4 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3B82F6] opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40">
                Scanning job market…
              </p>
            </div>

            {/* Scan items */}
            <div className="space-y-2.5">
              {scanSteps.map((step, i) => (
                <div key={step} className="flex items-center gap-2.5">
                  <AnimatePresence>
                    {checked > i ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#3B82F6]/10"
                      >
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path
                            d="M1.5 4l2 2 3-3"
                            stroke="#3B82F6"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.span>
                    ) : (
                      <motion.span
                        key="dot"
                        className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                      />
                    )}
                  </AnimatePresence>
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={checked > i ? { opacity: 1, x: 0 } : { opacity: 0.3, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`text-xs ${checked > i ? "text-black/70" : "text-black/30"} ${i === scanSteps.length - 1 ? "font-semibold" : ""}`}
                  >
                    {step}
                  </motion.span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ── Results phase ── */
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full rounded-2xl border border-black/[0.07] bg-white px-5 py-4 shadow-sm"
          >
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-black/30">
              Hiring demand · this week
            </p>
            <div className="space-y-3">
              {skills.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                >
                  <div className="mb-1 flex justify-between text-xs text-black/50">
                    <span>{s.name}</span>
                    <motion.span
                      className="font-medium text-black/70"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.08 + 0.4 }}
                    >
                      {s.pct}%
                    </motion.span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
                    <motion.div
                      className="h-1.5 rounded-full bg-[#3B82F6]"
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.1,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   CARD 2 — Domain pills popping in one by one
───────────────────────────────────────────────────── */
function DomainPills() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="flex flex-wrap gap-2.5 content-start">
      {domains.map((d, i) => (
        <motion.span
          key={d}
          initial={{ opacity: 0, scale: 0.45 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{
            delay: i * 0.07,
            type: "spring",
            stiffness: 360,
            damping: 17,
          }}
          style={{ rotate: rotations[i], display: "inline-block" }}
          className="rounded-full border border-black/[0.09] bg-white px-5 py-2.5 text-sm font-medium text-black/65 shadow-sm"
        >
          {d}
        </motion.span>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   CARD 3 — Profile building sequence
───────────────────────────────────────────────────── */
function ProfileMock() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [fieldsVisible, setFieldsVisible] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const t1 = setTimeout(() => setFieldsVisible(1), 400);
    const t2 = setTimeout(() => setFieldsVisible(2), 900);
    const t3 = setTimeout(() => setFieldsVisible(3), 1380);
    const t4 = setTimeout(() => setProgress(62), 1800);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [isInView]);

  return (
    <div ref={ref} className="w-full rounded-2xl border border-white/20 bg-white/12 p-4 backdrop-blur-sm">
      {/* Avatar */}
      <motion.div
        className="mb-4 flex items-center gap-3"
        initial={{ opacity: 0, y: 6 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
      >
        <div className="h-9 w-9 rounded-full bg-white/25" />
        <div className="space-y-1.5">
          <div className="h-2.5 w-28 rounded-full bg-white/30" />
          <div className="h-2 w-20 rounded-full bg-white/20" />
        </div>
      </motion.div>

      {/* Fields */}
      <div className="space-y-2.5 text-xs">
        {profileFields.map((f, i) => (
          <AnimatePresence key={f.label}>
            {fieldsVisible > i && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2"
              >
                <span className="text-white/55">{f.label}</span>
                <span className="font-semibold text-white">{f.value}</span>
              </motion.div>
            )}
          </AnimatePresence>
        ))}

        {/* Progress bar */}
        <AnimatePresence>
          {fieldsVisible >= 3 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="rounded-lg bg-white/10 px-3 py-2"
            >
              <div className="mb-1.5 flex justify-between text-white/55">
                <span>Roadmap progress</span>
                <motion.span
                  className="text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {progress}%
                </motion.span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <motion.div
                  className="h-1.5 rounded-full bg-white/80"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   CARD 4 — Courses crossed out, savings counted up
───────────────────────────────────────────────────── */
function SavingsMock() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [crossed, setCrossed] = useState(0);
  const [total, setTotal] = useState(0);

  const finalTotal = abandonedCourses.reduce((s, c) => s + c.price, 0);

  useEffect(() => {
    if (!isInView) return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Cross items out one by one
    abandonedCourses.forEach((_, i) => {
      timers.push(setTimeout(() => setCrossed(i + 1), 350 + i * 480));
    });

    // Count up total after last strikethrough
    const countStart = 350 + abandonedCourses.length * 480 + 100;
    timers.push(
      setTimeout(() => {
        const duration = 900;
        const steps = 40;
        const increment = finalTotal / steps;
        let step = 0;
        const iv = setInterval(() => {
          step++;
          setTotal(Math.min(parseFloat((increment * step).toFixed(2)), finalTotal));
          if (step >= steps) clearInterval(iv);
        }, duration / steps);
      }, countStart)
    );

    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  return (
    <div ref={ref} className="w-full rounded-2xl border border-black/[0.07] bg-white px-5 py-4 shadow-sm">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-black/30">
        courses you won't need to buy
      </p>

      <div className="space-y-2.5 mb-4">
        {abandonedCourses.map((course, i) => (
          <motion.div
            key={course.name}
            className="flex items-center justify-between gap-3"
            initial={{ opacity: 0, x: -8 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          >
            {/* Course name with strikethrough overlay */}
            <div className="relative flex-1 overflow-hidden">
              <span className={`text-xs transition-colors duration-300 ${crossed > i ? "text-black/25" : "text-black/60"}`}>
                {course.name}
              </span>
              {crossed > i && (
                <motion.div
                  className="absolute inset-y-0 left-0 flex items-center"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                  style={{ width: "100%", transformOrigin: "left" }}
                >
                  <div className="h-px w-full bg-red-400/60" />
                </motion.div>
              )}
            </div>
            <span className={`shrink-0 text-xs font-medium transition-colors duration-300 ${crossed > i ? "text-black/25 line-through" : "text-black/45"}`}>
              ${course.price.toFixed(2)}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Running total */}
      <div className="flex items-center justify-between border-t border-black/[0.06] pt-3">
        <span className="text-xs font-semibold text-black/40">Money saved</span>
        <motion.span
          className="text-xl font-bold text-[#3B82F6]"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          ${total.toFixed(2)}
          {total >= finalTotal && <span className="text-sm font-normal text-black/30"> +more</span>}
        </motion.span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   SECTION
───────────────────────────────────────────────────── */
const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function Benefits() {
  return (
    <section className="w-full bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">

        {/* Heading */}
        <motion.h2
          className="mb-14 max-w-2xl font-headline text-[clamp(2.4rem,5.5vw,4rem)] font-normal leading-[1.06] tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: true }}
        >
          <span className="text-[#111827]">Four ways we help you </span>
          <span className="text-[#3B82F6]">land</span>
          <span className="text-[#111827]"> the </span>
          <span className="italic text-black/30">job</span>
        </motion.h2>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Card 1 */}
          <motion.div
            custom={0} variants={cardVariants}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="relative flex min-h-[480px] flex-col justify-between overflow-hidden rounded-3xl border border-black/[0.07] bg-[#EEF4FF] p-8"
          >
            <div>
              <h3 className="mb-2 text-xl font-semibold text-[#111827]">
                Know exactly what to learn
              </h3>
              <p className="max-w-xs text-sm leading-relaxed text-black/50">
                Roadmaps built from real job postings — not opinions. See exactly what companies are hiring for, right now.
              </p>
            </div>
            <div className="mt-8">
              <SkillBars />
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            custom={1} variants={cardVariants}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="relative flex min-h-[480px] flex-col justify-between overflow-hidden rounded-3xl border border-black/[0.07] bg-[#F7F7F7] p-8"
          >
            <div className="flex-1">
              <DomainPills />
            </div>
            <div className="mt-8">
              <h3 className="mb-2 text-xl font-semibold text-[#111827]">
                Every tech domain covered
              </h3>
              <p className="max-w-xs text-sm leading-relaxed text-black/50">
                Frontend to Blockchain — 14 domains, all with professional-level, comprehensive learning paths.
              </p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            custom={2} variants={cardVariants}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-3xl border border-[#2563EB]/20 bg-[#3B82F6] p-8"
          >
            <div>
              <ProfileMock />
            </div>
            <div className="mt-6">
              <h3 className="mb-2 text-xl font-semibold text-white">
                Adapts to you
              </h3>
              <p className="max-w-xs text-sm leading-relaxed text-white/65">
                Your goal, level, and pace shape your roadmap. Plus hand-picked weekly resources — exactly what you need, when you need it.
              </p>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            custom={3} variants={cardVariants}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-3xl border border-black/[0.07] bg-[#F7F7F7] p-8"
          >
            <div>
              <h3 className="mb-2 text-xl font-semibold text-[#111827]">
                Kill tutorial hell
              </h3>
              <p className="max-w-xs text-sm leading-relaxed text-black/50">
                Conflicting Reddit threads, half-watched YouTube series, abandoned Udemy courses. One market-backed roadmap replaces all of it.
              </p>
            </div>
            <div className="mt-8">
              <SavingsMock />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
