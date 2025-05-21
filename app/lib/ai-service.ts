import { generateTextWithGemini } from './genKit';

interface TrackIntroPrompt {
  trackName: string;
  artistName: string;
  albumName: string;
}

export async function generateTrackIntro({ trackName, artistName, albumName }: TrackIntroPrompt): Promise<string> {
  try {
    const prompt = `Create a brief, engaging introduction for the song "${trackName}" by ${artistName} from the album "${albumName}". 
    The introduction should be educational and informative, highlighting interesting facts about the song, artist, or album.
    Keep it concise (2-3 sentences) and conversational in tone.
    Focus on the most interesting or unique aspects that would enhance the listener's appreciation of the track.`;

    const text = await generateTextWithGemini(prompt);
    return text.trim();
  } catch (error) {
    console.error('Failed to generate track intro:', error);
    throw error;
  }
} 