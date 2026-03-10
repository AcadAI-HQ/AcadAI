/**
 * AI Mentor Service — server-side only (uses Firebase Admin SDK).
 *
 * Provides:
 * - `buildUserContext()` — rich system prompt built from user profile + progress
 * - `MENTOR_TOOLS` — Gemini function declarations for agentic tool use
 * - `executeTool()` — dispatcher that runs the requested tool against Firestore
 */

import { adminDb } from './firebase-admin';
import type { MentorToolDefinition } from './gemini-service';

// ---------------------------------------------------------------------------
// Tool definitions (sent to Gemini as function declarations)
// ---------------------------------------------------------------------------

export const MENTOR_TOOLS: MentorToolDefinition[] = [
  {
    name: 'get_user_progress',
    description:
      "Get the user's current roadmap progress: percentage complete, current step, and how many steps have been finished.",
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_roadmap_overview',
    description:
      "Get a high-level overview of the user's roadmap: the section titles and number of steps in each section.",
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'mark_step_complete',
    description:
      "Mark a specific roadmap step as complete on behalf of the user. Only call this when the user explicitly asks you to mark something as done.",
    parameters: {
      type: 'object',
      properties: {
        stepId: {
          type: 'string',
          description:
            'The step ID in "sectionIndex-subtopicIndex" format (e.g. "0-2" for first section, third step). You can get valid step IDs from get_roadmap_overview.',
        },
      },
      required: ['stepId'],
    },
  },
  {
    name: 'get_learning_resources',
    description:
      "Get this week's curated learning resources for the user's domain. Returns the latest articles, videos, and tools.",
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_step_details',
    description:
      'Get the full details of a specific roadmap step including its title, description, and list of learning resources.',
    parameters: {
      type: 'object',
      properties: {
        stepId: {
          type: 'string',
          description: 'Step ID in "sectionIndex-subtopicIndex" format (e.g. "1-0").',
        },
      },
      required: ['stepId'],
    },
  },
];

// ---------------------------------------------------------------------------
// Context builder — injects user state into the system prompt
// ---------------------------------------------------------------------------

export async function buildUserContext(userId: string, domain: string): Promise<string> {
  let profileSnippet = '';
  let progressSnippet = '';

  try {
    // User profile
    if (adminDb) {
      const userSnap = await adminDb.collection('users').doc(userId).get();
      if (userSnap.exists) {
        const u = userSnap.data() as Record<string, any>;
        const name = u.displayName || 'the learner';
        const userType = u.userType || 'learner';
        const skills = (u.skills as string[] | undefined)?.slice(0, 5).join(', ') || 'none listed';
        const expLabel = u.domainExperience || 'beginner';
        profileSnippet = `User: ${name} (${userType}). Domain experience: ${expLabel}. Known skills: ${skills}.`;
      }
    }
  } catch {
    // Non-fatal — context will be incomplete but mentor still works
  }

  try {
    // Progress
    if (adminDb) {
      const progressSnap = await adminDb
        .collection('users')
        .doc(userId)
        .collection('roadmapProgress')
        .doc(domain)
        .get();
      if (progressSnap.exists) {
        const p = progressSnap.data() as Record<string, any>;
        const pct = p.totalSteps
          ? Math.round(((p.completedCount || 0) / p.totalSteps) * 100)
          : 0;
        progressSnippet = `Roadmap: ${domain}. Progress: ${pct}% complete (${p.completedCount || 0}/${p.totalSteps || 0} steps). Current step ID: ${p.currentStepId || 'not started'}.`;
      } else {
        progressSnippet = `Roadmap: ${domain}. Progress: not started yet.`;
      }
    }
  } catch {
    // Non-fatal
  }

  return `You are an expert AI Mentor for AcadAI, a professional learning platform.
Your role is to guide learners through their technical roadmap with personalized advice.

${profileSnippet}
${progressSnippet}

Guidelines:
- Be concise and practical — learners want actionable advice, not lectures.
- When asked about progress, use the get_user_progress tool to fetch real data.
- When asked about specific steps, use get_step_details or get_roadmap_overview.
- Only mark steps complete when the user explicitly requests it.
- Use get_learning_resources when the user asks for resources or what to study next.
- Encourage the learner. Celebrate progress. Be a coach, not a critic.
- Keep responses under 300 words unless explaining a complex topic.`;
}

