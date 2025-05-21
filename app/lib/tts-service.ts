import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import { Storage } from '@google-cloud/storage';
import { adminStorage } from './firebase-admin';
import { TTSRequest, TTSResponse, TTSGenerationError, TTSGenerationResult } from '../types/TTS';

const ttsClient = new TextToSpeechClient();
const storage = new Storage();

// Simple cache for generated audio
const audioCache = new Map<string, TTSResponse>();

interface TTSOptions {
  text: string;
  userId: string;
  trackId: string;
  voice?: {
    languageCode?: string;
    name?: string;
  };
}

export async function generateTTSAudio({ text, userId, trackId, voice }: TTSOptions) {
  try {
    // Use Chirp 3 voice (en-US-Neural2-F for female, en-US-Neural2-D for male)
    const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
      input: { text },
      voice: {
        languageCode: voice?.languageCode || 'en-US',
        name: voice?.name || 'en-US-Neural2-F',
      },
      audioConfig: {
        audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding.MP3,
        speakingRate: 1.0,
        pitch: 0,
        // Add natural pauses and emphasis
        effectsProfileId: ['large-home-entertainment-class-device'],
      },
    };

    // Generate audio
    const [response] = await ttsClient.synthesizeSpeech(request);
    if (!response.audioContent) {
      throw new Error('No audio content generated');
    }

    // Upload to Firebase Storage
    const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET_URI!);
    const fileName = `users/${userId}/trackIntros/${trackId}/intro.mp3`;
    const file = bucket.file(fileName);

    await file.save(response.audioContent, {
      metadata: {
        contentType: 'audio/mpeg',
      },
    });

    // Get public URL
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future expiration
    });

    return {
      audioUrl: url,
      duration: response.audioContent.length / 16000, // Approximate duration in seconds
    };
  } catch (error) {
    console.error('TTS generation failed:', error);
    throw error;
  }
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