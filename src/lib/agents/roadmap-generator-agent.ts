/**
 * Roadmap Generator Agent
 *
 * Monthly pipeline that:
 * 1. Reads market research data from Firestore for each of 14 domains
 * 2. Generates AI-powered learning roadmaps using Gemini, informed by current market data
 * 3. Validates the generated roadmap structure
 * 4. Stores roadmaps to Firestore `roadmaps/{domain}`
 *
 * Triggered by: POST /api/cron/roadmap-update (called from GitHub Actions monthly, AFTER market research)
 *
 * COST PROTECTION:
 * - 3000ms delay between domains to avoid rate limits
 * - Gemini token cap: 4096 tokens per domain (roadmap budget)
 * - Sequential processing prevents burst spending
 */

import { generateJSON } from '@/lib/gemini-service';
import { adminDb } from '@/lib/firebase-admin';

const MARKET_RESEARCH_COLLECTION = 'market-research';
const ROADMAPS_COLLECTION = 'roadmaps';

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

interface RoadmapStep {
  title: string;
  description: string;
  subtopics: string[];
  resources: string[];
}

interface RoadmapData {
  domain: string;
  overview: string;
  steps: RoadmapStep[];
}

interface MarketResearchDoc {
  inDemandSkills: string[];
  tools: string[];
  frameworks: string[];
  trends: string[];
  summary: string;
}

export interface RoadmapGeneratorResult {
  success: boolean;
  domainsProcessed: number;
  errors: string[];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runRoadmapGeneratorAgent(): Promise<RoadmapGeneratorResult> {
  console.log('[roadmap-generator] Starting monthly roadmap generation across 14 domains...');

  if (!adminDb) {
    throw new Error('[roadmap-generator] Firebase Admin not available. Cannot read/store roadmaps.');
  }

  const errors: string[] = [];
  let domainsProcessed = 0;

  for (let i = 0; i < DOMAINS.length; i++) {
    const domain = DOMAINS[i];
    const displayName = DOMAIN_DISPLAY_NAMES[domain];

    // Delay between domains to avoid rate limits (skip delay for first domain)
    if (i > 0) {
      await delay(3000);
    }

    try {
      console.log(`[roadmap-generator] [${i + 1}/${DOMAINS.length}] Processing: ${displayName}`);

      // ── Step 1: Read market research from Firestore ─────────────────────────
      const researchDoc = await adminDb
        .collection(MARKET_RESEARCH_COLLECTION)
        .doc(domain)
        .get();

      if (!researchDoc.exists) {
        console.warn(
          `[roadmap-generator] No market research found for ${displayName}. Skipping.`
        );
        errors.push(`${domain}: No market research data available`);
        continue;
      }

      const research = researchDoc.data() as MarketResearchDoc;

      // ── Step 2: Generate roadmap with Gemini ────────────────────────────────
      const systemInstruction =
        'You are an expert curriculum designer for tech learning paths. Generate structured, practical roadmaps that take a learner from beginner to job-ready. Return only valid JSON.';

      const prompt = `Generate a comprehensive learning roadmap for ${displayName}.

Current market intelligence for this domain:
- In-demand skills: ${research.inDemandSkills.join(', ')}
- Popular tools: ${research.tools.join(', ')}
- Key frameworks: ${research.frameworks.join(', ')}
- Industry trends: ${research.trends.join(', ')}
- Market summary: ${research.summary}

Return a JSON object with EXACTLY this structure (no markdown wrapper, no extra fields):
{
  "domain": "${displayName}",
  "overview": "A comprehensive 2-3 sentence overview of the ${displayName} learning path, what it covers, and what the learner will achieve.",
  "steps": [
    {
      "title": "Step Title",
      "description": "Clear description of what to learn and why it matters (2-3 sentences).",
      "subtopics": ["subtopic1", "subtopic2", "subtopic3"],
      "resources": ["https://real-url-1.com", "https://real-url-2.com"]
    }
  ]
}

Requirements:
- Generate 12-18 steps that progress from foundations to advanced/specialized topics
- Each step should have 3-6 subtopics
- Each step should have 2-3 resource URLs that are REAL, WORKING links (use official docs, MDN, freeCodeCamp, roadmap.sh, official GitHub repos, etc.)
- Incorporate the in-demand skills, tools, and frameworks from the market data
- Include practical project-based steps
- Cover testing, deployment, and production considerations
- End with career-oriented steps (portfolio, interview prep, specialization)
- Make descriptions actionable and specific, not generic`;

      const roadmap = await generateJSON<RoadmapData>(
        prompt,
        'roadmap',
        systemInstruction
      );

      // ── Step 3: Validate the generated roadmap ──────────────────────────────
      if (!roadmap.domain || !roadmap.overview || !Array.isArray(roadmap.steps)) {
        throw new Error(
          `Invalid roadmap structure: missing domain, overview, or steps array`
        );
      }

      if (roadmap.steps.length < 8) {
        throw new Error(
          `Roadmap has only ${roadmap.steps.length} steps (minimum 8 required)`
        );
      }

      // Validate each step has required fields
      for (let j = 0; j < roadmap.steps.length; j++) {
        const step = roadmap.steps[j];
        if (!step.title || !step.description) {
          throw new Error(`Step ${j + 1} is missing title or description`);
        }
        if (!Array.isArray(step.subtopics)) {
          roadmap.steps[j].subtopics = [];
        }
        if (!Array.isArray(step.resources)) {
          roadmap.steps[j].resources = [];
        }
      }

      // ── Step 4: Store to Firestore ──────────────────────────────────────────
      const now = new Date();

      await adminDb.collection(ROADMAPS_COLLECTION).doc(domain).set({
        domain: roadmap.domain,
        overview: roadmap.overview,
        steps: roadmap.steps,
        generatedAt: now.toISOString(),
        source: 'ai-generated',
      });

      domainsProcessed++;
      console.log(
        `[roadmap-generator] [${i + 1}/${DOMAINS.length}] Done: ${displayName} (${roadmap.steps.length} steps)`
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[roadmap-generator] Failed for ${displayName}:`, message);
      errors.push(`${domain}: ${message}`);
      // Continue to next domain — don't let one failure stop the pipeline
    }
  }

  console.log(
    `[roadmap-generator] Completed. Processed: ${domainsProcessed}/${DOMAINS.length}, Errors: ${errors.length}`
  );

  return {
    success: errors.length === 0,
    domainsProcessed,
    errors,
  };
}
