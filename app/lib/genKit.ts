'use server'

import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';

// configure a Genkit instance
const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash, // set default model
});

export async function generateTextWithGemini(prompt: string): Promise<string> {
  const { text } = await ai.generate(prompt);
  return text;
}