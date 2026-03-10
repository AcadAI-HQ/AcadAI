/**
 * Pipeline Guard — prevents duplicate and runaway AI pipeline executions.
 *
 * COST PROTECTION STRATEGY:
 *
 * 1. IDEMPOTENCY: If a job ran successfully within its time window
 *    (e.g. 6 days for weekly, 25 days for monthly), it will be skipped.
 *    Even if the cron fires multiple times, only one run goes through.
 *
 * 2. PARALLEL RUN PREVENTION: If a job is currently running (status='running'
 *    and started < 2h ago), new triggers are blocked.
 *
 * 3. STALE LOCK RECOVERY: If a job got stuck (status='running' but started > 2h
 *    ago — likely a crash), the stale lock is overridden automatically.
 *
 * 4. AUTH: All cron API routes must independently validate CRON_SECRET.
 *    This is a second layer — the guard protects against logic bugs, not auth.
 *
 * Storage: Firestore collection `_pipeline_locks/{jobName}`
 */

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

const LOCKS_COLLECTION = '_pipeline_locks';
const STALE_LOCK_THRESHOLD_HOURS = 2; // Override a 'running' lock older than this

export type JobName =
  | 'blog-post'
  | 'learning-resources'
  | 'market-research'
  | 'roadmaps'
  | 'roadmap-update';

interface LockDocument {
  status: 'running' | 'completed' | 'failed';
  lastRun: FirebaseFirestore.Timestamp;
  runId: string;
  completedAt?: FirebaseFirestore.Timestamp;
  error?: string;
}

type AcquireResult =
  | { acquired: true; runId: string }
  | { acquired: false; reason: string };

/**
 * Attempt to acquire a named execution lock.
 *
 * @param jobName   Unique identifier for the pipeline job.
 * @param windowHours  How many hours must pass before the job can run again.
 *                     Use 144 (6 days) for weekly jobs, 600 (25 days) for monthly.
 * @returns { acquired: true, runId } — caller should proceed and then call releaseLock.
 *          { acquired: false, reason } — caller should skip and return 200.
 */
export async function acquireLock(
  jobName: JobName,
  windowHours: number
): Promise<AcquireResult> {
  if (!adminDb) {
    return {
      acquired: false,
      reason: 'Firebase Admin SDK not initialized — cannot acquire lock. Check FIREBASE_SERVICE_ACCOUNT env var.',
    };
  }

  const ref = adminDb.collection(LOCKS_COLLECTION).doc(jobName);
  const nowMs = Date.now();

  const snapshot = await ref.get();

  if (snapshot.exists) {
    const lock = snapshot.data() as LockDocument;
    const lastRunMs = lock.lastRun?.toMillis() ?? 0;
    const hoursSince = (nowMs - lastRunMs) / (1000 * 60 * 60);

    if (lock.status === 'running') {
      if (hoursSince < STALE_LOCK_THRESHOLD_HOURS) {
        // Another instance is actively running — block this one
        return {
          acquired: false,
          reason: `Job "${jobName}" is already running (started ${hoursSince.toFixed(1)}h ago). Blocking parallel execution.`,
        };
      }
      // Lock is stale — previous run likely crashed. Override it.
      console.warn(
        `[pipeline-guard] Stale lock detected for "${jobName}" (${hoursSince.toFixed(1)}h old). Overriding.`
      );
    }

    if (lock.status === 'completed' && hoursSince < windowHours) {
      // Job ran successfully within the allowed window — skip
      return {
        acquired: false,
        reason: `Job "${jobName}" completed ${hoursSince.toFixed(1)}h ago (window: ${windowHours}h). Skipping duplicate run.`,
      };
    }
  }

  // Acquire the lock
  const runId = randomUUID();
  await ref.set({
    status: 'running',
    lastRun: FieldValue.serverTimestamp(),
    runId,
  });

  console.log(`[pipeline-guard] Lock acquired: job="${jobName}" runId=${runId}`);
  return { acquired: true, runId };
}

/**
 * Release the lock after a job completes or fails.
 * Always call this — even on failure — so the next scheduled run isn't blocked.
 */
export async function releaseLock(
  jobName: JobName,
  runId: string,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  if (!adminDb) return;

  const ref = adminDb.collection(LOCKS_COLLECTION).doc(jobName);

  await ref.update({
    status: success ? 'completed' : 'failed',
    completedAt: FieldValue.serverTimestamp(),
    ...(errorMessage ? { error: errorMessage.slice(0, 500) } : {}),
  });

  console.log(
    `[pipeline-guard] Lock released: job="${jobName}" runId=${runId} success=${success}`
  );
}
