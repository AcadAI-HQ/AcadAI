/**
 * POST /api/cron/learning-resources
 *
 * Triggered by GitHub Actions every Monday at 2am UTC (after blog-post).
 * Generates curated learning resources for all 14 domains and stores to Firestore.
 *
 * COST PROTECTION LAYERS:
 * 1. CRON_SECRET validation — only GitHub Actions (with the secret) can call this
 * 2. Pipeline lock (144h window) — won't run again if already ran within 6 days
 * 3. Gemini token cap enforced inside agent (≤ 2048 tokens per domain)
 * 4. Tavily capped at 2 searches per domain (28 total) inside agent
 * 5. 1500ms delay between domains to respect Gemini 15 RPM free-tier limit
 */

import { NextRequest, NextResponse } from 'next/server';
import { acquireLock, releaseLock } from '@/lib/pipeline-guard';
import { runLearningResourcesAgent } from '@/lib/agents/learning-resources-agent';

export const runtime = 'nodejs';
export const maxDuration = 300;

// 144h = 6 days. Weekly cron fires every 7 days, so this gives 1 day of slack.
const WINDOW_HOURS = 144;
const JOB_NAME = 'learning-resources' as const;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('[cron/learning-resources] CRON_SECRET env var is not set. Rejecting all requests.');
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
    console.log(`[cron/learning-resources] Skipped — ${lock.reason}`);
    // Return 200 (not an error) so GitHub Actions doesn't treat it as a failure
    return NextResponse.json(
      { skipped: true, reason: lock.reason },
      { status: 200 }
    );
  }

  const { runId } = lock;

  // ── 3. Run the agent ─────────────────────────────────────────────────────────
  try {
    const result = await runLearningResourcesAgent();

    await releaseLock(JOB_NAME, runId, result.success);

    return NextResponse.json({
      success: result.success,
      domainsProcessed: result.domainsProcessed,
      weekId: result.weekId,
      errors: result.errors,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[cron/learning-resources] Agent failed:', message);

    // Always release the lock on failure so next scheduled run isn't blocked
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
