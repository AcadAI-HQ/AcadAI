/**
 * Market Research Agent
 *
 * Monthly pipeline that:
 * 1. Searches for current market data across 14 tech domains via Tavily (3 searches per domain)
 * 2. Aggregates search results (max 6 per domain)
 * 3. Extracts structured market intelligence with Gemini
 * 4. Stores results to Firestore `market-research/{domain}`
 *
 * Triggered by: POST /api/cron/market-research (called from GitHub Actions monthly)
 *
 * COST PROTECTION:
 * - 3 Tavily searches x 14 domains = 42 searches per run (well within 1000/month free tier)
 * - 2000ms delay between domains to avoid rate limits
 * - Gemini token cap: 1024 tokens per domain (market_research budget)
 */

import { tavilySearch } from '@/lib/tavily-service';
import { generateJSON } from '@/lib/gemini-service';
import { adminDb } from '@/lib/firebase-admin';

const MARKET_RESEARCH_COLLECTION = 'market-research';

const DOMAINS = [
  'frontend',
  'backend',
  'fullstack',
  'ml',
  'devops',
  'android',
  'ios',
  'blockchain',
  'ui-ux',
  'product-engineering',
  'game-dev-aaa',
  'game-dev-indie',
  'cybersecurity',
  'data-science',
] as const;

const DOMAIN_DISPLAY_NAMES: Record<string, string> = {
  frontend: 'Frontend Development',
  backend: 'Backend Development',
  fullstack: 'Fullstack Development',
  ml: 'Machine Learning',
  devops: 'DevOps',
  android: 'Android Development',
  ios: 'iOS Development',
  blockchain: 'Blockchain Development',
  'ui-ux': 'UI/UX Design',
  'product-engineering': 'Product Engineering',
  'game-dev-aaa': 'AAA Game Development',
  'game-dev-indie': 'Indie Game Development',
  cybersecurity: 'Cybersecurity',
  'data-science': 'Data Science',
};

interface MarketResearchData {
  inDemandSkills: string[];
  tools: string[];
  frameworks: string[];
  trends: string[];
  summary: string;
}

export interface MarketResearchResult {
  success: boolean;
  domainsProcessed: number;
  errors: string[];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runMarketResearchAgent(): Promise<MarketResearchResult> {
  console.log('[market-research] Starting monthly market research across 14 domains...');

  if (!adminDb) {
    throw new Error('[market-research] Firebase Admin not available. Cannot store research data.');
  }

  const errors: string[] = [];
  let domainsProcessed = 0;

  for (let i = 0; i < DOMAINS.length; i++) {
    const domain = DOMAINS[i];
    const displayName = DOMAIN_DISPLAY_NAMES[domain];

    // Delay between domains to avoid rate limits (skip delay for first domain)
    if (i > 0) {
      await delay(2000);
    }

    try {
      console.log(`[market-research] [${i + 1}/${DOMAINS.length}] Processing: ${displayName}`);

      // ── Step 1: Run 3 Tavily searches ───────────────────────────────────────
      const [skillsResults, toolsResults, salaryResults] = await Promise.all([
        tavilySearch(`${displayName} developer skills jobs hiring 2026`, {
          maxResults: 3,
          days: 30,
        }),
        tavilySearch(`top ${displayName} frameworks tools companies 2026`, {
          maxResults: 3,
          days: 30,
        }),
        tavilySearch(`${displayName} engineer salary requirements 2026`, {
          maxResults: 3,
          days: 30,
        }),
      ]);

      // ── Step 2: Aggregate results (max 6 total) ────────────────────────────
      const allResults = [...skillsResults, ...toolsResults, ...salaryResults].slice(0, 6);

      if (allResults.length === 0) {
        console.warn(`[market-research] No search results for ${displayName}. Skipping.`);
        errors.push(`${domain}: No search results returned`);
        continue;
      }

      const searchContext = allResults
        .map((r, idx) => `${idx + 1}. ${r.title}\n   ${r.content.slice(0, 200)}`)
        .join('\n\n');

      // ── Step 3: Extract structured data with Gemini ─────────────────────────
      const systemInstruction =
        'You are a tech industry analyst. Extract structured market intelligence from search results. Return only valid JSON.';

      const prompt = `Analyze these recent search results about the ${displayName} job market and technology landscape:

${searchContext}

Return a JSON object with EXACTLY this structure (no markdown wrapper, no extra fields):
{
  "inDemandSkills": ["skill1", "skill2", ...],
  "tools": ["tool1", "tool2", ...],
  "frameworks": ["framework1", "framework2", ...],
  "trends": ["trend1", "trend2", ...],
  "summary": "A concise 2-3 sentence summary of the current ${displayName} market landscape."
}

Guidelines:
- inDemandSkills: 5-10 most in-demand skills for ${displayName} roles
- tools: 5-8 top tools and technologies being used
- frameworks: 4-8 popular frameworks and libraries
- trends: 3-5 key industry trends
- summary: Brief market overview mentioning demand, salary trends, and key shifts`;

      const research = await generateJSON<MarketResearchData>(
        prompt,
        'market_research',
        systemInstruction
      );

      // ── Step 4: Store to Firestore ──────────────────────────────────────────
      const now = new Date();

      await adminDb.collection(MARKET_RESEARCH_COLLECTION).doc(domain).set({
        domain,
        displayName,
        inDemandSkills: research.inDemandSkills ?? [],
        tools: research.tools ?? [],
        frameworks: research.frameworks ?? [],
        trends: research.trends ?? [],
        summary: research.summary ?? '',
        updatedAt: now.toISOString(),
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      });

      domainsProcessed++;
      console.log(`[market-research] [${i + 1}/${DOMAINS.length}] Done: ${displayName}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[market-research] Failed for ${displayName}:`, message);
      errors.push(`${domain}: ${message}`);
      // Continue to next domain — don't let one failure stop the pipeline
    }
  }

  console.log(
    `[market-research] Completed. Processed: ${domainsProcessed}/${DOMAINS.length}, Errors: ${errors.length}`
  );

  return {
    success: errors.length === 0,
    domainsProcessed,
    errors,
  };
}
