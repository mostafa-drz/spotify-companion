'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  signInWithCustomToken,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { clientAuth, type FirebaseUser } from '@/app/lib/firebase-client';
import { generateFirebaseToken } from '@/app/actions/auth';
import { signOut as spotifySignOut } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

interface FirebaseAuthContextType {
  user: FirebaseUser | null;
  isLoading: boolean;
  error: Error | null;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(
  undefined
);

export function FirebaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Handle session invalidation
    if (status === 'unauthenticated') {
      const handleSignOut = async () => {
        try {
          await firebaseSignOut(clientAuth);
          await spotifySignOut();
          setUser(null);
          router.push('/');
        } catch (error) {
          console.error('Error during sign out:', error);
        }
      };
      handleSignOut();
    }
  }, [status, router]);

  useEffect(() => {
    const unsubscribe = clientAuth.onAuthStateChanged(
      (user) => {
        if (user) {
          setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Firebase auth state change error:', error);
        setError(error as Error);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const signInToFirebase = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await generateFirebaseToken();
        if (result) {
          await signInWithCustomToken(clientAuth, result.token);
        }
      } catch (error) {
        console.error('Error signing in to Firebase:', error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    const signOutFromFirebase = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await firebaseSignOut(clientAuth);
        setUser(null);
      } catch (error) {
        console.error('Error signing out:', error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id && !user) {
      signInToFirebase();
    }
    if (!session?.user?.id && user) {
      signOutFromFirebase();
    }
  }, [session?.user?.id, user]);

  return (
    <FirebaseAuthContext.Provider value={{ user, isLoading, error }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error(
      'useFirebaseAuth must be used within a FirebaseAuthProvider'
    );
  }
  return context;
}
