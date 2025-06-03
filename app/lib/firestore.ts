import { clientDb } from '@/app/lib/firebase-client';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import type {
  PromptTemplate,
  TrackIntro,
  UserPromptSettings,
} from '@/app/types/Prompt';
import { User } from '@/app/types/User';
import { DEFAULT_TEMPLATES } from '@/app/lib/constants';

function getIntroDocId(trackId: string, templateId: string) {
  return `${trackId}_${templateId}`;
}

export async function getTrackIntro(
  userId: string,
  trackId: string,
  templateId: string
): Promise<TrackIntro | null> {
  const docId = getIntroDocId(trackId, templateId);
  const docRef = doc(clientDb, 'users', userId, 'trackIntros', docId);
  const document = await getDoc(docRef);
  if (!document.exists()) return null;
  const data = document.data();
  // userId is not expected in the data
  return data as TrackIntro;
}

export async function saveTrackIntro(
  userId: string,
  trackId: string,
  templateId: string,
  intro: TrackIntro
): Promise<void> {
  const docId = getIntroDocId(trackId, templateId);
  const docRef = doc(clientDb, 'users', userId, 'trackIntros', docId);
  await setDoc(docRef, intro, { merge: true });
}

export async function getTrackIntros(
  userId: string,
  trackId?: string
): Promise<TrackIntro[]> {
  try {
    const introsRef = collection(clientDb, 'users', userId, 'trackIntros');
    let q;
    if (trackId) {
      q = query(introsRef, where('trackId', '==', trackId));
    } else {
      q = introsRef;
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      // userId is not expected in the data
      return data as TrackIntro;
    });
  } catch (error) {
    console.error('Error getting track intros:', error);
    return [];
  }
}

export async function getUserPromptTemplates(
  userId: string
): Promise<PromptTemplate[]> {
  const docRef = doc(clientDb, 'users', userId);
  const document = await getDoc(docRef);
  const userData = document.data() as UserPromptSettings;
  return (userData?.templates as unknown as PromptTemplate[]) || [];
}

export async function addUserPromptTemplate(
  userId: string,
  template: PromptTemplate
): Promise<void> {
  const docRef = doc(clientDb, 'users', userId);
  const document = await getDoc(docRef);

  // Initialize user data if it doesn't exist
  const userData = document.exists()
    ? (document.data() as User)
    : { templates: [] };

  // Add the new template with advanced fields
  const templates = [
    ...(userData.templates || []),
    {
      ...template,
      tone: template.tone || '',
      length: template.length || 0,
      language: template.language || 'en-US',
    },
  ];

  // Save the updated user data
  await setDoc(
    docRef,
    {
      ...userData,
      templates,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function updateUserPromptTemplate(
  userId: string,
  templateId: string,
  updates: Partial<PromptTemplate>
): Promise<void> {
  const docRef = doc(clientDb, 'users', userId);
  const document = await getDoc(docRef);
  const userData = document.data() as User;
  const templateIndex = userData?.templates.findIndex(
    (t) => t.id === templateId
  );
  if (templateIndex !== -1) {
    userData.templates[templateIndex] = {
      ...userData.templates[templateIndex],
      ...updates,
      tone: updates.tone || userData.templates[templateIndex].tone || '',
      length: updates.length || userData.templates[templateIndex].length || 0,
      language:
        updates.language ||
        userData.templates[templateIndex].language ||
        'en-US',
    };
  }
  await setDoc(docRef, userData);
}

export async function deleteUserPromptTemplate(
  userId: string,
  templateId: string
): Promise<void> {
  const docRef = doc(clientDb, 'users', userId);
  const document = await getDoc(docRef);
  const userData = document.data() as User;
  userData.templates = userData.templates.filter((t) => t.id !== templateId);
  await setDoc(docRef, userData);
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    // Delete all track intros first
    const introsRef = collection(clientDb, 'users', userId, 'trackIntros');
    const introsSnapshot = await getDocs(introsRef);
    const deletePromises = introsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Then delete the user document
    const docRef = doc(clientDb, 'users', userId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export async function userExists(userId: string): Promise<boolean> {
  const docRef = doc(clientDb, 'users', userId);
  const document = await getDoc(docRef);
  return document.exists();
}

export async function initializeNewUser(
  userId: string,
  userData: Partial<User> = {}
): Promise<void> {
  const docRef = doc(clientDb, 'users', userId);
  const document = await getDoc(docRef);

  if (document.exists()) {
    throw new Error('User already exists');
  }

  // Initialize with default values
  const newUserData: User = {
    id: userId,
    email: userId, // Since we're using email as userId
    displayName: '',
    photoURL: '',
    availableCredits: 10, // Initial credits
    usedCredits: 0,
    defaultPrompt: null,
    templates: DEFAULT_TEMPLATES,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...userData,
  };

  await setDoc(docRef, newUserData);
}
