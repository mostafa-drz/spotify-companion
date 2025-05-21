import { NextResponse } from 'next/server';
import { verifyAuth } from '@/app/lib/firebase-admin';
import { generateTrackIntro } from '@/app/lib/ai-service';
import { generateTTSAudio } from '@/app/lib/tts-service';
import { adminDb } from '@/app/lib/firebase-admin';

interface RequestBody {
  trackId: string;
  track: {
    name: string;
    artists: Array<{ name: string }>;
    album: { name: string };
    // ... other track fields
  };
}

export async function POST(request: Request) {
  try {
    const userId = await verifyAuth();
    const { trackId, track } = (await request.json()) as RequestBody;

    // Check if intro already exists
    const introRef = adminDb.collection('users').doc(userId).collection('trackIntros').doc(trackId);
    const introDoc = await introRef.get();

    if (introDoc.exists) {
      const intro = introDoc.data();
      return NextResponse.json({
        status: 'ready',
        intro,
      });
    }

    // Generate intro text
    const introText = await generateTrackIntro({
      trackName: track.name,
      artistName: track.artists.map(a => a.name).join(', '),
      albumName: track.album.name,
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