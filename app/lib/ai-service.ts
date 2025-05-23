import { generateTextWithGemini } from './genKit';
import { SpotifyTrack } from '@/app/types/Spotify';
interface TrackIntroPrompt extends SpotifyTrack {
  track: SpotifyTrack;
}


const MAIN_PROMPT= `
You are aa helpful assistant that can help me to learn more about the music I am listening to on Spotify. 

I'll share a track information from Spotify and you will help me to learn more about the track with the following parameters provided:
`
export async function generateTrackIntro({ customPrompt, track }: TrackIntroPrompt): Promise<string> {
  try {
    const prompt = customPrompt
      ? `
      ${customPrompt}

      Here's the track:
      ${JSON.stringify(track)}
      `
      : `Create a brief, engaging introduction for the song "${track.name}" by ${track.artists.map(a => a.name).join(', ')} from the album "${track.album.name}". 
    The introduction should be educational and informative, highlighting interesting facts about the song, artist, or album.
    Keep it concise (2-3 sentences) and conversational in tone.
    Focus on the most interesting or unique aspects that would enhance the listener's appreciation of the track.
    
    Here's the track:
    ${JSON.stringify(track)}
    `;

    const text = await generateTextWithGemini(prompt);
    return text.trim();
  } catch (error) {
    console.error('Failed to generate track intro:', error);
    throw error;
  }
} 