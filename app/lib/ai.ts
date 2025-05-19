import { adminDb } from './firebase-admin';

// Types
export interface TrackMetadata {
  id: string;
  name: string;
  artists: string[];
  album: string;
  duration: number;
}

export interface AIResponse {
  text: string;
  duration: number; // in seconds
}

// Simple cache for generated intros
const introCache = new Map<string, AIResponse>();

export async function generateIntro(
  trackMetadata: TrackMetadata,
  promptTemplate: string
): Promise<AIResponse> {
  const cacheKey = `${trackMetadata.id}-${promptTemplate}`;
  
  // Check cache first
  const cachedResponse = introCache.get(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Format the prompt with track metadata
    const formattedPrompt = promptTemplate
      .replace('{trackName}', trackMetadata.name)
      .replace('{artists}', trackMetadata.artists.join(', '))
      .replace('{album}', trackMetadata.album);

    // TODO: Replace with actual Vertex AI call
    // This is a mock implementation
    const response: AIResponse = {
      text: `This is a mock intro for ${trackMetadata.name} by ${trackMetadata.artists.join(', ')}.`,
      duration: 60
    };

    // Cache the response
    introCache.set(cacheKey, response);

    // Log the generation
    await adminDb.collection('aiGenerations').add({
      trackId: trackMetadata.id,
      prompt: formattedPrompt,
      response,
      timestamp: new Date()
    });

    return response;
  } catch (error) {
    console.error('Error generating intro:', error);
    throw new Error('Failed to generate intro');
  }
}

export function clearCache(): void {
  introCache.clear();
} 