import { adminDb } from './firebase-admin';
import { verifyAuth } from '@/app/lib/firebase-admin';
import { generateTrackIntro } from './genKit';
import { IntroPromptInput, IntroPromptOutput } from '@/app/types/Prompt';

// Types
export interface TrackMetadata {
  id: string;
  name: string;
  artists: string[];
  album: string;
  duration: number;
  playlistId?: string;
}

// Generate or fetch intro for a track
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
  
  if (docData?.introText) {
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

    // Save to Firestore
    await docRef.set({
      introText: output.markdown,
      ssml: output.ssml,
      duration: output.duration,
      updatedAt: new Date(),
      playlistId: trackMetadata.playlistId || null
    }, { merge: true });

    return output;
  } catch (error) {
    console.error('Error generating intro:', error);
    throw error;
  }
}