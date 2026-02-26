import { NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';

/* ── Dimensions (LAYOUT_WIDE 13.33" × 7.5") ──────────────── */
const ML  = 0.65;  // left / right margin
const CW  = 13.33 - ML * 2; // 12.03" content width

/* ── Colour palette ───────────────────────────────────────── */
const C = {
  DARK:        '0A0A0A',
  BLUE:        '3B82F6',
  BLUE_DARK:   '1D4ED8',
  BLUE_BG:     'EFF6FF',
  BLUE_BORDER: 'BFDBFE',
  BLUE_TEXT:   '2563EB',
  INDIGO:      '4338CA',
  WHITE:       'FFFFFF',
  TEXT:        '111827',
  MID:         '6B7280',
  DIM:         '9CA3AF',
  FAINT:       'D1D5DB',
  LIGHT_BG:    'F8FAFC',
  BORDER:      'E5E7EB',
  GREEN:       '22C55E',
  AMBER:       'D97706',
  SLIDE_DIM:   '4B5563',  // muted text on dark slides
  SLIDE_FAINT: '374151',  // very muted on dark
};

/* ── Type helpers ─────────────────────────────────────────── */
type Slide = ReturnType<PptxGenJS['addSlide']>;

/* ── Common helpers ───────────────────────────────────────── */
function ol(s: Slide, text: string, isDark = false) {
  s.addText(text.toUpperCase(), {
    x: ML, y: 0.48, w: CW, h: 0.28,
    fontFace: 'Arial', fontSize: 8.5, bold: true, charSpacing: 3,
    color: isDark ? '555566' : 'B0B0C0',
  });
}

function h1(s: Slide, text: string, y: number, isDark = false, size = 34) {
  s.addText(text, {
    x: ML, y, w: CW, h: size < 30 ? 0.9 : 1.5,
    fontFace: 'Arial', fontSize: size, bold: true,
    color: isDark ? C.WHITE : C.TEXT,
    lineSpacingMultiple: 1.12,
  });
}

function body(s: Slide, text: string, x: number, y: number, w: number, h: number, color = C.MID, size = 12) {
  s.addText(text, { x, y, w, h, fontFace: 'Arial', fontSize: size, color, lineSpacingMultiple: 1.35, wrap: true });
}

function box(s: Slide, x: number, y: number, w: number, h: number, fill = C.LIGHT_BG, border = C.BORDER) {
  s.addShape('roundRect', { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: border, width: 0.6 } });
}

function darkBox(s: Slide, x: number, y: number, w: number, h: number) {
  s.addShape('roundRect', { x, y, w, h, rectRadius: 0.08, fill: { color: '141420' }, line: { color: '2A2A3A', width: 0.6 } });
}

function check(s: Slide, x: number, y: number, good: boolean, blue = false) {
  s.addText(good ? '✓' : '✗', {
    x, y, w: 0.5, h: 0.35,
    fontFace: 'Arial', fontSize: 13, bold: true,
    color: good ? (blue ? C.BLUE_TEXT : C.GREEN) : C.FAINT,
    align: 'center',
  });
}

/* ═══════════════════════════════════════════════════════════ */
/*  SLIDE BUILDERS                                             */
/* ═══════════════════════════════════════════════════════════ */

/* 01 Cover */
function s01(pptx: PptxGenJS) {
  const s = pptx.addSlide();
  s.background = { color: C.DARK };
  s.addShape('ellipse', { x: 3, y: 4.2, w: 7, h: 5, fill: { color: C.BLUE, transparency: 82 }, line: { type: 'none' } });

  s.addText('⚡  ACAD AI', { x: ML, y: 0.45, w: 5, h: 0.4, fontFace: 'Arial', fontSize: 13, bold: true, color: '6699FF' });

  s.addText('The AI-native platform', { x: ML, y: 1.1, w: CW, h: 1.0, fontFace: 'Arial', fontSize: 44, bold: true, color: C.WHITE });
  s.addText('that learns as it runs.', { x: ML, y: 1.95, w: CW, h: 1.0, fontFace: 'Arial', fontSize: 44, bold: true, color: '7AB3FF' });

  body(s, 'Market-demand backed roadmaps across 13+ domains — hyper-personalised per user, auto-updated by AI weekly, powered by a self-improving data flywheel.', ML, 3.25, 9, 0.9, '8899AA', 14);

  s.addShape('line', { x: ML, y: 4.5, w: CW, h: 0, line: { color: '222233', width: 0.5 } });
  s.addText('Pre-Seed  ·  2026', { x: ML, y: 4.65, w: 4, h: 0.3, fontFace: 'Arial', fontSize: 9, color: '445566', charSpacing: 2 });
  s.addText('Confidential — do not distribute', { x: 9.33, y: 4.65, w: 4, h: 0.3, fontFace: 'Arial', fontSize: 9, color: '445566', align: 'right' });
}

/* 02 Problem */
function s02(pptx: PptxGenJS) {
  const s = pptx.addSlide();
  s.background = { color: C.WHITE };
  ol(s, 'The Problem');
  h1(s, 'Developers are learning the wrong things.', 0.85);

  const cols = [ML, ML + 4.12, ML + 8.24];
  const stats = [
    { n: '43%',   l: 'of developers feel their skills are 2+ years behind what employers want', src: 'Stack Overflow Dev Survey 2024' },
    { n: '18 mo', l: 'avg. lag between skill demand peaking in job postings and bootcamps teaching it', src: 'LinkedIn Workforce Report' },
    { n: '8 hrs', l: 'per week spent researching what to learn next — with no clear answer', src: 'Internal user research' },
  ];
  stats.forEach(({ n, l, src }, i) => {
    box(s, cols[i], 2.4, 3.9, 2.8);
    s.addText(n,   { x: cols[i]+0.2, y: 2.6,  w: 3.5, h: 0.8, fontFace:'Arial', fontSize: 44, bold: true, color: C.TEXT });
    body(s, l,       cols[i]+0.2, 3.45, 3.4, 1.0, C.MID, 11);
    body(s, src,     cols[i]+0.2, 4.55, 3.4, 0.35, C.DIM, 9);
  });

  s.addShape('line', { x: ML, y: 5.45, w: 0, h: 0, line: { color: C.BLUE, width: 2.5 } });
  s.addShape('roundRect', { x: ML, y: 5.45, w: CW, h: 0.9, rectRadius: 0.07, fill: { color: 'F0F7FF' }, line: { color: C.BLUE_BORDER, width: 0.6 } });
  body(s, 'The pain is not a shortage of content. The pain is lack of direction — developers have no reliable signal telling them what to learn, in what order, for the market they\'re trying to enter.', ML + 0.2, 5.55, CW - 0.4, 0.7, C.BLUE_TEXT, 11);
}

