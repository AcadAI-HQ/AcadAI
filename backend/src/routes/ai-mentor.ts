import { Router, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { mentorRateLimiter, getUserUsage } from '../middleware/rate-limiter';
import { db } from '../config/firebase';

const router = Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

// Message constraints
const MAX_MESSAGE_LENGTH = 2000;
const MAX_CHAT_HISTORY_LENGTH = 20;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

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
  roles?: {
    admin?: boolean;
  };
  flags?: {
    bypassPremium?: boolean;
  };
}

/**
 * Check if user has premium subscription or bypass
 */
function isPremiumUser(profile: UserProfile | null): boolean {
  if (!profile) return false;

  // Check for admin or bypass flags
  if (profile.roles?.admin === true || profile.flags?.bypassPremium === true) {
    return true;
  }

  // Check subscription
  if (!profile.subscription) return false;
  return profile.subscription.tier === 'premium' && profile.subscription.status === 'active';
}

/**
 * Fetch user profile from Firestore
 */
async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) {
    console.error('[AI Mentor] Firestore not initialized');
    return null;
  }

  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('[AI Mentor] Error fetching user profile:', error);
    return null;
  }
}

/**
 * POST /api/ai-mentor/chat
 * Send a message to the AI Mentor and get a personalized response.
 *
 * Middleware chain: requireAuth → mentorRateLimiter → handler
 * Rate limiting runs AFTER auth so req.user.uid is available as the key.
 */
router.post('/chat', requireAuth, mentorRateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message, chatHistory } = req.body as {
      message: string;
      chatHistory: ChatMessage[];
    };

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Validate message length
    if (message.length > MAX_MESSAGE_LENGTH) {
      res.status(400).json({
        error: 'Message too long',
        message: `Message must be ${MAX_MESSAGE_LENGTH} characters or less.`,
      });
      return;
    }

    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Fetch user profile and check premium status
    const userProfile = await getUserProfile(userId);
    if (!isPremiumUser(userProfile)) {
      res.status(403).json({
        error: 'Premium required',
        message: 'AI Mentor is a premium feature. Upgrade to access personalized learning assistance.',
      });
      return;
    }

    // Check if Gemini API key is configured
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      console.error('[AI Mentor] GOOGLE_GENAI_API_KEY not configured');
      res.status(503).json({
        error: 'AI service not configured',
        message: 'The AI Mentor feature requires configuration.',
      });
      return;
    }

    // userProfile already fetched above for premium check

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build system context based on user profile
    let systemContext = `You are an AI Learning Mentor for AcadAI, an educational platform that helps users learn technology skills through personalized roadmaps.

Your role is to:
1. Provide personalized learning guidance based on the user's background and goals
2. Answer questions about their learning path and roadmap topics
3. Offer encouragement and motivation
4. Suggest resources, projects, and learning strategies
5. Help troubleshoot learning obstacles
6. Explain technical concepts in an accessible way

Be friendly, supportive, and encouraging while being concise and practical. Keep responses focused and actionable.

`;

    // Add user context from Firestore
    if (userProfile) {
      systemContext += `\nUser Profile:\n`;

      if (userProfile.userType) {
        systemContext += `- User Type: ${userProfile.userType}\n`;
      }

      if (userProfile.lastGeneratedDomain) {
        systemContext += `- Currently Learning: ${userProfile.lastGeneratedDomain}\n`;
      }

      if (userProfile.interestedDomains?.length) {
        systemContext += `- Interested In: ${userProfile.interestedDomains.join(', ')}\n`;
      }

      if (userProfile.domainExperience) {
        systemContext += `- Experience Level: ${userProfile.domainExperience}\n`;
      }

      if (userProfile.skills?.length) {
        systemContext += `- Known Skills: ${userProfile.skills.join(', ')}\n`;
      }

      // Type-specific context
      if (userProfile.userType === 'student') {
        if (userProfile.degree) systemContext += `- Studying: ${userProfile.degree}\n`;
        if (userProfile.currentYear) systemContext += `- Year: ${userProfile.currentYear}\n`;
      } else if (userProfile.userType === 'professional') {
        if (userProfile.currentRole) systemContext += `- Current Role: ${userProfile.currentRole}\n`;
        if (userProfile.yearsOfExperience) systemContext += `- Years of Experience: ${userProfile.yearsOfExperience}\n`;
      } else if (userProfile.userType === 'learner' && userProfile.description) {
        systemContext += `- Background: ${userProfile.description}\n`;
      }
    }

    systemContext += `\nRespond in a helpful, conversational tone. Keep responses concise (2-4 paragraphs max unless the user asks for detailed explanations). Use markdown formatting for code blocks, lists, and emphasis when helpful.`;

    // Build conversation history for context (limit size to prevent abuse)
    const safeHistory = Array.isArray(chatHistory) ? chatHistory : [];
    const conversationHistory = safeHistory
      .slice(-MAX_CHAT_HISTORY_LENGTH) // Limit number of messages
      .map((msg) => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        // Truncate long messages in history
        const content = typeof msg.content === 'string'
          ? msg.content.slice(0, MAX_MESSAGE_LENGTH)
          : '';
        return `${role}: ${content}`;
      })
      .join('\n\n');

    // Build the full prompt
    let prompt = systemContext;

    if (conversationHistory) {
      prompt += `\n\nRecent conversation:\n${conversationHistory}`;
    }

    prompt += `\n\nUser: ${message}\n\nAssistant:`;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = result.response;
    const aiResponse = response.text();

    console.log(`[AI Mentor] Generated response for user ${userId}`);

    res.json({
      success: true,
      response: aiResponse.trim(),
    });

  } catch (error: any) {
    console.error('[AI Mentor] Chat error:', error);
    console.error('[AI Mentor] Error message:', error.message);

    const errorMessage = error.message?.toLowerCase() || '';

    // Handle specific Gemini API errors
    if (errorMessage.includes('api key') || errorMessage.includes('api_key')) {
      res.status(503).json({
        error: 'Service configuration error',
        message: 'The AI service is not properly configured.',
      });
      return;
    }

    if (errorMessage.includes('quota') || errorMessage.includes('rate') || errorMessage.includes('limit')) {
      res.status(429).json({
        error: 'Service temporarily unavailable',
        message: 'The AI service is currently busy. Please try again in a moment.',
      });
      return;
    }

    if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
      res.status(400).json({
        error: 'Content filtered',
        message: 'I cannot respond to that request. Please try rephrasing your question.',
      });
      return;
    }

    if (errorMessage.includes('not found') || errorMessage.includes('model')) {
      res.status(503).json({
        error: 'Model error',
        message: 'AI model configuration error. Please contact support.',
      });
      return;
    }

    res.status(500).json({
      error: 'Chat failed',
      message: error.message || 'Something went wrong. Please try again.',
    });
  }
});

/**
 * GET /api/ai-mentor/status
 * Get AI Mentor usage status (reads from in-memory rate-limit store).
 */
router.get('/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Fetch user profile and check premium status
    const userProfile = await getUserProfile(userId);
    const usage = getUserUsage(userId);

    res.json({
      isPremium: isPremiumUser(userProfile),
      burstUsed: usage.burstUsed,
      burstLimit: usage.burstLimit,
      burstRemaining: usage.burstRemaining,
      dailyUsed: usage.dailyUsed,
      dailyLimit: usage.dailyLimit,
      dailyRemaining: usage.dailyRemaining,
    });

  } catch (error: any) {
    console.error('[AI Mentor] Status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

export default router;
