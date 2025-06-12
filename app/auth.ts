import NextAuth from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';
import type { JWT } from 'next-auth/jwt';
import { adminAuth, userExists, initializeNewUser } from './lib/firebase-admin';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
    accessToken?: string;
    error?: 'RefreshAccessTokenError';
  }
}

// Extend the built-in token types
declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: 'RefreshAccessTokenError';
  }
}

const scope = [
  'user-read-email',
  'streaming',
  'user-modify-playback-state',
  'user-read-playback-state',
].join(' ');

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        url: `https://accounts.spotify.com/authorize`,
        params: {
          scope: scope,
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        // Create or get Firebase user using email as UID
        try {
          const email = user.email;
          if (!email) {
            throw new Error('No email provided by Spotify');
          }

          // Check if user exists in Firebase
          let isNewUser = false;
          try {
            isNewUser = !(await userExists(email));
            if (isNewUser) {
              // Create Firebase auth user
              await adminAuth.createUser({
                uid: email,
                email: email,
                displayName: user.name || undefined,
                photoURL: user.image || undefined,
              });

              // Initialize user document with defaults
              await initializeNewUser(email, {
                displayName: user.name || '',
                photoURL: user.image || '',
              });
            }
          } catch (error) {
            console.error('Error checking/creating user:', error);
            throw error;
          }

          return {
            ...token,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            accessTokenExpires: account.expires_at
              ? account.expires_at * 1000
              : 0,
          };
        } catch (error) {
          console.error('Error creating/getting Firebase user:', error);
          throw error;
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      try {
        // Access token has expired, try to update it
        const refreshedTokens = await refreshAccessToken(token);
        return refreshedTokens;
      } catch (error) {
        console.error('Error refreshing access token', error);
        // Return token with undefined values instead of null
        return {
          ...token,
          accessToken: undefined,
          refreshToken: undefined,
          accessTokenExpires: undefined,
          error: 'RefreshAccessTokenError',
        };
      }
    },
    async session({ session, token }) {
      // If token has error or no access token, return session with error
      if (token.error || !token.accessToken) {
        return {
          ...session,
          accessToken: undefined,
          error: 'RefreshAccessTokenError',
        };
      }

      session.user.id = session.user.email as string;
      session.accessToken = token.accessToken;
      return session;
    },
  },
});

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const tokens = await response.json();

    if (!response.ok) {
      // Return token with undefined values instead of null
      return {
        ...token,
        accessToken: undefined,
        refreshToken: undefined,
        accessTokenExpires: undefined,
        error: 'RefreshAccessTokenError',
      };
    }

    return {
      ...token,
      accessToken: tokens.access_token,
      accessTokenExpires: Date.now() + tokens.expires_in * 1000,
      refreshToken: tokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token', error);
    // Return token with undefined values instead of null
    return {
      ...token,
      accessToken: undefined,
      refreshToken: undefined,
      accessTokenExpires: undefined,
      error: 'RefreshAccessTokenError',
    };
  }
}
