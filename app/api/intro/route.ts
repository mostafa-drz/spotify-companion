import { NextResponse } from 'next/server';
import { generateTrackIntro } from '@/app/lib/ai-service';
import { adminDb } from '@/app/lib/firebase-admin';
import { verifyAuth } from '@/app/lib/firebase-admin';
import { SpotifyTrack } from '@/app/types/Spotify';


interface RequestBody {
  track: SpotifyTrack;
  trackId: string;
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const userId = await verifyAuth();
    const { track, trackId } = await request.json() as RequestBody;
    console.log('track', track);
    if (!track) {
      return NextResponse.json(
        { error: 'Missing track information' },
        { status: 400 }
      );
    }

    // Construct the path to the track intro document
    const trackIntrosRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('trackIntros');

    // Check if intro already exists
    const introDoc = await trackIntrosRef.doc(trackId).get();

    if (introDoc.exists) {
      return NextResponse.json({
        status: 'ready',
        intro: introDoc.data()
      });
    }

    const introText = await generateTrackIntro(track);

    // Save to Firestore
    const introData = {
      trackId: track.id,
      userId,
      introText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'ready'
    };

    console.log('introData', introData);

    await trackIntrosRef.doc(trackId).set(introData);

    return NextResponse.json({
      status: 'ready',
      intro: introData
    });
  } catch (error) {
    console.error('Error generating intro:', error);
    return NextResponse.json(
      { error: 'Failed to generate intro' },
      { status: 500 }
    );
  }
} 