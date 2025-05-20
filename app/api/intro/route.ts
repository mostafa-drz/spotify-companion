import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { userId, trackId, track } = await req.json();
    if (!userId || !trackId || !track) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }
    // Placeholder: Replace with actual AI/Genkit call
    const script = `Did you know? "${track.name}" by ${track.artists.join(", ")} from the album "${track.album}" is a great track!`;

    const docRef = adminDb.collection('users').doc(userId).collection('trackIntros').doc(trackId);
    await docRef.set({
      introText: script,
      trackId,
      updatedAt: new Date(),
      trackName: track.name,
      artists: track.artists,
      album: track.album,
    }, { merge: true });

    return NextResponse.json({ success: true, script });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message || 'Server error' }, { status: 500 });
  }
} 