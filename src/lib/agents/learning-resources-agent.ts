/**
 * Learning Resources Agent
 *
 * Weekly pipeline that generates curated learning resources for all 14 domains.
 * For each domain:
 * 1. Runs 2 Tavily searches (tutorials + tools/releases)
 * 2. Curates 5-7 resources via Gemini 2.0 Flash
 * 3. Stores to Firestore `learning-resources/{domain}/weeks/{weekId}`
 *
 * Sequential processing with 1500ms delay between domains to respect
 * Gemini free-tier 15 RPM limit.
 *
 * Triggered by: POST /api/cron/learning-resources (called from GitHub Actions weekly)
 */

import { tavilySearch } from '@/lib/tavily-service';
import { generateJSON } from '@/lib/gemini-service';
import { adminDb } from '@/lib/firebase-admin';

// ── Domain configuration ────────────────────────────────────────────────────────

const DOMAINS: { key: string; displayName: string }[] = [
  { key: 'frontend', displayName: 'Frontend Development' },
  { key: 'backend', displayName: 'Backend Development' },
  { key: 'fullstack', displayName: 'Fullstack Development' },
  { key: 'ml', displayName: 'Machine Learning' },
  { key: 'devops', displayName: 'DevOps' },
  { key: 'android', displayName: 'Android Development' },
  { key: 'ios', displayName: 'iOS Development' },
  { key: 'blockchain', displayName: 'Blockchain Development' },
  { key: 'ui-ux', displayName: 'UI/UX Design' },
  { key: 'product-engineering', displayName: 'Product Engineering' },
  { key: 'game-dev-aaa', displayName: 'AAA Game Development' },
  { key: 'game-dev-indie', displayName: 'Indie Game Development' },
  { key: 'cybersecurity', displayName: 'Cybersecurity' },
  { key: 'data-science', displayName: 'Data Science' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────────

/**
 * Returns the ISO week identifier in "YYYY-WNN" format.
 */
function getWeekId(date: Date = new Date()): { weekId: string; year: number; weekNumber: number } {
  // ISO week calculation
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number (Monday=1, Sunday=7)
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  const year = d.getUTCFullYear();
  const weekId = `${year}-W${String(weekNumber).padStart(2, '0')}`;
  return { weekId, year, weekNumber };
}

function getMonthName(): string {
  return new Date().toLocaleString('en-US', { month: 'long' });
}

function getYear(): number {
  return new Date().getFullYear();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Types ────────────────────────────────────────────────────────────────────────

interface Resource {
  title: string;
  url: string;
  type: 'article' | 'video' | 'course' | 'tool' | 'documentation';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

interface GeneratedResources {
  resources: Resource[];
}

export interface LearningResourcesResult {
  success: boolean;
  domainsProcessed: number;
  weekId: string;
  errors: string[];
}

// ── Main agent ───────────────────────────────────────────────────────────────────

async function processDomain(
  domain: { key: string; displayName: string },
  weekId: string,
  year: number,
  weekNumber: number
): Promise<void> {
  const monthName = getMonthName();
  const currentYear = getYear();

  // ── Tavily searches (2 per domain) ──────────────────────────────────────────
  const [tutorials, tools] = await Promise.all([
    tavilySearch(`best ${domain.displayName} tutorial article ${monthName} ${currentYear}`, {
      maxResults: 3,
    }),
    tavilySearch(`new ${domain.displayName} tools releases ${monthName} ${currentYear}`, {
      maxResults: 3,
    }),
  ]);

  const allResults = [...tutorials, ...tools].slice(0, 6);

  if (allResults.length === 0) {
    throw new Error(`No search results found for ${domain.displayName}`);
  }

  const searchContext = allResults
    .map((r, i) => `${i + 1}. Title: ${r.title}\n   URL: ${r.url}\n   Summary: ${r.content.slice(0, 200)}`)
    .join('\n\n');

  // ── Gemini curation ─────────────────────────────────────────────────────────
  const systemInstruction = `You are a developer educator curating the best weekly learning content for ${domain.displayName} developers.`;

  const prompt = `Here are recent search results for ${domain.displayName} resources:

${searchContext}

Curate 5-7 of the best learning resources from the search results above. Return a JSON object with EXACTLY this structure (no markdown wrapper, no extra fields):

{
  "resources": [
    {
      "title": "string (clear, concise)",
      "url": "string (real URL from search results)",
      "type": "article|video|course|tool|documentation",
      "description": "string (2 sentences max, what you'll learn)",
      "difficulty": "beginner|intermediate|advanced",
      "estimatedTime": "string (e.g. '15 min', '2 hours')"
    }
  ]
}

IMPORTANT RULES:
- Only use URLs that appear in the search results above. Do NOT invent URLs.
- Each resource must have a real URL from the search results provided.
- Return 5-7 resources total.
- Vary the difficulty levels across beginner, intermediate, and advanced.`;

  const generated = await generateJSON<GeneratedResources>(
    prompt,
    'weekly_resources',
    systemInstruction
  );

  // ── Validate ────────────────────────────────────────────────────────────────
  if (!generated.resources || !Array.isArray(generated.resources) || generated.resources.length < 3) {
    throw new Error(
      `Validation failed for ${domain.displayName}: expected at least 3 resources, got ${generated.resources?.length ?? 0}`
    );
  }

  // ── Store to Firestore ──────────────────────────────────────────────────────
  if (!adminDb) {
    throw new Error('[learning-resources] Firebase Admin not available. Cannot store resources.');
  }

  const doc = {
    weekId,
    domain: domain.key,
    displayName: domain.displayName,
    resources: generated.resources,
    updatedAt: new Date().toISOString(),
    year,
    weekNumber,
  };

  await adminDb
    .collection('learning-resources')
    .doc(domain.key)
    .collection('weeks')
    .doc(weekId)
    .set(doc);

  console.log(
    `[learning-resources] Stored ${generated.resources.length} resources for ${domain.displayName} (${weekId})`
  );
}

export async function runLearningResourcesAgent(): Promise<LearningResourcesResult> {
  console.log('[learning-resources] Starting weekly learning resources generation...');

  if (!adminDb) {
    throw new Error('[learning-resources] Firebase Admin not available. Cannot proceed.');
  }

  const { weekId, year, weekNumber } = getWeekId();
  const errors: string[] = [];
  let domainsProcessed = 0;

  for (let i = 0; i < DOMAINS.length; i++) {
    const domain = DOMAINS[i];

    try {
      await processDomain(domain, weekId, year, weekNumber);
      domainsProcessed++;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[learning-resources] Failed for ${domain.displayName}: ${message}`);
      errors.push(`${domain.key}: ${message}`);
    }

    // Delay between domains to respect Gemini free-tier 15 RPM
    // Skip delay after the last domain
    if (i < DOMAINS.length - 1) {
      await delay(1500);
    }
  }

  console.log(
    `[learning-resources] Complete. ${domainsProcessed}/${DOMAINS.length} domains processed. ${errors.length} errors.`
  );

  return {
    success: errors.length === 0,
    domainsProcessed,
    weekId,
    errors,
  };
}
