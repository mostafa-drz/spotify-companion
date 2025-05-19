'use client';

import { useSession } from 'next-auth/react';
import { useFirebaseAuth } from '@/app/contexts/FirebaseAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { user: firebaseUser, isLoading } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading' || isLoading) return;

    if (!session || !firebaseUser) {
      router.push('/');
    }
  }, [session, firebaseUser, status, isLoading, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DB954]"></div>
      </div>
    );
  }

  if (!session || !firebaseUser) {
    return null;
  }

  return <>{children}</>;
} 