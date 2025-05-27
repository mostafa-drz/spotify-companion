'use server';

import { auth, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from '@/app/auth';
import { generateCustomToken, verifyCustomToken } from '@/app/lib/firebase-admin';
import { AuthError } from '@/app/lib/AuthError';

/**
 * Authentication Actions
 * 
 * These server actions handle authentication-related operations:
 * - Firebase token generation and verification
 * - Spotify token refresh
 * - Sign in/out operations
 */

// Firebase Token Management
export async function generateFirebaseToken(): Promise<{ token: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new AuthError('Not authenticated', 'UNAUTHENTICATED', 401);
    }

    const token = await generateCustomToken(session.user.id);
    return { token };
  } catch (error) {
    console.error('Error generating Firebase token:', error);
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Failed to generate token', 'TOKEN_GENERATION_FAILED');
  }
}

export async function verifyFirebaseToken(token: string): Promise<{ uid: string }> {
  try {
    const uid = await verifyCustomToken(token);
    return { uid };
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    throw new AuthError('Invalid token', 'INVALID_TOKEN', 401);
  }
}

// Spotify Token Management
export async function refreshSpotifyToken(): Promise<{ accessToken: string }> {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      throw new AuthError('Not authenticated', 'UNAUTHENTICATED', 401);
    }

    // The token refresh is handled by NextAuth's JWT callback
    // We just need to return the current token
    return { accessToken: session.accessToken };
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Failed to refresh token', 'TOKEN_REFRESH_FAILED');
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