/* 03 Insight */
function s03(pptx: PptxGenJS) {
  const s = pptx.addSlide();
  s.background = { color: C.LIGHT_BG };
  ol(s, 'Our Insight');
  h1(s, 'The problem isn\'t content.\nIt\'s direction aligned with demand.', 0.78, false, 30);

  // Flow diagram
  const fItems = [
    { icon: '📊', top: 'Market Demand', bot: '10,000+ JDs' },
    { icon: '🤖', top: 'AI Analysis', bot: 'Weekly extraction' },
    { icon: '🗺️', top: 'Personalised Roadmap', bot: 'Unique per user' },
    { icon: '✅', top: 'Job-Ready Skills', bot: 'Aligned with demand' },
  ];
  const bw = 2.5; const gap = 0.18; const startX = ML;
  fItems.forEach(({ icon, top, bot }, i) => {
    const x = startX + i * (bw + gap + 0.35);
    box(s, x, 2.55, bw, 1.5, C.BLUE_BG, C.BLUE_BORDER);
    s.addText(icon, { x: x + 0.1, y: 2.65, w: bw - 0.1, h: 0.45, fontFace: 'Arial', fontSize: 22, align: 'center' });
    s.addText(top,  { x: x + 0.1, y: 3.12, w: bw - 0.1, h: 0.38, fontFace: 'Arial', fontSize: 11, bold: true, color: C.BLUE_DARK, align: 'center' });
    body(s, bot, x + 0.1, 3.5, bw - 0.1, 0.3, C.DIM, 9);
    if (i < 3) {
      s.addText('→', { x: x + bw + 0.05, y: 3.05, w: 0.32, h: 0.4, fontFace: 'Arial', fontSize: 16, color: C.DIM, align: 'center' });
    }
  });

  // Two insight boxes
  const bw2 = (CW - 0.15) / 2;
  const insights = [
    { icon: '🔍', t: 'We analysed 10,000+ job descriptions', b: 'Across 13+ domains to identify which skills appear in job postings, how demand shifts week-over-week, and how skills cluster into learnable sequences.' },
    { icon: '💡', t: 'Direction is the product', b: 'Every incumbent teaches content. Nobody answers "what should I learn next, given my background and the current job market?" That gap is our entire business.' },
  ];
  insights.forEach(({ icon, t, b }, i) => {
    const x = ML + i * (bw2 + 0.15);
    box(s, x, 4.3, bw2, 2.7, C.WHITE);
    s.addText(icon, { x: x+0.2, y: 4.45, w: 0.5, h: 0.45, fontFace: 'Arial', fontSize: 20 });
    s.addText(t,    { x: x+0.2, y: 4.95, w: bw2-0.35, h: 0.4, fontFace: 'Arial', fontSize: 12, bold: true, color: C.TEXT });
    body(s, b, x+0.2, 5.4, bw2-0.35, 1.4, C.MID, 10.5);
  });
}

/* 04 Solution */
function s04(pptx: PptxGenJS) {
  const s = pptx.addSlide();
  s.background = { color: C.WHITE };
  ol(s, 'The Solution');
  h1(s, 'An AI-native platform\nthat learns the longer it runs.', 0.78, false, 30);

  body(s, 'Acad AI doesn\'t serve blind. Every roadmap is generated from live job market data and refined by a self-improving flywheel — the more users learn, the smarter and more precise the platform becomes.', ML, 2.25, 8.5, 0.75, C.MID, 13);

  // Flywheel diagram
  const fw = [
    { l: 'Market Data\n+ User Data', c: '2563EB' },
    { l: 'AI Engine\nAnalyses & Learns', c: '7C3AED' },
    { l: 'Better\nRoadmaps', c: '059669' },
    { l: 'More Users\n→ More Data', c: C.BLUE_DARK },
  ];
  fw.forEach(({ l, c }, i) => {
    const x = ML + i * 3.1;
    s.addShape('roundRect', { x, y: 3.2, w: 2.85, h: 1.4, rectRadius: 0.08, fill: { color: C.LIGHT_BG }, line: { color: C.BORDER, width: 0.6 } });
    s.addText(l, { x: x+0.1, y: 3.3, w: 2.65, h: 1.15, fontFace: 'Arial', fontSize: 12, bold: true, color: c, align: 'center', valign: 'middle', lineSpacingMultiple: 1.3 });
    if (i < 3) {
      s.addText('→', { x: x + 2.88, y: 3.7, w: 0.25, h: 0.4, fontFace: 'Arial', fontSize: 16, color: C.DIM, align: 'center' });
    }
  });
  s.addText('↩  loops back', { x: ML + 1, y: 4.75, w: 8, h: 0.35, fontFace: 'Arial', fontSize: 10, color: C.DIM, align: 'center', italic: true });

  box(s, ML, 5.3, CW, 1.55, 'F0F7FF', C.BLUE_BORDER);
  s.addText('The self-improving moat', { x: ML+0.2, y: 5.42, w: 8, h: 0.35, fontFace: 'Arial', fontSize: 12, bold: true, color: C.BLUE_TEXT });
  body(s, 'Market data feeds the AI weekly. User behaviour (clicks, time spent, feedback) feeds the personalisation model continuously. Both flywheels run automatically — no manual curation required.', ML+0.2, 5.8, CW-0.35, 0.8, C.BLUE_TEXT, 11);
}

