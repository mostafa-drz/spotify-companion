import { NextResponse } from 'next/server';
import { verifyAuth } from '@/app/lib/firebase-admin';
import { generateIntro } from '@/app/lib/ai';
import { generateTTSAudio } from '@/app/lib/tts-service';
import { adminDb } from '@/app/lib/firebase-admin';
import { SpotifyTrack } from '@/app/types/Spotify';
import { TrackMetadata } from '@/app/types/Track';

interface RequestBody {
  trackId: string;
  track: SpotifyTrack;
  regenerate?: boolean;
  language?: string;
  tone?: 'casual' | 'academic' | 'storytelling' | 'conversational' | 'professional';
  length?: number;
  userAreaOfInterest?: string;
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
      userAreaOfInterest = 'General'
    } = (await request.json()) as RequestBody;

    // Check if intro already exists, unless regenerating
    const introRef = adminDb.collection('users').doc(userId).collection('trackIntros').doc(trackId);
    const introDoc = await introRef.get();

    if (introDoc.exists && !regenerate) {
      const intro = introDoc.data();
      return NextResponse.json({
        status: 'ready',
        intro,
      });
    }

    // Generate intro using new GenKit integration
    const introOutput = await generateIntro(
      track as unknown as TrackMetadata,
      userAreaOfInterest,
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

    // Save to Firestore
    const intro = {
      trackId,
      userId,
      introText: introOutput.markdown,
      ssml: introOutput.ssml,
      audioUrl,
      duration: introOutput.duration,
      language,
      tone,
      length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await introRef.set(intro);

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