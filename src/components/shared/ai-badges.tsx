'use client';

import { Sparkles, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

// ─── AiCuratedBadge ────────────────────────────────────────────────────────────
// Purple pill with Sparkles icon. Used next to week counts in DomainResourceCard,
// WeeklyResourceCard headers, and the domain resource list page header.
export function AiCuratedBadge() {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'backOut' }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-[#8E2DE2]/15 text-[#C084FC] border border-[#8E2DE2]/25"
    >
      <Sparkles className="h-2.5 w-2.5" />
      AI Curated
    </motion.span>
  );
}

// ─── AiGeneratedBadge ──────────────────────────────────────────────────────────
// Blue pill with BrainCircuit icon. Used in the roadmap page header when
// source === 'ai-generated'.
export function AiGeneratedBadge() {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'backOut' }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/25"
    >
      <BrainCircuit className="h-2.5 w-2.5" />
      AI Generated
    </motion.span>
  );
}

// ─── FreshIndicator ────────────────────────────────────────────────────────────
// Green pulse dot + "Updated Xd ago" text.
// Shown when daysAgo <= 14.
interface FreshIndicatorProps {
  daysAgo: number;
}

export function FreshIndicator({ daysAgo }: FreshIndicatorProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse flex-shrink-0" />
      <span className="text-[11px] text-muted-foreground">
        Updated {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
      </span>
    </span>
  );
}

// ─── StaleIndicator ────────────────────────────────────────────────────────────
// Gray static dot + "Updated Xd ago" text.
// Shown when daysAgo > 14. No animation — communicates inactivity.
interface StaleIndicatorProps {
  daysAgo: number;
}

export function StaleIndicator({ daysAgo }: StaleIndicatorProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-[#6B7280] flex-shrink-0" />
      <span className="text-[11px] text-muted-foreground">
        Updated {daysAgo}d ago
      </span>
    </span>
  );
}

// ─── ContentFreshness ──────────────────────────────────────────────────────────
// Utility component that auto-selects FreshIndicator or StaleIndicator
// based on the updatedAt date. Threshold: 14 days.
interface ContentFreshnessProps {
  updatedAt: Date | string;
}

export function ContentFreshness({ updatedAt }: ContentFreshnessProps) {
  const date = typeof updatedAt === 'string' ? new Date(updatedAt) : updatedAt;
  const daysAgo = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  const isFresh = daysAgo <= 14;

  return isFresh
    ? <FreshIndicator daysAgo={daysAgo} />
    : <StaleIndicator daysAgo={daysAgo} />;
}
