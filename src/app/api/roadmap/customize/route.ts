/**
 * Roadmap Customization API Route
 * Uses Gemini AI to personalize roadmaps based on user profile
 *
 * **PREMIUM FEATURE**: This endpoint is only accessible to premium users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK (server-side)
if (!getApps().length) {
  try {
    // Try to initialize with service account if available
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      // Fallback: try loading from file
      initializeApp({
        credential: cert(require('../../../../../firebase-service-account.json'))
      });
    }
  } catch (error) {
    console.warn('Firebase Admin initialization failed:', error);
    // Will handle auth errors later
  }
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  let roadmapData: any = null; // Declare outside try block for error handler access

  try {
    const body = await request.json();
    let { roadmapData: roadmapDataFromBody, userProfile, domain, userId, answers } = body;
    roadmapData = roadmapDataFromBody;

    // Verify user authentication via Firebase Auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decodedToken;

    try {
      decodedToken = await getAuth().verifyIdToken(token);
    } catch (authError) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Verify the userId matches the authenticated user
    if (decodedToken.uid !== userId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'User ID mismatch' },
        { status: 403 }
      );
    }

    // Get user profile from Firestore to check subscription
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'Not Found', message: 'User profile not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const subscription = userData?.subscription || { tier: 'free', status: 'inactive' };

    // Check if user has active premium subscription
    if (subscription.tier !== 'premium' || subscription.status !== 'active') {
      return NextResponse.json(
        {
          error: 'Premium Required',
          message: 'Hyperpersonalization is a premium feature. Please upgrade to premium to access AI-customized roadmaps.',
          isPremiumFeature: true
        },
        { status: 403 }
      );
    }

    if (!domain) {
      return NextResponse.json(
        { error: 'Missing required field: domain' },
        { status: 400 }
      );
    }

    // If roadmapData not provided, load it from public folder
    if (!roadmapData) {
      try {
        const roadmapPath = `/roadmaps-new/${domain}.json`;
        const roadmapResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}${roadmapPath}`);
        if (roadmapResponse.ok) {
          roadmapData = await roadmapResponse.json();
        }
      } catch (err) {
        console.error('Failed to load roadmap data:', err);
        return NextResponse.json(
          { error: 'Failed to load roadmap data for domain: ' + domain },
          { status: 404 }
        );
      }
    }

    // Build userProfile if not complete
    if (!userProfile) {
      userProfile = {};
    }

    // Add assessment answers to user profile if provided
    if (answers) {
      userProfile.assessmentAnswers = answers;
    }

    // Check if Gemini API key is configured
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: 'Gemini API not configured',
          message: 'The hyperpersonalization feature requires a Google Gemini API key.',
          customizedRoadmap: roadmapData // Return original roadmap as fallback
        },
        { status: 503 }
      );
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build personalization prompt
    let prompt = `You are an expert learning path advisor. Personalize the following ${domain} roadmap based on the user's profile.\n\n`;

    // Add user profile context
    prompt += `User Profile:\n`;
    prompt += `- Type: ${userProfile.userType || 'learner'}\n`;
    if (userProfile.skills && userProfile.skills.length > 0) {
      prompt += `- Current skills: ${userProfile.skills.join(', ')}\n`;
    }
    if (userProfile.domainExperience) {
      prompt += `- Experience level: ${userProfile.domainExperience}\n`;
    }
    if (userProfile.learningGoals) {
      prompt += `- Learning goals: ${userProfile.learningGoals}\n`;
    }
    if (userProfile.availableTime) {
      prompt += `- Available time: ${userProfile.availableTime}\n`;
    }

    // Add assessment answers if provided
    if (userProfile.assessmentAnswers && userProfile.assessmentAnswers.length > 0) {
      prompt += `\nAssessment Responses:\n`;
      userProfile.assessmentAnswers.forEach((qa: any, i: number) => {
        prompt += `${i + 1}. ${qa.question}\n   Answer: ${qa.answer}\n`;
      });
    }

    prompt += `\nOriginal Roadmap:\n${JSON.stringify(roadmapData, null, 2)}\n\n`;

    prompt += `Please provide personalized recommendations for this roadmap:\n`;
    prompt += `1. Suggest which topics to prioritize based on the user's background\n`;
    prompt += `2. Recommend additional resources that match their learning style\n`;
    prompt += `3. Provide a realistic timeline based on their available time\n`;
    prompt += `4. Highlight areas where they can skip or speed through based on existing skills\n`;
    prompt += `5. Suggest practical projects aligned with their goals\n\n`;

    prompt += `Return your response as a JSON object with this structure:\n`;
    prompt += `{\n`;
    prompt += `  "recommendations": {\n`;
    prompt += `    "priorityTopics": ["topic1", "topic2"],\n`;
    prompt += `    "skipOrSpeedThrough": ["topic3"],\n`;
    prompt += `    "estimatedTimeline": "X months",\n`;
    prompt += `    "suggestedProjects": ["project1", "project2"],\n`;
    prompt += `    "personalizedTips": ["tip1", "tip2"]\n`;
    prompt += `  }\n`;
    prompt += `}\n\n`;
    prompt += `Only return valid JSON, no markdown or explanations.`;

    // Generate personalized recommendations
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let aiResponse = response.text();

    // Clean up the response (remove markdown code blocks if present)
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the AI response
    let recommendations;
    try {
      recommendations = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // If parsing fails, create a basic structure
      recommendations = {
        recommendations: {
          priorityTopics: [],
          skipOrSpeedThrough: [],
          estimatedTimeline: 'Varies based on pace',
          suggestedProjects: [],
          personalizedTips: ['Focus on hands-on practice', 'Build projects as you learn']
        }
      };
    }

    // Return the customized roadmap with recommendations
    return NextResponse.json({
      success: true,
      customizedRoadmap: {
        ...roadmapData,
        personalization: recommendations.recommendations,
        customizedAt: new Date().toISOString(),
        customizedFor: userProfile.uid || 'user'
      }
    });

  } catch (error: any) {
    console.error('Roadmap customization error:', error);

    // Handle specific Gemini API errors
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        {
          error: 'Invalid API key',
          message: 'The Google Gemini API key is invalid.',
          customizedRoadmap: roadmapData // Return original as fallback
        },
        { status: 503 }
      );
    }

    if (error.message?.includes('quota')) {
      return NextResponse.json(
        {
          error: 'API quota exceeded',
          message: 'The Gemini API quota has been exceeded. Please try again later.',
          customizedRoadmap: roadmapData // Return original as fallback
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'Customization failed',
        message: error.message || 'Failed to customize roadmap.',
        customizedRoadmap: roadmapData // Return original as fallback
      },
      { status: 500 }
    );
  }
}
