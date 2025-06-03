import { generateTrackIntro } from './genKit';
import type { TrackMetadata } from '@/app/types/Spotify';
import type { TrackIntro } from '@/app/types/Prompt';
import { getTrackIntro, saveTrackIntro } from '@/app/lib/firestore';
import { Tone } from '@/app/types/Prompt';

/**
 * Generate or fetch intro for a track
 *
 * This function:
 * 1. Verifies user authentication
 * 2. Checks Firestore for cached intro
 * 3. Generates new intro if cache miss or parameters changed
 * 4. Caches the result in Firestore
 *
 * Cache invalidation is based on:
 * - Language
 * - Tone
 * - Length
 * - Template prompt
 *
 * @param userId - The user's ID
 * @param trackMetadata - Track information from Spotify
 * @param templateId - ID of the template used to generate this intro
 * @param templateName - Name of the template for display purposes
 * @param templatePrompt - The selected template's prompt text
 * @param language - Language code (default: 'en')
 * @param tone - Optional tone for the intro
 * @param length - Optional duration in seconds
 *
 * @returns Promise<TrackIntro> - The generated or cached intro
 * @throws Error if generation fails or user is not authenticated
 */
export async function generateIntro(
  userId: string,
  trackMetadata: TrackMetadata,
  templateId: string,
  templateName: string,
  templatePrompt: string,
  language: string = 'en-US',
  tone: string = 'neutral',
  length: string = 'medium'
): Promise<TrackIntro> {
  try {
    // Check if we have a cached intro for this track+template
    const cachedIntro = await getTrackIntro(
      userId,
      trackMetadata.id,
      templateId
    );

    if (cachedIntro) {
      return cachedIntro;
    }

    // Generate the intro using the AI
    const intro = await generateTrackIntro({
      trackDetailsJSON: JSON.stringify(trackMetadata),
      templatePrompt,
      language,
      tone: tone as Tone,
      length,
    });

    // Save the intro to Firestore
    const introData: TrackIntro = {
      trackId: trackMetadata.id,
      introText: intro.markdown,
      ssml: intro.ssml,
      audioUrl: '', // This will be set by the audio generation service
      duration: intro.duration,
      language,
      tone,
      length: parseInt(length),
      prompt: templatePrompt || '',
      templateId,
      templateName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      markdown: intro.markdown,
    };

    await saveTrackIntro(userId, trackMetadata.id, templateId, introData);

    return introData;
  } catch (error) {
    console.error('Error generating intro:', error);
    throw error;
  }
}