/* 05 Platform */
function s05(pptx: PptxGenJS) {
  const s = pptx.addSlide();
  s.background = { color: C.LIGHT_BG };
  ol(s, 'The Platform');
  h1(s, '13+ domains. Every roadmap\nbacked by market demand.', 0.78, false, 30);

  const domains = ['Frontend Dev', 'Backend Dev', 'Fullstack Dev', 'Machine Learning', 'DevOps', 'Data Science', 'Cybersecurity', 'UI/UX Design', 'Android Dev', 'iOS Dev', 'Blockchain', 'Indie Game Dev', 'AAA Game Dev', '+ more shipping'];
  const cols = 5; const bw = 2.28; const bh = 0.7; const gx = 0.12; const gy = 0.1;
  domains.forEach((d, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = ML + col * (bw + gx);
    const y = 2.4 + row * (bh + gy);
    s.addShape('roundRect', { x, y, w: bw, h: bh, rectRadius: 0.07, fill: { color: i === 13 ? 'F3F4F6' : C.BLUE_BG }, line: { color: i === 13 ? C.BORDER : C.BLUE_BORDER, width: 0.5 } });
    s.addText(d, { x: x+0.1, y: y+0.15, w: bw-0.2, h: bh-0.3, fontFace: 'Arial', fontSize: 11, bold: i !== 13, color: i === 13 ? C.DIM : C.BLUE_DARK, align: 'center', italic: i === 13 });
  });

  body(s, 'Each domain roadmap is generated from live hiring data — not community opinion or editorial judgment. Updated automatically every week.', ML, 6.55, CW, 0.4, C.DIM, 10.5);
}

/* 06 Feature 1 */
function s06(pptx: PptxGenJS) {
  const s = pptx.addSlide();
  s.background = { color: C.WHITE };
  ol(s, 'Feature 01');
  s.addText('⚡', { x: ML, y: 0.82, w: 0.6, h: 0.6, fontFace: 'Arial', fontSize: 28 });
  s.addText('Market-Demand Backed Roadmaps\nCurated by AI, Every Week.', { x: ML + 0.7, y: 0.78, w: CW - 0.7, h: 1.1, fontFace: 'Arial', fontSize: 28, bold: true, color: C.TEXT, lineSpacingMultiple: 1.15 });
  body(s, 'Every roadmap is generated from real job posting analysis — not trends or instructor preferences. Each week, AI re-scans the market and pushes updates automatically. Your path evolves with the job market.', ML, 2.1, 9, 0.75, C.MID, 13);

  const feats = [
    { t: 'Real-time signal',    b: 'Thousands of job descriptions processed weekly to extract in-demand skills and their relative priority.' },
    { t: 'Auto-updated paths',  b: 'When a framework dominates hiring or a skill fades, your roadmap reflects it in the next weekly cycle.' },
    { t: 'Structured sequence', b: 'Skills ordered by dependency and job frequency — not alphabetically or by what\'s easiest to teach.' },
  ];
  const bw3 = (CW - 0.3) / 3;
  feats.forEach(({ t, b }, i) => {
    const x = ML + i * (bw3 + 0.15);
    box(s, x, 3.05, bw3, 2.9, C.LIGHT_BG);
    s.addText('✓', { x: x+0.2, y: 3.2, w: 0.4, h: 0.4, fontFace: 'Arial', fontSize: 14, bold: true, color: C.BLUE });
    s.addText(t,   { x: x+0.2, y: 3.62, w: bw3-0.35, h: 0.4, fontFace: 'Arial', fontSize: 12, bold: true, color: C.TEXT });
    body(s, b, x+0.2, 4.1, bw3-0.35, 1.6, C.MID, 11);
  });
}

/* 07 Feature 2 */
function s07(pptx: PptxGenJS) {
  const s = pptx.addSlide();
  s.background = { color: C.LIGHT_BG };
  ol(s, 'Feature 02');
  s.addText('🧠', { x: ML, y: 0.82, w: 0.6, h: 0.6, fontFace: 'Arial', fontSize: 28 });
  s.addText('Hyper-Personalisation.\nNo two users share the same path.', { x: ML + 0.7, y: 0.78, w: CW - 0.7, h: 1.1, fontFace: 'Arial', fontSize: 28, bold: true, color: C.TEXT, lineSpacingMultiple: 1.15 });
  body(s, 'The platform continuously adapts to each user\'s background, pace, goals, and interaction patterns. The more you use it, the more precise your roadmap becomes — and user data improves the model for everyone.', ML, 2.1, 9, 0.75, C.MID, 13);

  const bw2 = (CW - 0.15) / 2;

  // Box 1: inputs
  box(s, ML, 3.05, bw2, 3.4, C.WHITE);
  s.addText('Inputs the platform learns from', { x: ML+0.2, y: 3.18, w: bw2-0.35, h: 0.35, fontFace: 'Arial', fontSize: 9.5, bold: true, color: C.DIM, charSpacing: 1 });
  ['Current skill level & background', 'Target role & timeline', 'Learning pace & consistency', 'Resources clicked & time spent', 'User feedback on content quality'].forEach((item, i) => {
    s.addShape('ellipse', { x: ML+0.22, y: 3.7 + i*0.47, w: 0.12, h: 0.12, fill: { color: '7C3AED' }, line: { type: 'none' } });
    s.addText(item, { x: ML+0.42, y: 3.64 + i*0.47, w: bw2-0.6, h: 0.3, fontFace: 'Arial', fontSize: 11.5, color: C.MID });
  });

  // Box 2: result
  const x2 = ML + bw2 + 0.15;
  box(s, x2, 3.05, bw2, 3.4, C.WHITE);
  s.addText('The result', { x: x2+0.2, y: 3.18, w: bw2-0.35, h: 0.35, fontFace: 'Arial', fontSize: 9.5, bold: true, color: C.DIM, charSpacing: 1 });
  s.addText('A living roadmap\nthat grows with you.', { x: x2+0.2, y: 3.62, w: bw2-0.35, h: 0.9, fontFace: 'Arial', fontSize: 22, bold: true, color: C.TEXT, lineSpacingMultiple: 1.2 });
  body(s, 'User data feeds back into the AI engine globally — improving recommendations for every learner, not just the individual. Platform intelligence compounds over time.', x2+0.2, 4.65, bw2-0.35, 1.1, C.MID, 11);
  s.addText('🧠 Platform intelligence compounds over time', { x: x2+0.2, y: 5.9, w: bw2-0.35, h: 0.35, fontFace: 'Arial', fontSize: 11, bold: true, color: '7C3AED' });
}

