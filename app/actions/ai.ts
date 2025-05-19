'use server';

import { verifyAuth } from '@/app/lib/firebase-admin';
import { generateIntro, TrackMetadata } from '@/app/lib/ai';
import { savePromptMetadata } from './prompts';
import { AuthError } from '@/app/lib/AuthError';

export async function generateTrackIntro(
  trackMetadata: TrackMetadata,
  promptTemplate: string
) {
  try {
    // Verify authentication
    await verifyAuth();

    // Generate intro
    const result = await generateIntro(trackMetadata, promptTemplate);

    // Update prompt metadata
    await savePromptMetadata(
      trackMetadata.id,
      promptTemplate,
      'completed'
    );

    return { success: true, data: result };
  } catch (error) {
    console.error('Error generating track intro:', error);
    
    // Update prompt metadata with error
    await savePromptMetadata(
      trackMetadata.id,
      promptTemplate,
      'failed',
      error instanceof Error ? error.message : 'Unknown error'
    );

    throw new AuthError('Failed to generate track intro', 'GENERATION_FAILED');
  }
} 