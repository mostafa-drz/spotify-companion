'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { signInWithCustomToken, signOut as firebaseSignOut } from 'firebase/auth';
import { clientAuth, type FirebaseUser } from '@/app/lib/firebase';
import { generateFirebaseToken } from '@/app/actions/auth';

interface FirebaseAuthContextType {
  user: FirebaseUser | null;
  isLoading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
      if (session?.user?.id && !user) {
        try {
          setIsLoading(true);
          setError(null);
          const { token } = await generateFirebaseToken();
          await signInWithCustomToken(clientAuth, token);
        } catch (error) {
          console.error('Error signing in to Firebase:', error);
          setError(error as Error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    signInToFirebase();
  }, [session?.user?.id, user]);

  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await firebaseSignOut(clientAuth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FirebaseAuthContext.Provider value={{ user, isLoading, error, signOut }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
} 