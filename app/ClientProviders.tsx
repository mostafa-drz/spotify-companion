'use client';

import { SWRConfig } from 'swr';
import { SessionProvider } from 'next-auth/react';
import { SpotifyPlayerProvider } from '@/app/contexts/SpotifyPlayerContext';
import ErrorBoundary from '@/app/components/ErrorBoundary';
import { FirebaseAuthProvider } from '@/app/contexts/UserContext';

const fetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.') as Error & { info?: unknown; status?: number };
    error.info = await res.json().catch(() => ({}));
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SWRConfig value={{ fetcher }}>
        <SessionProvider>
          <FirebaseAuthProvider>
            <SpotifyPlayerProvider>
              {children}
            </SpotifyPlayerProvider>
          </FirebaseAuthProvider>
        </SessionProvider>
      </SWRConfig>
    </ErrorBoundary>
  );
} 