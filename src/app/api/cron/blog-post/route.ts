/**
 * POST /api/cron/blog-post
 *
 * Triggered by GitHub Actions every Monday at 2am UTC.
 * Generates one AI blog post and stores it to Firestore.
 *
 * COST PROTECTION LAYERS:
 * 1. CRON_SECRET validation — only GitHub Actions (with the secret) can call this
 * 2. Pipeline lock (144h window) — won't run again if already ran within 6 days
 * 3. Gemini token cap enforced inside blog-writer-agent (≤ 2048 tokens output)
 * 4. Tavily capped at 3 searches per run (inside agent)
 */

import { NextRequest, NextResponse } from 'next/server';
import { acquireLock, releaseLock } from '@/lib/pipeline-guard';
import { runBlogWriterAgent } from '@/lib/agents/blog-writer-agent';

// 144h = 6 days. Weekly cron fires every 7 days, so this gives 1 day of slack.
const WINDOW_HOURS = 144;
const JOB_NAME = 'blog-post' as const;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('[cron/blog-post] CRON_SECRET env var is not set. Rejecting all requests.');
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
    console.log(`[cron/blog-post] Skipped — ${lock.reason}`);
    // Return 200 (not an error) so GitHub Actions doesn't treat it as a failure
    return NextResponse.json(
      { skipped: true, reason: lock.reason },
      { status: 200 }
    );
  }

  const { runId } = lock;

  // ── 3. Run the agent ─────────────────────────────────────────────────────────
  try {
    const result = await runBlogWriterAgent();

    await releaseLock(JOB_NAME, runId, true);

    return NextResponse.json({
      success: true,
      slug: result.slug,
      title: result.title,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[cron/blog-post] Agent failed:', message);

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
