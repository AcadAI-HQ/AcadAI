import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit with Google AI plugin
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY
    })
  ]
});

// Export model references for use in services
export const geminiPro = 'googleai/gemini-1.5-pro';
export const geminiFlash = 'googleai/gemini-1.5-flash';

export default ai;
