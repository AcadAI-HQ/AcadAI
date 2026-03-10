# AcadAI UX Plan — AI-Native Learning Advisor
**Version**: 1.0
**Date**: March 2026
**Scope**: Trust, transparency, and engagement design for the AI-native pipeline (roadmaps, learning resources, blog)

---

## 0. Codebase Audit Summary

Before proposing changes, here is what the current UX actually does well and where the gaps are.

**What works:**
- Dashboard welcome banner is warm, contextual, and progress-aware. The 5 time-greetings and progress-sensitive copy are genuinely good.
- The AI Mentor nudge after 3+ days away is the right pattern — ambient re-engagement without being aggressive.
- The hyperpersonalization flow (multi-step question wizard) has clean motion and good progressive disclosure.
- The `WeeklyResourceCard` already shows `publishedAgo` (relative time) — a seed of freshness signaling that needs to be promoted.
- The `EmptyResourceState` component exists but its copy ("No Resources Available Yet") is passive. It doesn't explain *why* or *when*.

**What's missing:**
- Zero AI origin labeling anywhere in the app. The roadmap page has no indication that content was researched or when it was last updated.
- The domain picker grid on the dashboard has no signal that some domains have fresh AI content this week vs. stale content.
- The `DomainResourceCard` says "X Weeks" but never says "Updated this week" or "Last updated 3 weeks ago."
- The "Personalize with AI" CTA on the roadmap page has no context explaining what it does relative to an already-AI-generated roadmap. It looks like a generic AI button.
- The loading state on the roadmap page (`Bot` icon + "Loading Your Roadmap...") inadvertently implies AI is running *right now*, which is false.
- The `empty-resource-state.tsx` uses hardcoded `text-white` and `text-gray-400` — it breaks in light mode and doesn't match the design system.
- No re-engagement mechanism when new AI content drops on Monday mornings. The `acadai_last_dashboard_visit` localStorage key exists for time tracking but is only used for the AI Mentor nudge, not content freshness.

---

## 1. Mental Model — "Your AI Learning Advisor"

### The Problem with Existing Framings

"AI generator" implies: you typed a prompt, you got output. Feels random. Low trust.
"AI chatbot" implies: you talk to it. Creates wrong expectation — users will look for a chat box.
"AI-powered" implies: vague tech marketing. No behavioral change.

### The Right Mental Model

Think of a **senior developer who left their job to research the tech industry full-time on your behalf.** They spend every week reading job postings, watching what companies are actually hiring for, and updating your learning plan accordingly. They also leave you curated reading lists every Monday. You don't talk to them in real-time — but their work is always there when you open the app.

This is not a chatbot. It is not a generator. It is a research-backed advisor that works continuously in the background.

### The Positioning Statement (exact UI copy)

Primary (for page headers, onboarding):
> "AcadAI researches the job market every week and updates your learning plan so you're always working toward what's actually in demand."

Secondary (for tooltip or smaller callouts):
> "Updated weekly from real job postings and engineering blogs — not static content someone wrote two years ago."

This framing does two things: it explains the mechanism (job market research) and it implicitly attacks the alternative (static bootcamp curricula). Both are true and both are motivating for the target user.

### What to Avoid

- Do not anthropomorphize too much. "Your AI Mentor misses you!" (already in the codebase for the nudge card) is on the edge — acceptable for re-engagement nudges because it's warm, but should not be the primary framing for the system.
- Do not say "AI-generated" as a quality label — it triggers skepticism in technical users who know LLMs hallucinate. Instead say "researched" or "market-informed."
- Do not lead with "powered by Gemini." Tool disclosure can live in a settings page or footer. The user cares about the outcome, not the underlying model.

---

## 2. Onboarding — First Encounter with AI Features

### Current State

The onboarding flow lives at `/onboarding` and is hidden from the sidebar (correctly). The flow collects: user type, background, domain choice, and existing skills. After completion, the user lands on the dashboard and sees their roadmap domain in the picker.

The problem: **the user never learns that the roadmap they're about to see is AI-researched.** The first AI encounter is completely silent. They will assume they got a static Wikipedia-style list of topics.

### Proposed First-Encounter Moments

There are two acceptable strategies. Given this is a bootstrapped MVP with 0 users, strategy B is lower effort and higher trust:

**Strategy A — Explicit onboarding step (adds a Step 5)**
After domain selection, add a transition screen (not a question, just information):

```
[ Sparkles icon, large ]

AcadAI is building your roadmap.

Not a generic list — a learning path researched from
actual job postings in [Frontend Development] this month.

[ animated progress bar, 2-3 seconds ]
[ "Let's go" button appears after 2s ]
```

