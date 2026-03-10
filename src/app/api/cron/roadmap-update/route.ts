/**
 * POST /api/cron/roadmap-update
 *
 * Triggered by GitHub Actions on the 1st of every month at 3am UTC (after market research).
 * Generates AI-powered roadmaps for 14 tech domains using market research data.
 *
 * COST PROTECTION LAYERS:
 * 1. CRON_SECRET validation — only GitHub Actions (with the secret) can call this
 * 2. Pipeline lock (648h window = 27 days) — won't run again if already ran within window
 * 3. Gemini token cap enforced inside roadmap-generator-agent (4096 tokens per domain)
 * 4. Sequential processing with 3000ms delays prevents burst spending
 */

import { NextRequest, NextResponse } from 'next/server';
import { acquireLock, releaseLock } from '@/lib/pipeline-guard';
import { runRoadmapGeneratorAgent } from '@/lib/agents/roadmap-generator-agent';

export const runtime = 'nodejs';
export const maxDuration = 300;

const WINDOW_HOURS = 648; // 27 days
const JOB_NAME = 'roadmap-update' as const;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('[cron/roadmap-update] CRON_SECRET env var is not set. Rejecting all requests.');
    return false;
  }
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  // ── 1. Authenticate ─────────────────────────────────────────────────────────
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── 2. Acquire execution lock ────────────────────────────────────────────────
  const lock = await acquireLock(JOB_NAME, WINDOW_HOURS);

  if (!lock.acquired) {
    console.log(`[cron/roadmap-update] Skipped — ${lock.reason}`);
    return NextResponse.json(
      { skipped: true, reason: lock.reason },
      { status: 200 }
    );
  }

  const { runId } = lock;

  // ── 3. Run the agent ─────────────────────────────────────────────────────────
  try {
    const result = await runRoadmapGeneratorAgent();

    await releaseLock(JOB_NAME, runId, result.success);

    return NextResponse.json({
      success: result.success,
      domainsProcessed: result.domainsProcessed,
      errors: result.errors,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[cron/roadmap-update] Agent failed:', message);

    await releaseLock(JOB_NAME, runId, false, message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// Block GET requests — this is a write operation only
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
