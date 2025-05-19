'use server';

import { verifyAuth } from '@/app/lib/firebase-admin';
import { generateAudio, getAvailableVoices } from '@/app/lib/tts-service';
import { TTSRequest } from '@/app/types/TTS';
import { AuthError } from '@/app/lib/AuthError';

export async function generateTrackAudio(request: TTSRequest) {
  try {
    // Verify authentication
    await verifyAuth();

    // Generate audio
    const result = await generateAudio(request);

    if (!result.success) {
      throw new AuthError(result.error?.message || 'Failed to generate audio', 'TTS_FAILED');
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error generating track audio:', error);
    throw new AuthError('Failed to generate track audio', 'TTS_FAILED');
  }
}

export async function getVoices() {
  try {
    // Verify authentication
    await verifyAuth();

    // Get available voices
    const voices = await getAvailableVoices();
    return { success: true, data: voices };
  } catch (error) {
    console.error('Error getting voices:', error);
    throw new AuthError('Failed to get available voices', 'TTS_FAILED');
  }
} 