This costs one extra step but earns trust before the user sees any content. The perceived wait makes the roadmap feel more valuable (effort justification bias). The current loading state on the roadmap page (`Bot` icon + "Loading Your Roadmap...") can be repurposed here instead.

**Strategy B — In-context callout on first roadmap view (recommended for MVP)**
Do not change the onboarding steps. Instead, on the first time a user lands on their roadmap page, show a one-time dismissible banner at the top of the page:

```
[ BrainCircuit icon ]
This roadmap was built from job market research — not a static list.
AcadAI scans engineering job postings monthly and updates these paths to reflect
what companies are actually hiring for right now.
[ Got it — dismiss ]
```

Implementation: set `acadai_roadmap_intro_seen` in localStorage on dismiss. Show only when this key is absent. Never show again.

**Aha Moment Definition**

The "aha moment" for AI trust is: **the user sees a specific, non-obvious skill or tool in their roadmap and thinks "I would not have known to learn that."** This means the roadmap content quality is the real trust builder, not the UI. The UI's job is to frame the first encounter so the user is primed to look for that specificity, not skim past it.

The one-time banner (Strategy B) primes the user to notice specificity before they scroll. That is its primary job.

### Micro-copy Principle for AI Introductions

Use this formula: **[what it did] + [from what source] + [how often]**
Example: "Built from job posting analysis, updated monthly"
Not: "AI-powered learning path" (vague, no mechanism, no freshness signal)

---

## 3. Roadmap Page UX — AI vs. Static

### Current State (file: `src/app/roadmap/[domain]/page.tsx`)

The page has:
1. A back button (top left)
2. A "Personalize with AI" button (top right, `#29ABE2` outlined)
3. A centered title section with domain name and overview text
4. The `LearningPathView` component (node-based or list)

Nothing on this page tells the user: when was this last updated? Was it researched or hand-written? What does "Personalize with AI" mean when the base roadmap is *already* AI-researched?

### Proposed Changes

**3.1 — Freshness Badge (below the domain title)**

Place a subtle inline metadata line immediately below the `<h1>` title, above the overview paragraph:

```
[ small calendar icon ]  Updated [Month Year]  ·  [ small bar-chart icon ]  Based on job market data
```

Rendered as `text-xs text-muted-foreground` — not prominent, but scannable. Clicking it does nothing on MVP. Later this could expand to show a tooltip explaining the pipeline.

When to show each state:
- AI has run: "Updated March 2026 · Based on job market data"
- AI has not run yet (first month, no pipeline data): omit the badge entirely, show nothing. Do not show "Not yet updated" — that raises questions you don't want to answer at signup.

The freshness data source: the roadmap JSON stored in Firestore per user (`users/{userId}/roadmaps/{domain}`) should include a `lastUpdated` timestamp field populated when the monthly pipeline runs. The roadmap page reads this field. If absent, the badge is simply not rendered.

**3.2 — Reframing "Personalize with AI"**

The current button reads "Personalize with AI" with a Sparkles icon. The problem: the user just landed on what is already an AI-researched roadmap. The button sounds redundant ("isn't this already AI?").

The distinction to communicate:
- Base roadmap: "Researched for your domain" — what everyone gets. Market-informed, not personalized to *you*.
- Personalized roadmap: "Tailored to your background" — adjusted for your specific skills, time budget, and goals.

Rename the button:
```
[ Sparkles icon ]  Tailor to my background
```

Add a tooltip on hover (desktop only, `title` attribute is sufficient for MVP):
```
"The base roadmap covers everything in demand for this role.
Tailoring removes topics you already know and adds depth
where you need it most."
```

This framing makes personalization feel *complementary* to the AI-researched base, not a replacement. It also reframes the value prop from "AI feature" to "time savings" — a more motivating frame for developers.

**3.3 — Error / Bad AI Output State**

Current error state shows: `AlertTriangle` + "Error Loading Roadmap" + the raw error message.

The raw error message should never reach the user. Replace with:

```
[ AlertTriangle ]

We couldn't load your roadmap right now.

This is usually a temporary issue. The base version of this
roadmap is always available — try refreshing the page.

[ Try again ]  [ Back to Dashboard ]
```

No mention of "AI failed." The user does not need that context. Frame it as a loading issue, not an AI quality issue.

