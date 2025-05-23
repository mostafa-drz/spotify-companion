'use server'

import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
import { IntroPromptInput, IntroPromptOutput } from '@/app/types/Prompt';

// Configure GenKit instance
const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
  promptDir: './app/lib/prompts' // Specify the directory containing our .prompt files
});

/**
 * Generate track intro using GenKit and Dotprompt
 */
export async function generateTrackIntro(
  input: IntroPromptInput
): Promise<IntroPromptOutput> {
  try {
    // Load the prompt file
    const introPrompt = ai.prompt('intro');
    
    // Execute the prompt with input
    const { output } = await introPrompt(input);
    
    // The output is already typed according to our schema
    return output as IntroPromptOutput;
  } catch (error) {
    console.error('Error generating track intro:', error);
    throw error;
  }
}