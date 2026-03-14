import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { generateWithTools } from '@/lib/gemini-service';
import { MENTOR_TOOLS, buildUserContext, executeTool } from '@/lib/ai-mentor-service';

// ---------------------------------------------------------------------------
// Simple Firestore-backed daily usage counter
// Collection: users/{uid}/usage/ai-mentor
// Fields: dailyCount, dailyDate (YYYY-MM-DD), monthlyCount, monthlyMonth (YYYY-MM)
// ---------------------------------------------------------------------------

const DAILY_LIMIT = 50;
const MONTHLY_LIMIT = 1500;

async function checkAndIncrementUsage(
  uid: string
): Promise<{ allowed: boolean; dailyUsed: number; monthlyUsed: number }> {
  if (!adminDb) return { allowed: true, dailyUsed: 0, monthlyUsed: 0 };

  const usageRef = adminDb.collection('users').doc(uid).collection('usage').doc('ai-mentor');
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const thisMonth = today.slice(0, 7); // YYYY-MM

  const snap = await usageRef.get();
  let data = snap.exists ? (snap.data() as Record<string, any>) : {};

  // Reset daily count if date has changed
  const dailyCount = data.dailyDate === today ? (data.dailyCount || 0) : 0;
  const monthlyCount = data.monthlyMonth === thisMonth ? (data.monthlyCount || 0) : 0;

  if (dailyCount >= DAILY_LIMIT || monthlyCount >= MONTHLY_LIMIT) {
    return { allowed: false, dailyUsed: dailyCount, monthlyUsed: monthlyCount };
  }

  await usageRef.set(
    {
      dailyCount: dailyCount + 1,
      dailyDate: today,
      monthlyCount: monthlyCount + 1,
      monthlyMonth: thisMonth,
    },
    { merge: true }
  );

  return { allowed: true, dailyUsed: dailyCount + 1, monthlyUsed: monthlyCount + 1 };
}

async function getUsage(
  uid: string
): Promise<{ dailyUsed: number; monthlyUsed: number }> {
  if (!adminDb) return { dailyUsed: 0, monthlyUsed: 0 };
  const usageRef = adminDb.collection('users').doc(uid).collection('usage').doc('ai-mentor');
  const snap = await usageRef.get();
  if (!snap.exists) return { dailyUsed: 0, monthlyUsed: 0 };
  const data = snap.data() as Record<string, any>;
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = today.slice(0, 7);
  return {
    dailyUsed: data.dailyDate === today ? (data.dailyCount || 0) : 0,
    monthlyUsed: data.monthlyMonth === thisMonth ? (data.monthlyCount || 0) : 0,
  };
}

export { getUsage };

// ---------------------------------------------------------------------------
// POST /api/ai-mentor/chat
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    // 1. Verify auth
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!adminAuth) {
      return NextResponse.json({ error: 'Server auth not configured' }, { status: 500 });
    }

    let uid: string;
    try {
      const decoded = await adminAuth.verifyIdToken(authHeader.substring(7));
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    // 2. Parse + validate body
    const body = await req.json();
    const { message, chatHistory = [], domain = 'general', stepContext } = body as {
      message: string;
      chatHistory?: Array<{ role: string; content: string }>;
      domain?: string;
      stepContext?: { stepId: string; stepTitle: string; sectionTitle: string };
    };

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 chars)' }, { status: 400 });
    }

    // 3. Verify premium subscription — fail closed (deny if DB unavailable)
    if (!adminDb) {
      return NextResponse.json({ error: 'Server database not configured' }, { status: 500 });
    }

    const userSnap = await adminDb.collection('users').doc(uid).get();
    const userData = userSnap.data() as Record<string, any> | undefined;
    const isPremium =
      userData?.subscription?.tier === 'premium' &&
      userData?.subscription?.status === 'active';
    const isAdmin = userData?.roles?.admin === true;
    const bypass = userData?.flags?.bypassPremium === true;

    if (!isPremium && !isAdmin && !bypass) {
      return NextResponse.json(
        { error: 'Premium subscription required', code: 'PREMIUM_REQUIRED' },
        { status: 403 }
      );
    }

    // 4. Check usage limits
    const usage = await checkAndIncrementUsage(uid);
    if (!usage.allowed) {
      const isDaily = usage.dailyUsed >= DAILY_LIMIT;
      return NextResponse.json(
        {
          error: isDaily
            ? `You've reached your daily limit of ${DAILY_LIMIT} messages. Your limit resets at midnight.`
            : `You've reached your monthly limit of ${MONTHLY_LIMIT} messages. Your limit resets on the 1st of next month.`,
        },
        { status: 429 }
      );
    }

    // 5. Build system context
    const systemContext = await buildUserContext(uid, domain);
    let systemInstruction = systemContext;
    if (stepContext) {
      systemInstruction += `\n\nThe user is currently viewing roadmap step "${stepContext.stepTitle}" in section "${stepContext.sectionTitle}" (stepId: ${stepContext.stepId}).`;
    }

    // 6. Generate with tools (agentic loop)
    const { text, toolsUsed } = await generateWithTools(
      message.trim(),
      systemInstruction,
      chatHistory,
      MENTOR_TOOLS,
      (toolName, args) => executeTool(toolName, args, uid, domain)
    );

    return NextResponse.json({
      success: true,
      response: text,
      toolsUsed,
      usage: {
        dailyUsed: usage.dailyUsed,
        monthlyUsed: usage.monthlyUsed,
        dailyLimit: DAILY_LIMIT,
        monthlyLimit: MONTHLY_LIMIT,
      },
    });
  } catch (error: any) {
    console.error('[ai-mentor/chat]', error);
    if (error?.message?.includes('SAFETY')) {
      return NextResponse.json(
        { error: 'Your message was flagged by safety filters. Please rephrase.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
