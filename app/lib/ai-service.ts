import { generateTextWithGemini } from './genKit';
import { SpotifyTrack } from '@/app/types/Spotify';
export interface TrackIntroPrompt {
  trackName: string;
  artistName: string;
  albumName: string;
  releaseYear?: number;
  genres?: string[];
  popularity?: number;
}

export async function generateTrackIntro(track: SpotifyTrack): Promise<string> {
  try {
    const fullPrompt = `
      Create a concise, educational introduction for the song with the JSON object: ${JSON.stringify(track)}.

      Requirements:
      - Keep it under 30 seconds when read aloud
      - Focus on interesting facts about the song, artist, or cultural impact
      - Use a conversational, engaging tone
      - Avoid spoilers about the song's content
      - Make it suitable for text-to-speech (avoid complex punctuation or formatting)
      - Include a brief pause (indicated by "...") before the song starts

      Format the response as plain text, ready for TTS conversion.
    `;

    const text = await generateTextWithGemini(fullPrompt);
    return `${text.trim()} ...`;
  } catch (error) {
    console.error('Error generating track intro:', error);
    throw new Error('Failed to generate track intro');
  }
} 