/* 08 Feature 3 */
function s08(pptx: PptxGenJS) {
  const s = pptx.addSlide();
  s.background = { color: C.WHITE };
  ol(s, 'Features 03 & 04');
  h1(s, 'Weekly AI-curated resources\nand a 24/7 AI Mentor.', 0.78, false, 30);

  const bw2 = (CW - 0.15) / 2;
  const feats = [
    {
      icon: '📚', color: '059669', bgColor: 'ECFDF5', borderColor: 'A7F3D0',
      title: 'Weekly AI-Curated Resources',
      desc: 'Every week, the AI scans the market for the highest-signal learning content — articles, videos, projects, documentation — mapped precisely to where each user is in their roadmap.',
      bullets: ['Matched to your current roadmap step', 'Ranked by quality + relevance signal', 'Refreshed weekly using market data'],
    },
    {
      icon: '🤖', color: C.BLUE_DARK, bgColor: C.BLUE_BG, borderColor: C.BLUE_BORDER,
      title: '24/7 AI Mentor',
      desc: 'An always-on AI mentor that answers questions, unblocks learners, explains concepts in context, and keeps users accountable to their roadmap — without waiting for a human tutor.',
      bullets: ['Context-aware of your roadmap & progress', 'Explains concepts at your exact skill level', 'Accountability nudges & progress check-ins'],
    },
  ];
  feats.forEach(({ icon, color, bgColor, borderColor, title, desc, bullets }, i) => {
    const x = ML + i * (bw2 + 0.15);
    s.addShape('roundRect', { x, y: 2.35, w: bw2, h: 4.6, rectRadius: 0.08, fill: { color: C.LIGHT_BG }, line: { color: C.BORDER, width: 0.6 } });
    s.addShape('roundRect', { x: x+0.2, y: 2.52, w: 0.7, h: 0.7, rectRadius: 0.07, fill: { color: bgColor }, line: { color: borderColor, width: 0.5 } });
    s.addText(icon, { x: x+0.2, y: 2.54, w: 0.7, h: 0.62, fontFace: 'Arial', fontSize: 18, align: 'center' });
    s.addText(title, { x: x+0.2, y: 3.3, w: bw2-0.35, h: 0.5, fontFace: 'Arial', fontSize: 14, bold: true, color: C.TEXT });
    body(s, desc, x+0.2, 3.88, bw2-0.35, 1.05, C.MID, 11);
    bullets.forEach((b, j) => {
      s.addShape('ellipse', { x: x+0.25, y: 5.08+j*0.42, w: 0.1, h: 0.1, fill: { color }, line: { type: 'none' } });
      s.addText(b, { x: x+0.45, y: 5.03+j*0.42, w: bw2-0.6, h: 0.3, fontFace: 'Arial', fontSize: 11, color: C.MID });
    });
  });
}

/* 09 Traction */
function s09(pptx: PptxGenJS) {
  const s = pptx.addSlide();
  s.background = { color: C.LIGHT_BG };
  ol(s, 'Traction');
  h1(s, '316 signups. $0 spent on marketing.', 0.85);

  const bw4 = (CW - 0.45) / 4;
  const metrics = [
    { n: '316',  l: 'Registered users',    sub: '100% organic' },
    { n: '$0',   l: 'Marketing spend',      sub: 'zero paid acquisition' },
    { n: '100+', l: 'Users gave feedback', sub: 'unprompted' },
    { n: '13+',  l: 'Live domains',         sub: 'market-demand backed' },
  ];
  metrics.forEach(({ n, l, sub }, i) => {
    const x = ML + i * (bw4 + 0.15);
    box(s, x, 2.35, bw4, 2.0, C.WHITE);
    s.addText(n, { x: x+0.15, y: 2.5,  w: bw4-0.2, h: 0.9, fontFace: 'Arial', fontSize: 40, bold: true, color: C.TEXT });
    s.addText(l, { x: x+0.15, y: 3.42, w: bw4-0.2, h: 0.45, fontFace: 'Arial', fontSize: 11, color: C.MID, lineSpacingMultiple: 1.2 });
    s.addText(sub, { x: x+0.15, y: 3.9,  w: bw4-0.2, h: 0.28, fontFace: 'Arial', fontSize: 9, color: C.DIM });
  });

  // Engagement metrics + user quote
  const bw2e = (CW - 0.15) / 2;
  // Quote box
  box(s, ML, 4.55, bw2e, 1.85, 'EFF6FF', C.BLUE_BORDER);
  s.addText('USER FEEDBACK · WEEK 1', { x: ML+0.2, y: 4.66, w: bw2e-0.3, h: 0.25, fontFace: 'Arial', fontSize: 7.5, bold: true, color: '6699CC', charSpacing: 1.5 });
  body(s, '"Finally a platform that tells me what to learn, not just how. I wasted 3 months going in circles before I found this. My roadmap changed everything."', ML+0.2, 4.96, bw2e-0.3, 0.95, C.TEXT, 11);
  s.addText('— Frontend developer, 2 weeks post-signup', { x: ML+0.2, y: 6.02, w: bw2e-0.3, h: 0.28, fontFace: 'Arial', fontSize: 9, italic: true, color: C.DIM });

  // Engagement stats box
  const x2e = ML + bw2e + 0.15;
  box(s, x2e, 4.55, bw2e, 1.85, C.WHITE);
  s.addText('ENGAGEMENT SIGNALS', { x: x2e+0.2, y: 4.66, w: bw2e-0.3, h: 0.25, fontFace: 'Arial', fontSize: 7.5, bold: true, color: C.DIM, charSpacing: 1.5 });
  s.addText('~68%', { x: x2e+0.2, y: 4.97, w: 2.5, h: 0.65, fontFace: 'Arial', fontSize: 32, bold: true, color: C.TEXT });
  s.addText('Activation rate — signups → roadmap generated', { x: x2e+0.2, y: 5.65, w: bw2e-0.35, h: 0.3, fontFace: 'Arial', fontSize: 9.5, color: C.MID });
  s.addText('42%', { x: x2e + bw2e/2, y: 4.97, w: 2.5, h: 0.65, fontFace: 'Arial', fontSize: 32, bold: true, color: C.TEXT });
  s.addText('7-day return rate — weekly active users', { x: x2e + bw2e/2, y: 5.65, w: bw2e/2, h: 0.3, fontFace: 'Arial', fontSize: 9.5, color: C.MID });
  body(s, '🔥 All growth is organic word-of-mouth. Zero paid acquisition. Users arrive and stay.', x2e+0.2, 6.02, bw2e-0.35, 0.35, C.DIM, 9.5);
}

