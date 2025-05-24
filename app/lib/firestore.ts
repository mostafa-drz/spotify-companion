import { clientDb } from '@/app/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { TrackIntro } from '@/app/types/Prompt';

interface IntroCacheParams {
  language: string;
  tone: string;
  length: string;
  prompt: string;
}

export async function getCachedIntro(
  trackId: string,
  params: IntroCacheParams
): Promise<TrackIntro | null> {
  try {
    const docRef = doc(clientDb, 'trackIntros', trackId);
    const doc = await getDoc(docRef);
    
    if (!doc.exists()) return null;
    
    const data = doc.data() as TrackIntro;
    
    // Check if cached intro matches all parameters
    if (
      data.language === params.language &&
      data.tone === params.tone &&
      data.length === params.length &&
      data.prompt === params.prompt
    ) {
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cached intro:', error);
    return null;
  }
}

export async function saveIntroToFirestore(intro: TrackIntro): Promise<void> {
  try {
    const docRef = doc(clientDb, 'trackIntros', intro.trackId);
    await setDoc(docRef, intro, { merge: true });
  } catch (error) {
    console.error('Error saving intro to Firestore:', error);
    throw error;
  }
} 