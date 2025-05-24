import { adminDb } from '@/app/lib/firebase-admin';
import { verifyAuth } from '@/app/lib/firebase-admin';
import { generateTrackIntro } from './genKit';
import { IntroPromptInput, IntroPromptOutput } from '@/app/types/Prompt';
import type { TrackMetadata } from '@/app/types/Track';
import type { TrackIntro } from '@/app/types/Prompt';
import { getCachedIntro, saveIntroToFirestore } from '@/app/lib/firestore';

/**
 * Track metadata interface for intro generation
 * Contains essential information about a Spotify track
 */
export interface TrackMetadata {
  id: string;
  name: string;
  artists: string[];
  album: string;
  duration: number;
  playlistId?: string;
}

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
 * - User preferences
 * 
 * @param trackMetadata - Track information from Spotify
 * @param userAreaOfInterest - User's preferred area of interest
 * @param language - Language code (default: 'en')
 * @param tone - Optional tone for the intro
 * @param length - Optional duration in seconds
 * 
 * @returns Promise<IntroPromptOutput> - Structured output with markdown and SSML
 * @throws Error if generation fails or user is not authenticated
 */
export async function generateIntro(
  trackMetadata: TrackMetadata,
  userAreaOfInterest: string,
  language: string = 'en-US',
  tone: string = 'neutral',
  length: string = 'medium'
): Promise<TrackIntro> {
  const userId = await verifyAuth();

  try {
    // Check if we have a cached intro that matches all parameters
    const cachedIntro = await getCachedIntro(trackMetadata.id, {
      language,
      tone,
      length,
      prompt: userAreaOfInterest
    });

    if (cachedIntro) {
      console.log('Using cached intro for track:', trackMetadata.id);
      return cachedIntro;
    }

    // Generate the intro using the AI
    const intro = await generateTrackIntro({
      trackDetailsJSON: JSON.stringify(trackMetadata),
      userAreaOfInterest,
      language,
      tone,
      length
    });

    // Save the intro to Firestore
    const introData: TrackIntro = {
      trackId: trackMetadata.id,
      userId: trackMetadata.userId || '',
      introText: intro.markdown,
      ssml: intro.ssml,
      audioUrl: '', // This will be set by the audio generation service
      duration: intro.duration,
      language,
      tone,
      length,
      prompt: userAreaOfInterest,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      playlistId: trackMetadata.playlistId || null
    };

    await saveIntroToFirestore(introData);

    return introData;
  } catch (error) {
    console.error('Error generating intro:', error);
    throw error;
  }
}