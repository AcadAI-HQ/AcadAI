/**
 * AI Learning Resources Service
 * Client-side Firestore reads for AI-generated weekly resources.
 *
 * Collection path: `learning-resources/{domain}/weeks/{weekId}`
 * Note: Firestore rules must allow client reads on `learning-resources/{domain}/weeks`
 */

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AIResourceType = 'article' | 'video' | 'course' | 'tool' | 'documentation';
export type AIResourceDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface AIResource {
  title: string;
  url: string;
  type: AIResourceType;
  description: string;
  difficulty: AIResourceDifficulty;
  estimatedTime: string; // e.g. "15 min"
}

export interface AIWeekData {
  weekId: string;        // e.g. "2026-W10"
  domain: string;        // slug e.g. "frontend"
  displayName: string;   // e.g. "Frontend Development"
  weekNumber: number;    // e.g. 10
  year: number;          // e.g. 2026
  updatedAt: string;     // ISO date string
  resources: AIResource[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Cast a raw Firestore document to AIWeekData. */
function toAIWeekData(weekId: string, raw: Record<string, unknown>): AIWeekData {
  return {
    weekId,
    domain: (raw.domain as string) ?? '',
    displayName: (raw.displayName as string) ?? '',
    weekNumber: (raw.weekNumber as number) ?? 0,
    year: (raw.year as number) ?? 0,
    updatedAt: (raw.updatedAt as string) ?? '',
    resources: (raw.resources as AIResource[]) ?? [],
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch up to the last 12 weeks of AI-generated resources for a domain.
 * Results are returned sorted newest first (highest weekNumber first).
 *
 * @param domain - domain slug, e.g. "frontend"
 */
export async function getAIResourcesForDomain(domain: string): Promise<AIWeekData[]> {
  try {
    const weeksRef = collection(db, 'learning-resources', domain, 'weeks');
    const q = query(weeksRef, orderBy('weekNumber', 'desc'), limit(12));
    const snap = await getDocs(q);

    return snap.docs.map((d) => toAIWeekData(d.id, d.data() as Record<string, unknown>));
  } catch (error) {
    console.error(`[ai-learning-resources] Failed to fetch resources for domain "${domain}":`, error);
    return [];
  }
}

/**
 * Fetch only the most recent AI-generated week for a domain.
 *
 * @param domain - domain slug, e.g. "frontend"
 * @returns The latest AIWeekData, or null if none exists.
 */
export async function getLatestAIWeekForDomain(domain: string): Promise<AIWeekData | null> {
  try {
    const weeksRef = collection(db, 'learning-resources', domain, 'weeks');
    const q = query(weeksRef, orderBy('weekNumber', 'desc'), limit(1));
    const snap = await getDocs(q);

    if (snap.empty) return null;

    const d = snap.docs[0];
    return toAIWeekData(d.id, d.data() as Record<string, unknown>);
  } catch (error) {
    console.error(`[ai-learning-resources] Failed to fetch latest week for domain "${domain}":`, error);
    return null;
  }
}

/**
 * Quick existence check — returns true if at least one AI week doc exists for
 * the given domain.
 *
 * @param domain - domain slug, e.g. "frontend"
 */
export async function hasAIResourcesForDomain(domain: string): Promise<boolean> {
  try {
    const weeksRef = collection(db, 'learning-resources', domain, 'weeks');
    const q = query(weeksRef, limit(1));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.error(`[ai-learning-resources] Failed to check AI resources for domain "${domain}":`, error);
    return false;
  }
}

/**
 * Fetch a single AI-generated week by its weekId string (e.g. "2026-W10").
 *
 * @param domain  - domain slug, e.g. "frontend"
 * @param weekId  - week document ID, e.g. "2026-W10"
 */
export async function getAIWeekById(domain: string, weekId: string): Promise<AIWeekData | null> {
  try {
    const weekRef = doc(db, 'learning-resources', domain, 'weeks', weekId);
    const snap = await getDoc(weekRef);

    if (!snap.exists()) return null;

    return toAIWeekData(snap.id, snap.data() as Record<string, unknown>);
  } catch (error) {
    console.error(`[ai-learning-resources] Failed to fetch week "${weekId}" for domain "${domain}":`, error);
    return null;
  }
}
