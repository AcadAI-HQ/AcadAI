/**
 * Per-user in-memory rate limiter for AI Mentor chat.
 *
 * Two tiers of protection:
 *   1. Burst  — sliding window (default: 10 requests / 60 s)
 *   2. Daily  — fixed window   (default: 50 requests / 24 h)
 *
 * Why in-memory?
 *   Firestore is too slow and expensive for increment-on-every-request.
 *   In-memory is fine for a single-instance deploy. If you scale to
 *   multiple instances, swap to a Redis store (see "Redis upgrade" below).
 *
 * All limits are configurable via environment variables and can be
 * overridden per-user tier (free / premium / admin).
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

// ---------------------------------------------------------------------------
// Configuration — override via .env
// ---------------------------------------------------------------------------

const BURST_LIMIT      = parseInt(process.env.RATE_LIMIT_BURST_MAX || '10', 10);
const BURST_WINDOW_SEC = parseInt(process.env.RATE_LIMIT_BURST_WINDOW_SEC || '60', 10);
const DAILY_LIMIT      = parseInt(process.env.RATE_LIMIT_MESSAGES_PER_DAY || '50', 10);
const DAILY_WINDOW_SEC = 24 * 60 * 60; // 24 hours (fixed)

// Garbage-collection interval for stale map entries
const GC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RateLimitTier {
  burstLimit: number;
  burstWindowSec: number;
  dailyLimit: number;
}

interface UserBucket {
  /** Sliding window: timestamps (epoch ms) of recent burst requests */
  burstTimestamps: number[];
  /** Fixed window: message count in the current daily window */
  dailyCount: number;
  /** Epoch ms when the current daily window started */
  dailyWindowStart: number;
}

interface RateLimitResult {
  allowed: boolean;
  limitType?: 'burst' | 'daily';
  /** The limit that applies (for X-RateLimit-Limit header) */
  limit: number;
  /** Remaining requests in the tightest window */
  remaining: number;
  /** Unix epoch seconds when the current window resets */
  resetEpochSec: number;
  /** Seconds the client should wait before retrying (0 if allowed) */
  retryAfterSec: number;
  /** Human-readable message for 429 responses */
  message?: string;
}

// ---------------------------------------------------------------------------
// Tier presets — extend these as you add plans
// ---------------------------------------------------------------------------

const DEFAULT_TIER: RateLimitTier = {
  burstLimit: BURST_LIMIT,
  burstWindowSec: BURST_WINDOW_SEC,
  dailyLimit: DAILY_LIMIT,
};

/**
 * Predefined tier configurations.
 * To activate tiered limits, uncomment the Firestore lookup in
 * getTierForUser() below.
 */
const TIER_PRESETS: Record<string, RateLimitTier> = {
  free: { ...DEFAULT_TIER },
  premium: {
    burstLimit: 20,
    burstWindowSec: BURST_WINDOW_SEC,
    dailyLimit: 200,
  },
  admin: {
    burstLimit: 100,
    burstWindowSec: BURST_WINDOW_SEC,
    dailyLimit: 10_000,
  },
};

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------

const store = new Map<string, UserBucket>();

// ---------------------------------------------------------------------------
// Tier resolution (sync for speed — see async upgrade path below)
// ---------------------------------------------------------------------------

