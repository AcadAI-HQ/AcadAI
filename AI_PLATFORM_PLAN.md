# AcadAI — AI-Native Platform Plan

> Last updated: 2026-03-09
> Track: what's done, what's in progress, what's pending.

---

## Vision

Transform AcadAI into a fully AI-driven platform where:
- **Market research** (monthly) drives roadmap content — AI scans job boards and tech trends
- **Roadmaps** (monthly) are generated per-domain from live market data
- **Learning resources** (weekly) are auto-curated per domain
- **Blog posts** (weekly) are written after SEO gap analysis
- Everything runs via GitHub Actions cron + Firebase — **essentially $0/month cost**

---

## Cost Analysis (Monthly at Current Scale)

| Pipeline | Tavily Credits | Gemini Tokens | Est. Cost |
|---|---|---|---|
| Blog post (×4/mo) | 20 | ~25k | $0 |
| SEO pre-check (×4/mo) | 8 | ~4k | $0 |
| Market Research (14 domains) | 42 | ~42k | $0 |
| Roadmap Generation (14 domains) | 0 | ~128k | $0 |
| Learning Resources (14 domains ×4 weeks) | 112 | ~282k | $0 |
| **TOTAL** | **182 / 1000 free** | **~481k / 1M/day free** | **~$0** |

Both Gemini (1M tokens/day free tier) and Tavily (1000 searches/month free) cover this completely.

---

## Architecture Overview

```
GitHub Actions
  ├── Every Monday 2am UTC (weekly-ai-pipeline.yml)
  │     ├── POST /api/cron/blog-post        → SEO analysis → blog post
  │     └── POST /api/cron/learning-resources → per-domain weekly content
  │
  └── 1st of Month 3am UTC (monthly-ai-pipeline.yml)
        ├── POST /api/cron/market-research   → job board trends per domain
        └── POST /api/cron/roadmap-update    → AI roadmaps from research data
```

### Firestore Collections
```
blog-posts/{slug}                          ← AI blog posts (DONE)
market-research/{domain}                   ← Monthly skill demand data
roadmaps/{domain}                          ← AI-generated global roadmaps
users/{userId}/roadmaps/{domain}           ← User-personalized roadmaps (DONE)
learning-resources/{domain}/weeks/{weekId} ← Weekly curated content
_pipeline_locks/{jobName}                  ← Idempotency locks (DONE)
```

---

## Status

### ✅ DONE

- [x] **Gemini service** (`src/lib/gemini-service.ts`) — token budgets, singleton client, JSON parsing
- [x] **Tavily service** (`src/lib/tavily-service.ts`) — 1000/mo free tier, session limit, graceful degradation
- [x] **Pipeline guard** (`src/lib/pipeline-guard.ts`) — Firestore locks, idempotency, parallel-run prevention
- [x] **Blog writer agent** (`src/lib/agents/blog-writer-agent.ts`) — 3 Tavily searches + Gemini → Firestore
- [x] **Blog cron route** (`src/app/api/cron/blog-post/route.ts`) — CRON_SECRET auth, 144h lock
- [x] **Blog server** (`src/lib/blog-server.ts`) — merges static + Firestore posts
- [x] **Blog pages** (`src/app/blog/` and `src/app/blog/[slug]/`) — SEO metadata, revalidate 3600
- [x] **Weekly GitHub Action** (`.github/workflows/weekly-ai-pipeline.yml`) — Monday 2am UTC, blog only
- [x] **Gemini token budgets** defined for: blog_post, roadmap, weekly_resources, market_research, hyper_personalization, chat

### ✅ DONE (continued, completed 2026-03-09)

