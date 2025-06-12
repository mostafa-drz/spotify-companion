import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { auth } from '@/app/auth';
import { DEFAULT_TEMPLATES, INITIAL_CREDITS } from '@/app/lib/constants';
import { User } from '@/app/types/User';

// Firebase Admin SDK initialization
if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET_URI,
  });
}

// Export Firebase Admin instances
export const adminAuth = getAuth();
export const adminDb = getFirestore();
export const adminStorage = getStorage();

// Utility function to generate custom token
export async function generateCustomToken(uid: string): Promise<string> {
  try {
    // Verify user exists (should always exist since created in NextAuth)
    await adminAuth.getUser(uid);
    return await adminAuth.createCustomToken(uid);
  } catch (error) {
    console.error('Error generating custom token:', error);
    throw new Error('Failed to generate custom token');
  }
}

// Utility function to verify custom token
export async function verifyCustomToken(token: string): Promise<string> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying custom token:', error);
    throw new Error('Invalid token');
  }
}

// Utility function to verify authentication
export async function verifyAuth() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized: No valid session');
    }

    // Verify the user exists in Firebase
    await adminAuth.getUser(session.user.id);
    return session.user.id;
  } catch (error) {
    console.error('Error verifying authentication:', error);
    throw new Error('Unauthorized: Invalid user session');
  }
}

// A utility function to delete user from firebase auth using firebase admin
export async function deleteUser(uid: string) {
  try {
    await adminAuth.deleteUser(uid);
    console.log('User deleted from firebase auth', uid);

    // Delete all trackIntros subcollection docs
    const introsSnapshot = await adminDb
      .collection('users')
      .doc(uid)
      .collection('trackIntros')
      .get();
    const deletePromises = introsSnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(deletePromises);

    // Then delete the user document
    await adminDb.collection('users').doc(uid).delete();
    console.log('User and subcollections deleted from firestore', uid);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
}

// Helper for track intro doc IDs
function getIntroDocId(trackId: string, templateId: string) {
  return `${trackId}_${templateId}`;
}

// Server-side Firestore helpers for track intros
import type { TrackIntro } from '@/app/types/Prompt';

export async function getTrackIntro(
  userId: string,
  trackId: string,
  templateId: string
): Promise<TrackIntro | null> {
  const docId = getIntroDocId(trackId, templateId);
  const docRef = adminDb
    .collection('users')
    .doc(userId)
    .collection('trackIntros')
    .doc(docId);
  const document = await docRef.get();
  if (!document.exists) return null;
  const data = document.data();
  return data as TrackIntro;
}

export async function saveTrackIntro(
  userId: string,
  trackId: string,
  templateId: string,
  intro: TrackIntro
): Promise<void> {
  const docId = getIntroDocId(trackId, templateId);
  const docRef = adminDb
    .collection('users')
    .doc(userId)
    .collection('trackIntros')
    .doc(docId);
  await docRef.set(intro, { merge: true });
}

export async function userExists(userId: string): Promise<boolean> {
  const userRef = adminDb.collection('users').doc(userId);
  const userDoc = await userRef.get();
  return userDoc.exists;
}

export async function initializeNewUser(
  userId: string,
  userData: Partial<User> = {}
): Promise<void> {
  const userRef = adminDb.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (userDoc.exists) {
    throw new Error('User already exists');
  }

  // Initialize with default values
  const newUserData: User = {
    id: userId,
    email: userId, // Since we're using email as userId
    displayName: '',
    photoURL: '',
    admin: {
      availableCredits: INITIAL_CREDITS, // Initial credits
      usedCredits: 0,
    },
    defaultPrompt: null,
    templates: DEFAULT_TEMPLATES,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...userData,
  };

  await userRef.set(newUserData);
}
