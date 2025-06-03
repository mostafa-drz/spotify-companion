'use server';

import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
import { IntroPromptInput, IntroPromptOutput } from '@/app/types/Prompt';

/**
 * Configure GenKit instance with Google AI plugin
 * - Uses Gemini 1.5 Flash model for fast, efficient responses
 * - Loads prompts from app/lib/prompts directory
 * - Enables server-side execution with 'use server' directive
 */
const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
  promptDir: './app/lib/prompts', // Specify the directory containing our .prompt files
});

/**
 * Generate track intro using GenKit and Dotprompt
 *
 * This function:
 * 1. Loads the intro.prompt file using GenKit's prompt loader
 * 2. Executes the prompt with the provided input
 * 3. Returns a structured output with markdown and SSML
 *
 * @param input - The input parameters for intro generation
 * @param input.trackDetailsJSON - JSON string containing track metadata
 * @param input.templatePrompt - The selected template's prompt text
 * @param input.language - Language code for the intro
 * @param input.tone - Optional tone for the intro
 * @param input.length - Optional duration in seconds
 *
 * @returns Promise<IntroPromptOutput> - Structured output with markdown and SSML
 * @throws Error if prompt execution fails
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