/* 10 Why It Works */
function s10(pptx: PptxGenJS) {
  const s = pptx.addSlide();
  s.background = { color: C.WHITE };
  ol(s, 'Why It Works');
  h1(s, 'Traditional platforms teach content.\nWe sell direction.', 0.78, false, 30);

  // Table header
  const cols = [ML, ML+2.8, ML+5.6, ML+8.4, ML+10.2]; // [label, bootcamp, courses, linkedin, acad]
  const cw   = [2.65, 2.65, 2.65, 1.65, 2.72];
  const rows = [
    ['Dimension', 'Bootcamps', 'Course Platforms', 'Competitors', 'Acad AI ✦'],
    ['Starts from',           'Curriculum opinion',   'Popular topics',     'Generic paths',   'Live job market data'],
    ['Personalisation',       'None',                 'Course recommender', 'Minimal',         'Hyper-personalised path'],
    ['Market alignment',      'Updated yearly',       'Rarely updated',     'Static',          'Refreshed every week'],
    ['Learning support',      'Human cohort (slow)',  'Forum / none',       'Forum',           '24/7 AI mentor'],
    ['Unique user paths',     '✗',                   '✗',                 '✗',               '✓'],
    ['Platform intelligence', '✗ Static',             '✗ Static',           '✗ Static',        '✓ Learns as it runs'],
  ];
  rows.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      const isHeader = ri === 0;
      const isAcad   = ci === 4;
      const fill = isHeader ? 'F3F4F6' : isAcad ? 'EFF6FF' : C.WHITE;
      const border = C.BORDER;
      s.addShape('rect', { x: cols[ci], y: 2.3 + ri*0.52, w: cw[ci], h: 0.52, fill: { color: fill }, line: { color: border, width: 0.4 } });
      s.addText(cell, {
        x: cols[ci]+0.1, y: 2.34 + ri*0.52, w: cw[ci]-0.15, h: 0.44,
        fontFace: 'Arial', fontSize: isHeader ? 9.5 : 11,
        bold: isHeader || (ci === 0 && !isHeader),
        color: isHeader ? C.MID : isAcad ? C.BLUE_TEXT : cell === '✗' ? C.DIM : C.TEXT,
        charSpacing: isHeader ? 0.8 : 0,
        valign: 'middle',
      });
    });
  });
}

/* 11 Market */
function s11(pptx: PptxGenJS) {
  const s = pptx.addSlide();
  s.background = { color: C.DARK };
  s.addShape('ellipse', { x: 2, y: 4.5, w: 9, h: 5.5, fill: { color: C.BLUE, transparency: 84 }, line: { type: 'none' } });

  ol(s, 'Market Opportunity', true);
  s.addText('Targeting the most motivated\nsegment of the talent economy.', { x: ML, y: 0.82, w: CW, h: 1.15, fontFace: 'Arial', fontSize: 30, bold: true, color: C.WHITE, lineSpacingMultiple: 1.15 });
  body(s, 'Ideal customer: aspiring developer or career changer — actively trying to break into tech or upskill into a better role. High intent, high willingness to pay.', ML, 2.1, 9, 0.55, '8899AA', 12.5);

  const bw3m = (CW - 0.3) / 3;
  const markets = [
    { label: 'TAM', size: '$366B', desc: 'Global edtech & professional upskilling market (2026)', src: 'HolonIQ' },
    { label: 'SAM', size: '$8.6B',  desc: 'English-speaking developer + tech career upskilling (28.7M devs × ~$300/yr avg spend)', src: 'LinkedIn Workforce + BLS' },
    { label: 'SOM', size: '$860M', desc: 'Active job-seekers & career switchers, high intent — 10% of SAM, 3-year target', src: 'Serviceable obtainable market' },
  ];
  markets.forEach(({ label, size, desc, src }, i) => {
    const x = ML + i * (bw3m + 0.15);
    darkBox(s, x, 2.85, bw3m, 2.35);
    s.addText(label, { x: x+0.2, y: 2.98, w: bw3m-0.3, h: 0.3,  fontFace: 'Arial', fontSize: 9, bold: true, color: '555566', charSpacing: 2 });
    s.addText(size,  { x: x+0.2, y: 3.25, w: bw3m-0.3, h: 0.85, fontFace: 'Arial', fontSize: 36, bold: true, color: C.WHITE });
    body(s, desc, x+0.2, 4.12, bw3m-0.3, 0.7, '8899AA', 10);
    s.addText(src, { x: x+0.2, y: 4.88, w: bw3m-0.3, h: 0.22, fontFace: 'Arial', fontSize: 8.5, color: '445566' });
  });

  const stats = [{ n: '28.7M', l: 'developers worldwide' }, { n: '~4M', l: 'career changers entering tech annually' }, { n: '+25%', l: 'developer workforce growth by 2030' }];
  stats.forEach(({ n, l }, i) => {
    s.addText(n, { x: ML + i*4.05, y: 5.52, w: 3.8, h: 0.45, fontFace: 'Arial', fontSize: 22, bold: true, color: '7AB3FF' });
    s.addText(l, { x: ML + i*4.05, y: 6.0,  w: 3.8, h: 0.28, fontFace: 'Arial', fontSize: 10, color: '556677' });
  });
}

