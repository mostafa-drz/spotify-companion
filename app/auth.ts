import NextAuth from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    SpotifyProvider,
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
});