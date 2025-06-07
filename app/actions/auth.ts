'use server';

import {
  auth,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from '@/app/auth';
import {
  generateCustomToken,
  verifyCustomToken,
  deleteUser as adminDeleteUser,
} from '@/app/lib/firebase-admin';
import { redirect } from 'next/navigation';

/**
 * Authentication Actions
 *
 * These server actions handle authentication-related operations:
 * - Firebase token generation and verification
 * - Spotify token refresh
 * - Sign in/out operations
 */

// Firebase Token Management
export async function generateFirebaseToken(): Promise<{
  token: string;
} | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      // Instead of throwing, redirect to home page
      redirect('/');
    }

    const token = await generateCustomToken(session.user.id);
    return { token };
  } catch (error) {
    console.error('Error generating Firebase token:', error);
    // Instead of throwing, redirect to home page
    redirect('/');
  }
}

export async function verifyFirebaseToken(
  token: string
): Promise<{ uid: string } | null> {
  try {
    const uid = await verifyCustomToken(token);
    return { uid };
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    // Instead of throwing, redirect to home page
    redirect('/');
  }
}

// Spotify Token Management
export async function refreshSpotifyToken(): Promise<{
  accessToken: string;
} | null> {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      // Instead of throwing, redirect to home page
      redirect('/');
    }

    // The token refresh is handled by NextAuth's JWT callback
    // We just need to return the current token
    return { accessToken: session.accessToken };
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    // Instead of throwing, redirect to home page
    redirect('/');
  }
}

// Authentication Operations
export async function signIn() {
  // This will trigger the NextAuth sign-in flow and redirect to Spotify
  await nextAuthSignIn('spotify', { redirectTo: '/playing' });
}

// Sign out from both Firebase and NextAuth
export async function signOut() {
  // This will trigger the NextAuth sign-out flow and redirect to home
  await nextAuthSignOut({ redirectTo: '/' });
}

// Delete user from both Firebase and NextAuth
export async function deleteUser(uid: string) {
  try {
    await adminDeleteUser(uid);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