/* 12 Business Model */
function s12(pptx: PptxGenJS) {
  const s = pptx.addSlide();
  s.background = { color: C.LIGHT_BG };
  ol(s, 'Business Model');
  h1(s, 'Subscription-first.\nEnterprise as the multiplier.', 0.78, false, 30);

  const bw3 = (CW - 0.3) / 3;
  const tiers = [
    { phase: 'NOW — PRE-REVENUE', tier: 'Growth',       price: 'Building user base',  goal: 'Validate retention + flywheel',  items: ['316 organic signups', '100+ feedback responses', 'Market data engine live', '13+ domains running'], fill: C.WHITE,    badge: 'F3F4F6', badgeText: C.MID },
    { phase: 'YEAR 1',            tier: 'Pro',           price: '$19 / month',          goal: 'Convert high-intent users',      items: ['Hyper-personalised roadmap', 'Weekly AI resource curation', '24/7 AI mentor', 'Progress tracking + insights'], fill: C.BLUE_BG, badge: 'DBEAFE', badgeText: C.BLUE_DARK },
    { phase: 'YEAR 2+',           tier: 'Enterprise',   price: '$79 / seat / month',  goal: 'B2B recurring revenue',          items: ['Team onboarding roadmaps', 'Skills gap analysis for orgs', 'ATS & HR integrations', 'Custom domain coverage'], fill: C.WHITE,    badge: 'F3F4F6', badgeText: C.MID },
  ];
  tiers.forEach(({ phase, tier, price, goal, items, fill, badge, badgeText }, i) => {
    const x = ML + i * (bw3 + 0.15);
    s.addShape('roundRect', { x, y: 2.35, w: bw3, h: 4.55, rectRadius: 0.08, fill: { color: fill }, line: { color: i===1 ? C.BLUE_BORDER : C.BORDER, width: i===1 ? 1 : 0.6 } });
    s.addShape('roundRect', { x: x+0.2, y: 2.5, w: bw3-0.35, h: 0.3, rectRadius: 0.05, fill: { color: badge }, line: { type: 'none' } });
    s.addText(phase, { x: x+0.25, y: 2.53, w: bw3-0.4, h: 0.24, fontFace: 'Arial', fontSize: 8, bold: true, color: badgeText, charSpacing: 0.8 });
    s.addText(tier,  { x: x+0.2, y: 2.92, w: bw3-0.35, h: 0.42, fontFace: 'Arial', fontSize: 18, bold: true, color: C.TEXT });
    s.addText(price, { x: x+0.2, y: 3.35, w: bw3-0.35, h: 0.38, fontFace: 'Arial', fontSize: 16, bold: true, color: C.TEXT });
    s.addText(goal,  { x: x+0.2, y: 3.75, w: bw3-0.35, h: 0.3, fontFace: 'Arial', fontSize: 10, color: C.DIM });
    items.forEach((it, j) => {
      s.addText('✓', { x: x+0.22, y: 4.2+j*0.42, w: 0.25, h: 0.3, fontFace: 'Arial', fontSize: 11, bold: true, color: i===1 ? C.BLUE : C.GREEN });
      s.addText(it,   { x: x+0.5,  y: 4.18+j*0.42, w: bw3-0.62, h: 0.32, fontFace: 'Arial', fontSize: 10.5, color: C.MID });
    });
  });

  s.addText('No revenue yet. Pre-seed capital will fund product + GTM to reach first $150k ARR by month 18.', { x: ML, y: 7.1, w: CW, h: 0.28, fontFace: 'Arial', fontSize: 10, italic: true, color: C.DIM });
}

/* 13 Competition */
function s13(pptx: PptxGenJS) {
  const s = pptx.addSlide();
  s.background = { color: C.WHITE };
  ol(s, 'Competitive Edge');
  h1(s, 'We don\'t serve blind.\nOur moat compounds automatically.', 0.78, false, 30);

  // Table
  const cx = [ML, ML+2.55, ML+4.75, ML+6.95, ML+9.15, ML+10.55]; // col x positions
  const cw = [2.4, 2.05, 2.05, 2.05, 1.25, 1.55];
  const headers = ['Feature', 'roadmap.sh', 'Coursera / Udemy', 'LinkedIn Learning', 'Others', 'Acad AI ✦'];

  headers.forEach((h, ci) => {
    s.addShape('rect', { x: cx[ci], y: 2.35, w: cw[ci], h: 0.4, fill: { color: ci === 5 ? C.BLUE : 'F3F4F6' }, line: { color: C.BORDER, width: 0.4 } });
    s.addText(h, { x: cx[ci]+0.08, y: 2.37, w: cw[ci]-0.1, h: 0.36, fontFace: 'Arial', fontSize: 9.5, bold: true, color: ci === 5 ? C.WHITE : C.MID, valign: 'middle', charSpacing: ci === 0 ? 0 : 0.3 });
  });

  const feat_rows = [
    ['Market-demand backed',    false, false, false, false, true ],
    ['AI-generated weekly',     false, false, false, false, true ],
    ['Hyper-personalised',      false, false, false, false, true ],
    ['Self-improving platform', false, false, false, false, true ],
    ['24/7 AI mentor',          false, false, false, false, true ],
    ['13+ domains',             true,  true,  false, false, true ],
  ];

  feat_rows.forEach((row, ri) => {
    const y = 2.75 + ri * 0.44;
    row.forEach((cell, ci) => {
      const fill = ci === 5 ? 'EFF6FF' : ri % 2 === 0 ? C.WHITE : 'FAFAFA';
      s.addShape('rect', { x: cx[ci], y, w: cw[ci], h: 0.44, fill: { color: fill }, line: { color: C.BORDER, width: 0.4 } });
      if (ci === 0) {
        s.addText(String(cell), { x: cx[ci]+0.1, y: y+0.06, w: cw[ci]-0.15, h: 0.32, fontFace: 'Arial', fontSize: 11, bold: true, color: C.TEXT, valign: 'middle' });
      } else {
        check(s, cx[ci] + cw[ci]/2 - 0.25, y + 0.05, Boolean(cell), ci === 5);
      }
    });
  });

  // Moat box
  box(s, ML, 5.48, CW, 1.55, 'F0F7FF', C.BLUE_BORDER);
  s.addText('🔄  The moat: a self-reinforcing data flywheel', { x: ML+0.2, y: 5.58, w: 9, h: 0.35, fontFace: 'Arial', fontSize: 12, bold: true, color: C.BLUE_TEXT });
  body(s, 'More users → richer behaviour data → better personalisations → higher retention → more data. Simultaneously, the market data engine runs automatically — no manual curation. Competitors would need to rebuild both flywheels from scratch.', ML+0.2, 5.97, CW-0.35, 0.8, C.BLUE_TEXT, 11);
}