- [x] **Market Research Agent** (`src/lib/agents/market-research-agent.ts`) — 3 Tavily searches × 14 domains → Gemini extracts skills/tools/trends → Firestore `market-research/{domain}`
- [x] **Roadmap Generator Agent** (`src/lib/agents/roadmap-generator-agent.ts`) — reads market research → Gemini generates roadmap JSON → Firestore `roadmaps/{domain}`
- [x] **Learning Resources Agent** (`src/lib/agents/learning-resources-agent.ts`) — 2 Tavily searches × 14 domains → Gemini curates 5-7 resources → Firestore `learning-resources/{domain}/weeks/{weekId}`
- [x] **SEO pre-analysis** added to blog-writer-agent (Step 0: 2 extra searches for coverage gaps + trending keywords)
- [x] **Market Research cron route** (`src/app/api/cron/market-research/route.ts`) — 648h lock window
- [x] **Roadmap Update cron route** (`src/app/api/cron/roadmap-update/route.ts`) — 648h lock window
- [x] **Learning Resources cron route** (`src/app/api/cron/learning-resources/route.ts`) — 144h lock window
- [x] **Monthly GitHub Action** (`.github/workflows/monthly-ai-pipeline.yml`) — 1st of month 3am UTC, sequential jobs
- [x] **Weekly GitHub Action updated** (added `learning-resources` job after `blog-post`)
- [x] **Pipeline guard updated** — new job names added to `JobName` union type

### 📋 TODO — UX P1 (trust-critical, ship before first 100 users)

- [x] Fix `EmptyResourceState` — design-system tokens, pipeline-explaining copy
- [x] **P1.1** — One-time dismissible roadmap intro banner (`acadai_roadmap_intro_seen` localStorage, AnimatePresence animated)
- [x] **P1.2** — Roadmap freshness banner reads `roadmapData.generatedAt`, only shown when `isAiGenerated` true; label changed to "Market-researched"
- [x] **P1.3** — Renamed "Personalize with AI" → "Tailor to my background" with tooltip explaining distinction
- [x] **P1.5** — Replaced pulsing Bot loading state with Skeleton components (4 rows + header)
- [x] **P1 bonus** — Error state copy now user-friendly ("We couldn't load your roadmap right now."), raw error string hidden

### 📋 TODO — UX P2 (weekly retention, ship within 30 days)

- [ ] "New this week" banner on dashboard (localStorage `acadai_last_resource_week_seen_{domain}`)
- [ ] "Picked for you this week" hero card on learning resources page
- [ ] Learning resources subtitle: "Fresh resources every Monday — researched from engineering blogs…"
- [ ] "New this week" badge on `DomainResourceCard` when `lastUpdatedDate` within 7 days
- [ ] AI status strip on dashboard ("Roadmaps updated March 2026 · Resources updated Xd ago")

### 📋 TODO — Infrastructure

- [ ] Firestore security rules: allow client reads on `roadmaps/{domain}` and `learning-resources/{domain}/weeks`
- [ ] Monitor first pipeline runs and tune prompts if needed

---

## Phase Detail

### Phase 1: SEO-Enhanced Blog Writer (Update existing)

**Goal**: Before writing, AI checks what topics acadai.org already covers and finds keyword gaps.

**Steps added to blog-writer-agent.ts**:
1. Search `site:acadai.org` blog coverage (1 search)
2. Search trending tech education keywords (1 search)
3. Pass coverage + trends to Gemini → pick highest-opportunity uncovered topic
4. Proceed with existing blog writing flow

**Tavily budget**: +2 searches/week = +8/month (174 total, within 1000)

---

### Phase 2: Market Research Agent (Monthly)

**File**: `src/lib/agents/market-research-agent.ts`
**Trigger**: POST /api/cron/market-research (1st of month)
**Lock**: 'market-research', 648h (27 days)

**Per domain** (14 domains, processed sequentially with 2s delay):
1. Tavily: `"{domain} developer skills jobs hiring 2026"` (3 results)
2. Tavily: `"top {domain} frameworks tools companies 2026"` (3 results)
3. Tavily: `"{domain} engineer job requirements salary 2026"` (3 results)
4. Gemini (`market_research` budget, 1024 tokens): Extract structured skills/tools/trends list
5. Store to `market-research/{domain}`: `{ domain, inDemandSkills[], tools[], frameworks[], trends[], updatedAt }`

