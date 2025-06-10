'use server';

import { adminDb } from '../lib/firebase-admin';
import { generateIntro } from '../lib/ai';
import { generateTTSAudio } from '../lib/tts-service';
import { hasSufficientCredits, deductCredits } from '../actions/credits';
import { UserTransaction } from '../types/User';
import { SpotifyTrack } from '../types/Spotify';
import { TrackMetadata } from '../types/Spotify';
import { Tone } from '../types/Prompt';

function getIntroDocId(trackId: string, templateId: string) {
  return `${trackId}_${templateId}`;
}

export async function generateIntroText(
  userId: string,
  trackId: string,
  track: SpotifyTrack,
  templateId: string,
  templateName: string,
  templatePrompt: string,
  language: string = 'en',
  tone: Tone,
  length: number = 60
) {
  // Check if user has sufficient credits
  const hasCredits = await hasSufficientCredits(
    userId,
    UserTransaction.GENERATE_TRACK_INTRO
  );
  if (!hasCredits) {
    return {
      error: 'Insufficient credits to generate intro',
    };
  }

  // Generate intro using GenKit integration
  const introOutput = await generateIntro(
    userId,
    track as unknown as TrackMetadata,
    templateId,
    templateName,
    templatePrompt,
    language,
    tone,
    length.toString()
  );

  // Save to Firestore using adminDb
  const docId = getIntroDocId(trackId, templateId);
  const introRef = adminDb
    .collection('users')
    .doc(userId)
    .collection('trackIntros')
    .doc(docId);
  await introRef.set(introOutput);

  // Deduct credits after successful generation
  await deductCredits(userId, UserTransaction.GENERATE_TRACK_INTRO);

  return introOutput;
}

export async function generateIntroAudio(
  userId: string,
  trackId: string,
  templateId: string,
  text: string
) {
  // Generate TTS audio
  const { audioUrl } = await generateTTSAudio({
    text,
    userId,
    trackId,
  });

  // Update Firestore with audio URL using adminDb
  const docId = getIntroDocId(trackId, templateId);
  const introRef = adminDb
    .collection('users')
    .doc(userId)
    .collection('trackIntros')
    .doc(docId);
  await introRef.set({ audioUrl }, { merge: true });

  return audioUrl;
}
