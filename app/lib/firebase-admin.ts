import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { auth } from '@/app/auth';

// Firebase Admin SDK initialization
if (!getApps().length) {
  initializeApp({
    credential: applicationDefault()
  });
}

// Export Firebase Admin instances
export const adminAuth = getAuth();
export const adminDb = getFirestore();

// Utility function to generate custom token
export async function generateCustomToken(uid: string): Promise<string> {
  try {
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
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized: No valid session');
  }

  try {
    // Verify the user exists in Firebase
    await adminAuth.getUser(session.user.id);
    return session.user.id;
  } catch (error) {
    console.error('Error verifying Firebase user:', error);
    throw new Error('Unauthorized: Invalid Firebase user');
  }
} 