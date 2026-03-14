/**
 * Blog Writer Agent
 *
 * Weekly pipeline that:
 * 1. Runs SEO gap analysis (2 Tavily searches) to avoid duplicate topics
 * 1b. Searches for trending tech topics via Tavily (3 searches, all within free tier)
 * 2. Picks the most relevant topic for AcadAI's developer audience
 * 3. Generates a full blog post with Gemini 2.0 Flash (≤ 2048 tokens output)
 * 4. Stores the post to Firestore `blog-posts/{slug}`
 *
 * Triggered by: POST /api/cron/blog-post (called from GitHub Actions weekly)
 */

import { tavilySearch } from '@/lib/tavily-service';
import { generateJSON } from '@/lib/gemini-service';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { BlogPost } from '@/types/blog';

const BLOG_POSTS_COLLECTION = 'blog-posts';

// Unsplash photo IDs mapped to topic categories
const COVER_IMAGES: Record<string, string> = {
  career: 'photo-1507003211169-0a1dd7228f2d',
  coding: 'photo-1461749280684-dccba630e2f6',
  learning: 'photo-1456513080510-7bf3a84b82f8',
  team: 'photo-1522071820081-009f0129c71c',
  ai: 'photo-1677442135703-1787eea5ce01',
  interview: 'photo-1573497019940-1c28c88b4f3e',
  tools: 'photo-1517694712202-14dd9538aa97',
};

function buildCoverUrl(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?w=1200&q=80&auto=format`;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/-$/, '');
}

function estimateReadTime(content: string): string {
  const minutes = Math.max(3, Math.ceil(content.split(/\s+/).length / 200));
  return `${minutes} min read`;
}

interface GeneratedPost {
  title: string;
  slug?: string;
  excerpt: string;
  tags: string[];
  coverCategory: keyof typeof COVER_IMAGES;
  content: string;
}

export interface BlogWriterResult {
  success: boolean;
  slug?: string;
  title?: string;
  error?: string;
}

export async function runBlogWriterAgent(): Promise<BlogWriterResult> {
  console.log('[blog-writer] Starting weekly blog post generation...');

  if (!adminDb) {
    throw new Error('[blog-writer] Firebase Admin not available. Cannot read/store posts.');
  }

  // ── Step 0: SEO Gap Analysis ─────────────────────────────────────────────────
  // Read existing blog posts from Firestore (avoid duplicate topics) + search trending
  const [existingSnapshot, trendingInSpace] = await Promise.all([
    adminDb.collection(BLOG_POSTS_COLLECTION).orderBy('createdAt', 'desc').limit(20).get(),
    tavilySearch('developer learning platform blog topics trending 2026', {
      maxResults: 5,
    }),
  ]);

  const existingTopics = existingSnapshot.docs
    .map((d) => `- ${d.data().title}`)
    .join('\n');

  const trendingTopics = trendingInSpace
    .map((r) => `- ${r.title}: ${r.content.slice(0, 120)}`)
    .join('\n');

  console.log(
    `[blog-writer] SEO analysis: ${existingSnapshot.size} existing posts found, ${trendingInSpace.length} trending topics found`
  );

  // ── Step 1: Gather trending topics (3 Tavily searches) ──────────────────────
  const [techTrends, careerTrends, learningTrends] = await Promise.all([
    tavilySearch('trending developer tools programming languages 2026', {
      maxResults: 4,
    }),
    tavilySearch('software engineer career job market skills hiring 2026', {
      maxResults: 4,
    }),
    tavilySearch('learn programming self-taught developer path 2026', {
      maxResults: 3,
    }),
  ]);

  const allResults = [...techTrends, ...careerTrends, ...learningTrends];

  const topicContext = allResults
    .slice(0, 8)
    .map((r, i) => `${i + 1}. ${r.title}\n   ${r.content.slice(0, 180)}`)
    .join('\n\n');

  // ── Step 2: Generate blog post ───────────────────────────────────────────────
  const systemInstruction = `You are a senior developer and technical writer for AcadAI — a free platform that gives developers personalized learning roadmaps.

Writing style:
- Direct and practical, zero fluff
- Written for junior-to-mid developers trying to build a career
- Uses concrete examples and specifics, not platitudes
- Occasionally references AcadAI naturally (1-2 times max, never forced)
- Markdown with ## headings, bullet points, and occasional **bold** for emphasis

AcadAI offers free personalized roadmaps for: Frontend, Backend, Fullstack, ML, DevOps, Android, iOS, Blockchain, UI/UX, Product Engineering, Game Dev, Cybersecurity, Data Science.`;

  const prompt = `Here are trending topics in tech this week:

${topicContext}

--- EXISTING BLOG POSTS ON ACADAI (avoid duplicating these topics) ---
${existingTopics || '(No existing posts found)'}

--- TRENDING TOPICS IN THE DEVELOPER LEARNING SPACE (for keyword targeting) ---
${trendingTopics || '(No trending topics found)'}

AVOID topics already covered in the existing blog posts listed above. Pick a topic with high search potential that is NOT already covered.

Pick the SINGLE most actionable topic for developers trying to build their careers or skills. Write a high-value blog post about it.

Return a JSON object with EXACTLY this structure (no markdown wrapper, no extra fields):
{
  "title": "Specific, engaging title under 70 characters",
  "slug": "url-friendly-slug-matching-title",
  "excerpt": "Compelling 1-2 sentence summary under 160 characters",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "coverCategory": "one of: career, coding, learning, team, ai, interview, tools",
  "content": "Full markdown blog post, 800-1100 words. Use ## for section headings. Include concrete, actionable advice. End the post with a natural 1-sentence mention of how AcadAI's free personalized roadmaps can help with this topic."
}`;

  const generated = await generateJSON<GeneratedPost>(
    prompt,
    'blog_post',
    systemInstruction
  );

  // ── Step 3: Validate and normalise ──────────────────────────────────────────
  if (!generated.title || !generated.content || !generated.excerpt) {
    throw new Error(
      `[blog-writer] Missing required fields. Got: ${JSON.stringify(Object.keys(generated))}`
    );
  }

  const slug = generated.slug || slugify(generated.title);
  const coverPhotoId =
    COVER_IMAGES[generated.coverCategory] ?? COVER_IMAGES.coding;
  const today = new Date().toISOString().split('T')[0];

  const post: BlogPost & { createdAt: object; source: string } = {
    slug,
    title: generated.title,
    date: today,
    excerpt: generated.excerpt,
    readTime: estimateReadTime(generated.content),
    tags: Array.isArray(generated.tags) ? generated.tags.slice(0, 5) : [],
    content: generated.content,
    coverImage: buildCoverUrl(coverPhotoId),
    createdAt: FieldValue.serverTimestamp(),
    source: 'ai-generated',
  };

  // ── Step 4: Store to Firestore ───────────────────────────────────────────────
  // Check for slug collision — append date suffix if needed
  const existingDoc = await adminDb
    .collection(BLOG_POSTS_COLLECTION)
    .doc(slug)
    .get();

  const finalSlug = existingDoc.exists ? `${slug}-${today}` : slug;
  post.slug = finalSlug;

  await adminDb.collection(BLOG_POSTS_COLLECTION).doc(finalSlug).set(post);

  console.log(`[blog-writer] ✅ Published: "${post.title}" → slug: ${finalSlug}`);
  return { success: true, slug: finalSlug, title: post.title };
}
