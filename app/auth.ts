import NextAuth from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';
import { FirestoreAdapter } from "@auth/firebase-adapter"
import { app } from "@/app/lib/firebase"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
    accessToken?: string;
  }
}

// Extend the built-in user types
declare module "@auth/core/adapters" {
  interface AdapterUser {
    accessToken?: string;
  }
}

const scope = [
  "user-read-email",
  "user-read-private",
  "playlist-read-private",
  "playlist-read-collaborative",
  "streaming",
  "user-modify-playback-state",
  "user-read-playback-state"
].join(" ");

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
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
  adapter: FirestoreAdapter(app),
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      // Add the user's ID to the session
      session.user.id = user.id;
      // Add the access token from the user object (stored by the adapter)
      session.accessToken = user.accessToken;
      return session;
    },
  },
});