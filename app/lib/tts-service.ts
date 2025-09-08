import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import { Storage } from '@google-cloud/storage';

// Initialize Google Cloud clients using explicit service account credentials from env vars
const projectId = process.env.GCP_PROJECT_ID;
const clientEmail = process.env.GCP_CLIENT_EMAIL;
const privateKeyRaw = process.env.GCP_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKeyRaw) {
  throw new Error(
    'Missing GCP service account envs. Please set GCP_PROJECT_ID, GCP_CLIENT_EMAIL, and GCP_PRIVATE_KEY.'
  );
}

const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

const ttsClient = new TextToSpeechClient({
  projectId,
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
});

const storage = new Storage({
  projectId,
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
});

interface TTSOptions {
  text: string;
  userId: string;
  trackId: string;
  voice?: {
    languageCode?: string;
    name?: string;
  };
}

export async function generateTTSAudio({
  text,
  userId,
  trackId,
  voice,
}: TTSOptions) {
  try {
    // Use Chirp 3 voice (en-US-Neural2-F for female, en-US-Neural2-D for male)
    const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest =
      {
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
