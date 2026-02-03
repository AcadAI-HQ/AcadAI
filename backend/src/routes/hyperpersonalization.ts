import { Router, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { db } from '../config/firebase';
import * as admin from 'firebase-admin';

const router = Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

// Monthly usage limit
const MONTHLY_USAGE_LIMIT = 3;

// Input constraints
const MAX_TEXT_ANSWER_LENGTH = 500;
const MAX_ARRAY_ITEMS = 50;

// All available domains
const AVAILABLE_DOMAINS = [
  'frontend', 'backend', 'fullstack', 'ml', 'devops',
  'cybersecurity', 'data-science', 'ui-ux', 'product-engineering',
  'game-dev-indie', 'game-dev-aaa', 'android', 'blockchain', 'iOS'
];

interface UserProfile {
  userType?: string;
  skills?: string[];
  lastGeneratedDomain?: string;
  interestedDomains?: string[];
  domainExperience?: string;
  degree?: string;
  currentYear?: string;
  currentRole?: string;
  yearsOfExperience?: number;
  description?: string;
  subscription?: {
    tier: string;
    status: string;
  };
}

interface HyperpersonalizationUsage {
  usageCount: number;
  lastResetDate: admin.firestore.Timestamp;
  history: Array<{
    domain: string;
    timestamp: admin.firestore.Timestamp;
  }>;
}

interface RoadmapStep {
  title: string;
  description: string;
  subtopics: string[];
  resources?: string[];
}

interface RoadmapFile {
  domain: string;
  type: string;
  overview: string;
  steps: RoadmapStep[];
}

/**
 * Check if user has premium subscription
 */
function isPremiumUser(profile: UserProfile | null): boolean {
  if (!profile?.subscription) return false;
  return profile.subscription.tier === 'premium' && profile.subscription.status === 'active';
}

/**
 * Get or create hyperpersonalization usage document
 */
async function getUsageData(userId: string): Promise<HyperpersonalizationUsage> {
  if (!db) throw new Error('Firestore not initialized');

  const usageRef = db.collection('users').doc(userId).collection('settings').doc('hyperpersonalization');
  const usageDoc = await usageRef.get();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (!usageDoc.exists) {
    const initialUsage: HyperpersonalizationUsage = {
      usageCount: 0,
      lastResetDate: admin.firestore.Timestamp.fromDate(startOfMonth),
      history: [],
    };
    await usageRef.set(initialUsage);
    return initialUsage;
  }

  const data = usageDoc.data() as HyperpersonalizationUsage;

  // Check if we need to reset for new month
  const lastReset = data.lastResetDate.toDate();
  if (lastReset < startOfMonth) {
    const resetUsage: HyperpersonalizationUsage = {
      usageCount: 0,
      lastResetDate: admin.firestore.Timestamp.fromDate(startOfMonth),
      history: [],
    };
    await usageRef.set(resetUsage);
    return resetUsage;
  }

  return data;
}

/**
 * Increment usage count
 */
async function incrementUsage(userId: string, domain: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  const usageRef = db.collection('users').doc(userId).collection('settings').doc('hyperpersonalization');

  await usageRef.update({
    usageCount: admin.firestore.FieldValue.increment(1),
    history: admin.firestore.FieldValue.arrayUnion({
      domain,
      timestamp: admin.firestore.Timestamp.now(),
    }),
  });
}

/**
 * Get user profile from Firestore
 */
async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;

  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('[Hyperpersonalization] Error fetching user profile:', error);
    return null;
  }
}

/**
 * POST /api/hyperpersonalization/start
 * Initialize the hyperpersonalization process
 */