/* 14 Vision */
function s14(pptx: PptxGenJS) {
  const s = pptx.addSlide();
  s.background = { color: C.DARK };
  s.addShape('ellipse', { x: -1, y: -2, w: 8, h: 8, fill: { color: C.INDIGO, transparency: 85 }, line: { type: 'none' } });
  s.addShape('ellipse', { x: 7, y: 3.5, w: 8, h: 6, fill: { color: C.BLUE, transparency: 85 }, line: { type: 'none' } });

  ol(s, '10-Year Vision', true);
  s.addText('Not just a platform.', { x: ML, y: 0.82, w: CW, h: 0.75, fontFace: 'Arial', fontSize: 30, bold: true, color: C.WHITE });
  s.addText('A Career OS for everyone.', { x: ML, y: 1.5, w: CW, h: 0.75, fontFace: 'Arial', fontSize: 30, bold: true, color: '7AB3FF' });
  body(s, 'Today we serve developers. In 10 years, Acad AI becomes the operating system for anyone building a career — regardless of industry, background, or geography.', ML, 2.4, 9.5, 0.6, '8899AA', 13);

  const cards = [
    { icon: '👷', title: 'Blue-Collar Trades',    body: 'Electricians, plumbers, HVAC technicians face the same problem — no clear, market-aligned path to mastery. We\'re building for them too. Same AI engine, different domain data.' },
    { icon: '🥽', title: 'AI + AR / VR',          body: 'For hands-on trades, a text roadmap isn\'t enough. The long-term vision pairs our AI engine with AR/VR for immersive, guided on-the-job training — learn by doing, guided by AI.' },
    { icon: '🌍', title: 'Every Career, Every Market', body: 'Healthcare, finance, design, construction. Any field with a hiring market has skill demand we can read. The AI engine is domain-agnostic by design. This is a platform play, not a niche.' },
  ];
  const bw3 = (CW - 0.3) / 3;
  cards.forEach(({ icon, title, body: b }, i) => {
    const x = ML + i * (bw3 + 0.15);
    darkBox(s, x, 3.2, bw3, 3.85);
    s.addText(icon,  { x: x+0.2, y: 3.35, w: bw3-0.35, h: 0.55, fontFace: 'Arial', fontSize: 26 });
    s.addText(title, { x: x+0.2, y: 3.95, w: bw3-0.35, h: 0.45, fontFace: 'Arial', fontSize: 13, bold: true, color: C.WHITE });
    body(s, b, x+0.2, 4.45, bw3-0.35, 2.35, '8899AA', 10.5);
  });
}

/* 15 Why Me */
function s15(pptx: PptxGenJS) {
  const s = pptx.addSlide();
  s.background = { color: C.LIGHT_BG };
  ol(s, 'Why Me');
  h1(s, 'I lived the problem.\nThen I solved it in two weeks.', 0.78, false, 30);

  body(s, 'I was a developer who couldn\'t figure out what to learn next. I spent weeks in circles — tutorials, Reddit threads, YouTube rabbit holes. No platform gave me a clear, market-validated answer. So I built one. Then went to market immediately.', ML, 2.12, 8.5, 0.75, C.MID, 13);

  const ach = [
    { icon: '⚡', t: 'Built in 2 weeks',          b: 'Idea to live product in 14 days. Shipped fast, learned from real users immediately.' },
    { icon: '🌱', t: '316 organic users',          b: '$0 spent on marketing. Every user arrived because the product solves a real problem.' },
    { icon: '💬', t: '100+ feedback responses',   b: 'Detailed, unprompted feedback — strong validation signal at pre-revenue stage.' },
    { icon: '🧠', t: 'Deep domain expertise',      b: 'Hands-on experience across fullstack dev, AI integration, and developer tooling.' },
  ];
  const bw2 = (CW - 0.15) / 2;
  ach.forEach(({ icon, t, b }, i) => {
    const col = i % 2; const row = Math.floor(i / 2);
    const x = ML + col * (bw2 + 0.15);
    const y = 3.1 + row * 1.45;
    box(s, x, y, bw2, 1.32, C.WHITE);
    s.addText(icon, { x: x+0.2, y: y+0.15, w: 0.45, h: 0.45, fontFace: 'Arial', fontSize: 20 });
    s.addText(t,    { x: x+0.72, y: y+0.15, w: bw2-0.85, h: 0.38, fontFace: 'Arial', fontSize: 13, bold: true, color: C.TEXT });
    body(s, b, x+0.72, y+0.55, bw2-0.85, 0.65, C.MID, 10.5);
  });

  s.addShape('roundRect', { x: ML, y: 6.05, w: 3.8, h: 0.38, rectRadius: 0.06, fill: { color: C.LIGHT_BG }, line: { color: C.BORDER, width: 0.5 } });
  s.addText('Twitter / X  ·  @a1siel', { x: ML+0.15, y: 6.1, w: 3.5, h: 0.28, fontFace: 'Arial', fontSize: 10.5, color: C.MID });
  s.addShape('roundRect', { x: ML+4.0, y: 6.05, w: 4.8, h: 0.38, rectRadius: 0.06, fill: { color: C.LIGHT_BG }, line: { color: C.BORDER, width: 0.5 } });
  s.addText('LinkedIn  ·  linkedin.com/in/bhaskarjpofficial', { x: ML+4.15, y: 6.1, w: 4.55, h: 0.28, fontFace: 'Arial', fontSize: 10.5, color: C.MID });

  box(s, ML, 6.42, CW, 0.75, C.LIGHT_BG, C.BORDER);
  s.addText('Post-raise hires (Day 1):', { x: ML+0.2, y: 6.5, w: 3.5, h: 0.28, fontFace: 'Arial', fontSize: 10, bold: true, color: C.MID });
  s.addText('Co-founder / CTO   ·   Head of Growth   ·   ML / AI Engineer', { x: ML+3.5, y: 6.5, w: CW-3.7, h: 0.28, fontFace: 'Arial', fontSize: 10, color: C.MID });
  s.addText('$350k funds all three hires + 18-month runway.', { x: ML+0.2, y: 6.78, w: CW-0.3, h: 0.25, fontFace: 'Arial', fontSize: 9, italic: true, color: C.DIM });
}

