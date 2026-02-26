"use client";

import { motion, AnimatePresence, useInView, useAnimate } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────────────
   CURSOR ICON
───────────────────────────────────────────────────── */
function CursorIcon() {
  return (
    <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
      <path
        d="M1 1L1 15.5L4.5 11.5L6.8 17.5L9.3 16.7L7 10.5L11.5 10.5L1 1Z"
        fill="white"
        stroke="#111827"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────
   SHARED PROPS
───────────────────────────────────────────────────── */
interface MockProps {
  active: boolean;
  onComplete: () => void;
}

/* ─────────────────────────────────────────────────────
   STEP 1 MOCK — typing animation + cursor clicks button
   Cursor: anchored at button centre (top:192 left:130)
   Starts offset x:+90 y:-40 → glides to x:0 y:0
───────────────────────────────────────────────────── */
function SignUpMock({ active, onComplete }: MockProps) {
  const [scope, animate] = useAnimate();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const target = "alex@gmail.com";

  useEffect(() => {
    if (!active) return;
    let mounted = true;

    const run = async () => {
      // Type email
      for (let i = 1; i <= target.length; i++) {
        await new Promise<void>((r) => setTimeout(r, 75));
        if (!mounted) return;
        setEmail(target.slice(0, i));
      }
      await new Promise<void>((r) => setTimeout(r, 220));

      // Cursor: fade in at offset position
      if (!mounted || !scope.current) return;
      await animate(".signup-cursor", { opacity: 1 }, { duration: 0.18 });
      // Glide to button
      if (!mounted || !scope.current) return;
      await animate(".signup-cursor", { x: 0, y: 0 }, {
        duration: 0.58,
        ease: [0.25, 0.1, 0.25, 1],
      });
      await new Promise<void>((r) => setTimeout(r, 110));

      // Click
      if (!mounted || !scope.current) return;
      await animate(".signup-cursor", { scale: 0.8 }, { duration: 0.08 });
      if (!mounted || !scope.current) return;
      setDone(true);
      await animate(".signup-cursor", { scale: 1 }, { duration: 0.14 });

      if (mounted) onComplete();
    };

    run();
    return () => { mounted = false; };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={scope}
      className="relative w-full max-w-[280px] rounded-2xl border border-white/80 bg-white p-5 shadow-lg"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="h-6 w-6 rounded-md bg-[#3B82F6]" />
        <span className="text-xs font-bold tracking-tight text-black/60">AcadAI</span>
      </div>

      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-black/30">
        Create account
      </p>

      <div className="mb-2.5 flex h-8 items-center rounded-lg bg-black/[0.04] px-3">
        <motion.span
          className="text-xs text-black/45"
          initial={{ opacity: 0 }}
          animate={active ? { opacity: 1 } : {}}
          transition={{ delay: 0.15 }}
        >
          Alex Johnson
        </motion.span>
      </div>

      <div className="mb-4 flex h-8 items-center rounded-lg bg-black/[0.04] px-3">
        <span className="font-mono text-xs text-[#3B82F6]">
          {email}
          {active && !done && (
            <motion.span
              className="ml-px inline-block h-3 w-px align-middle bg-[#3B82F6]"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.75, repeat: Infinity }}
            />
          )}
        </span>
      </div>

      <motion.div
        className="flex h-9 items-center justify-center rounded-xl text-xs font-semibold"
        animate={
          done
            ? { backgroundColor: "#3B82F6", color: "#ffffff" }
            : { backgroundColor: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.22)" }
        }
        transition={{ duration: 0.4 }}
      >
        {done ? "✓  You're in — welcome!" : "Get Started Free →"}
      </motion.div>

      {/* Cursor */}
      <motion.div
        className="signup-cursor pointer-events-none absolute"
        style={{ top: 192, left: 130, x: 90, y: -40, opacity: 0 }}
      >
        <CursorIcon />
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   STEP 2 MOCK — pills pop in, cursor clicks "Frontend"
   Cursor: anchored at Frontend pill centre (top:62 left:72)
   Starts offset x:+118 y:+110 → glides to x:0 y:0
───────────────────────────────────────────────────── */
const domainList = ["Frontend", "Backend", "ML / AI", "DevOps", "Fullstack", "iOS Dev"];

function DomainPickerMock({ active, onComplete }: MockProps) {
  const [scope, animate] = useAnimate();
  const [entered, setEntered] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    let mounted = true;

    const run = async () => {
      if (!mounted) return;
      setEntered(true);

      // Wait for pills to settle (last pill ≈ 5 × 90ms + spring settle)
      await new Promise<void>((r) => setTimeout(r, 880));

      // Cursor: fade in at offset position
      if (!mounted || !scope.current) return;
      await animate(".domain-cursor", { opacity: 1 }, { duration: 0.18 });
      // Glide to Frontend pill
      if (!mounted || !scope.current) return;
      await animate(".domain-cursor", { x: 0, y: 0 }, {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      });
      await new Promise<void>((r) => setTimeout(r, 110));

      // Click
      if (!mounted || !scope.current) return;
      await animate(".domain-cursor", { scale: 0.8 }, { duration: 0.08 });
      if (!mounted || !scope.current) return;
      setSelected("Frontend");
      await animate(".domain-cursor", { scale: 1 }, { duration: 0.14 });

      if (mounted) onComplete();
    };

    run();
    return () => { mounted = false; };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={scope}
      className="relative w-full max-w-[280px] rounded-2xl border border-black/[0.07] bg-white p-5 shadow-lg"
    >
      <p className="mb-3.5 text-[10px] font-semibold uppercase tracking-widest text-black/30">
        Choose your domain
      </p>
      <div className="grid grid-cols-2 gap-2">
        {domainList.map((d, i) => (
          <motion.div
            key={d}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={entered ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: i * 0.09, type: "spring", stiffness: 380, damping: 20 }}
            className={`relative flex items-center justify-center gap-1 rounded-xl border py-2.5 text-xs font-medium transition-all duration-300 ${
              selected === d
                ? "border-[#3B82F6]/30 bg-[#EEF4FF] text-[#3B82F6]"
                : "border-black/[0.06] bg-black/[0.02] text-black/50"
            }`}
          >
            {selected === d && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
              >
                ✓{" "}
              </motion.span>
            )}
            {d}
          </motion.div>
        ))}
      </div>

      {/* Cursor */}
      <motion.div
        className="domain-cursor pointer-events-none absolute"
        style={{ top: 62, left: 72, x: 118, y: 110, opacity: 0 }}
      >
        <CursorIcon />
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   STEP 3 MOCK — prefs appear, cursor clicks "Generate"
   Cursor: anchored at Generate button centre (top:214 left:130)
   Starts offset x:+90 y:-52 → glides to x:0 y:0
───────────────────────────────────────────────────── */
const prefRows = [
  { label: "Experience", val: "Intermediate", color: "#F59E0B" },
  { label: "Daily Time",  val: "1–2 hrs / day", color: "#3B82F6" },
  { label: "Goal",        val: "Senior Engineer", color: "#8B5CF6" },
  { label: "Style",       val: "Project-based",  color: "#10B981" },
];

function PersonalizeMock({ active, onComplete }: MockProps) {
  const [scope, animate] = useAnimate();
  const [show, setShow] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) return;
    let mounted = true;

    const run = async () => {
      // Show preference rows one by one
      for (let i = 1; i <= prefRows.length; i++) {
        await new Promise<void>((r) => setTimeout(r, i === 1 ? 300 : 420));
        if (!mounted) return;
        setShow(i);
      }

      // Wait for Generate button to appear + settle
      await new Promise<void>((r) => setTimeout(r, 380));

      // Cursor: fade in at offset position
      if (!mounted || !scope.current) return;
      await animate(".pref-cursor", { opacity: 1 }, { duration: 0.18 });
      // Glide to Generate button
      if (!mounted || !scope.current) return;
      await animate(".pref-cursor", { x: 0, y: 0 }, {
        duration: 0.58,
        ease: [0.25, 0.1, 0.25, 1],
      });
      await new Promise<void>((r) => setTimeout(r, 110));

      // Click
      if (!mounted || !scope.current) return;
      await animate(".pref-cursor", { scale: 0.8 }, { duration: 0.08 });
      if (!mounted || !scope.current) return;
      setReady(true);
      await animate(".pref-cursor", { scale: 1 }, { duration: 0.14 });

      if (mounted) onComplete();
    };

    run();
    return () => { mounted = false; };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={scope}
      className="relative w-full max-w-[280px] rounded-2xl border border-black/[0.07] bg-white p-5 shadow-lg"
    >
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-black/30">
        Tailoring your path
      </p>

      <div className="space-y-2">
        {prefRows.map((row, i) => (
          <AnimatePresence key={row.label}>
            {show > i && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                className="flex items-center justify-between rounded-xl bg-black/[0.04] px-3 py-2"
              >
                <span className="text-xs text-black/40">{row.label}</span>
                <span className="text-xs font-semibold" style={{ color: row.color }}>
                  {row.val}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      {/* Generate / Confirm button — mirrors Card 1 button behaviour */}
      <AnimatePresence>
        {show >= prefRows.length && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            <motion.div
              className="mt-3 flex h-9 items-center justify-center rounded-xl text-xs font-semibold"
              animate={
                ready
                  ? { backgroundColor: "#3B82F6", color: "#ffffff" }
                  : { backgroundColor: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.25)" }
              }
              transition={{ duration: 0.4 }}
            >
              {ready ? "✓ Roadmap personalized" : "Generate Roadmap →"}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cursor */}
      <motion.div
        className="pref-cursor pointer-events-none absolute"
        style={{ top: 214, left: 130, x: 90, y: -52, opacity: 0 }}
      >
        <CursorIcon />
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   CONNECTORS
───────────────────────────────────────────────────── */
function StepArrow1() {
  return (
    <div className="hidden lg:flex items-center justify-center self-stretch">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="52" height="52" fill="rgba(0,0,0,0.18)">
        <path d="M437.65 228.63c-11-11.3-28.02-30.74-43.85-33.25-13.68.4-4.24 16.99 4.72 15.98 1.67-.27 14.6 12 20.99 18.95-73.13-19.32-152.62-31.59-224.6-2.19-24.36-20.09-70.46-5.55-97.86 2.74-10.7 4.38-44.74 15.3-45.58 27.63 2.63 10.11 14.03 9.62 19.87 2.58 6.8-4.63 14.23-8.1 21.77-11.33 27.16-10.03 57.65-20.38 86.74-14.81-19.75 10.96-45.07 24.46-49.37 48.67-.98 20.42 24.81 26.36 39.14 16.1 18.7-11.31 37.58-31.54 34.51-54.98 67.16-28.65 141.54-17.06 210.28.69a634.53 634.53 0 0 0-26.86 9.82c-4.5 1.55-4.87 7.28-1.98 10.53 6.02 8.29 15.78 3.88 23.3.63 8.17-3.12 16.31-6.28 24.61-9.03 22.39-5.78 16.3-15.12 4.17-28.72Zm-286.98 58.93c4.9-15.45 20.39-24.72 33.42-32.9-6.02 14.67-18.84 26.87-33.42 32.9Z" />
      </svg>
    </div>
  );
}

function StepArrow2() {
  return (
    <div className="hidden lg:flex items-center justify-center self-stretch">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="52" height="52" fill="rgba(0,0,0,0.18)">
        <path d="M375.95 245.71c-6.18-13.07-22.21-14.92-33.93-21.16-29.11-11.27-58.17-22.62-86.21-36.42-5.15-2.8-4.05 4.74-2.59 7.39 4.87 15.91 21.97 19.24 35.18 25.8 13.69 6.2 27.69 11.61 41.74 16.9-12.73.12-25.61-1.49-38.19-2.47-51.09-6.41-102.94-16.8-149.65-39.09a155.28 155.28 0 0 1-16.43-9.9c-1.14-.84-3.46-2.34-4.55-.57-1.36 5.2 2.49 10.61 5.17 14.87 31.88 32.8 138.31 52.25 200.67 52.48-15.33 9.26-29.95 19.74-44.99 29.42-7.58 5.51-16.54 9.85-22.69 17.01-1.71 5.34 2.93 11.98 7.44 14.55.99.34 1.72-.37 2.07-1.24 34.84-20.49 69.03-43.91 107.85-56.22 4.63-1.49.47-8.42-.89-11.37Z" />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   CARD REVEAL VARIANTS
───────────────────────────────────────────────────── */
const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.13,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

/* ─────────────────────────────────────────────────────
   SECTION — coordinator drives the sequential loop
   Timeline:
     gridInView → +800ms → Card 1 starts
     Card 1 done → +600ms → Card 2 starts
     Card 2 done → +600ms → Card 3 starts
     Card 3 done → +1500ms → all remount → +200ms → Card 1 starts (loop)
   Viewport:
     Loop runs only while the cards grid is ≥30% visible.
     On exit: all timeouts cancelled, mocks reset.
     On re-entry: sequence restarts from Card 1.
───────────────────────────────────────────────────── */
export default function HowItWorks() {
  const gridRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gridRef, { once: false, amount: 0.3 });

  const [round, setRound] = useState(0);
  const [activeCard, setActiveCard] = useState(0);

  // All coordinator timeouts stored here so they can be bulk-cancelled
  const pendingRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasEnteredRef = useRef(false);

  const cancelAll = useCallback(() => {
    pendingRef.current.forEach(clearTimeout);
    pendingRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const t = setTimeout(fn, delay);
    pendingRef.current.push(t);
  }, []);

  // React to viewport enter / exit
  useEffect(() => {
    if (isInView) {
      hasEnteredRef.current = true;
      cancelAll();
      // Remount all mocks fresh, then start Card 1 after card-reveal animation
      setRound((r) => r + 1);
      setActiveCard(0);
      schedule(() => setActiveCard(1), 800);
    } else if (hasEnteredRef.current) {
      // Cards left the viewport — stop everything and reset
      cancelAll();
      setActiveCard(0);
      setRound((r) => r + 1);
    }
  }, [isInView, cancelAll, schedule]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCard1Complete = useCallback(() => {
    schedule(() => setActiveCard(2), 600);
  }, [schedule]);

  const handleCard2Complete = useCallback(() => {
    schedule(() => setActiveCard(3), 600);
  }, [schedule]);

  const handleCard3Complete = useCallback(() => {
    // Brief pause showing all three in "done" state, then loop
    schedule(() => {
      setRound((r) => r + 1);
      setActiveCard(0);
    }, 1500);
    schedule(() => setActiveCard(1), 1700);
  }, [schedule]);

  return (
    <section className="w-full bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">

        {/* Eyebrow + Heading + Subtext */}
        <div className="mb-16 text-center">
          <motion.p
            className="mb-4 inline-block rounded-full border border-black/[0.08] bg-black/[0.04] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-black/40"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true }}
          >
            How it works
          </motion.p>

          <motion.h2
            className="font-headline text-[clamp(2.2rem,5vw,3.6rem)] font-normal leading-[1.07] tracking-tight text-[#111827]"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true }}
          >
            Your Roadmap in{" "}
            <span className="text-[#3B82F6]">3 steps</span>
          </motion.h2>

          <motion.p
            className="mt-4 text-base text-black/45"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            viewport={{ once: true }}
          >
            From sign-up to a fully personalized learning path — in minutes.
          </motion.p>
        </div>

        {/* Steps grid — observed for viewport visibility */}
        <div ref={gridRef} className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_52px_1fr_52px_1fr] lg:gap-0 lg:items-start">

          {/* ── Step 1 ── */}
          <motion.div
            custom={0} variants={cardVariants}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="flex flex-col"
          >
            <div className="flex h-[280px] items-center justify-center overflow-hidden rounded-3xl border border-black/[0.07] bg-[#F3F4F6] px-8">
              <SignUpMock
                key={`s1-${round}`}
                active={activeCard === 1}
                onComplete={handleCard1Complete}
              />
            </div>
            <div className="mt-6">
              <div className="mb-2 flex items-baseline gap-3">
                <span className="text-[2.4rem] font-light leading-none text-black/50">01</span>
                <h3 className="text-lg font-semibold text-[#111827]">Sign Up for Free</h3>
              </div>
              <p className="text-sm leading-relaxed text-black/50">
                Create your account in seconds — no credit card, no commitments.
                Just your ambition and a place to build.
              </p>
            </div>
          </motion.div>

          <div className="hidden lg:flex items-start justify-center pt-[114px]">
            <StepArrow1 />
          </div>

          {/* ── Step 2 ── */}
          <motion.div
            custom={1} variants={cardVariants}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="flex flex-col"
          >
            <div className="flex h-[280px] items-center justify-center overflow-hidden rounded-3xl border border-black/[0.07] bg-[#F3F4F6] px-8">
              <DomainPickerMock
                key={`s2-${round}`}
                active={activeCard === 2}
                onComplete={handleCard2Complete}
              />
            </div>
            <div className="mt-6">
              <div className="mb-2 flex items-baseline gap-3">
                <span className="text-[2.4rem] font-light leading-none text-black/50">02</span>
                <h3 className="text-lg font-semibold text-[#111827]">Choose Your Roadmap</h3>
              </div>
              <p className="text-sm leading-relaxed text-black/50">
                Pick from 14+ tech domains. We surface exactly what top
                companies are hiring for — right now, not last year.
              </p>
            </div>
          </motion.div>

          <div className="hidden lg:flex items-start justify-center pt-[114px]">
            <StepArrow2 />
          </div>

          {/* ── Step 3 ── */}
          <motion.div
            custom={2} variants={cardVariants}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="flex flex-col"
          >
            <div className="flex h-[280px] items-center justify-center overflow-hidden rounded-3xl border border-black/[0.07] bg-[#F3F4F6] px-8">
              <PersonalizeMock
                key={`s3-${round}`}
                active={activeCard === 3}
                onComplete={handleCard3Complete}
              />
            </div>
            <div className="mt-6">
              <div className="mb-2 flex items-baseline gap-3">
                <span className="text-[2.4rem] font-light leading-none text-black/50">03</span>
                <h3 className="text-lg font-semibold text-[#111827]">Hyperpersonalize It</h3>
              </div>
              <p className="text-sm leading-relaxed text-black/50">
                Tell us your level, pace, and goal. Your roadmap reshapes
                itself to fit <em>you</em> — nobody else gets the same path.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