router.post('/start', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!domain || !AVAILABLE_DOMAINS.includes(domain)) {
      res.status(400).json({ error: 'Invalid domain' });
      return;
    }

    // Check premium status
    const userProfile = await getUserProfile(userId);
    if (!isPremiumUser(userProfile)) {
      res.status(403).json({
        error: 'Premium required',
        message: 'Hyperpersonalization is a premium feature.',
      });
      return;
    }

    // Check usage limits
    const usage = await getUsageData(userId);
    const remainingUses = MONTHLY_USAGE_LIMIT - usage.usageCount;

    if (remainingUses <= 0) {
      const nextReset = new Date();
      nextReset.setMonth(nextReset.getMonth() + 1, 1);
      nextReset.setHours(0, 0, 0, 0);

      res.status(429).json({
        error: 'Limit reached',
        message: `You've used all ${MONTHLY_USAGE_LIMIT} personalizations this month.`,
        nextReset: nextReset.toISOString(),
      });
      return;
    }

    // Load the base roadmap for this domain to extract topics
    const roadmapResponse = await fetch(`${process.env.FRONTEND_URL || 'http://localhost:9002'}/roadmaps-new/${domain}.json`);
    if (!roadmapResponse.ok) {
      res.status(404).json({ error: 'Roadmap not found for domain' });
      return;
    }

    const roadmap = await roadmapResponse.json() as RoadmapFile;

    // Extract all topics from roadmap for skill selection
    const allTopics = roadmap.steps.map(step => ({
      title: step.title,
      subtopics: step.subtopics,
    }));

    // Build questions based on domain and user profile
    const questions = [
      {
        id: 'known_topics',
        type: 'multi-select',
        question: 'Which topics do you already know well?',
        description: 'Select topics you\'re confident in and want to skip or review briefly.',
        options: allTopics.map(t => ({
          value: t.title,
          label: t.title,
          subtopics: t.subtopics,
        })),
      },
      {
        id: 'focus_areas',
        type: 'multi-select',
        question: 'Which areas do you want to focus on most?',
        description: 'Select topics you want to dive deeper into.',
        options: allTopics.map(t => ({
          value: t.title,
          label: t.title,
        })),
      },
      {
        id: 'goal',
        type: 'single-select',
        question: 'What\'s your primary learning goal?',
        options: [
          { value: 'job', label: 'Get a job in this field' },
          { value: 'freelance', label: 'Start freelancing' },
          { value: 'project', label: 'Build a specific project' },
          { value: 'upskill', label: 'Upskill at current job' },
          { value: 'explore', label: 'Explore and learn' },
        ],
      },
      {
        id: 'time_commitment',
        type: 'single-select',
        question: 'How much time can you dedicate weekly?',
        options: [
          { value: '5', label: 'Less than 5 hours' },
          { value: '10', label: '5-10 hours' },
          { value: '20', label: '10-20 hours' },
          { value: '30', label: '20-30 hours' },
          { value: '40', label: 'Full-time (30+ hours)' },
        ],
      },
      {
        id: 'learning_style',
        type: 'single-select',
        question: 'How do you prefer to learn?',
        options: [
          { value: 'project', label: 'Project-based (learn by building)' },
          { value: 'theory', label: 'Theory first, then practice' },
          { value: 'mixed', label: 'Mix of theory and projects' },
          { value: 'video', label: 'Video tutorials' },
          { value: 'docs', label: 'Documentation and articles' },
        ],
      },
      {
        id: 'specific_technologies',
        type: 'text',
        question: 'Any specific technologies or frameworks you want to focus on?',
        description: 'E.g., "React, TypeScript, Next.js" or "Leave blank for recommendations"',
        placeholder: 'Enter technologies separated by commas...',
      },
      {
        id: 'project_idea',
        type: 'text',
        question: 'Do you have a project in mind you want to build?',
        description: 'Describe it briefly and we\'ll tailor the roadmap to help you build it.',
        placeholder: 'E.g., "A social media app with real-time chat"',
      },
    ];

    res.json({
      success: true,
      domain,
      domainTitle: roadmap.domain,
      remainingUses,
      showWarning: remainingUses === 1,
      userContext: {
        userType: userProfile?.userType,
        skills: userProfile?.skills,
        domainExperience: userProfile?.domainExperience,
      },
      questions,
    });

  } catch (error: any) {
    console.error('[Hyperpersonalization] Start error:', error);
    res.status(500).json({
      error: 'Failed to start',
      message: error.message || 'Something went wrong.',
    });
  }
});

/**
 * POST /api/hyperpersonalization/generate
 * Generate personalized roadmap based on answers
 */
