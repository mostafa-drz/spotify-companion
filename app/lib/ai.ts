import { adminDb } from './firebase-admin';
import { verifyAuth } from '@/app/lib/firebase-admin';
import { generateTrackIntro } from './genKit';
import { IntroPromptInput, IntroPromptOutput } from '@/app/types/Prompt';

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
  language: string = 'en',
  tone?: 'casual' | 'academic' | 'storytelling' | 'conversational' | 'professional',
  length?: number
): Promise<IntroPromptOutput> {
  const userId = await verifyAuth();

  // Check Firestore for existing intro
  const docRef = adminDb.collection('users').doc(userId).collection('trackIntros').doc(trackMetadata.id);
  const doc = await docRef.get();
  const docData = doc.exists ? doc.data() : undefined;
  
  // Return cached intro if it exists and matches our input parameters
  if (docData?.introText && 
      docData.language === language && 
      docData.tone === tone && 
      docData.length === length) {
    return {
      markdown: docData.introText,
      ssml: docData.ssml || '',
      duration: docData.duration || 60
    };
  }

  try {
    // Prepare input for GenKit
    const input: IntroPromptInput = {
      trackDetailsJSON: JSON.stringify(trackMetadata),
      userAreaOfInterest,
      language,
      tone,
      length
    };

    // Generate intro using GenKit
    const output = await generateTrackIntro(input);

    // Save to Firestore with metadata for cache invalidation
    await docRef.set({
      introText: output.markdown,
      ssml: output.ssml,
      duration: output.duration,
      language,
      tone,
      length,
      updatedAt: new Date(),
      playlistId: trackMetadata.playlistId || null
    }, { merge: true });

    return output;
  } catch (error) {
    console.error('Error generating intro:', error);
    throw error;
  }
}