// ---------------------------------------------------------------------------
// Tool executor — called in the agentic loop with real Firestore data
// ---------------------------------------------------------------------------

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  userId: string,
  domain: string
): Promise<Record<string, unknown>> {
  if (!adminDb) {
    return { error: 'Database unavailable' };
  }

  switch (toolName) {
    case 'get_user_progress': {
      try {
        const snap = await adminDb
          .collection('users')
          .doc(userId)
          .collection('roadmapProgress')
          .doc(domain)
          .get();
        if (!snap.exists) {
          return { status: 'not_started', message: 'User has not started this roadmap yet.' };
        }
        const p = snap.data() as Record<string, any>;
        const pct = p.totalSteps
          ? Math.round(((p.completedCount || 0) / p.totalSteps) * 100)
          : 0;
        return {
          domain,
          percentComplete: pct,
          completedCount: p.completedCount || 0,
          totalSteps: p.totalSteps || 0,
          currentStepId: p.currentStepId || null,
          completedSteps: (p.completedSteps as string[] | undefined)?.slice(-5) || [],
        };
      } catch {
        return { error: 'Failed to fetch progress' };
      }
    }

    case 'get_roadmap_overview': {
      try {
        // Try personalized roadmap first, then base
        let steps: any[] = [];
        const personalSnap = await adminDb
          .collection('users')
          .doc(userId)
          .collection('roadmaps')
          .doc(domain)
          .get();
        if (personalSnap.exists) {
          steps = (personalSnap.data() as any)?.content?.steps || [];
        } else {
          const baseSnap = await adminDb.collection('roadmaps').doc(domain).get();
          if (baseSnap.exists) {
            steps = (baseSnap.data() as any)?.steps || [];
          }
        }
        const overview = steps.map((s: any, i: number) => ({
          sectionIndex: i,
          title: s.title,
          stepCount: (s.subtopics as any[] | undefined)?.length || 0,
          stepIds: (s.subtopics as any[] | undefined)?.map((_: any, j: number) => `${i}-${j}`) || [],
        }));
        return { domain, sections: overview, totalSections: steps.length };
      } catch {
        return { error: 'Failed to fetch roadmap' };
      }
    }

    case 'mark_step_complete': {
      const stepId = args.stepId as string;
      if (!stepId || !/^\d+-\d+$/.test(stepId)) {
        return { error: 'Invalid step ID format. Use "sectionIndex-subtopicIndex" (e.g. "0-2").' };
      }
      try {
        const progressRef = adminDb
          .collection('users')
          .doc(userId)
          .collection('roadmapProgress')
          .doc(domain);
        const snap = await progressRef.get();
        if (!snap.exists) {
          return { error: 'No progress record found. User has not started the roadmap.' };
        }
        const p = snap.data() as Record<string, any>;
        const completed: string[] = p.completedSteps || [];
        if (completed.includes(stepId)) {
          return { success: false, message: `Step ${stepId} was already marked complete.` };
        }

        // Calculate next step
        const [sIdx, tIdx] = stepId.split('-').map(Number);
        const nextStepId = `${sIdx}-${tIdx + 1}`;

        const updatedCompleted = [...completed, stepId];
        await progressRef.update({
          completedSteps: updatedCompleted,
          completedCount: updatedCompleted.length,
          currentStepId: nextStepId,
          lastUpdated: new Date(),
        });
        return {
          success: true,
          message: `Step ${stepId} marked as complete. Next step: ${nextStepId}.`,
          completedCount: updatedCompleted.length,
        };
      } catch {
        return { error: 'Failed to mark step complete' };
      }
    }

    case 'get_learning_resources': {
      try {
        // Get the most recent week for this domain
        const weeksSnap = await adminDb
          .collection('learning-resources')
          .doc(domain)
          .collection('weeks')
          .orderBy('weekNumber', 'desc')
          .limit(1)
          .get();

        if (weeksSnap.empty) {
          return {
            available: false,
            message: 'No curated resources available for this domain yet. Check back next Monday.',
          };
        }
        const weekData = weeksSnap.docs[0].data() as Record<string, any>;
        const resources = (weekData.resources as any[] | undefined)?.slice(0, 5).map((r: any) => ({
          title: r.title,
          url: r.url,
          type: r.type,
          description: r.description,
          difficulty: r.difficulty,
          estimatedTime: r.estimatedTime,
        })) || [];
        return {
          weekId: weekData.weekId,
          domain,
          resources,
          resourceCount: resources.length,
        };
      } catch {
        return { error: 'Failed to fetch learning resources' };
      }
    }

    case 'get_step_details': {
      const stepId = args.stepId as string;
      if (!stepId || !/^\d+-\d+$/.test(stepId)) {
        return { error: 'Invalid step ID format.' };
      }
      try {
        const [sIdx, tIdx] = stepId.split('-').map(Number);
        let steps: any[] = [];
        const personalSnap = await adminDb
          .collection('users')
          .doc(userId)
          .collection('roadmaps')
          .doc(domain)
          .get();
        if (personalSnap.exists) {
          steps = (personalSnap.data() as any)?.content?.steps || [];
        } else {
          const baseSnap = await adminDb.collection('roadmaps').doc(domain).get();
          if (baseSnap.exists) steps = (baseSnap.data() as any)?.steps || [];
        }

        const section = steps[sIdx];
        if (!section) return { error: `Section ${sIdx} not found in roadmap.` };
        const subtopic = (section.subtopics as string[] | undefined)?.[tIdx];
        if (!subtopic) return { error: `Step ${stepId} not found in roadmap.` };

        return {
          stepId,
          stepTitle: subtopic,
          sectionTitle: section.title,
          sectionDescription: section.description || '',
          resources: (section.resources as string[] | undefined) || [],
        };
      } catch {
        return { error: 'Failed to fetch step details' };
      }
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
