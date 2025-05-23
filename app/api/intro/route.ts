import { NextResponse } from 'next/server';
import { verifyAuth } from '@/app/lib/firebase-admin';
import { generateTrackIntro } from '@/app/lib/ai-service';
import { generateTTSAudio } from '@/app/lib/tts-service';
import { adminDb } from '@/app/lib/firebase-admin';
import { SpotifyTrack } from '@/app/types/Spotify';
interface RequestBody {
  trackId: string;
  track: SpotifyTrack;
  regenerate?: boolean;
}

export async function POST(request: Request) {
  try {
    const userId = await verifyAuth();
    const { trackId, track, regenerate } = (await request.json()) as RequestBody;

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

    // Generate intro text
    const introText = await generateTrackIntro({
      track,
      customPrompt: track.prompt,
    });

    // Generate TTS audio
    const { audioUrl, duration } = await generateTTSAudio({
      text: introText,
      userId,
      trackId,
    });

    // Save to Firestore
    const intro = {
      trackId,
      userId,
      introText,
      audioUrl,
      duration,
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