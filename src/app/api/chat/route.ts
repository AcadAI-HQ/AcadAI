/**
 * Chat API Route - Gemini AI Integration
 * Handles chat messages for roadmap assistance
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId, domain, chatHistory, userProfile } = body;

    if (!message || !userId || !domain) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if Gemini API key is configured
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: 'Gemini API not configured',
          message: 'The AI chat feature requires a Google Gemini API key to be configured in environment variables.'
        },
        { status: 503 }
      );
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build context from user profile and chat history
    let contextPrompt = `You are an expert learning assistant helping with ${domain} learning. `;

    if (userProfile) {
      contextPrompt += `The user is a ${userProfile.userType || 'learner'}`;
      if (userProfile.skills && userProfile.skills.length > 0) {
        contextPrompt += ` with skills in: ${userProfile.skills.join(', ')}`;
      }
      if (userProfile.domainExperience) {
        contextPrompt += ` and ${userProfile.domainExperience} experience in ${domain}`;
      }
      contextPrompt += '. ';
    }

    contextPrompt += `Provide helpful, concise, and accurate answers about ${domain} learning, roadmaps, resources, and career guidance. `;
    contextPrompt += 'Keep responses focused and practical.\n\n';

    // Add chat history for context
    if (chatHistory && chatHistory.length > 0) {
      contextPrompt += 'Previous conversation:\n';
      chatHistory.slice(-5).forEach((msg: any) => {
        contextPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      contextPrompt += '\n';
    }

    // Add current user message
    contextPrompt += `User: ${message}\nAssistant:`;

    // Generate response
    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    const aiMessage = response.text();

    // Return the AI response
    return NextResponse.json({
      success: true,
      message: aiMessage,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Chat API error:', error);

    // Handle specific Gemini API errors
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        {
          error: 'Invalid API key',
          message: 'The Google Gemini API key is invalid or missing.'
        },
        { status: 503 }
      );
    }

    if (error.message?.includes('quota')) {
      return NextResponse.json(
        {
          error: 'API quota exceeded',
          message: 'The Gemini API quota has been exceeded. Please try again later.'
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to generate response',
        message: error.message || 'An error occurred while processing your message.'
      },
      { status: 500 }
    );
  }
}
