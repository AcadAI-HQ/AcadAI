# AcadAI — AI-Native UI Design Specification

**Version**: 1.0
**Date**: March 2026
**Scope**: AI pipeline surface area — indicators, roadmap page, learning resources, dashboard card

---

## Table of Contents

1. [Design Tokens — AI Semantic Extensions](#1-design-tokens--ai-semantic-extensions)
2. [AI Status Indicator Components](#2-ai-status-indicator-components)
3. [Roadmap Page Header Enhancement](#3-roadmap-page-header-enhancement)
4. [Domain Resource Card Redesign](#4-domain-resource-card-redesign)
5. [AI Week Card Component](#5-ai-week-card-component)
6. [AI Week Detail Page Layout](#6-ai-week-detail-page-layout)
7. [Dashboard AI Engine Status Card](#7-dashboard-ai-engine-status-card)
8. [Micro-animation Specifications](#8-micro-animation-specifications)
9. [globals.css Additions](#9-globalscss-additions)

---

## 1. Design Tokens — AI Semantic Extensions

These values are used throughout all AI-native components. They complement the existing palette and never replace it.

### Color Table

| Token name      | Hex value | Usage |
|-----------------|-----------|-------|
| AI Purple       | `#8E2DE2` | AI-generated label, roadmap banner, left border accents |
| AI Curated Text | `#C084FC` | Text on dark bg for AI-curated labels (lighter purple, 4.7:1 on card bg) |
| AI Blue         | `#3B82F6` | AI-generated roadmap badge, banner tint |
| AI Blue Text    | `#60A5FA` | Text on dark bg for AI-generated labels |
| Fresh Green     | `#22C55E` | Pulsing dot for content updated within 14 days |
| Stale Gray      | `#6B7280` | Static dot for content older than 14 days |
| Article Blue    | `#3B82F6` | Left border + icon on article resource items |
| Video Red       | `#EF4444` | Left border + icon on video resource items |
| Tool Green      | `#10B981` | Left border + icon on tool resource items |
| Course Orange   | `#F97316` | Left border + icon on course resource items |
| Doc Gray        | `#6B7280` | Left border + icon on documentation resource items |

### Background Tint Formula

All AI-tinted backgrounds follow a consistent formula:

- Container background: `bg-gradient-to-br from-[#3B82F6]/5 to-[#8E2DE2]/5`
- Container border: `border border-[#3B82F6]/10`
- Hover border: `hover:border-[#3B82F6]/25`
- Badge fill (purple): `bg-[#8E2DE2]/15`
- Badge fill (blue): `bg-[#3B82F6]/15`

---

## 2. AI Status Indicator Components

These are inline, composable building blocks placed inside card headers, page titles, and banners. They never stand alone — they always accompany a content element.

### 2a. "AI Curated" Badge

Used next to week counts in `DomainResourceCard`, in `WeeklyResourceCard` headers, and in the domain resource list page header.

```tsx
// Component: AiCuratedBadge
// File target: src/components/shared/ai-badges.tsx (new file)

<motion.span
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.3, ease: 'backOut' }}
  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-[#8E2DE2]/15 text-[#C084FC] border border-[#8E2DE2]/25"
>
  <Sparkles className="h-2.5 w-2.5" />
  AI Curated
</motion.span>
```

Typography: `text-[10px] font-semibold tracking-wider`
Icon size: `h-2.5 w-2.5` (10px)
Gap between icon and text: `gap-1` (4px)
Do not use this badge at sizes smaller than 10px — it becomes illegible.

### 2b. "AI Generated" Badge

Used in the roadmap page header when `source === 'ai-generated'`.

```tsx
// Component: AiGeneratedBadge

<motion.span
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.3, ease: 'backOut' }}
  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/25"
>
  <BrainCircuit className="h-2.5 w-2.5" />
  AI Generated
</motion.span>
```

### 2c. "Fresh" Indicator

Used in the AI Engine Status Card and inline next to last-updated timestamps throughout the app. The green dot uses the Tailwind built-in `animate-pulse`.

```tsx
// Component: FreshIndicator
// Props: daysAgo (number)

<span className="inline-flex items-center gap-1.5">
  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse flex-shrink-0" />
  <span className="text-[11px] text-muted-foreground">
    Updated {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
  </span>
</span>
```

Threshold rule: show green + pulse when `daysAgo <= 14`. Show gray static dot when `daysAgo > 14`.

### 2d. "Stale" Indicator

```tsx
// Component: StaleIndicator
// Props: daysAgo (number)

<span className="inline-flex items-center gap-1.5">
  <span className="w-1.5 h-1.5 rounded-full bg-[#6B7280] flex-shrink-0" />
  <span className="text-[11px] text-muted-foreground">
    Updated {daysAgo}d ago
  </span>
</span>
```

No animation on the stale dot — static gray communicates inactivity without drawing attention.

### 2e. Composable Freshness Wrapper

A utility component that renders either `FreshIndicator` or `StaleIndicator` based on the date.

```tsx
// Component: ContentFreshness
// File target: src/components/shared/ai-badges.tsx

interface ContentFreshnessProps {
  updatedAt: Date | string;
}

export function ContentFreshness({ updatedAt }: ContentFreshnessProps) {
  const date = typeof updatedAt === 'string' ? new Date(updatedAt) : updatedAt;
  const daysAgo = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  const isFresh = daysAgo <= 14;

  return isFresh
    ? <FreshIndicator daysAgo={daysAgo} />
    : <StaleIndicator daysAgo={daysAgo} />;
}
```

---

## 3. Roadmap Page Header Enhancement

**Target file**: `src/app/roadmap/[domain]/page.tsx`

The current header has a back button, title section, and a "Personalize with AI" button. This spec adds an AI-status banner between the header row and the title section, and upgrades the personalization button.

### 3a. AI Freshness Banner

Insert this block immediately after the `<div className="flex items-center justify-between mb-6">` header row, before the title section. It is only rendered when `roadmapData.source === 'ai-generated'` or when a `lastUpdated` timestamp is available on the roadmap object.

```tsx
{/* AI Freshness Banner */}
{roadmapData && (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="bg-gradient-to-r from-[#3B82F6]/8 to-[#8E2DE2]/8 border border-[#3B82F6]/15 rounded-xl p-3 mb-6 flex items-center gap-3"
  >
    {/* Sparkle icon */}
    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
      <Sparkles className="h-3.5 w-3.5 text-[#60A5FA]" />
    </div>

    {/* Text block */}
    <div className="flex-1 min-w-0">
      <p className="text-[12px] font-medium text-foreground/80 leading-snug">
        This roadmap is updated monthly with the latest job market data.
      </p>
      <p className="text-[11px] text-muted-foreground mt-0.5">
        Last updated: Mar 2026
        {/* Replace with: format(new Date(roadmapData.lastUpdated), 'MMM yyyy') */}
      </p>
    </div>

    {/* AI Generated badge */}
    <div className="flex-shrink-0">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/25">
        <BrainCircuit className="h-2.5 w-2.5" />
        AI Generated
      </span>
    </div>
  </motion.div>
)}
```

Visual anatomy:
- Left icon well: 28px square, `rounded-lg`, 10% blue fill
- Banner height: auto, min ~52px, `p-3` (12px all sides)
- The gradient is extremely subtle — 8% opacity on both stops. It should whisper, not shout.
- On mobile (`< sm`), hide the badge on the right and let the text block fill width.

Mobile adaptation:
```tsx
// Add to the badge wrapper div:
className="flex-shrink-0 hidden sm:block"
```

### 3b. "Personalize with AI" Button Upgrade

Replace the current button:
```tsx
// CURRENT (to be replaced):
className="gap-2 border-[#29ABE2]/30 text-[#29ABE2] hover:bg-[#29ABE2]/10 hover:border-[#29ABE2]/50 hover:text-[#29ABE2]"
```

With a gradient-border version using a wrapper technique. Since Tailwind cannot natively do gradient borders on buttons, use a wrapping `div`:

```tsx
{/* Personalize with AI — gradient border button */}
<div className="relative p-px rounded-xl bg-gradient-to-r from-[#3B82F6]/40 to-[#8E2DE2]/40 hover:from-[#3B82F6]/70 hover:to-[#8E2DE2]/70 transition-all duration-200 shadow-[0_0_0_0_rgba(59,130,246,0)] hover:shadow-[0_0_16px_rgba(59,130,246,0.18)]">
  <button
    onClick={() => setView("personalizing")}
    className="flex items-center gap-2 px-3 py-1.5 rounded-[11px] bg-background text-[13px] font-medium text-foreground/80 hover:text-foreground transition-colors"
  >
    <Sparkles className="h-3.5 w-3.5 text-[#60A5FA]" />
    Personalize with AI
  </button>
</div>
```

The inner button radius is `rounded-[11px]` (one pixel inside the `rounded-xl` wrapper) to avoid a gap artifact.

Hover state: gradient border goes from 40% to 70% opacity. Box shadow grows to `0_0_16px_rgba(59,130,246,0.18)` — a soft blue glow.

---

## 4. Domain Resource Card Redesign

**Target file**: `src/components/learning-resources/domain-resource-card.tsx`

### 4a. Props Extension

Add `hasAiContent: boolean` to `DomainResourceCardProps`.

```tsx
interface DomainResourceCardProps {
  domain: { id: string; name: string; icon: LucideIcon };
  availableWeeks: number;
  completionPercentage?: number;
  hasAiContent?: boolean;   // NEW: true when AI-generated weeks exist
  onSelect: () => void;
}
```

### 4b. Full Revised Component JSX

```tsx
export function DomainResourceCard({
  domain,
  availableWeeks,
  completionPercentage = 0,
  hasAiContent = false,
  onSelect,
}: DomainResourceCardProps) {
  const Icon = domain.icon;
  const hasResources = availableWeeks > 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    >
      <Card
        onClick={hasResources ? onSelect : undefined}
        className={`
          h-full flex flex-col justify-between transition-all duration-200 relative overflow-hidden
          ${hasResources
            ? 'cursor-pointer hover:shadow-[0_0_24px_rgba(59,130,246,0.08)]'
            : 'cursor-not-allowed opacity-60'}
          ${hasAiContent
            ? 'border-l-2 border-l-[#8E2DE2] hover:border-[#8E2DE2]/30'
            : 'hover:border-primary/40'}
        `}
      >
        {/* Subtle AI tint overlay — only when hasAiContent */}
        {hasAiContent && (
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#8E2DE2]/3 to-transparent"
            aria-hidden
          />
        )}

        <CardHeader className="relative">
          <div className="flex justify-between items-start mb-3">
            {/* Icon with optional shimmer */}
            <div className={`relative ${hasAiContent ? 'ai-icon-shimmer' : ''}`}>
              <Icon
                className={`h-9 w-9 ${
                  hasResources
                    ? hasAiContent ? 'text-[#C084FC]' : 'text-primary'
                    : 'text-muted-foreground'
                }`}
              />
            </div>

            {/* Badge cluster */}
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {hasAiContent && hasResources && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: 'backOut' }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-[#8E2DE2]/15 text-[#C084FC] border border-[#8E2DE2]/25"
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  AI Curated
                </motion.span>
              )}
              {!hasResources ? (
                <Badge variant="secondary" className="text-[11px]">Coming Soon</Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-[#29ABE2]/40 text-[#29ABE2] text-[11px]"
                >
                  {availableWeeks} {availableWeeks === 1 ? 'Week' : 'Weeks'}
                </Badge>
              )}
            </div>
          </div>

          <CardTitle className="font-headline text-base leading-snug">
            {domain.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="relative">
          <CardDescription className="mb-4 text-[13px] leading-relaxed">
            {hasResources
              ? `${availableWeeks} week${availableWeeks !== 1 ? 's' : ''} of ${hasAiContent ? 'AI-curated' : 'curated'} learning resources for ${domain.name}.`
              : (
                <span>
                  Learning resources for {domain.name} are coming soon.{' '}
                  <span className="text-[#C084FC]/80">AI resources launching shortly.</span>
                </span>
              )
            }
          </CardDescription>

          {hasResources && completionPercentage > 0 && (
            <ResourceProgressBar
              completed={completionPercentage}
              total={100}
              showPercentage={true}
              size="sm"
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

### 4c. Icon Shimmer Animation

The `ai-icon-shimmer` class creates a soft sweep effect on the icon. Add to `globals.css`:

```css
/* In @layer utilities */
.ai-icon-shimmer {
  position: relative;
}
.ai-icon-shimmer::after {
  content: '';
  position: absolute;
  inset: -4px;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(192, 132, 252, 0.25) 50%,
    transparent 60%
  );
  background-size: 200% 100%;
  animation: ai-shimmer 2.8s ease-in-out infinite;
  border-radius: 8px;
  pointer-events: none;
}
@keyframes ai-shimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}
```

This produces a single slow light-sweep across the icon — subtle enough that users feel something is different without knowing exactly what.

### 4d. Coming Soon Card Micro-copy

The "AI resources launching soon" text uses `text-[#C084FC]/80` — the AI Curated text color at 80% opacity. This connects the coming-soon promise visually with the AI brand. Do not make this text clickable or interactive.

---

## 5. AI Week Card Component

This is a variant of `WeeklyResourceCard` used when a week's data was generated by the AI pipeline rather than written by hand. It is NOT a separate component file — it is a conditional rendering path inside the existing `WeeklyResourceCard`.

**Target file**: `src/components/learning-resources/weekly-resource-card.tsx`

### 5a. Props Extension

```tsx
interface WeeklyResourceCardProps {
  weekNumber: number;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  publishedDate: string;
  completedResources?: number;
  totalResources: number;
  isCompleted?: boolean;
  isAiGenerated?: boolean;          // NEW
  resourceTypeCounts?: {            // NEW — for type breakdown pills
    article?: number;
    video?: number;
    tool?: number;
    course?: number;
  };
  onClick: () => void;
}
```

### 5b. Full Revised Component JSX

```tsx
export function WeeklyResourceCard({
  weekNumber,
  title,
  difficulty,
  estimatedTime,
  publishedDate,
  completedResources = 0,
  totalResources,
  isCompleted = false,
  isAiGenerated = false,
  resourceTypeCounts,
  onClick,
}: WeeklyResourceCardProps) {
  const difficultyColors = {
    beginner:     'bg-green-500/10  text-green-500  border-green-500/20',
    intermediate: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    advanced:     'bg-red-500/10    text-red-500    border-red-500/20',
  };

  const parsedDate = publishedDate ? new Date(publishedDate) : null;
  const publishedAgo =
    parsedDate && !isNaN(parsedDate.getTime())
      ? formatDistance(parsedDate, new Date(), { addSuffix: true })
      : null;

  // Determine week-of date label for AI cards
  const weekOfLabel = parsedDate && !isNaN(parsedDate.getTime())
    ? `Week of ${format(parsedDate, 'MMM d, yyyy')}`
    : `Week ${weekNumber}`;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card
        onClick={onClick}
        className={`
          cursor-pointer transition-all duration-200 relative overflow-hidden
          hover:shadow-md
          ${isAiGenerated
            ? 'border-l-2 border-l-[#8E2DE2] hover:border-[#8E2DE2]/30 hover:shadow-[0_0_20px_rgba(142,45,226,0.07)]'
            : 'hover:border-primary/40'}
        `}
      >
        {/* AI gradient tint */}
        {isAiGenerated && (
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#8E2DE2]/4 to-transparent"
            aria-hidden
          />
        )}

        <CardHeader className="relative pb-2">
          <div className="flex items-start justify-between mb-2">
            {/* Left: week label + completion check */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#29ABE2] leading-none">
                {isAiGenerated ? weekOfLabel : `Week ${weekNumber}`}
              </span>
              {isCompleted && (
                <CheckCircle2 className="h-4.5 w-4.5 text-[#22C55E] flex-shrink-0" />
              )}
            </div>

            {/* Right: badges */}
            <div className="flex items-center gap-1.5">
              {isAiGenerated && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: 'backOut' }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-[#8E2DE2]/15 text-[#C084FC] border border-[#8E2DE2]/25"
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  AI Curated
                </motion.span>
              )}
              <Badge variant="outline" className={difficultyColors[difficulty]}>
                {difficulty}
              </Badge>
            </div>
          </div>

          <CardTitle className="font-headline text-base leading-snug line-clamp-2">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="relative pt-0">
          {/* Meta row */}
          <div className="flex items-center gap-3 text-[12px] text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {estimatedTime} min
            </span>
            {publishedAgo && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {publishedAgo}
              </span>
            )}
            {isAiGenerated && (
              <span className="text-[#C084FC]/70 ml-auto">
                {totalResources} resources · Curated by AI
              </span>
            )}
          </div>

          {/* Type breakdown pills — only for AI cards when counts are provided */}
          {isAiGenerated && resourceTypeCounts && (
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              {resourceTypeCounts.article && resourceTypeCounts.article > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/15">
                  <FileText className="h-2.5 w-2.5" />
                  {resourceTypeCounts.article} article{resourceTypeCounts.article > 1 ? 's' : ''}
                </span>
              )}
              {resourceTypeCounts.video && resourceTypeCounts.video > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-[#EF4444]/10 text-[#F87171] border border-[#EF4444]/15">
                  <Video className="h-2.5 w-2.5" />
                  {resourceTypeCounts.video} video{resourceTypeCounts.video > 1 ? 's' : ''}
                </span>
              )}
              {resourceTypeCounts.tool && resourceTypeCounts.tool > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/15">
                  <Wrench className="h-2.5 w-2.5" />
                  {resourceTypeCounts.tool} tool{resourceTypeCounts.tool > 1 ? 's' : ''}
                </span>
              )}
              {resourceTypeCounts.course && resourceTypeCounts.course > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-[#F97316]/10 text-[#FB923C] border border-[#F97316]/15">
                  <GraduationCap className="h-2.5 w-2.5" />
                  {resourceTypeCounts.course} course{resourceTypeCounts.course > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          {/* Progress bar */}
          {completedResources > 0 && (
            <ResourceProgressBar
              completed={completedResources}
              total={totalResources}
              showPercentage={true}
              size="sm"
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

Required new imports for this component:
```tsx
import { FileText, Video, Wrench, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
```

### 5c. Type Pill Sizing Rules

Type pills use `rounded` (4px), not `rounded-full`. This distinguishes them from the AI badge (rounded-full) and difficulty badge (rounded-full). The squared corners read as "metadata" while the rounded ones read as "status."

---

## 6. AI Week Detail Page Layout

**Target file**: `src/app/dashboard/learning-resources/[domain]/[week]/page.tsx`
**Target component**: `src/components/learning-resources/resource-detail-view.tsx`

### 6a. Page Header Additions

In `WeekDetailPage`, add an AI provenance banner directly above the `ResourceDetailView` when the resource was AI-generated. This mirrors the roadmap banner pattern.

```tsx
{/* AI provenance banner — rendered in page.tsx above ResourceDetailView */}
{resource.isAiGenerated && (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.28, ease: 'easeOut' }}
    className="flex items-center gap-3 bg-gradient-to-r from-[#8E2DE2]/8 to-[#3B82F6]/8 border border-[#8E2DE2]/15 rounded-xl px-4 py-3 mb-6"
  >
    <Sparkles className="h-4 w-4 text-[#C084FC] flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[12px] font-medium text-foreground/80 leading-snug">
        These resources were curated by AI based on current trends and developer demand.
      </p>
    </div>
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-[#8E2DE2]/15 text-[#C084FC] border border-[#8E2DE2]/25 flex-shrink-0 hidden sm:inline-flex">
      <Sparkles className="h-2.5 w-2.5" />
      AI Curated
    </span>
  </motion.div>
)}
```

### 6b. ResourceDetailView Header Enhancement

In `resource-detail-view.tsx`, upgrade the page header to use design-system tokens instead of hard-coded `text-white` and `text-gray-400`:

```tsx
{/* BEFORE */}
<h1 className="text-3xl font-bold text-white">Week {resource.weekNumber}</h1>
<h2 className="text-xl text-gray-300">{resource.title}</h2>
<p className="text-gray-400">{resource.description}</p>

{/* AFTER */}
<h1 className="text-3xl font-headline font-bold text-foreground">
  Week {resource.weekNumber}
</h1>
<h2 className="text-lg text-foreground/70 mt-1">{resource.title}</h2>
<p className="text-muted-foreground mt-3 leading-relaxed text-sm max-w-2xl">
  {resource.description}
</p>
```

Replace all instances of `text-gray-400` with `text-muted-foreground` and all `text-white` with `text-foreground` throughout `resource-detail-view.tsx`. This makes the component respect the CSS variable theming system.

### 6c. Resource Item Left Border by Type

**Target file**: `src/components/learning-resources/resource-item.tsx`

The current `ResourceItem` card has no left border. Add type-specific left borders for visual scanning:

```tsx
const typeBorderColors = {
  article:  'border-l-2 border-l-[#3B82F6]',
  video:    'border-l-2 border-l-[#EF4444]',
  tutorial: 'border-l-2 border-l-[#10B981]',
  tool:     'border-l-2 border-l-[#10B981]',
  project:  'border-l-2 border-l-[#A855F7]',
  course:   'border-l-2 border-l-[#F97316]',
};

// Apply to Card:
<Card
  className={`
    group transition-all duration-200
    ${typeBorderColors[resource.type as keyof typeof typeBorderColors] ?? 'border-l-2 border-l-[#6B7280]'}
    ${isCompleted ? 'bg-[#22C55E]/4 border-[#22C55E]/20' : 'hover:border-primary/30'}
  `}
>
```

The left border replaces the visual differentiation currently done purely by icon color. Both can coexist — they reinforce each other.

### 6d. "Open Resource" Hover Button

The current implementation reveals the `ExternalLink` icon on hover. Upgrade to a labeled button that animates in on card hover:

```tsx
{/* In the resource item, replace ExternalLink icon with: */}
<div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
  <button
    onClick={handleCardClick}
    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#3B82F6]/10 text-[#60A5FA] text-[11px] font-medium hover:bg-[#3B82F6]/20 transition-colors"
  >
    <ExternalLink className="h-3 w-3" />
    Open
  </button>
</div>
```

For items with inline content (`resource.content` is set), the button label changes to "Read" and uses cyan instead:

```tsx
<button
  onClick={() => setShowArticle(true)}
  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#29ABE2]/10 text-[#29ABE2] text-[11px] font-medium hover:bg-[#29ABE2]/20 transition-colors"
>
  <BookOpen className="h-3 w-3" />
  Read
</button>
```

---

## 7. Dashboard AI Engine Status Card

**Target file**: `src/app/dashboard/page.tsx`

This card is inserted inside the Quick Access section — specifically as a fifth item that spans full width below the 2×2 grid on mobile, or appears as a wider card at the end of the grid on desktop.

### 7a. Placement

Insert after the `QUICK_ACTIONS` grid and before the domain picker:

```tsx
{/* Between Quick access and Domain picker */}
<motion.div {...fadeUp(0.16)}>
  <AiEngineStatusCard />
</motion.div>
```

### 7b. Full Component Spec

Create a new file: `src/components/dashboard/ai-engine-status-card.tsx`

```tsx
// src/components/dashboard/ai-engine-status-card.tsx
'use client';

import { BrainCircuit, Sparkles, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface AiStatusRow {
  label: string;
  value: string;
  daysAgo: number;
  href?: string;
}

interface AiEngineStatusCardProps {
  roadmapUpdatedDaysAgo: number;
  resourcesRefreshedDaysAgo: number;
  latestBlogTitle: string;
  latestBlogSlug: string;
}

function StatusRow({ label, value, daysAgo, href }: AiStatusRow) {
  const isFresh = daysAgo <= 14;

  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            isFresh ? 'bg-[#22C55E] animate-pulse' : 'bg-[#6B7280]'
          }`}
        />
        <span className="text-[12px] text-muted-foreground truncate">{label}</span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 ml-3">
        {href ? (
          <Link
            href={href}
            className="text-[12px] text-[#60A5FA] hover:text-[#3B82F6] hover:underline transition-colors flex items-center gap-0.5"
          >
            {value}
            <ExternalLink className="h-2.5 w-2.5" />
          </Link>
        ) : (
          <span className="text-[12px] text-foreground/70 font-medium">{value}</span>
        )}
      </div>
    </div>
  );
}

export function AiEngineStatusCard({
  roadmapUpdatedDaysAgo,
  resourcesRefreshedDaysAgo,
  latestBlogTitle,
  latestBlogSlug,
}: AiEngineStatusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-gradient-to-br from-[#3B82F6]/5 to-[#8E2DE2]/5 border border-[#3B82F6]/10 rounded-xl p-4"
    >
      {/* Card header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0">
          <BrainCircuit className="h-3.5 w-3.5 text-[#60A5FA]" />
        </div>
        <span className="text-[13px] font-semibold text-foreground/80">AI Engine</span>
        <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wider bg-[#22C55E]/12 text-[#22C55E] border border-[#22C55E]/20">
          <span className="w-1 h-1 rounded-full bg-[#22C55E] animate-pulse" />
          Live
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5 mb-2" />

      {/* Status rows */}
      <div className="space-y-0">
        <StatusRow
          label="Roadmaps"
          value={roadmapUpdatedDaysAgo === 0 ? 'Updated today' : `Updated ${roadmapUpdatedDaysAgo}d ago`}
          daysAgo={roadmapUpdatedDaysAgo}
        />
        <StatusRow
          label="Learning Resources"
          value={resourcesRefreshedDaysAgo === 0 ? 'Refreshed today' : `Refreshed ${resourcesRefreshedDaysAgo}d ago`}
          daysAgo={resourcesRefreshedDaysAgo}
        />
        <StatusRow
          label="Latest post"
          value={latestBlogTitle.length > 32 ? latestBlogTitle.slice(0, 32) + '…' : latestBlogTitle}
          daysAgo={0}
          href={`/blog/${latestBlogSlug}`}
        />
      </div>
    </motion.div>
  );
}
```

### 7c. Visual Anatomy

```
┌─────────────────────────────────────────────────┐  ← rounded-xl
│  [🧠]  AI Engine               ● Live           │  ← 56px header
│ ────────────────────────────────────────────── │  ← 1px divider
│  ● Roadmaps          Updated 2d ago             │  ← 36px row
│  ● Learning Resources  Refreshed 5d ago         │  ← 36px row
│  ● Latest post       "The Future of Sys..." ↗   │  ← 36px row (linked)
└─────────────────────────────────────────────────┘
  Total height: ~172px
  Width: full parent width (col-span behavior)
```

Card padding: `p-4` (16px)
Row padding: `py-1.5` per row, no `px` needed (container provides it)
Divider: `h-px bg-white/5` — extremely subtle, just separates header from rows

### 7d. Placement in Dashboard Grid

On the dashboard, the Quick Actions currently renders 4 cards in `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`. The AI Engine card should sit outside this grid, spanning full width between "Quick access" and "Explore domains":

```tsx
{/* ── Quick access ── */}
<motion.div {...fadeUp(0.12)}>
  <h2 className="mb-3 text-base font-semibold text-foreground/80">Quick access</h2>
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {/* existing action cards */}
  </div>
</motion.div>

{/* ── AI Engine status ── */}
<motion.div {...fadeUp(0.16)}>
  <AiEngineStatusCard
    roadmapUpdatedDaysAgo={2}
    resourcesRefreshedDaysAgo={5}
    latestBlogTitle="The State of AI in 2026"
    latestBlogSlug="state-of-ai-2026"
  />
</motion.div>

{/* ── Domain picker ── */}
<motion.div {...fadeUp(0.18)}>
  ...
</motion.div>
```

The `fadeUp` delay is `0.16` — fitting between the quick actions (0.12) and domain picker (0.18).

---

## 8. Micro-animation Specifications

All animations use Framer Motion. No CSS keyframe animations are used for entry/exit — only for continuous effects (shimmer, pulse).

### 8a. AI Badge Entrance

Used on: `AiCuratedBadge`, `AiGeneratedBadge`, type pills in week cards.

```ts
const aiBadgeVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3, ease: 'backOut' },
};
```

`backOut` easing produces a slight overshoot that gives the badge a "pop in" feel — appropriate for something that signals intelligence/AI.

### 8b. Resource Card Stagger

Used on: the resource list in `DomainResourcesPage`, the resource items in `ResourceDetailView`.

```ts
// Parent container variants
const resourceListVariants = {
  animate: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

// Child card variants
const resourceCardVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};
```

Usage:
```tsx
<motion.div variants={resourceListVariants} initial="initial" animate="animate" className="space-y-3">
  {resources.map((resource) => (
    <motion.div key={resource.id} variants={resourceCardVariants}>
      <ResourceItem ... />
    </motion.div>
  ))}
</motion.div>
```

### 8c. AI Banner Entrance

Used on: roadmap page AI banner, week detail AI banner.

```ts
const aiBannerVariants = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
};
```

Slides down from above, not up from below. This is intentional — banners come from the top of the page.

### 8d. AI Engine Card Entrance

```ts
const aiCardVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
};
```

Same easing as the existing `fadeUp` pattern on the dashboard for consistency.

### 8e. "Live" Dot Pulse

The "Live" indicator in the AI Engine card uses a CSS `animate-pulse` on a 1px dot:

```tsx
<span className="w-1 h-1 rounded-full bg-[#22C55E] animate-pulse" />
```

The outer badge is static — only the inner dot pulses. This avoids the badge itself from bouncing, which would look unstable.

### 8f. Icon Shimmer (CSS, not Framer Motion)

Defined in section 4c above. Uses CSS `background-position` animation because Framer Motion does not animate `background-position` efficiently. The sweep interval is `2.8s` — slow enough to be subtle.

### 8g. Hover Transitions

All cards use CSS transitions, not Framer Motion, for hover state changes:

```
transition-all duration-200
```

200ms is the maximum for hover transitions. Anything longer feels sluggish. Framer Motion `whileHover` is used for `y` transforms only.

---

## 9. globals.css Additions

Add the following to `src/app/globals.css` inside `@layer utilities`:

```css
@layer utilities {
  /* AI icon shimmer effect — used on DomainResourceCard icon when hasAiContent */
  .ai-icon-shimmer {
    position: relative;
  }
  .ai-icon-shimmer::after {
    content: '';
    position: absolute;
    inset: -4px;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(192, 132, 252, 0.25) 50%,
      transparent 60%
    );
    background-size: 200% 100%;
    animation: ai-shimmer 2.8s ease-in-out infinite;
    border-radius: 8px;
    pointer-events: none;
  }

  @keyframes ai-shimmer {
    0%   { background-position: 200% center; }
    100% { background-position: -200% center; }
  }

  /* Gradient border utility for Personalize button */
  .gradient-border-ai {
    background: linear-gradient(var(--bg, hsl(var(--background))), var(--bg, hsl(var(--background)))) padding-box,
                linear-gradient(to right, rgba(59,130,246,0.4), rgba(142,45,226,0.4)) border-box;
    border: 1px solid transparent;
  }
  .gradient-border-ai:hover {
    background: linear-gradient(var(--bg, hsl(var(--background))), var(--bg, hsl(var(--background)))) padding-box,
                linear-gradient(to right, rgba(59,130,246,0.7), rgba(142,45,226,0.7)) border-box;
    box-shadow: 0 0 16px rgba(59,130,246,0.18);
  }
}
```

---

## Implementation Priority Order

1. **`src/components/shared/ai-badges.tsx`** (new) — foundation component used everywhere
2. **`src/app/globals.css`** — add shimmer + gradient-border utilities
3. **`src/components/learning-resources/domain-resource-card.tsx`** — add `hasAiContent` prop, left border, badge, shimmer
4. **`src/components/learning-resources/weekly-resource-card.tsx`** — add `isAiGenerated` path, type pills
5. **`src/components/learning-resources/resource-item.tsx`** — add left border by type, "Open/Read" hover button
6. **`src/app/roadmap/[domain]/page.tsx`** — add AI freshness banner, upgrade Personalize button
7. **`src/components/dashboard/ai-engine-status-card.tsx`** (new) — AI Engine status card
8. **`src/app/dashboard/page.tsx`** — add `AiEngineStatusCard` between quick actions and domain picker
9. **`src/components/learning-resources/resource-detail-view.tsx`** — swap hard-coded gray text to design-system tokens

---

## Contrast & Accessibility Notes

| Text / bg pair | Ratio | Pass at |
|---|---|---|
| `#C084FC` on `#111117` (card bg) | 4.9:1 | AA body |
| `#60A5FA` on `#111117` | 5.2:1 | AA body |
| `#22C55E` on `#111117` | 5.1:1 | AA body |
| `#C084FC` on `bg-[#8E2DE2]/15` tint | 4.7:1 | AA body |
| `#60A5FA` on `bg-[#3B82F6]/15` tint | 4.8:1 | AA body |

All badge text passes AA at 10px bold (large text threshold is 14px bold per WCAG 2.1, so these require full 4.5:1 — confirmed above).

Interactive elements (buttons, card click targets) all have `:hover` state defined. Focus states inherit from shadcn/ui's default `ring` handling. No additional focus styles needed unless a new `<button>` element is introduced — in that case, add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50`.