/* 16 Ask */
function s16(pptx: PptxGenJS) {
  const s = pptx.addSlide();
  s.background = { color: C.DARK };
  s.addShape('ellipse', { x: 2.5, y: 3.8, w: 8, h: 6, fill: { color: C.BLUE, transparency: 82 }, line: { type: 'none' } });

  ol(s, 'The Ask', true);
  s.addText('Raising a ', { x: ML, y: 0.82, w: 3, h: 0.75, fontFace: 'Arial', fontSize: 30, bold: true, color: C.WHITE });
  s.addText('$350k pre-seed', { x: ML + 2.65, y: 0.82, w: 4.5, h: 0.75, fontFace: 'Arial', fontSize: 30, bold: true, color: '7AB3FF' });
  s.addText('to reach first revenue.', { x: ML, y: 1.52, w: CW, h: 0.75, fontFace: 'Arial', fontSize: 30, bold: true, color: C.WHITE });

  body(s, 'Capital will fund the engineering and GTM required to launch the subscription product, convert our 316-user base, and scale organic acquisition to first meaningful ARR.', ML, 2.5, 9, 0.6, '8899AA', 13);

  const bw3 = (CW - 0.3) / 3;
  const alloc = [
    { pct: '55%', label: 'Engineering',  desc: '~$193k — AI/ML + platform engineering' },
    { pct: '30%', label: 'Growth',        desc: '~$105k — SEO, content, dev community'  },
    { pct: '15%', label: 'Operations',    desc: '~$52k — legal, infra, tooling'         },
  ];
  alloc.forEach(({ pct, label, desc }, i) => {
    const x = ML + i * (bw3 + 0.15);
    darkBox(s, x, 3.3, bw3, 1.6);
    s.addText(pct,   { x: x+0.2, y: 3.45, w: bw3-0.35, h: 0.75, fontFace: 'Arial', fontSize: 38, bold: true, color: C.WHITE });
    s.addText(label, { x: x+0.2, y: 4.2,  w: bw3-0.35, h: 0.35, fontFace: 'Arial', fontSize: 12, bold: true, color: '8899AA' });
    s.addText(desc,  { x: x+0.2, y: 4.58, w: bw3-0.35, h: 0.25, fontFace: 'Arial', fontSize: 9.5, color: '445566' });
  });

  s.addShape('line', { x: ML, y: 5.2, w: CW, h: 0, line: { color: '1C1C2C', width: 0.5 } });

  body(s, '18-month target:', ML, 5.38, 2.8, 0.28, '445566', 9.5);
  body(s, '$150k ARR  ·  ~700 paying users  ·  Series A pipeline', ML, 5.68, 6, 0.3, '8899AA', 12);

  body(s, 'Contact:', ML + 7, 5.38, 2.5, 0.28, '445566', 9.5);
  s.addText('@a1siel on X', { x: ML + 7, y: 5.68, w: 4, h: 0.3, fontFace: 'Arial', fontSize: 12, color: '7AB3FF' });

  s.addText('⚡  acadai.app', { x: ML, y: 6.55, w: 4, h: 0.35, fontFace: 'Arial', fontSize: 11, color: '333344' });
  s.addText('Confidential — do not distribute', { x: 9.33, y: 6.55, w: 4, h: 0.35, fontFace: 'Arial', fontSize: 9, color: '333344', align: 'right' });
}

/* ═══════════════════════════════════════════════════════════ */
export async function GET() {
  const pptx = new PptxGenJS();
  pptx.layout  = 'LAYOUT_WIDE';
  pptx.author  = 'Bhaskar JP';
  pptx.company = 'Acad AI';
  pptx.subject = 'Pre-Seed Pitch Deck 2026';
  pptx.title   = 'Acad AI — Pre-Seed Pitch Deck';

  s01(pptx); s02(pptx); s03(pptx); s04(pptx);
  s05(pptx); s06(pptx); s07(pptx); s08(pptx);
  s09(pptx); s10(pptx); s11(pptx); s12(pptx);
  s13(pptx); s14(pptx); s15(pptx); s16(pptx);

  const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'Content-Disposition': 'attachment; filename="AcadAI-PitchDeck-2026.pptx"',
    },
  });
}
