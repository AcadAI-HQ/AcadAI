'use client';

import { BrainCircuit, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// ─── Internal types ─────────────────────────────────────────────────────────

interface AiStatusRow {
  label: string;
  value: string;
  daysAgo: number;
  href?: string;
}

export interface AiEngineStatusCardProps {
  roadmapUpdatedDaysAgo: number;
  resourcesRefreshedDaysAgo: number;
  latestBlogTitle: string;
  latestBlogSlug: string;
}

// ─── StatusRow sub-component ─────────────────────────────────────────────────
// Renders a single row: pulsing/static dot + label on the left, value on the right.
// Green pulse dot when daysAgo <= 14, gray static dot when older.

function StatusRow({ label, value, daysAgo, href }: AiStatusRow) {
  const isFresh = daysAgo <= 14;

  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            isFresh ? 'bg-[#22C55E] animate-pulse' : 'bg-[#6B7280]'
          }`}
        />
        <span className="text-[12px] text-muted-foreground truncate">{label}</span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 ml-3">
        {href ? (
          <Link
            href={href}
            className="text-[12px] text-[#60A5FA] hover:text-[#3B82F6] hover:underline transition-colors flex items-center gap-0.5"
          >
            {value}
            <ExternalLink className="h-2.5 w-2.5" />
          </Link>
        ) : (
          <span className="text-[12px] text-foreground/70 font-medium">{value}</span>
        )}
      </div>
    </div>
  );
}

// ─── AiEngineStatusCard ──────────────────────────────────────────────────────
// Dashboard card showing live AI pipeline status: roadmap freshness,
// resource refresh date, and the latest AI-authored blog post.
//
// Placement: between the Quick Access grid and the Domain picker.

export function AiEngineStatusCard({
  roadmapUpdatedDaysAgo,
  resourcesRefreshedDaysAgo,
  latestBlogTitle,
  latestBlogSlug,
}: AiEngineStatusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-gradient-to-br from-[#3B82F6]/5 to-[#8E2DE2]/5 border border-[#3B82F6]/10 rounded-xl p-4"
    >
      {/* Card header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0">
          <BrainCircuit className="h-3.5 w-3.5 text-[#60A5FA]" />
        </div>
        <span className="text-[13px] font-semibold text-foreground/80">AI Engine</span>
        {/* Live badge — only the inner dot pulses, the badge itself is static */}
        <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wider bg-[#22C55E]/12 text-[#22C55E] border border-[#22C55E]/20">
          <span className="w-1 h-1 rounded-full bg-[#22C55E] animate-pulse" />
          Live
        </span>
      </div>

      {/* Divider — extremely subtle, just separates header from rows */}
      <div className="h-px bg-white/5 mb-2" />

      {/* Status rows */}
      <div className="space-y-0">
        <StatusRow
          label="Roadmaps"
          value={
            roadmapUpdatedDaysAgo === 0
              ? 'Updated today'
              : `Updated ${roadmapUpdatedDaysAgo}d ago`
          }
          daysAgo={roadmapUpdatedDaysAgo}
        />
        <StatusRow
          label="Learning Resources"
          value={
            resourcesRefreshedDaysAgo === 0
              ? 'Refreshed today'
              : `Refreshed ${resourcesRefreshedDaysAgo}d ago`
          }
          daysAgo={resourcesRefreshedDaysAgo}
        />
        <StatusRow
          label="Latest post"
          value={
            latestBlogTitle.length > 32
              ? latestBlogTitle.slice(0, 32) + '\u2026'
              : latestBlogTitle
          }
          daysAgo={0}
          href={`/blog/${latestBlogSlug}`}
        />
      </div>
    </motion.div>
  );
}
