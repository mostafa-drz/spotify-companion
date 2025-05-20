import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { adminStorage } from './firebase-admin';
import { verifyAuth } from '@/app/lib/firebase-admin';
import { TTSRequest, TTSResponse, TTSGenerationError, TTSGenerationResult } from '../types/TTS';

const ttsClient = new TextToSpeechClient();

// Simple cache for generated audio
const audioCache = new Map<string, TTSResponse>();

export interface GenerateTTSOptions {
  languageCode?: string;
  voiceName?: string;
  speakingRate?: number;
}

export async function generateTTS(
  trackId: string,
  text: string,
  options: GenerateTTSOptions = {}
): Promise<string> {
  const userId = await verifyAuth();
  const {
    languageCode = 'en-US',
    voiceName = 'en-US-Standard-B',
    speakingRate = 1.0
  } = options;

  // Synthesize speech
  const [response] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice: { languageCode, name: voiceName },
    audioConfig: { audioEncoding: 'MP3', speakingRate }
  });

  if (!response.audioContent) {
    throw new Error('No audio content returned from TTS');
  }

  // Store in Firebase Storage
  const filePath = `users/${userId}/tts/${trackId}.mp3`;
  const file = adminStorage.bucket().file(filePath);
  await file.save(response.audioContent as Buffer, {
    metadata: {
      contentType: 'audio/mpeg',
      metadata: {
        trackId,
        userId,
        languageCode,
        voiceName,
        speakingRate: speakingRate.toString(),
      }
    }
  });

  // Get a signed URL for the audio file
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
  });

  return url;
}

export async function generateAudio(request: TTSRequest): Promise<TTSGenerationResult> {
  // Create cache key that includes playlist context
  const cacheKey = `${request.playlistId}-${request.text}-${request.voice}-${request.language}-${request.speed}`;
  
  // Check cache first
  const cachedResponse = audioCache.get(cacheKey);
  if (cachedResponse) {
    return { 
      success: true, 
      data: cachedResponse,
      metadata: {
        playlistId: request.playlistId,
        timestamp: new Date(),
        attempt: 0
      }
    };
  }

  try {
    // TODO: Replace with actual TTS service call
    // This is a mock implementation
    const mockResponse: TTSResponse = {
      audioUrl: `https://example.com/mock-audio-${request.playlistId}.mp3`,
      duration: 60,
      format: 'mp3',
      size: 1024 * 1024 // 1MB
    };

    // Cache the response
    audioCache.set(cacheKey, mockResponse);

    // Log the generation
    await adminStorage.bucket().file(`tts/${request.playlistId}/${cacheKey}.mp3`).save(
      Buffer.from('mock audio data'),
      {
        metadata: {
          contentType: 'audio/mpeg',
          metadata: {
            text: request.text,
            voice: request.voice,
            language: request.language,
            speed: request.speed?.toString(),
            playlistId: request.playlistId,
            playlistName: request.playlistName
          }
        }
      }
    );

    return { 
      success: true, 
      data: mockResponse,
      metadata: {
        playlistId: request.playlistId,
        timestamp: new Date(),
        attempt: 0
      }
    };
  } catch (error) {
    console.error('Error generating audio:', error);
    
    const ttsError: TTSGenerationError = {
      code: 'TTS_FAILED',
      message: error instanceof Error ? error.message : 'Failed to generate audio'
    };

    return { 
      success: false, 
      error: ttsError,
      metadata: {
        playlistId: request.playlistId,
        timestamp: new Date(),
        attempt: 0
      }
    };
  }
}

export function clearCache(): void {
  audioCache.clear();
}

export async function getAvailableVoices(): Promise<string[]> {
  // TODO: Replace with actual voice list from TTS service
  return [
    'en-US-Standard-A',
    'en-US-Standard-B',
    'en-US-Standard-C',
    'en-US-Standard-D'
  ];
} 