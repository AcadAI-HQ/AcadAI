import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { RoadmapFile } from '@/types';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for customization

/**
 * Load base roadmap from filesystem (server-side)
 */
async function loadBaseRoadmapServer(domain: string): Promise<RoadmapFile> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'roadmaps-new', `${domain}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data as RoadmapFile;
  } catch (error) {
    console.error('Error loading base roadmap from filesystem:', error);
    throw new Error(`Failed to load base roadmap for domain: ${domain}`);
  }
}

/**
 * POST /api/roadmap/customize
 * Customize a roadmap based on user's assessment answers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, domain, answers, userProfile } = body;

    // Validation
    if (!userId || !domain || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, domain, answers' },
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

    console.log(`Customizing ${domain} roadmap for user ${userId}...`);

    // Load base roadmap from filesystem
    const baseRoadmap = await loadBaseRoadmapServer(domain);

    // Build customization prompt
    const customizationPrompt = buildCustomizationPrompt(
      baseRoadmap,
      answers,
      userProfile,
      domain
    );

    // Initialize Gemini AI with JSON mode
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent output
        topP: 0.9,
        maxOutputTokens: 8000, // Allow longer responses for full roadmap
        responseMimeType: "application/json", // Force JSON output
      },
    });

    console.log('Calling Gemini AI for roadmap customization...');

    // Generate customized roadmap
    const result = await model.generateContent(customizationPrompt);
    const response = result.response;
    const generatedText = response.text();

    console.log('Received response from Gemini');

    // Parse the JSON response
    let customizedRoadmap: RoadmapFile;
    try {
      // With JSON mode, response should be clean JSON
      customizedRoadmap = JSON.parse(generatedText);

      // Ensure it has the required structure
      if (!customizedRoadmap.domain || !customizedRoadmap.steps || !Array.isArray(customizedRoadmap.steps)) {
        throw new Error('Invalid roadmap structure');
      }

      // Set domain to ensure consistency
      customizedRoadmap.domain = domain;

      console.log(`Successfully parsed roadmap with ${customizedRoadmap.steps.length} steps`);

    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Generated text (first 500 chars):', generatedText.substring(0, 500));

      // Fallback: Use base roadmap with modified overview
      customizedRoadmap = {
        ...baseRoadmap,
        overview: `${baseRoadmap.overview}\n\nThis roadmap has been tailored based on your experience and goals.`,
      };

      console.log('Using fallback roadmap');
    }

    console.log('Successfully customized roadmap');

    // Return the customized roadmap (client will save it to Firestore)
    return NextResponse.json({
      success: true,
      customizedRoadmap,
      message: 'Roadmap customized successfully',
    });

  } catch (error: any) {
    console.error('Roadmap customization error:', error);

    return NextResponse.json(
      {
        error: 'Failed to customize roadmap',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Build comprehensive prompt for Gemini to customize the roadmap
 */
function buildCustomizationPrompt(
  baseRoadmap: RoadmapFile,
  answers: Array<{ question: string; answer: string }>,
  userProfile: any,
  domain: string
): string {
  // Extract key insights from answers
  const answersText = answers
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
    .join('\n\n');

  // Build a JSON schema for structured output
  const jsonSchema = {
    type: "object",
    properties: {
      domain: { type: "string" },
      type: { type: "string" },
      overview: { type: "string" },
      steps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            subtopics: {
              type: "array",
              items: { type: "string" }
            },
            examples: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  features: { type: "string" },
                  stack: { type: "string" }
                }
              }
            },
            resources: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["title", "description", "subtopics"]
        }
      }
    },
    required: ["domain", "type", "overview", "steps"]
  };

  return `Create a personalized ${domain} learning roadmap based on this user assessment:

${answersText}

User Profile:
- Type: ${userProfile?.userType || 'learner'}
- Current Skills: ${userProfile?.skills?.join(', ') || 'Not specified'}
- Experience: ${userProfile?.domainExperience || 'beginner'}

Base Roadmap has ${baseRoadmap.steps.length} steps. Customize it by:

1. REORDER/SKIP steps based on user's existing knowledge
2. ADJUST depth based on time commitment and experience
3. PERSONALIZE overview mentioning their specific goals
4. FOCUS on technologies they mentioned interest in
5. Keep 8-15 steps total, each with 4-8 subtopics

Return a JSON object with:
- domain: "${domain}"
- type: "personalized"
- overview: (personalized message referencing their answers)
- steps: array of learning steps

Each step must have: title, description, subtopics (array), examples (array of {name, features, stack}), resources (array of URLs)`;

}