/**
 * Resolve the rate-limit tier for a given request.
 *
 * Current behaviour: returns DEFAULT_TIER for everyone.
 *
 * === Upgrade path: tiered limits from Firestore (cached) ===
 *
 * 1. Import your Firestore `db` instance.
 * 2. Add a TTL cache so you only read once every N minutes per user:
 *
 *    const tierCache = new Map<string, { tier: RateLimitTier; exp: number }>();
 *    const CACHE_TTL = 5 * 60 * 1000; // 5 min
 *
 *    async function getTierForUser(req: AuthenticatedRequest): Promise<RateLimitTier> {
 *      const uid = req.user?.uid;
 *      if (!uid) return DEFAULT_TIER;
 *
 *      const cached = tierCache.get(uid);
 *      if (cached && Date.now() < cached.exp) return cached.tier;
 *
 *      const snap = await db.collection('users').doc(uid).get();
 *      const plan = snap.data()?.subscription?.tier || 'free';
 *      const tier = TIER_PRESETS[plan] || DEFAULT_TIER;
 *      tierCache.set(uid, { tier, exp: Date.now() + CACHE_TTL });
 *      return tier;
 *    }
 *
 * 3. Change mentorRateLimiter to `async` and `await getTierForUser(req)`.
 *
 * === Upgrade path: Redis (multi-instance) ===
 *
 * Replace the in-memory `store` Map with redis commands:
 *   - Burst: use a sorted set (ZADD + ZRANGEBYSCORE + ZCARD)
 *   - Daily: use INCR with EXPIREAT set to end-of-day
 * Or use the `rate-limit-redis` package with `express-rate-limit`.
 */
function getTierForUser(_req: AuthenticatedRequest): RateLimitTier {
  // Read from custom claims:  req.user?.customClaims?.plan
  // Read from cached Firestore: see docstring above
  return DEFAULT_TIER;
}

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

function getBucket(userId: string): UserBucket {
  let bucket = store.get(userId);
  if (!bucket) {
    bucket = {
      burstTimestamps: [],
      dailyCount: 0,
      dailyWindowStart: Date.now(),
    };
    store.set(userId, bucket);
  }
  return bucket;
}

/**
 * Check both limits and, if allowed, consume one token from each window.
 * Returns a result object used for headers and the 429 body.
 */
function checkAndConsume(userId: string, tier: RateLimitTier): RateLimitResult {
  const now = Date.now();
  const bucket = getBucket(userId);

  // --- 1. Burst: sliding window ---
  const burstWindowMs = tier.burstWindowSec * 1000;
  // Evict timestamps outside the current window
  bucket.burstTimestamps = bucket.burstTimestamps.filter(
    (ts) => now - ts < burstWindowMs
  );

  if (bucket.burstTimestamps.length >= tier.burstLimit) {
    const oldest = bucket.burstTimestamps[0];
    const resetMs = oldest + burstWindowMs;
    const retryAfterSec = Math.ceil((resetMs - now) / 1000);

    return {
      allowed: false,
      limitType: 'burst',
      limit: tier.burstLimit,
      remaining: 0,
      resetEpochSec: Math.ceil(resetMs / 1000),
      retryAfterSec: Math.max(1, retryAfterSec),
      message: `Too many requests. Please wait ${retryAfterSec} seconds before trying again.`,
    };
  }

  // --- 2. Daily: fixed window ---
  const dailyWindowMs = DAILY_WINDOW_SEC * 1000;
  if (now - bucket.dailyWindowStart >= dailyWindowMs) {
    // Window expired — reset
    bucket.dailyCount = 0;
    bucket.dailyWindowStart = now;
  }

  if (bucket.dailyCount >= tier.dailyLimit) {
    const resetMs = bucket.dailyWindowStart + dailyWindowMs;
    const retryAfterSec = Math.ceil((resetMs - now) / 1000);

    return {
      allowed: false,
      limitType: 'daily',
      limit: tier.dailyLimit,
      remaining: 0,
      resetEpochSec: Math.ceil(resetMs / 1000),
      retryAfterSec: Math.max(1, retryAfterSec),
      message: `You've reached your daily limit of ${tier.dailyLimit} mentor messages. Please try again tomorrow.`,
    };
  }

  // --- 3. Allowed — consume a token in both windows ---
  bucket.burstTimestamps.push(now);
  bucket.dailyCount++;

  const burstRemaining = tier.burstLimit - bucket.burstTimestamps.length;
  const dailyRemaining = tier.dailyLimit - bucket.dailyCount;

  // Report whichever constraint is tighter
  const burstTighter = burstRemaining < dailyRemaining;
  const remaining = Math.min(burstRemaining, dailyRemaining);
  const resetMs = burstTighter
    ? bucket.burstTimestamps[0] + burstWindowMs
    : bucket.dailyWindowStart + dailyWindowMs;

  return {
    allowed: true,
    limit: burstTighter ? tier.burstLimit : tier.dailyLimit,
    remaining,
    resetEpochSec: Math.ceil(resetMs / 1000),
    retryAfterSec: 0,
  };
}

