'use client';

import { SessionProvider } from 'next-auth/react';
import { SpotifyPlayerProvider } from '@/app/contexts/SpotifyPlayerContext';
import ErrorBoundary from '@/app/components/ErrorBoundary';
import { FirebaseAuthProvider } from '@/app/contexts/FirebaseAuthContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <FirebaseAuthProvider>
          <SpotifyPlayerProvider>
            {children}
          </SpotifyPlayerProvider>
        </FirebaseAuthProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
} 