router.post('/generate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain, answers } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!domain || !AVAILABLE_DOMAINS.includes(domain)) {
      res.status(400).json({ error: 'Invalid domain' });
      return;
    }

    if (!answers || typeof answers !== 'object') {
      res.status(400).json({ error: 'Answers are required' });
      return;
    }

    // Sanitize answers to prevent injection and limit size
    const sanitizedAnswers: Record<string, any> = {};
    for (const [key, value] of Object.entries(answers)) {
      if (typeof value === 'string') {
        // Truncate text answers
        sanitizedAnswers[key] = value.slice(0, MAX_TEXT_ANSWER_LENGTH);
      } else if (Array.isArray(value)) {
        // Limit array size and sanitize string items
        sanitizedAnswers[key] = value
          .slice(0, MAX_ARRAY_ITEMS)
          .map(item => typeof item === 'string' ? item.slice(0, 200) : item);
      } else {
        sanitizedAnswers[key] = value;
      }
    }

    // Re-check premium and usage
    const userProfile = await getUserProfile(userId);
    if (!isPremiumUser(userProfile)) {
      res.status(403).json({ error: 'Premium required' });
      return;
    }

    const usage = await getUsageData(userId);
    if (usage.usageCount >= MONTHLY_USAGE_LIMIT) {
      res.status(429).json({ error: 'Monthly limit reached' });
      return;
    }

    // Check Gemini API
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      res.status(503).json({ error: 'AI service not configured' });
      return;
    }

    // Load base roadmap
    const roadmapResponse = await fetch(`${process.env.FRONTEND_URL || 'http://localhost:9002'}/roadmaps-new/${domain}.json`);
    if (!roadmapResponse.ok) {
      res.status(404).json({ error: 'Roadmap not found' });
      return;
    }

    const baseRoadmap = await roadmapResponse.json() as RoadmapFile;

    // Build Gemini prompt
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert learning path designer. Personalize the following ${baseRoadmap.domain} roadmap based on the user's profile and preferences.

USER PROFILE:
- User Type: ${userProfile?.userType || 'learner'}
- Existing Skills: ${userProfile?.skills?.join(', ') || 'None specified'}
- Domain Experience: ${userProfile?.domainExperience || 'Not specified'}

USER PREFERENCES:
- Topics they already know: ${sanitizedAnswers.known_topics?.join(', ') || 'None'}
- Focus areas: ${sanitizedAnswers.focus_areas?.join(', ') || 'All topics'}
- Primary goal: ${sanitizedAnswers.goal || 'General learning'}
- Weekly time commitment: ${sanitizedAnswers.time_commitment || '10'} hours
- Learning style: ${sanitizedAnswers.learning_style || 'mixed'}
- Specific technologies: ${sanitizedAnswers.specific_technologies || 'No specific preference'}
- Project idea: ${sanitizedAnswers.project_idea || 'None specified'}

ORIGINAL ROADMAP:
${JSON.stringify(baseRoadmap.steps, null, 2)}

INSTRUCTIONS:
1. Remove or significantly shorten topics the user already knows well
2. Expand and add more detail to their focus areas
3. Reorder topics based on their goal and project idea (if specified)
4. Add relevant subtopics for technologies they specifically mentioned
5. Include project suggestions aligned with their goal
6. Adjust complexity based on their experience level
7. Keep the roadmap practical and achievable given their time commitment

Return a valid JSON object with this EXACT structure:
{
  "domain": "${baseRoadmap.domain}",
  "type": "personalized",
  "overview": "A personalized overview (2-3 sentences) tailored to their goals",
  "steps": [
    {
      "title": "Step Title",
      "description": "Brief description",
      "subtopics": ["subtopic1", "subtopic2", ...],
      "resources": ["https://resource1.com", "https://resource2.com"]
    }
  ],
  "personalizationSummary": {
    "removedTopics": ["topics removed because user knows them"],
    "expandedTopics": ["topics expanded based on focus areas"],
    "addedTopics": ["new topics added based on their specific needs"],
    "estimatedTimeWeeks": number,
    "keyRecommendations": ["recommendation 1", "recommendation 2"]
  }
}

