'use client';

import { SessionProvider } from 'next-auth/react';
import { SpotifyPlayerProvider } from '@/app/contexts/SpotifyPlayerContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SpotifyPlayerProvider>
        {children}
      </SpotifyPlayerProvider>
    </SessionProvider>
  );
} 