import { NextResponse } from 'next/server';
import { verifyAuth } from '@/app/lib/firebase-admin';
import { generateIntro } from '@/app/lib/ai';
import { generateTTSAudio } from '@/app/lib/tts-service';
import { adminDb } from '@/app/lib/firebase-admin';
import { SpotifyTrack } from '@/app/types/Spotify';
import { TrackMetadata } from '@/app/types/Track';
import { UserTransaction } from '@/app/types/User';
import { hasSufficientCredits, deductCredits } from '@/app/actions/credits';

interface RequestBody {
  trackId: string;
  track: SpotifyTrack;
  regenerate?: boolean;
  language?: string;
  tone?: 'casual' | 'academic' | 'storytelling' | 'conversational' | 'professional';
  length?: number;
  templateId: string;
  templateName: string;
  templatePrompt: string;
}

// Helper to generate composite doc ID
function getIntroDocId(trackId: string, templateId: string) {
  return `${trackId}_${templateId}`;
}

export async function POST(request: Request) {
  try {
    const userId = await verifyAuth();
    const { 
      trackId, 
      track, 
      regenerate,
      language = 'en',
      tone = 'conversational',
      length = 60,
      templateId,
      templateName,
      templatePrompt
    } = (await request.json()) as RequestBody;

    if (!templateId) {
      return NextResponse.json({
        status: 'error',
        error: 'templateId is required',
      }, { status: 400 });
    }
    if (!templatePrompt) {
      return NextResponse.json({
        status: 'error',
        error: 'templatePrompt is required',
      }, { status: 400 });
    }

    // Check if intro already exists for this template, unless regenerating
    if (!regenerate && templateId) {
      const docId = getIntroDocId(trackId, templateId);
      const introRef = adminDb.collection('users').doc(userId).collection('trackIntros').doc(docId);
      const existingDoc = await introRef.get();
      if (existingDoc.exists) {
        return NextResponse.json({
          status: 'ready',
          intro: existingDoc.data(),
        });
      }
    }

    // Check if user has sufficient credits
    const hasCredits = await hasSufficientCredits(userId, UserTransaction.GENERATE_TRACK_INTRO);
    if (!hasCredits) {
      return NextResponse.json({
        status: 'error',
        error: 'Insufficient credits to generate intro',
      }, { status: 402 }); // Payment Required
    }

    // Generate intro using new GenKit integration
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

    // Generate TTS audio
    const { audioUrl } = await generateTTSAudio({
      text: introOutput.markdown,
      userId,
      trackId,
    });

    // Update the intro with the audio URL
    const intro = {
      ...introOutput,
      audioUrl,
      updatedAt: new Date().toISOString(),
    };

    const docId = getIntroDocId(trackId, templateId);
    const introRef = adminDb.collection('users').doc(userId).collection('trackIntros').doc(docId);
    await introRef.set(intro);

    // Deduct credits after successful generation
    await deductCredits(userId, UserTransaction.GENERATE_TRACK_INTRO);

    return NextResponse.json({
      status: 'ready',
      intro,
    });
  } catch (error) {
    console.error('Intro generation failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to generate intro',
      },
      { status: 500 }
    );
  }
} 