Only return valid JSON, no markdown or explanations.`;

    // Generate personalized roadmap
    const result = await model.generateContent(prompt);
    const response = result.response;
    let aiResponse = response.text();

    // Clean up response
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let personalizedRoadmap;
    try {
      personalizedRoadmap = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('[Hyperpersonalization] Failed to parse AI response:', aiResponse);
      res.status(500).json({
        error: 'Failed to generate roadmap',
        message: 'AI response was not valid JSON. Please try again.',
      });
      return;
    }

    // Save to Firestore
    if (!db) {
      res.status(500).json({ error: 'Database not available' });
      return;
    }

    const roadmapRef = db.collection('users').doc(userId).collection('roadmaps').doc(domain);

    await roadmapRef.set({
      userId,
      domain,
      baseRoadmapVersion: 'v1.0.0',
      customized: true,
      lastModified: admin.firestore.FieldValue.serverTimestamp(),
      content: {
        domain: personalizedRoadmap.domain,
        type: personalizedRoadmap.type,
        overview: personalizedRoadmap.overview,
        steps: personalizedRoadmap.steps,
      },
      personalizationSummary: personalizedRoadmap.personalizationSummary,
      personalizationAnswers: sanitizedAnswers,
      modifications: admin.firestore.FieldValue.arrayUnion({
        timestamp: admin.firestore.Timestamp.now(),
        type: 'ai_customization',
        description: 'Hyperpersonalized roadmap generated',
        modifiedBy: 'gemini',
      }),
    }, { merge: true });

    // Reset progress for this domain since the roadmap structure has changed
    const progressRef = db.collection('users').doc(userId).collection('roadmapProgress').doc(domain);
    await progressRef.delete();
    console.log(`[Hyperpersonalization] Reset progress for user ${userId}, domain ${domain}`);

    // Increment usage
    await incrementUsage(userId, domain);

    console.log(`[Hyperpersonalization] Generated for user ${userId}, domain ${domain}`);

    res.json({
      success: true,
      roadmap: personalizedRoadmap,
      remainingUses: MONTHLY_USAGE_LIMIT - usage.usageCount - 1,
    });

  } catch (error: any) {
    console.error('[Hyperpersonalization] Generate error:', error);

    if (error.message?.includes('quota') || error.message?.includes('rate')) {
      res.status(429).json({
        error: 'AI service busy',
        message: 'Please try again in a moment.',
      });
      return;
    }

    res.status(500).json({
      error: 'Generation failed',
      message: error.message || 'Something went wrong.',
    });
  }
});

/**
 * POST /api/hyperpersonalization/reset
 * Reset domain to base roadmap
 */
router.post('/reset', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!domain || !AVAILABLE_DOMAINS.includes(domain)) {
      res.status(400).json({ error: 'Invalid domain' });
      return;
    }

    if (!db) {
      res.status(500).json({ error: 'Database not available' });
      return;
    }

    // Delete the personalized roadmap document
    const roadmapRef = db.collection('users').doc(userId).collection('roadmaps').doc(domain);
    await roadmapRef.delete();

    // Also reset progress since the roadmap structure will change back to default
    const progressRef = db.collection('users').doc(userId).collection('roadmapProgress').doc(domain);
    await progressRef.delete();

    console.log(`[Hyperpersonalization] Reset roadmap and progress for user ${userId}, domain ${domain}`);

    res.json({
      success: true,
      message: 'Roadmap reset to default',
    });

  } catch (error: any) {
    console.error('[Hyperpersonalization] Reset error:', error);
    res.status(500).json({
      error: 'Reset failed',
      message: error.message || 'Something went wrong.',
    });
  }
});

/**
 * GET /api/hyperpersonalization/status
 * Get usage status
 */
router.get('/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const userProfile = await getUserProfile(userId);
    const isPremium = isPremiumUser(userProfile);

    if (!isPremium) {
      res.json({
        isPremium: false,
        usageCount: 0,
        remainingUses: 0,
        limit: MONTHLY_USAGE_LIMIT,
      });
      return;
    }

    const usage = await getUsageData(userId);

    res.json({
      isPremium: true,
      usageCount: usage.usageCount,
      remainingUses: MONTHLY_USAGE_LIMIT - usage.usageCount,
      limit: MONTHLY_USAGE_LIMIT,
      history: usage.history,
    });

  } catch (error: any) {
    console.error('[Hyperpersonalization] Status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

export default router;