**3.4 — Graceful Fallback State (AI hasn't run yet)**

When `lastUpdated` is absent from the Firestore document (first month, pipeline hasn't run):

- Show the base template roadmap from `/public/roadmaps-new/{domain}.json` — this already happens via `getRoadmapForUser` fallback logic.
- Do not show the freshness badge.
- Do not show anything that implies the content is outdated or incomplete.
- The "Tailor to my background" button still works — personalization runs against whatever roadmap version is available.

This is already the correct behavior in the service layer. The UX just needs to not actively signal an absent state.

---

## 4. Learning Resources UX — Weekly Freshness

### Current State

`src/app/dashboard/learning-resources/page.tsx`:
- Loads a manifest of available weeks per domain
- Shows a grid of `DomainResourceCard` components
- Each card shows domain name, icon, "X Weeks" badge, and a progress bar if started

`src/components/learning-resources/domain-resource-card.tsx`:
- The badge shows "X Weeks" or "Coming Soon"
- The description says "Explore X weeks of curated learning resources"
- Zero freshness signaling

`src/components/learning-resources/weekly-resource-card.tsx`:
- Already shows `publishedAgo` (relative date from `date-fns`). This is correct and should be kept.

### Gap

The domain-level grid doesn't tell the user which domains have been updated *this week*. A user who visits Tuesday morning after a Monday AI run has no idea that Frontend just got 7 fresh resources. There is no "New" signal, no hierarchy of freshness, no clear entry point for "what should I study this week."

### Proposed Changes

**4.1 — "Updated This Week" Badge on Domain Cards**

In `DomainResourceCard`, add a `lastUpdatedDate?: string` prop. If the most recent week was published within the last 7 days:

- Replace the "X Weeks" badge with: `[ green dot ]  New this week`
- Badge color: `bg-green-500/10 text-green-500 border-green-500/20` (matches the existing difficulty badge system in `WeeklyResourceCard`)
- Show both if needed: the "New this week" badge takes primary position; "X Weeks" becomes secondary or omitted

The manifest already contains `availableWeeks` — add the most recent week's `publishedDate` to the manifest so the card can compute this client-side.

**4.2 — Personalized "Start Here" Recommendation**

Above the domain grid, add a single highlighted card for the user's active domain (the one matching `user.lastGeneratedDomain`):

```
┌─────────────────────────────────────────────────────────┐
│  [ Sparkles icon ]  Picked for you this week            │
│                                                         │
│  Frontend Development — Week 8                          │
│  TypeScript Patterns for Production Apps                │
│  5 resources · 45 min read · Updated 2 days ago         │
│                                                         │
│  [ Start this week's resources → ]                      │
└─────────────────────────────────────────────────────────┘
```

This card only appears if:
- The user has an active domain (`user.lastGeneratedDomain` is set)
- That domain has at least one week available in the manifest
- The user has not completed all resources for the most recent week

Implementation: pull the most recent week's data from the manifest for the user's active domain. Link directly to that week's resource view (`/dashboard/learning-resources/{domain}/{week}`).

This is the single most impactful change for the learning resources page — it answers "what should I do today?" without requiring the user to navigate.

**4.3 — Empty State Improvement**

Current `EmptyResourceState` copy: "No Resources Available Yet" — passive, no explanation.

The component also uses `text-white` and `text-gray-400` hardcoded, which breaks in the design system. These should be `text-foreground` and `text-muted-foreground` respectively.

New copy when AI has not run yet for a domain:

```
[ BookOpen icon ]

Resources for [Domain Name] are being prepared.

Our AI curates fresh learning resources every Monday.
Check back next week — or explore another domain in the meantime.

[ Explore other domains ]  [ Back to Dashboard ]
```

New copy when no domain is specified (generic fallback):

```
[ BookOpen icon ]

No resources yet.

AcadAI publishes new learning resources every Monday.
If you just signed up, your first batch will be ready
on the next Monday after your account was created.

[ Back to Dashboard ]
```

**4.4 — Progress Tracking Motivation**

Currently: progress bar appears on `DomainResourceCard` only if `completionPercentage > 0`. This is correct — no zero-state progress bar.

The question is whether users need to explicitly mark resources as "done." Currently `resource-item.tsx` (not read but implied by `getCompletionStats`) tracks this.

Recommendation: keep the "mark as done" mechanic exactly as-is. Do not add friction (ratings, notes, etc.) at this stage. The motivation for marking done is:

1. Progress bar on the domain card (visible reward)
2. The "Picked for you this week" recommendation card (above) skips to the next week once the current one is complete

Do not add streaks, XP, or gamification at this stage. This user (developer, self-aware, skeptical) will find shallow gamification condescending. Progress bars tied to real learning milestones are enough.

---

## 5. Dashboard UX — AI as Ambient Intelligence

### Current State

The dashboard has: welcome banner, AI Mentor nudge (if away 3+ days), profile completion nudge (if < 100%), quick access grid (4 cards), domain picker grid (14 domains).

Nothing on the dashboard tells the user:
- Whether AI has run recently
- Whether their domain has new content
- When to expect the next update

### Proposed Changes

**5.1 — AI Status Strip (passive, low-visual-weight)**

Between the quick access grid and the domain picker, add a single-line status strip that is visible but not dominant:

```
[ small Sparkles icon ]  Roadmaps updated March 2026 · Learning resources updated 3 days ago
```

Styling: `text-xs text-muted-foreground` with a subtle left border in `#29ABE2/30`. No interactive elements needed on MVP — just ambient transparency.

Data source: a static config file or environment variable updated when pipelines run. For MVP, this can be a hardcoded string in a `src/lib/ai-pipeline-status.ts` file that is manually updated after each pipeline run. It does not need to be dynamic Firestore data yet.

This strip answers the implicit user question "is this thing being maintained?" without making them look for an answer.

**5.2 — "New This Week" Signal on Domain Picker Cards**

In the domain picker grid on the dashboard, the card for a domain that has fresh learning resources this week should show a small visual indicator:

- Add a `[ New ]` pill in `bg-green-500/10 text-green-500 text-[9px]` next to the accent dot in the top-left of each domain card
- Only show for domains where the most recent manifest week was published within 7 days
- The "Active" badge already occupies top-right — the "New" pill can sit next to the accent dot without conflict

This is a non-blocking enhancement. The pill is small enough that it adds signal without restructuring the card.

**5.3 — "This Week's Picks" Section (dashboard-level, below quick access)**

If the user has an active domain AND that domain has resources published in the last 7 days, show a "This week's picks" row above the domain picker:

```
┌────────────────────────────────────────────────────────────────┐
│  This week in Frontend Development                  [ View all ]│
│                                                                 │
│  [ resource card ]  [ resource card ]  [ resource card ]        │
└────────────────────────────────────────────────────────────────┘
```

Show 3 resource preview chips (title + estimated read time). Clicking any of them goes to the full resource view. Clicking "View all" goes to the learning resources page for that domain.

Conditional display: only render if fresh content exists. If no fresh content for the user's domain this week, this section is simply absent — no empty state, no placeholder.

This section should appear between the quick access grid and the domain picker. It is the highest-value real estate on the page for a returning user.

**5.4 — AI Mentor Entry Point Assessment**

Current: "AI Mentor" is a sidebar nav item with a `Bot` icon and a Sparkles badge. It links to `/dashboard/ai-mentor`.

The sidebar entry point is correct — it is always accessible, always visible, not intrusive. The Sparkles badge correctly signals "AI feature."

What is missing: the sidebar label says "AI Mentor" but gives no hint of what it does. A developer seeing this for the first time will wonder: is it a chatbot? A quiz? A recommendation engine?

Add a tooltip on the sidebar item (shown on hover, desktop only):
```
"Ask anything about your learning path — what to study next,
how long it will take, what to focus on for interviews."
```

No other changes to the AI Mentor entry point at this stage. Do not move it to a FAB, do not add a persistent chat bubble. The sidebar is the right location for a feature that is useful but not urgently needed on every visit.

---

## 6. Trust Building — Transparency Without Overexplaining

### The Trust Calibration Problem

Technical users (the target audience) have two conflicting reactions to AI labels:

1. Positive: "Oh, this is researched and up to date — not some static list."
2. Negative: "Oh, this was generated — it might be hallucinated or generic."

The goal is to trigger reaction 1 consistently. The way to do that is to:

- Emphasize the *source* of the AI's inputs (real job postings, engineering blogs) rather than the technology itself
- Show specificity in the output (non-obvious skills and tools in the roadmap) which makes AI origin feel like a quality signal, not a risk signal
- Avoid the word "generated" in favor of "researched," "curated," or "updated"

### When to Show AI Origin

**Always show (passively):**
- The freshness badge on the roadmap page ("Updated March 2026 · Based on job market data")
- The AI status strip on the dashboard
- The "New this week" badge on domain cards and resource cards

**Show on interaction (on hover or first visit only):**
- The one-time banner on first roadmap visit explaining the pipeline
- Tooltip on "Tailor to my background" explaining what personalization does differently from the base

**Never show proactively:**
- Which AI model was used (irrelevant to the user's goals)
- Pipeline run logs or technical details
- Error details when the AI service fails

### Distinguishing AI Content from Human Content

There are currently two types of human-curated content on the platform:
1. Static blog posts (written by humans, already in the codebase)
2. AI-written blog posts (from the weekly blog writer agent)

On the blog, AI-written posts should have a consistent label. Recommended:

```
[ small Sparkles icon ]  Written by AcadAI · Updated weekly
```

Placed in the post metadata line, same visual weight as the author name. Do not write "AI-generated" — write "Written by AcadAI" which anthropomorphizes the platform rather than the technology.

### Handling AI Errors and Low-Quality Output

**Scenario: roadmap JSON is malformed or incomplete**

The `getRoadmapForUser` service already falls back to the base template. The UX should never expose this fallback as a failure — the user simply sees the base roadmap with no explanation.

If the base template itself is unavailable (network failure, missing file), show the error state proposed in section 3.3 — framed as a temporary loading issue.

**Scenario: learning resources are low-quality (AI picked poor sources)**

This is a content quality problem, not a UX problem primarily. However, UX can provide a safety valve:

Add a "Not helpful?" flag icon (`ThumbsDown` from lucide-react) on each `ResourceItem`. On click: save a `thumbsDown: true` flag to Firestore at `users/{userId}/resourceFeedback/{resourceId}`. Show a brief inline confirmation: "Thanks — we'll use this to improve future picks."

This data can be used later to filter out low-quality sources in the Tavily search pipeline. For MVP, just collect it — do not act on it automatically yet.

The flag should be visually subtle (appears on hover on desktop, always visible but small on mobile). It should never interrupt the reading flow.

### User Ability to Flag/Report Bad Content

Keep it minimal. The feedback mechanism described above (ThumbsDown on resource items) is sufficient for MVP. Do not add:
- A full report modal with categories (too much friction)
- AI quality ratings on roadmap nodes (clutters the primary learning UI)

The existing feedback page (`/dashboard/feedback`) serves as the escalation path for serious issues. The nudge card on the dashboard already links to it. That is enough.

---

## 7. Notification and Re-engagement Strategy

### Constraint

No push notifications. No email infrastructure yet (assumed). All re-engagement must happen inside the app on the user's next visit.

The existing `acadai_last_dashboard_visit` localStorage key already tracks the last visit time. This is the foundation to build on.

### Proposed: Content Freshness localStorage Keys

Add two new localStorage keys alongside the existing one:

```
acadai_last_resource_week_seen_{domain}  →  string (ISO date of last week the user viewed)
acadai_last_roadmap_update_seen          →  string (ISO date string of last roadmap update user was notified of)
```

These enable freshness-aware banners without requiring any backend or notification infrastructure.

### "New This Week" Banner Pattern

When the user returns to the dashboard and the following is true:
- Their active domain has new resources published since `acadai_last_resource_week_seen_{domain}`
- At least 1 day has passed since their last visit

Show a banner below the welcome banner (same visual tier as the AI Mentor nudge):

```
┌──────────────────────────────────────────────────────────────┐
│  [ Sparkles ]  New resources for Frontend Development        │
│  7 resources were added this week — including TypeScript     │
│  patterns and React Server Component deep dives.            │
│  [ Explore this week →]                         [ Dismiss ]  │
└──────────────────────────────────────────────────────────────┘
```

Styling: same rounded-xl, border-[#29ABE2]/20, bg-[#29ABE2]/5 as the existing AI Mentor nudge card. Consistent visual language.

On dismiss: write the current ISO date to `acadai_last_resource_week_seen_{domain}`. The banner will not reappear until the next pipeline run date.

On click "Explore this week": navigate to `/dashboard/learning-resources/{domain}` and write the dismiss timestamp.

**This banner is conditional.** If the user visits the same day the content dropped (Monday), they see it. If they visit Wednesday and the content is 2 days old, they still see it (it's still "this week"). If they visit the following Monday after seeing it once and dismissing, they won't see it again until the next pipeline adds another week.

### Monday Morning Re-engagement

The best re-engagement touchpoint is the user's next visit after Monday 2am UTC (when the pipeline runs). The banner above handles this passively.

There is no need for additional re-engagement mechanics at this stage. The existing AI Mentor nudge (3+ days away) already handles general re-engagement. The new content freshness banner handles weekly content re-engagement. Two nudge types is the maximum for a dashboard that is currently uncluttered.

### Monthly Roadmap Update Notification

When the monthly roadmap pipeline runs and updates the user's roadmap in Firestore, the user's next visit should acknowledge this.

Show a one-time notification on the roadmap page itself (not the dashboard — it's more impactful in context):

```
┌────────────────────────────────────────────────────────────┐
│  [ Sparkles ]  Your roadmap was updated this month         │
│  Based on job market data from February 2026. 3 topics     │
│  were refreshed to reflect current hiring trends.          │
│                                                [Got it]    │
└────────────────────────────────────────────────────────────┘
```

Trigger: `roadmap.lastUpdated` timestamp is newer than `acadai_last_roadmap_update_seen` in localStorage. On "Got it": write the current `lastUpdated` timestamp to localStorage.

---

## 8. Key UX Copy

### 8.1 AI Badge Label

For use on roadmap page freshness badge, domain cards with new content, and the AI status strip:

**Primary label (roadmap, status strip):**
> "Market-researched"

**Secondary label (small chips, badges):**
> "AI-curated"

**New content badge (domain/resource cards):**
> "New this week"

**Never use:**
> "AI-generated" / "GPT" / "Gemini" / "Powered by AI"

### 8.2 Roadmap Page Freshness Line

Full template:
> "This roadmap was last updated in [Month Year] based on active job postings and engineering hiring trends."

Short version (when space is limited, below the h1):
> "Updated [Month Year] · Based on job market data"

When the pipeline has not run yet (no `lastUpdated` field):
> [Render nothing — no badge, no placeholder]

### 8.3 Learning Resources Tab Heading (when AI content exists)

Replace the current "Learning Resources" h1 subtext:
> Current: "Weekly curated resources to deepen your knowledge across different domains"

> Proposed: "Fresh resources every Monday — researched from engineering blogs, docs, and what the industry is actually reading."

This copy is honest (it describes the pipeline accurately), specific (every Monday), and positions the content as industry-signal rather than generic tutorials.

### 8.4 Empty State When AI Hasn't Run Yet

For a specific domain with no weeks yet:
> "[Domain Name] resources are coming soon.
> AcadAI publishes new learning resources every Monday — your first batch for this domain will be ready in the next weekly update."

For the generic empty state:
> "No resources published yet.
> AcadAI researches and curates resources every Monday. Check back then — or explore one of the domains that's already available."

Both empty states should include "Explore other domains" as the primary action (not "Return to Dashboard" — keep users in the learning resources flow).

### 8.5 "Personalize with AI" — New Explanation

Rename button to: **"Tailor to my background"**

Subtitle text beneath or in tooltip:
> "The base roadmap covers everything hiring managers expect. Tailoring removes what you already know and adds depth where your gaps are."

On the personalization complete screen (after `HyperpersonalizationFlow` finishes), the success message currently reads "Roadmap Personalized!" — change to:

> "Your roadmap is now tailored to you."
> Subtitle: "The base market research stays intact — we've adjusted the focus and order based on your specific background."

This reinforces that personalization is additive/subtractive on top of the AI-researched base, not a replacement.

---

## 9. User Flow Diagrams

### Flow 1 — New User: First Roadmap View → AI Discovery → Personalization

```
[Sign Up] → [Onboarding Step 1: User Type]
          → [Step 2: Background]
          → [Step 3: Domain Selection]  ← auto-advance after selection
          → [Step 4: Existing Skills]
          → [Dashboard]

[Dashboard]
  → Sees welcome banner with domain name
  → Clicks "Start Roadmap" or domain card
  → [Roadmap Page loads]

[Roadmap Page — First Visit]
  ┌─────────────────────────────────────┐
  │ One-time banner appears (top):       │
  │ "This roadmap was built from job    │
  │  market research, not a static      │
  │  list. Updated monthly."            │
  │                      [Got it — ×]   │
  └─────────────────────────────────────┘
  User scrolls roadmap nodes
  → Notices specific, non-obvious skills (the real aha moment)
  → Sees freshness badge: "Updated March 2026 · Based on job market data"

  [User considers personalization]
  → Sees "Tailor to my background" button (top right)
  → Hovers: tooltip explains distinction from base roadmap
  → Clicks → [Personalization Flow]
      → Step 1 of N: domain-specific questions
      → ...answers questions...
      → Generating screen: "Adjusting your roadmap based on your background"
      → Complete: shows diff (expanded, streamlined, added topics)
      → "View Your Tailored Roadmap" → back to roadmap

  localStorage: acadai_roadmap_intro_seen = "true"  (banner never shows again)
```

**Drop-off risks in this flow:**
- Between roadmap load and personalization: user may not feel the base roadmap needs adjusting. Mitigate by making the "Tailor" button non-pushy (outline style, not primary CTA).
- During the personalization question wizard: if questions feel too generic or too many, user abandons. Keep to 3-4 max. Each must feel like it will meaningfully change the output.

---

### Flow 2 — Returning User: Monday Morning → New Resources → Progress

```
[User opens AcadAI — Tuesday after Monday pipeline run]

[Dashboard loads]
  → localStorage check: acadai_last_dashboard_visit was 5 days ago
  → Welcome banner: "Good morning, [Name]. You're 34% through Frontend Dev."

  ┌─────────────────────────────────────────────────────────┐
  │ "New this week" banner:                                  │
  │ [ Sparkles ] New resources for Frontend Development      │
  │ 6 resources added — TypeScript patterns, React perf...  │
  │ [Explore this week →]                       [Dismiss]   │
  └─────────────────────────────────────────────────────────┘

  → If user clicks "Explore this week":
      → Navigates to /dashboard/learning-resources/frontend
      → Sees domain-level week list
      → Most recent week has "New" badge
      → Clicks most recent week

  [Weekly Resource View]
  → Sees 6-7 resources (articles, videos, docs)
  → Clicks first resource → opens in article viewer or external tab
  → Returns → sees resource item with checkbox / "mark done"
  → Marks 2-3 resources done
  → Progress bar on domain card updates
  → Returns to dashboard

  [Dashboard — after reading]
  → Welcome banner "Continue" button now reflects updated progress
  → "This Week's Picks" section (if added) shows remaining resources

  localStorage written:
  → acadai_last_dashboard_visit = now
  → acadai_last_resource_week_seen_frontend = now
```

**Drop-off risks in this flow:**
- If the "New this week" banner doesn't appear (because the manifest doesn't expose the most recent week's date to the client), the user has no prompt to visit learning resources. The domain navigation is entirely self-directed, which reduces engagement.
- If resources are low quality or the topic doesn't feel relevant, the user marks nothing done and loses confidence in the platform. Mitigate with the ThumbsDown flag on individual resources.
- "Mark as done" friction: if the checkbox is too small or feels uncertain (does clicking it save?), users won't use it. Show a brief confirmation state (checkmark animates green, "Saved" flashes for 1 second).

---

## 10. Prioritized Improvements

### P1 — Must ship before first 100 users

These are trust-critical. Without them, word-of-mouth will describe AcadAI as "a static learning site, not sure if it does anything special."

**P1.1 — One-time roadmap intro banner**
File to change: `src/app/roadmap/[domain]/page.tsx`
Add a dismissible banner on first visit explaining the market-research origin. Uses `acadai_roadmap_intro_seen` localStorage key. No backend changes needed.
Effort: 1-2 hours
Impact: Sets user expectation correctly before they ever see the roadmap. Most important single change.

**P1.2 — Roadmap freshness badge**
File to change: `src/app/roadmap/[domain]/page.tsx`
Reads `roadmapData.lastUpdated` field. Renders "Updated [Month Year] · Based on job market data" below the h1. Conditionally rendered — absent if field missing.
Requires: the monthly roadmap pipeline to write `lastUpdated` to the Firestore roadmap document.
Effort: 2-3 hours
Impact: Every roadmap visit reinforces that content is maintained and researched.

**P1.3 — Rename "Personalize with AI" to "Tailor to my background"**
File to change: `src/app/roadmap/[domain]/page.tsx` (button label), `src/components/hyperpersonalization/hyperpersonalization-modal.tsx` (top bar title, completion screen copy)
Zero backend changes. Pure copy update.
Effort: 30 minutes
Impact: Eliminates the "isn't this already AI?" confusion. Makes the personalization value prop clear.

**P1.4 — Fix empty state copy and colors in `EmptyResourceState`**
File to change: `src/components/learning-resources/empty-resource-state.tsx`
Fix `text-white` → `text-foreground`, `text-gray-400` → `text-muted-foreground`.
Replace "No Resources Available Yet" copy with the pipeline-explaining version from section 8.4.
Effort: 30 minutes
Impact: Every user who hits an empty domain sees a meaningful explanation, not a dead end.

**P1.5 — Loading state accuracy on roadmap page**
File to change: `src/app/roadmap/[domain]/page.tsx`
The current loading state says "Loading Your Roadmap..." with a pulsing `Bot` icon, which implies real-time AI generation. The roadmap is being loaded from Firestore/static JSON, not generated on-demand.
Change to: a skeleton loader (3-4 content rows) which is standard and does not make false implications.
Use `Skeleton` from `@/components/ui/skeleton` to match the loading state pattern already in `conditional-layout.tsx`.
Effort: 1 hour
Impact: Prevents the false expectation that the roadmap is being generated fresh each visit, which would make load times seem broken.

---

### P2 — Ship within first 30 days of launch

These increase weekly retention and engagement once the user base exists.

**P2.1 — "New This Week" banner on dashboard (returning users)**
Files to change: `src/app/dashboard/page.tsx`
Add conditional banner using `acadai_last_resource_week_seen_{domain}` localStorage key. Compare against most recent week's `publishedDate` in the manifest.
Requires: manifest to expose most-recent-week date per domain (likely a small change to `loadManifest` or the manifest JSON structure).
Effort: 3-4 hours
Impact: Directly drives weekly active users. Users who come back Monday and see "new resources" have a concrete reason to open the learning resources page.

**P2.2 — "Picked for you this week" hero card on Learning Resources page**
Files to change: `src/app/dashboard/learning-resources/page.tsx`
Add a highlighted card above the domain grid showing the user's active domain's most recent week with a direct link.
Effort: 2-3 hours
Impact: Reduces navigation steps from "open learning resources" to "start studying" from 3 clicks to 1.

**P2.3 — Learning Resources page header copy update**
File to change: `src/app/dashboard/learning-resources/page.tsx`
Change subtitle to: "Fresh resources every Monday — researched from engineering blogs, docs, and what the industry is actually reading."
Effort: 5 minutes
Impact: Every visit reinforces the freshness model. Low effort, meaningful positioning.

**P2.4 — "New this week" badge on DomainResourceCard**
File to change: `src/components/learning-resources/domain-resource-card.tsx`
Add `lastUpdatedDate?: string` prop. Conditionally render "New this week" badge if within 7 days.
Effort: 1-2 hours
Impact: Users scanning the domain grid can immediately see which domains are fresh, reducing the cognitive work of deciding where to start.

**P2.5 — AI status strip on dashboard**
File to change: `src/app/dashboard/page.tsx`
Add a one-line status strip ("Roadmaps updated March 2026 · Learning resources updated 3 days ago") between quick access and domain picker.
Implement as a static `src/lib/ai-pipeline-status.ts` file updated manually after each pipeline run.
Effort: 1 hour (including the static config file)
Impact: Answers "is this platform maintained?" for skeptical technical users without requiring them to look for proof.

---

### P3 — Ship after 100 users, based on observed behavior

These are validated once there is behavioral data to confirm the hypothesis.

**P3.1 — "Tailor to my background" tooltip explaining distinction from base roadmap**
Validate first: do users click "Personalize with AI" (renamed in P1.3) without understanding what it does differently from the base? Check with analytics (if GA is set up). If click-through is low, add the tooltip.
Effort: 1 hour

**P3.2 — ThumbsDown flag on individual resource items**
Validate first: are users returning to learning resources after the first week? If yes, quality feedback becomes important. If no, retention is the primary problem (not quality), and feedback collection is premature.
File: `src/components/learning-resources/resource-item.tsx`
Effort: 3-4 hours including Firestore write

**P3.3 — Monthly roadmap update notification (in-context on roadmap page)**
Validate first: does the monthly pipeline actually produce meaningful changes to the roadmap JSON? If changes are minor (only a few nodes updated), the notification may feel like noise.
Implement once the pipeline has run 2-3 times and the diff size is known.
File: `src/app/roadmap/[domain]/page.tsx`
Effort: 2-3 hours

**P3.4 — "This week's picks" section on dashboard**
Validate first: do users click the "New this week" banner (P2.1)? If yes, a persistent section on the dashboard adds value. If the banner already drives enough traffic to learning resources, this section is redundant.
Effort: 3-4 hours

**P3.5 — "New" pill on domain picker cards in dashboard**
Validate first: do users use the domain picker to navigate to learning resources, or do they use the sidebar nav? If most navigate via sidebar, the domain picker cards are not a high-traffic element and the pill adds noise without impact.
Effort: 1-2 hours

---

## Appendix A — Copy Constraints

All copy in this plan follows these rules consistent with the broader AcadAI voice:

- No emojis in micro-copy except where they already exist in the codebase (the welcome banner uses them in the greeting line — acceptable)
- Sentence case for all labels and badges (not title case)
- Direct address: "your roadmap," "your domain" — not "the roadmap," "the user's domain"
- Active verbs: "researched," "updated," "curated" — not passive ("has been generated")
- Specific > vague: "Updated March 2026" > "Recently updated"; "Every Monday" > "Regularly"

---

## Appendix B — Files Referenced in This Plan

All paths are absolute from the project root.

| Component | File |
|---|---|
| Dashboard page | `src/app/dashboard/page.tsx` |
| Learning resources hub | `src/app/dashboard/learning-resources/page.tsx` |
| Roadmap viewer | `src/app/roadmap/[domain]/page.tsx` |
| Sidebar + layout | `src/components/layout/conditional-layout.tsx` |
| Domain resource card | `src/components/learning-resources/domain-resource-card.tsx` |
| Weekly resource card | `src/components/learning-resources/weekly-resource-card.tsx` |
| Empty resource state | `src/components/learning-resources/empty-resource-state.tsx` |
| Personalization flow | `src/components/hyperpersonalization/hyperpersonalization-modal.tsx` |
| AI pipeline status (proposed new file) | `src/lib/ai-pipeline-status.ts` |
| Roadmap service | `src/lib/roadmap-service.ts` |
| Progress service | `src/lib/progress-service.ts` |