**Tavily**: 3 searches × 14 domains = 42 credits/month

---

### Phase 3: Roadmap Generator Agent (Monthly, after market research)

**File**: `src/lib/agents/roadmap-generator-agent.ts`
**Trigger**: POST /api/cron/roadmap-update (1st of month, after market-research)
**Lock**: 'roadmap-update', 648h

**Per domain** (14 domains, 3s delay between):
1. Read `market-research/{domain}` from Firestore
2. Read base roadmap structure from `/public/roadmaps-new/{domain}.json` (just the steps array structure)
3. Gemini (`roadmap` budget, 4096 tokens): Generate updated roadmap emphasizing in-demand skills
4. Store to `roadmaps/{domain}`: full roadmap JSON matching existing schema

**Roadmap JSON schema**:
```json
{
  "domain": "Frontend Development",
  "overview": "...",
  "generatedAt": "2026-03-01",
  "steps": [
    {
      "title": "...",
      "description": "...",
      "subtopics": ["..."],
      "resources": ["url1", "url2"]
    }
  ]
}
```

**Tavily**: 0 (uses market research data already fetched)
**Note**: Roadmap pages should check `roadmaps/{domain}` before falling back to static JSON

---

### Phase 4: Learning Resources Agent (Weekly)

**File**: `src/lib/agents/learning-resources-agent.ts`
**Trigger**: POST /api/cron/learning-resources (every Monday)
**Lock**: 'learning-resources', 144h

**Per domain** (14 domains, 1.5s delay between):
1. Tavily: `"best {domain} tutorial article {month} {year}"` (3 results)
2. Tavily: `"new {domain} tools releases {month} {year}"` (3 results)
3. Gemini (`weekly_resources` budget, 2048 tokens): Curate top 5 resources with descriptions
4. Store to `learning-resources/{domain}/weeks/{weekId}`:
```json
{
  "weekId": "2026-W10",
  "domain": "frontend",
  "resources": [
    {
      "title": "...",
      "url": "...",
      "type": "article|video|course|tool",
      "description": "...",
      "difficulty": "beginner|intermediate|advanced"
    }
  ],
  "updatedAt": "timestamp"
}
```

**Tavily**: 2 searches × 14 domains = 28 credits/week = 112/month

---

## GitHub Actions Schedules

### weekly-ai-pipeline.yml (updated)
```
Monday 2am UTC:
  1. blog-post job (existing, ~60s)
  2. learning-resources job (new, ~5 min for 14 domains)
```

### monthly-ai-pipeline.yml (new)
```
1st of month 3am UTC:
  1. market-research job (~8 min for 14 domains)
  2. roadmap-update job (~10 min for 14 domains, runs after market-research)
```

---

## Environment Variables

Existing (already configured):
- `GOOGLE_GEMINI_API_KEY` — Gemini 2.0 Flash
- `TAVILY_API_KEY` — Tavily web search
- `CRON_SECRET` — Auth for all cron endpoints
- `NEXT_PUBLIC_SITE_URL` — Base URL

No new env vars needed for new pipelines.

---

## Risk & Mitigation

| Risk | Mitigation |
|---|---|
| Gemini rate limit (15 RPM free) | Sequential processing with delays between domains |
| Tavily monthly cap exceeded | Session limit (50) + monthly usage counter in Firestore |
| Bad roadmap JSON breaks UI | Validate schema before storing; fallback to static JSON |
| Duplicate runs on cron misfire | Pipeline guard with long window locks |
| API costs if scale increases | All budgets hardcoded in gemini-service.ts; easy to monitor |

---

*This file is updated as tasks complete. Check git history for change log.*
