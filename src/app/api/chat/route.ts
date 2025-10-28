import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory storage for development (replace with proper database in production)
// For production, you should use Firebase Admin SDK with proper credentials
const chatSessions = new Map<string, any>();

/**
 * POST /api/chat
 * Handle chat messages and return AI responses
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId, domain, userProfile, chatHistory } = body;

    // Validation
    if (!message || !userId || !domain) {
      return NextResponse.json(
        { error: 'Missing required fields: message, userId, domain' },
        { status: 400 }
      );
    }

    // Check for Gemini API key
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Use provided chat history from client
    const recentMessages = chatHistory || [];

    // Get roadmap for context (simplified - client will send this)
    const roadmapData = {
      domain: domain,
      overview: `Learning roadmap for ${domain} development`,
      steps: []
    };

    // Build context for Gemini
    const contextMessages = buildChatContext(
      recentMessages.slice(-10), // Last 10 messages for context
      roadmapData,
      userProfile
    );

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Generate response
    const chat = model.startChat({
      history: contextMessages.slice(0, -1).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    const aiResponse = response.text();

    return NextResponse.json({
      success: true,
      message: aiResponse,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Chat API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Build context for Gemini including chat history, roadmap, and user profile
 */
function buildChatContext(
  recentMessages: any[],
  roadmap: any,
  userProfile: any
): { role: 'user' | 'assistant'; content: string }[] {
  const systemContext = `You are an AI learning advisor helping users with their personalized learning roadmap for ${roadmap.domain}.

USER PROFILE:
- User Type: ${userProfile?.userType || 'learner'}
- Skills: ${userProfile?.skills?.join(', ') || 'Not specified'}
- Experience Level: ${userProfile?.domainExperience || 'beginner'}
${userProfile?.currentRole ? `- Current Role: ${userProfile.currentRole}` : ''}
${userProfile?.yearsOfExperience ? `- Years of Experience: ${userProfile.yearsOfExperience}` : ''}

CURRENT ROADMAP OVERVIEW:
${roadmap.overview || 'Learning path for ' + roadmap.domain}

YOUR ROLE:
- Answer questions about the roadmap
- Provide learning advice and resources
- Suggest personalized modifications to the roadmap based on user experience
- Help with specific technical topics
- Offer career guidance related to this domain
- Be encouraging and supportive

Keep responses concise (2-3 paragraphs max), actionable, and encouraging.`;

  // Add system context as first message
  const messages: { role: 'user' | 'assistant'; content: string }[] = [
    {
      role: 'user',
      content: systemContext,
    },
    {
      role: 'assistant',
      content: `I understand! I'm here to help you with your ${roadmap.domain} learning journey. I can answer questions about the roadmap, suggest personalized modifications based on your ${userProfile?.domainExperience || 'beginner'} level experience, and provide guidance. What would you like to know?`,
    },
  ];

  // Add recent chat history
  recentMessages.forEach((msg: any) => {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }
  });

  return messages;
}
