/**
 * Tavily Search API — web research for AI pipelines.
 *
 * COST PROTECTION:
 * - Free tier: 1000 searches/month. Expected usage: ~290/month.
 * - SESSION_SEARCH_LIMIT: soft cap of 50 searches per process lifecycle.
 *   Prevents a bug from looping and burning the monthly quota in one run.
 * - Use searchDepth: 'basic' (1 credit) unless you truly need 'advanced' (2 credits).
 * - Keep maxResults ≤ 5 per query.
 *
 * Env required: TAVILY_API_KEY
 */

export interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

export interface TavilySearchOptions {
  /** Max results to return. Default: 5. Keep ≤ 5 to minimize latency + cost. */
  maxResults?: number;
  /** 'basic' = 1 credit (default), 'advanced' = 2 credits. Use basic unless needed. */
  searchDepth?: 'basic' | 'advanced';
  /**
   * Filter to results published within the last N days.
   * WARNING: Only valid when topic is 'news'. Do NOT use with default (general) topic —
   * Tavily will return HTTP 400 "Query cannot consist only of site: operators".
   * Omit this parameter unless you also set topic: 'news'.
   */
  days?: number;
  /** Include a short AI-synthesized answer from Tavily (uses same credit). */
  includeAnswer?: boolean;
}

// Soft cap: resets per process (per cold start in serverless). Prevents loops.
let searchesThisSession = 0;
const SESSION_SEARCH_LIMIT = 50;

/**
 * Search the web via Tavily.
 * Returns an empty array (not an error) if TAVILY_API_KEY is not set,
 * so pipelines degrade gracefully without search data.
 */
export async function tavilySearch(
  query: string,
  options: TavilySearchOptions = {}
): Promise<TavilyResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    console.warn('[tavily] TAVILY_API_KEY not set — returning empty results. Add it to .env.local.');
    return [];
  }

  if (searchesThisSession >= SESSION_SEARCH_LIMIT) {
    throw new Error(
      `[tavily] Session search limit (${SESSION_SEARCH_LIMIT}) reached. This is a safety cap to prevent cost overruns. Check for loops in your pipeline code.`
    );
  }

  searchesThisSession++;

  const body = {
    api_key: apiKey,
    query,
    max_results: options.maxResults ?? 5,
    search_depth: options.searchDepth ?? 'basic',
    include_answer: options.includeAnswer ?? false,
    include_raw_content: false,
    ...(options.days ? { days: options.days } : {}),
  };

  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'unknown error');
    throw new Error(`[tavily] API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const results: TavilyResult[] = data.results ?? [];

  console.log(
    `[tavily] query="${query.slice(0, 60)}" results=${results.length} session_total=${searchesThisSession}/${SESSION_SEARCH_LIMIT}`
  );

  return results;
}
