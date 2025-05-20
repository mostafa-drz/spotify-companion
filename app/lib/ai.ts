import { adminDb } from './firebase-admin';
import { verifyAuth } from '@/app/lib/firebase-admin';
import { generateTextWithGemini } from '@/app/lib/genKit';

// Types
export interface TrackMetadata {
  id: string;
  name: string;
  artists: string[];
  album: string;
  duration: number;
  playlistId?: string;
}

export interface AIResponse {
  text: string;
  duration: number; // in seconds
}


// Generate or fetch intro for a track
export async function generateIntro(
  trackMetadata: TrackMetadata,
  promptTemplate: string
): Promise<AIResponse> {
  const userId = await verifyAuth();

  // Check Firestore for existing intro
  const docRef = adminDb.collection('users').doc(userId).collection('trackIntros').doc(trackMetadata.id);
  const doc = await docRef.get();
  const docData = doc.exists ? doc.data() : undefined;
  if (docData && docData.introText && docData.prompt === promptTemplate) {
    const response: AIResponse = {
      text: docData.introText,
      duration: docData.duration || 60
    };
    return response;
  }

  // Format the prompt with track metadata
  const formattedPrompt = promptTemplate
    .replace('{trackName}', trackMetadata.name)
    .replace('{artists}', trackMetadata.artists.join(', '))
    .replace('{album}', trackMetadata.album);

  // Call Genkit/Gemini for text generation
  let aiText = '';
  try {
    aiText = await generateTextWithGemini(formattedPrompt);
  } catch (error) {
    console.error('Error generating intro with Genkit:', error);
    throw new Error('Failed to generate intro');
  }

  const response: AIResponse = {
    text: aiText,
    duration: 60 // Placeholder, can be improved
  };

  // Save to Firestore
  await docRef.set({
    introText: aiText,
    prompt: promptTemplate,
    updatedAt: new Date(),
    playlistId: trackMetadata.playlistId || null,
    duration: response.duration
  }, { merge: true });

  return response;
}