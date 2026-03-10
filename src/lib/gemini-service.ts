/**
 * Gemini 2.0 Flash service — the single entry point for all AI generation on AcadAI.
 *
 * COST PROTECTION:
 * - Every call goes through this module; no direct GoogleGenerativeAI instantiation elsewhere.
 * - TOKEN_BUDGETS enforces hard maxOutputTokens per generation type.
 * - Free tier: 15 RPM, 1M tokens/day, 1500 RPD — sufficient for all pipeline jobs.
 *
 * Env required: GOOGLE_GEMINI_API_KEY
 */

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  type Content,
} from '@google/generative-ai';

// Hard token caps per generation type.
// Raising these increases cost — do not increase without understanding the impact.
export const TOKEN_BUDGETS = {
  blog_post: 2048,           // ~1200 words max
  roadmap: 4096,             // ~2500 words max
  weekly_resources: 2048,    // curated list
  market_research: 1024,     // structured summary
  hyper_personalization: 1024,
  chat: 2048,                // AI Mentor replies (raised for agentic tool use)
} as const;

export type GenerationType = keyof typeof TOKEN_BUDGETS;

export interface GeminiResponse {
  text: string;
  tokensUsed: number;
}

// Singleton client
let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const key = process.env.GOOGLE_GEMINI_API_KEY;
    if (!key) {
      throw new Error(
        '[gemini] GOOGLE_GEMINI_API_KEY is not set. Add it to your .env.local file.'
      );
    }
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
}

/**
 * Generate text with a hard token cap.
 * Use this for all prose generation (blog posts, summaries, etc.).
 */
export async function generateText(
  prompt: string,
  type: GenerationType,
  systemInstruction?: string
): Promise<GeminiResponse> {
  const client = getClient();
  const maxTokens = TOKEN_BUDGETS[type];

  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    ...(systemInstruction ? { systemInstruction } : {}),
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.75,
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const tokensUsed = response.usageMetadata?.totalTokenCount ?? 0;

  console.log(`[gemini] type=${type} tokens=${tokensUsed}/${maxTokens}`);

  return { text, tokensUsed };
}

export interface MentorToolDefinition {
  name: string;
  description: string;
  parameters?: {
    type: string;
    properties?: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
}

/**
 * Agentic chat with function calling.
 * Runs a tool-use loop: generate → call tool → feed result → repeat (max 3 rounds).
 */
export async function generateWithTools(
  message: string,
  systemInstruction: string,
  chatHistory: Array<{ role: string; content: string }>,
  tools: MentorToolDefinition[],
  toolExecutor: (name: string, args: Record<string, unknown>) => Promise<Record<string, unknown>>
): Promise<{ text: string; toolsUsed: string[] }> {
  const client = getClient();
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction,
    generationConfig: {
      maxOutputTokens: TOKEN_BUDGETS.chat,
      temperature: 0.75,
    },
    tools: [{ functionDeclarations: tools as any[] }],
    safetySettings,
  });

  // Build conversation history (last 10 turns to stay within context)
  const history: Content[] = chatHistory.slice(-10).map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({ history });
  let result = await chat.sendMessage(message);
  const toolsUsed: string[] = [];

  // Agentic loop — max 3 tool-call rounds
  for (let round = 0; round < 3; round++) {
    const fns = result.response.functionCalls?.();
    if (!fns || fns.length === 0) break;

    const call = fns[0];
    toolsUsed.push(call.name);
    console.log(`[gemini] tool_call=${call.name} args=${JSON.stringify(call.args)}`);

    const toolResult = await toolExecutor(call.name, (call.args || {}) as Record<string, unknown>);

    result = await chat.sendMessage([
      {
        functionResponse: {
          name: call.name,
          response: toolResult,
        },
      },
    ]);
  }

  const text = result.response.text();
  console.log(`[gemini] chat tools_used=${toolsUsed.join(',') || 'none'} tokens≈${text.length / 4}`);
  return { text, toolsUsed };
}

/**
 * Generate and parse JSON output.
 * Gemini sometimes wraps in ```json ... ``` — this strips that automatically.
 */
export async function generateJSON<T>(
  prompt: string,
  type: GenerationType,
  systemInstruction?: string
): Promise<T> {
  const { text } = await generateText(prompt, type, systemInstruction);

  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```$/m, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(
      `[gemini] Invalid JSON returned for type=${type}. First 300 chars: ${cleaned.slice(0, 300)}`
    );
  }
}