// ---------------------------------------------------------------------------
// Garbage collection — purge users with no recent activity
// ---------------------------------------------------------------------------

function runGC(): void {
  const now = Date.now();
  const maxAge = DAILY_WINDOW_SEC * 1000;

  for (const [userId, bucket] of store) {
    const windowExpired = now - bucket.dailyWindowStart > maxAge;
    const noBurst = bucket.burstTimestamps.length === 0 ||
      now - bucket.burstTimestamps[bucket.burstTimestamps.length - 1] > maxAge;

    if (windowExpired && noBurst) {
      store.delete(userId);
    }
  }
}

const gcTimer = setInterval(runGC, GC_INTERVAL_MS);
// Let Node.js exit even if the timer is still scheduled
if (gcTimer.unref) gcTimer.unref();

// ---------------------------------------------------------------------------
// Express middleware — apply AFTER requireAuth
// ---------------------------------------------------------------------------

/**
 * Rate-limiting middleware for the AI Mentor chat endpoint.
 *
 * Usage:
 *   router.post('/chat', requireAuth, mentorRateLimiter, chatHandler);
 */
export function mentorRateLimiter(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const userId = req.user?.uid;

  // No uid means auth didn't set it — let the route handler return 401
  if (!userId) {
    next();
    return;
  }

  const tier = getTierForUser(req);
  const result = checkAndConsume(userId, tier);

  // Always attach rate-limit headers (even on success)
  res.setHeader('X-RateLimit-Limit', result.limit);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, result.remaining));
  res.setHeader('X-RateLimit-Reset', result.resetEpochSec);

  if (!result.allowed) {
    res.setHeader('Retry-After', result.retryAfterSec);

    console.log(
      `[RateLimit] User ${userId} hit ${result.limitType} limit — ` +
      `retry in ${result.retryAfterSec}s`,
    );

    res.status(429).json({
      error: 'Rate limit exceeded',
      message: result.message,
      retryAfter: result.retryAfterSec,
      limitType: result.limitType,
    });
    return;
  }

  next();
}

// ---------------------------------------------------------------------------
// Utility — expose current usage for the /status endpoint
// ---------------------------------------------------------------------------

export function getUserUsage(userId: string, tier?: RateLimitTier) {
  const t = tier || DEFAULT_TIER;
  const bucket = store.get(userId);
  const now = Date.now();

  if (!bucket) {
    return {
      burstUsed: 0,
      burstLimit: t.burstLimit,
      burstRemaining: t.burstLimit,
      dailyUsed: 0,
      dailyLimit: t.dailyLimit,
      dailyRemaining: t.dailyLimit,
    };
  }

  // Recalculate burst count (filter stale timestamps)
  const burstWindowMs = t.burstWindowSec * 1000;
  const activeBurst = bucket.burstTimestamps.filter(
    (ts) => now - ts < burstWindowMs,
  ).length;

  // Check if daily window needs implicit reset
  const dailyWindowMs = DAILY_WINDOW_SEC * 1000;
  const dailyCount =
    now - bucket.dailyWindowStart >= dailyWindowMs ? 0 : bucket.dailyCount;

  return {
    burstUsed: activeBurst,
    burstLimit: t.burstLimit,
    burstRemaining: Math.max(0, t.burstLimit - activeBurst),
    dailyUsed: dailyCount,
    dailyLimit: t.dailyLimit,
    dailyRemaining: Math.max(0, t.dailyLimit - dailyCount),
  };
}

// Re-export for consumers that need tier info
export { TIER_PRESETS, DEFAULT_TIER };
