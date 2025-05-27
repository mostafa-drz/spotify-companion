import { clientDb } from '@/app/lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import type { PromptTemplate, TrackIntro, UserPromptSettings } from '@/app/types/Prompt';
import { User } from '@/app/types/User';

interface IntroCacheParams {
  language: string;
  tone: string;
  length: string;
  prompt: string;
  templateId?: string;
}

export async function getCachedIntro(
  trackId: string,
  params: IntroCacheParams
): Promise<TrackIntro | null> {
  try {
    const docRef = doc(clientDb, 'trackIntros', trackId);
    const document = await getDoc(docRef);
    
    if (!document.exists()) return null;
    
    const data = document.data() as TrackIntro;
    
    // Check if cached intro matches all parameters including template
    if (
      data.language === params.language &&
      data.tone === params.tone &&
      data.length === parseInt(params.length) &&
      data.prompt === params.prompt &&
      data.templateId === params.templateId
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

function getIntroDocId(trackId: string, templateId: string) {
  return `${trackId}_${templateId}`;
}

export async function getTrackIntro(userId: string, trackId: string, templateId: string): Promise<TrackIntro | null> {
  const docId = getIntroDocId(trackId, templateId);
  const docRef = doc(clientDb, 'users', userId, 'trackIntros', docId);
  const document = await getDoc(docRef);
  return document.exists() ? document.data() as TrackIntro : null;
}

export async function saveTrackIntro(userId: string, trackId: string, templateId: string, intro: TrackIntro): Promise<void> {
  const docId = getIntroDocId(trackId, templateId);
  const docRef = doc(clientDb, 'users', userId, 'trackIntros', docId);
  await setDoc(docRef, intro, { merge: true });
}

export async function getTrackIntros(userId: string, trackId?: string): Promise<TrackIntro[]> {
  try {
    const introsRef = collection(clientDb, 'users', userId, 'trackIntros');
    let q;
    if (trackId) {
      q = query(introsRef, where('trackId', '==', trackId));
    } else {
      q = introsRef;
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as TrackIntro);
  } catch (error) {
    console.error('Error getting track intros:', error);
    return [];
  }
}

export async function getUserPromptTemplates(userId: string): Promise<PromptTemplate[]> {
  const docRef = doc(clientDb, 'users', userId);
  const document = await getDoc(docRef);
  const userData = document.data() as UserPromptSettings;
  return userData?.templates as unknown as PromptTemplate[] || [];
}

export async function addUserPromptTemplate(userId: string, template: PromptTemplate): Promise<void> {
  const docRef = doc(clientDb, 'users', userId);
  const document = await getDoc(docRef);
  
  // Initialize user data if it doesn't exist
  const userData = document.exists() 
    ? (document.data() as User)
    : { templates: [] };

  // Add the new template with advanced fields
  const templates = [...(userData.templates || []), {
    ...template,
    tone: template.tone || '',
    length: template.length || 0,
    language: template.language || 'en-US'
  }];
  
  // Save the updated user data
  await setDoc(docRef, {
    ...userData,
    templates,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

export async function updateUserPromptTemplate(userId: string, templateId: string, updates: Partial<PromptTemplate>): Promise<void> {
  const docRef = doc(clientDb, 'users', userId);
  const document = await getDoc(docRef);
  const userData = document.data() as User;
  const templateIndex = userData?.templates.findIndex(t => t.id === templateId);
  if (templateIndex !== -1) {
    userData.templates[templateIndex] = { 
      ...userData.templates[templateIndex], 
      ...updates,
      tone: updates.tone || userData.templates[templateIndex].tone || '',
      length: updates.length || userData.templates[templateIndex].length || 0,
      language: updates.language || userData.templates[templateIndex].language || 'en-US'
    };
  }
  await setDoc(docRef, userData);
}

export async function deleteUserPromptTemplate(userId: string, templateId: string): Promise<void> {
  const docRef = doc(clientDb, 'users', userId);
  const document = await getDoc(docRef);
  const userData = document.data() as User;
  userData.templates = userData.templates.filter(t => t.id !== templateId);
  await setDoc(docRef, userData);
}